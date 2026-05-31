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
export declare const CurrentUser: (...dataOrPipes: (keyof CurrentUserInfo | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;
//# sourceMappingURL=current-user.decorator.d.ts.map