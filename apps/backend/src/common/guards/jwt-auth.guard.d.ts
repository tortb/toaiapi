import { ExecutionContext } from '@nestjs/common';
declare const JwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
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
export declare class JwtAuthGuard extends JwtAuthGuard_base {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | import("rxjs").Observable<boolean>;
    handleRequest<TUser = unknown>(err: Error | null, user: TUser | null, _info: unknown): TUser;
}
export {};
//# sourceMappingURL=jwt-auth.guard.d.ts.map