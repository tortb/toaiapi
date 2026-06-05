import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * API Key 响应 DTO
 *
 * 创建时返回完整的 key，之后只返回 prefix
 */
export class ApiKeyResponseDto {
  @ApiProperty({ description: 'API Key ID' })
  readonly id!: string;

  @ApiProperty({ description: 'API Key 名称' })
  readonly name!: string | null;

  @ApiProperty({ description: 'Key 前缀（用于展示）', example: 'sk-toai-xxxxxx' })
  readonly keyPrefix!: string;

  @ApiPropertyOptional({
    description: '完整的 API Key（仅创建时返回一次）',
    example: 'sk-toai-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  readonly key?: string;

  @ApiProperty({ description: '是否激活' })
  readonly isActive!: boolean;

  @ApiPropertyOptional({ description: '过期时间' })
  readonly expiresAt!: Date | null;

  @ApiPropertyOptional({ description: '速率限制（请求/分钟）' })
  readonly rateLimit!: number | null;

  @ApiPropertyOptional({ description: 'Token 限制（token/分钟）' })
  readonly tokenLimit!: number | null;

  @ApiProperty({ description: '允许的模型列表', type: [String] })
  readonly modelLimit!: string[];

  @ApiProperty({ description: 'IP 白名单', type: [String] })
  readonly ipWhitelist!: string[];

  @ApiPropertyOptional({ description: '最后使用时间' })
  readonly lastUsedAt?: Date | null;

  @ApiProperty({ description: '累计请求数' })
  readonly totalRequests?: number;

  @ApiProperty({ description: '创建时间' })
  readonly createdAt!: Date;
}
