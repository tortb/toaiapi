import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 修改用户角色请求 DTO
 *
 * 仅 super_admin 可执行此操作
 */
export class UpdateUserRoleDto {
  @ApiProperty({
    description: '目标角色',
    enum: ['USER', 'VIP', 'ENTERPRISE', 'AGENT', 'ADMIN', 'SUPER_ADMIN'],
    example: 'ADMIN',
  })
  @IsString()
  @IsIn(['USER', 'VIP', 'ENTERPRISE', 'AGENT', 'ADMIN', 'SUPER_ADMIN'])
  readonly role!: string;
}
