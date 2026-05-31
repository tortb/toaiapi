import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT 认证守卫
 *
 * 从 Authorization 头中提取 Bearer Token，验证 JWT 有效性。
 * 验证通过后将用户信息附加到 request.user。
 *
 * @example
 * ```typescript
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * async getProfile(@CurrentUser() user: CurrentUserInfo) { }
 * ```
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  override handleRequest<TUser = unknown>(
    err: Error | null,
    user: TUser | null,
    _info: unknown,
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
