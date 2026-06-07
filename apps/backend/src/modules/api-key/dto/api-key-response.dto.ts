import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ApiKeyGroupDto {
  @ApiProperty({ description: '用户组 ID' })
  readonly id!: string;

  @ApiProperty({ description: '用户组名称' })
  readonly name!: string;
}

class CreatedApiKeyDto {
  @ApiProperty({ description: 'API Key ID' })
  readonly id!: string;

  @ApiPropertyOptional({ description: 'API Key 名称' })
  readonly name!: string | null;

  @ApiProperty({ description: '完整的 API Key（仅创建/轮换时返回一次）' })
  readonly key!: string;

  @ApiProperty({ description: 'Key 前缀（用于展示）', example: 'sk-toai-xxxxxx' })
  readonly keyPrefix!: string;

  @ApiProperty({ description: 'Key 后缀（用于展示）', example: 'c3a1' })
  readonly keySuffix!: string;
}

/**
 * API Key 响应 DTO
 *
 * 创建/轮换时返回完整的 key，列表和更新后只返回 prefix/suffix。
 */
export class ApiKeyResponseDto {
  @ApiProperty({ description: 'API Key ID' })
  readonly id!: string;

  @ApiProperty({ description: 'API Key 名称' })
  readonly name!: string | null;

  @ApiProperty({ description: 'Key 前缀（用于展示）', example: 'sk-toai-xxxxxx' })
  readonly keyPrefix!: string;

  @ApiProperty({ description: 'Key 后缀（用于展示）', example: 'c3a1' })
  readonly keySuffix!: string;

  @ApiPropertyOptional({
    description: '完整的 API Key（仅创建/轮换时返回一次）',
    example: 'sk-toai-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  readonly key?: string;

  @ApiProperty({ description: '状态', enum: ['ACTIVE', 'DISABLED'] })
  readonly status!: 'ACTIVE' | 'DISABLED';

  @ApiProperty({ description: '是否激活（兼容旧前端）' })
  readonly isActive!: boolean;

  @ApiPropertyOptional({ description: '所属用户组 ID' })
  readonly groupId!: string | null;

  @ApiPropertyOptional({ description: '所属用户组名称' })
  readonly groupName!: string | null;

  @ApiPropertyOptional({ description: '所属用户组', type: ApiKeyGroupDto })
  readonly group!: ApiKeyGroupDto | null;

  @ApiProperty({ description: '今日消费，单位：分' })
  readonly usageToday!: number;

  @ApiProperty({ description: '近 30 天消费，单位：分' })
  readonly usage30d!: number;

  @ApiPropertyOptional({ description: 'RPM 限制' })
  readonly rpmLimit!: number | null;

  @ApiPropertyOptional({ description: 'TPM 限制' })
  readonly tpmLimit!: number | null;

  @ApiProperty({ description: '是否无限配额' })
  readonly unlimitedQuota!: boolean;

  @ApiPropertyOptional({ description: '过期时间' })
  readonly expiresAt!: Date | null;

  @ApiPropertyOptional({ description: '速率限制（请求/分钟，兼容旧字段）' })
  readonly rateLimit!: number | null;

  @ApiPropertyOptional({ description: 'Token 限制（token/分钟，兼容旧字段）' })
  readonly tokenLimit!: number | null;

  @ApiProperty({ description: '允许的模型列表', type: [String] })
  readonly modelLimit!: string[];

  @ApiProperty({ description: 'IP 白名单', type: [String] })
  readonly ipWhitelist!: string[];

  @ApiPropertyOptional({ description: '最后使用时间' })
  readonly lastUsedAt?: Date | null;

  @ApiProperty({ description: '累计请求数' })
  readonly totalRequests!: number;

  @ApiProperty({ description: '创建时间' })
  readonly createdAt!: Date;

  @ApiPropertyOptional({ description: '批量创建结果；仅创建时返回', type: [CreatedApiKeyDto] })
  readonly keys?: CreatedApiKeyDto[];
}
