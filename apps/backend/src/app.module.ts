import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ApiKeyModule } from './modules/api-key/api-key.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { BillingModule } from './modules/billing/billing.module';
import { BalanceModule } from './modules/balance/balance.module';
import { RequestLogModule } from './modules/request-log/request-log.module';
import { AdminModule } from './modules/admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    PrismaModule,

    // Cache
    RedisModule,

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Business modules
    UserModule,
    AuthModule,
    ApiKeyModule,
    GatewayModule,
    BillingModule,
    BalanceModule,
    RequestLogModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
