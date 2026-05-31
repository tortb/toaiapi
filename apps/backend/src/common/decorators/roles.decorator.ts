import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../guards/roles.guard';

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
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
