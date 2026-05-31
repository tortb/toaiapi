import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 当前用户信息接口
 */
export interface CurrentUserInfo {
  readonly id: string;
  readonly email: string;
  readonly role: string;
}

/**
 * 获取当前登录用户装饰器
 *
 * 从 JWT 中解析用户信息，注入到 Controller 方法参数中。
 *
 * @example
 * ```typescript
 * @Get('profile')
 * async getProfile(@CurrentUser() user: CurrentUserInfo) {
 *   return this.userService.findById(user.id);
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserInfo | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request['user'] as CurrentUserInfo;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
