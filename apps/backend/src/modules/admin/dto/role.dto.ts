import { IsString, IsOptional, IsBoolean, IsInt, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 创建角色 DTO
 */
export class CreateRoleDto {
  @ApiProperty({ description: '角色编码', example: 'editor' })
  @IsString()
  code!: string;

  @ApiProperty({ description: '显示名', example: '编辑员' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '角色等级', example: 30 })
  @IsInt()
  level!: number;

  @ApiPropertyOptional({ description: '数据范围', default: 'SELF' })
  @IsOptional()
  @IsString()
  dataScope?: string;
}

/**
 * 更新角色 DTO
 */
export class UpdateRoleDto {
  @ApiPropertyOptional({ description: '显示名' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '角色等级' })
  @IsOptional()
  @IsInt()
  level?: number;

  @ApiPropertyOptional({ description: '数据范围' })
  @IsOptional()
  @IsString()
  dataScope?: string;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * 分配权限 DTO
 */
export class AssignPermissionsDto {
  @ApiProperty({ description: '权限 ID 列表', type: [String] })
  @IsArray()
  permissionIds!: string[];
}

/**
 * 角色响应 DTO
 */
export class RoleResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  description!: string | null;

  @ApiProperty()
  level!: number;

  @ApiProperty()
  isSystem!: boolean;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  dataScope!: string;

  @ApiProperty()
  permissionCount!: number;

  @ApiProperty()
  userCount!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

/**
 * 权限响应 DTO
 */
export class PermissionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  resource!: string;

  @ApiProperty()
  action!: string;
}
