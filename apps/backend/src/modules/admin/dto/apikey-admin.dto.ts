import { IsString, IsOptional, IsBoolean, IsInt, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Admin 创建 API Key DTO
 */
export class AdminCreateApiKeyDto {
  @ApiProperty({ description: '用户 ID' })
  @IsString()
  userId!: string;

  @ApiProperty({ description: 'Key 名称' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: '过期时间' })
  @IsOptional()
  @IsString()
  expiresAt?: string;

  @ApiPropertyOptional({ description: '请求/分钟限制' })
  @IsOptional()
  @IsInt()
  rateLimit?: number;

  @ApiPropertyOptional({ description: 'Token/分钟限制' })
  @IsOptional()
  @IsInt()
  tokenLimit?: number;

  @ApiPropertyOptional({ description: '允许的模型列表', type: [String] })
  @IsOptional()
  @IsArray()
  modelLimit?: string[];

  @ApiPropertyOptional({ description: 'IP 白名单', type: [String] })
  @IsOptional()
  @IsArray()
  ipWhitelist?: string[];
}

/**
 * API Key 响应 DTO
 */
export class ApiKeyAdminResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  userEmail!: string;

  @ApiProperty()
  keyPrefix!: string;

  @ApiProperty()
  name!: string | null;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  expiresAt!: string | null;

  @ApiProperty()
  rateLimit!: number | null;

  @ApiProperty()
  tokenLimit!: number | null;

  @ApiProperty()
  modelLimit!: string[];

  @ApiProperty()
  ipWhitelist!: string[];

  @ApiProperty()
  lastUsedAt!: string | null;

  @ApiProperty()
  totalRequests!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
