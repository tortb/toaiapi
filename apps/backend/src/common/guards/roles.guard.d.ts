import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
/**
 * 角色元数据键
 */
export declare const ROLES_KEY = "roles";
/**
 * 角色守卫
 *
 * 检查当前用户是否拥有访问所需的最低角色。
 * 使用 @Roles() 装饰器设置所需角色。
 *
 * @example
 * ```typescript
 * @Roles('admin')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Get('admin/users')
 * async listUsers() { }
 * ```
 */
export declare class RolesGuard implements CanActivate {
    private readonly reflector;
    /**
     * 角色优先级（从低到高）
     */
    private readonly roleHierarchy;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
//# sourceMappingURL=roles.guard.d.ts.map