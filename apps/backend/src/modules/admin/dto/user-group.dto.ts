import { IsString, IsOptional, IsBoolean, IsInt, IsNumber, Min, Max, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 创建用户组 DTO
 */
export class CreateUserGroupDto {
  @ApiProperty({ description: '组名（英文，唯一）', example: 'vip' })
  @IsString()
  @Length(1, 50)
  name!: string;

  @ApiProperty({ description: '显示名（中文）', example: 'VIP 用户' })
  @IsString()
  @Length(1, 50)
  displayName!: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '价格倍率', example: 1.0 })
  @IsNumber()
  @Min(0.1)
  @Max(10.0)
  priceMultiplier!: number;

  @ApiProperty({ description: '请求/分钟', example: 60 })
  @IsInt()
  @Min(1)
  rpmLimit!: number;

  @ApiProperty({ description: 'Token/分钟', example: 60000 })
  @IsInt()
  @Min(1)
  tpmLimit!: number;

  @ApiProperty({ description: '最大 API Key 数', example: 10 })
  @IsInt()
  @Min(1)
  maxApiKeys!: number;

  @ApiPropertyOptional({ description: '允许的模型（空=全部）', type: [String] })
  @IsOptional()
  allowedModels?: string[];

  @ApiPropertyOptional({ description: '允许的渠道（空=全部）', type: [String] })
  @IsOptional()
  allowedChannels?: string[];

  @ApiPropertyOptional({ description: '是否允许代理', default: true })
  @IsOptional()
  @IsBoolean()
  allowProxy?: boolean;

  @ApiPropertyOptional({ description: '是否允许分享', default: false })
  @IsOptional()
  @IsBoolean()
  allowShare?: boolean;
}

/**
 * 更新用户组 DTO
 */
export class UpdateUserGroupDto {
  @ApiPropertyOptional({ description: '显示名（中文）' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  displayName?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '价格倍率' })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(10.0)
  priceMultiplier?: number;

  @ApiPropertyOptional({ description: '请求/分钟' })
  @IsOptional()
  @IsInt()
  @Min(1)
  rpmLimit?: number;

  @ApiPropertyOptional({ description: 'Token/分钟' })
  @IsOptional()
  @IsInt()
  @Min(1)
  tpmLimit?: number;

  @ApiPropertyOptional({ description: '最大 API Key 数' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxApiKeys?: number;

  @ApiPropertyOptional({ description: '允许的模型', type: [String] })
  @IsOptional()
  allowedModels?: string[];

  @ApiPropertyOptional({ description: '允许的渠道', type: [String] })
  @IsOptional()
  allowedChannels?: string[];

  @ApiPropertyOptional({ description: '是否允许代理' })
  @IsOptional()
  @IsBoolean()
  allowProxy?: boolean;

  @ApiPropertyOptional({ description: '是否允许分享' })
  @IsOptional()
  @IsBoolean()
  allowShare?: boolean;
}

/**
 * 用户组响应 DTO
 */
export class UserGroupResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  displayName!: string;

  @ApiProperty()
  description!: string | null;

  @ApiProperty()
  priceMultiplier!: number;

  @ApiProperty()
  rpmLimit!: number;

  @ApiProperty()
  tpmLimit!: number;

  @ApiProperty()
  maxApiKeys!: number;

  @ApiProperty()
  allowedModels!: string[];

  @ApiProperty()
  allowedChannels!: string[];

  @ApiProperty()
  allowProxy!: boolean;

  @ApiProperty()
  allowShare!: boolean;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  isBuiltin!: boolean;

  @ApiProperty()
  userCount!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
