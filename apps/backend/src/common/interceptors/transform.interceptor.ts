import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, unknown> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(
      map((data: T) => ({
        code: 0,
        message: 'success',
        data,
      })),
    );
  }
}
