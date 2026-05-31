import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

/**
 * 全局 HTTP 异常过滤器
 *
 * 统一异常响应格式：
 * {
 *   code: number,
 *   message: string,
 *   data: null,
 *   timestamp: string,
 *   path: string
 * }
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resp = exceptionResponse as Record<string, unknown>;
        const msg = resp['message'];
        if (typeof msg === 'string') {
          message = msg;
        } else if (Array.isArray(msg) && msg.length > 0 && typeof msg[0] === 'string') {
          message = msg[0];
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(
        `Unhandled error: ${exception.message}`,
        exception.stack,
      );
    }

    // 生产环境不暴露内部错误详情
    if (status === HttpStatus.INTERNAL_SERVER_ERROR && process.env['NODE_ENV'] === 'production') {
      message = 'Internal server error';
    }

    response.status(status).send({
      code: status,
      message,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
