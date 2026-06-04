import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Channel 响应 DTO
 *
 * api_key 字段脱敏为 keyPrefix，不返回明文
 */
export class ChannelResponseDto {
  @ApiProperty({ description: '渠道 ID' })
  readonly id!: string;

  @ApiProperty({ description: '所属 Provider ID' })
  readonly providerId!: string;

  @ApiPropertyOptional({ description: '所属 Provider 信息' })
  readonly provider?: {
    readonly id: string;
    readonly name: string;
    readonly displayName: string;
  };

  @ApiProperty({ description: '渠道名称' })
  readonly name!: string;

  @ApiProperty({ description: 'API 基础 URL' })
  readonly baseUrl!: string;

  @ApiProperty({ description: 'API Key 前缀（脱敏）', example: 'sk-1234****' })
  readonly keyPrefix!: string;

  @ApiProperty({ description: '权重' })
  readonly weight!: number;

  @ApiProperty({ description: '优先级' })
  readonly priority!: number;

  @ApiProperty({ description: '是否启用' })
  readonly isActive!: boolean;

  @ApiProperty({ description: '状态', example: 'ACTIVE' })
  readonly status!: string;

  @ApiProperty({ description: '总请求数' })
  readonly totalRequests!: number;

  @ApiProperty({ description: '失败请求数' })
  readonly failedRequests!: number;

  @ApiProperty({ description: '平均延迟（毫秒）' })
  readonly avgLatencyMs!: number;

  @ApiPropertyOptional({ description: '关联模型数量' })
  readonly modelCount?: number;

  @ApiProperty({ description: '创建时间' })
  readonly createdAt!: Date;

  @ApiProperty({ description: '更新时间' })
  readonly updatedAt!: Date;
}
