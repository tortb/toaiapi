import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 设置/更新模型定价请求 DTO
 *
 * 所有价格单位：分/百万 token
 */
export class UpsertPricingDto {
  @ApiProperty({ description: '输入价格（分/百万 token）', example: 2 })
  @IsInt()
  @Min(0)
  readonly inputPrice!: number;

  @ApiProperty({ description: '输出价格（分/百万 token）', example: 10 })
  @IsInt()
  @Min(0)
  readonly outputPrice!: number;

  @ApiPropertyOptional({ description: '缓存输入价格（分/百万 token）', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly cachedPrice?: number;

  @ApiPropertyOptional({ description: '推理 token 价格（分/百万 token）', example: 20 })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly reasoningPrice?: number;

  @ApiPropertyOptional({ description: '价格倍率', example: 1.0 })
  @IsOptional()
  readonly multiplier?: number;
}
