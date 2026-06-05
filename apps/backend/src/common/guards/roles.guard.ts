import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CurrentUserInfo } from '../decorators/current-user.decorator';

/**
 * 角色元数据键
 */
export const ROLES_KEY = 'roles';

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
@Injectable()
export class RolesGuard implements CanActivate {
  /**
   * 角色优先级（从低到高）
   */
  private readonly roleHierarchy: Record<string, number> = {
    user: 0,
    vip: 1,
    enterprise: 2,
    agent: 3,
    admin: 4,
    super_admin: 5,
  };

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 未设置角色要求，允许访问
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request['user'] as CurrentUserInfo | undefined;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Prisma enum 返回大写（ADMIN），装饰器用小写（admin），统一转小写比较
    const userLevel =
      this.roleHierarchy[user.role.toLowerCase()] ?? -1;
    const hasRole = requiredRoles.some((role) => {
      const requiredLevel = this.roleHierarchy[role.toLowerCase()] ?? 0;
      return userLevel >= requiredLevel;
    });

    if (!hasRole) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredRoles.join(' or ')}`,
      );
    }

    return true;
  }
}
