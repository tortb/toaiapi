/**
 * 角色装饰器
 *
 * 设置访问接口所需的最低角色。
 * 配合 RolesGuard 使用。
 *
 * @example
 * ```typescript
 * @Roles('admin')
 * @Get('admin/users')
 * async listUsers() { }
 * ```
 */
export declare const Roles: (...roles: string[]) => import("@nestjs/common").CustomDecorator<string>;
//# sourceMappingURL=roles.decorator.d.ts.map