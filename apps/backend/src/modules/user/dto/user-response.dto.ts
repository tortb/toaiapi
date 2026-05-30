import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 用户响应 DTO
 *
 * 排除敏感字段（password_hash）
 */
export class UserResponseDto {
  @ApiProperty({ description: '用户 ID' })
  readonly id!: string;

  @ApiProperty({ description: '邮箱地址' })
  readonly email!: string;

  @ApiPropertyOptional({ description: '手机号' })
  readonly phone!: string | null;

  @ApiPropertyOptional({ description: '显示名称' })
  readonly displayName!: string | null;

  @ApiPropertyOptional({ description: '头像 URL' })
  readonly avatarUrl!: string | null;

  @ApiProperty({ description: '用户角色', enum: ['USER', 'VIP', 'ENTERPRISE', 'AGENT', 'ADMIN', 'SUPER_ADMIN'] })
  readonly role!: string;

  @ApiProperty({ description: '用户状态', enum: ['ACTIVE', 'SUSPENDED', 'BANNED'] })
  readonly status!: string;

  @ApiProperty({ description: '创建时间' })
  readonly createdAt!: Date;
}
