import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
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
export declare class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: unknown, host: ArgumentsHost): void;
}
//# sourceMappingURL=http-exception.filter.d.ts.map