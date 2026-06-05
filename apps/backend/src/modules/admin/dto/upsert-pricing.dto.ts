import { IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 设置/更新模型定价请求 DTO
 *
 * 所有价格单位：元/百万 token
 * 存储时转换为 分/百万 token（1元 = 100分）
 */
export class UpsertPricingDto {
  @ApiProperty({ description: '输入价格（元/百万 token）', example: 0.02 })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  readonly inputPrice!: number;

  @ApiProperty({ description: '输出价格（元/百万 token）', example: 0.10 })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  readonly outputPrice!: number;

  @ApiPropertyOptional({ description: '缓存输入价格（元/百万 token）', example: 0.01 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  readonly cachedPrice?: number;

  @ApiPropertyOptional({ description: '推理 token 价格（元/百万 token）', example: 0.20 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  readonly reasoningPrice?: number;

  @ApiPropertyOptional({ description: '价格倍率', example: 1.0 })
  @IsOptional()
  readonly multiplier?: number;
}
