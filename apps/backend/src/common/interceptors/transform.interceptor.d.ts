import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
/**
 * 成功响应包装拦截器
 *
 * 将所有成功响应统一包装为：
 * {
 *   code: 0,
 *   message: 'success',
 *   data: <原始数据>
 * }
 */
export declare class TransformInterceptor<T> implements NestInterceptor<T, unknown> {
    intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
//# sourceMappingURL=transform.interceptor.d.ts.map