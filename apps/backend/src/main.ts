import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from '@fastify/helmet';
import { randomUUID } from 'crypto';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

function parseTrustProxy(value: string | undefined): boolean | string[] {
  const raw = value?.trim();
  if (!raw || raw === 'false' || raw === '0') {
    return false;
  }

  // Do not trust every peer: that lets direct clients spoof X-Forwarded-For.
  if (raw === 'true' || raw === '1') {
    return false;
  }

  const trusted = raw.split(',').map((entry) => entry.trim()).filter(Boolean);
  return trusted.length > 0 ? trusted : false;
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      bodyLimit: Number(process.env['BODY_LIMIT_MB'] || 10) * 1024 * 1024,
      trustProxy: parseTrustProxy(process.env['TRUST_PROXY']),
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // SECURITY: Helmet 安全头
  await app.register(helmet, {
    contentSecurityPolicy: false, // 前端需要 inline styles/scripts
    crossOriginEmbedderPolicy: false,
  });

  // 请求 ID 追踪：为每个请求生成唯一 ID，贯穿日志和响应
  const fastifyInstance = app.getHttpAdapter().getInstance();
  fastifyInstance.addHook('onRequest', async (request) => {
    const req = request as unknown as Record<string, unknown>;
    const requestId = (request.headers['x-request-id'] as string) || randomUUID();
    req['requestId'] = requestId;
  });

  fastifyInstance.addHook('onSend', async (request, reply) => {
    const req = request as unknown as Record<string, unknown>;
    const requestId = req['requestId'] as string;
    if (requestId) {
      reply.header('X-Request-Id', requestId);
    }
  });

  // Global filters and interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS
  const allowedOrigins = (process.env['ALLOWED_ORIGINS'] || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (allowedOrigins.includes('*')) {
    throw new Error('[SECURITY] ALLOWED_ORIGINS 禁止使用 *');
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'captcha-verify-param', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
  });

  // Port
  const port = process.env['PORT'] || 3001;

  // SECURITY: Swagger 按需加载（环境变量控制）
  const enableSwagger = process.env['ENABLE_SWAGGER'] === 'true'
    || (process.env['NODE_ENV'] !== 'production' && process.env['ENABLE_SWAGGER'] !== 'false');

  if (enableSwagger) {
    const swaggerStart = Date.now();

    const config = new DocumentBuilder()
      .setTitle('ToAIAPI')
      .setDescription('Enterprise AI Gateway Platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'api-key')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const swaggerDuration = Date.now() - swaggerStart;
    logger.log(`📚 Swagger loaded in ${swaggerDuration}ms - http://localhost:${port}/api/docs`);
  } else {
    logger.log('📚 Swagger disabled (set ENABLE_SWAGGER=true to enable)');
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  // Start
  await app.listen(port, '0.0.0.0');

  logger.log(`ToAIAPI Backend running on http://localhost:${port}`);
}

bootstrap();
