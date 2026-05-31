import { createParamDecorator } from '@nestjs/common';
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
export const CurrentUser = createParamDecorator((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request['user'];
    if (!user) {
        return null;
    }
    return data ? user[data] : user;
});
//# sourceMappingURL=current-user.decorator.js.map