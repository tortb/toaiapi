import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Model 响应 DTO
 */
export class ModelResponseDto {
  @ApiProperty({ description: '模型 ID' })
  readonly id!: string;

  @ApiProperty({ description: '模型名称', example: 'deepseek-chat' })
  readonly name!: string;

  @ApiProperty({ description: '显示名称', example: 'DeepSeek Chat' })
  readonly displayName!: string;

  @ApiProperty({ description: '所属 Provider ID' })
  readonly providerId!: string;

  @ApiProperty({ description: '最大上下文长度' })
  readonly maxContext!: number;

  @ApiProperty({ description: '是否支持流式输出' })
  readonly supportsStreaming!: boolean;

  @ApiProperty({ description: '是否支持工具调用' })
  readonly supportsTools!: boolean;

  @ApiProperty({ description: '是否支持视觉' })
  readonly supportsVision!: boolean;

  @ApiProperty({ description: '是否启用' })
  readonly isActive!: boolean;

  @ApiPropertyOptional({ description: '定价信息' })
  readonly pricing?: {
    readonly id: string;
    readonly inputPrice: number;
    readonly outputPrice: number;
    readonly cachedPrice: number | null;
    readonly reasoningPrice: number | null;
    readonly multiplier: number;
  } | null;

  @ApiProperty({ description: '创建时间' })
  readonly createdAt!: Date;

  @ApiProperty({ description: '更新时间' })
  readonly updatedAt!: Date;
}
