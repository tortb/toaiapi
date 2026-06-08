import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, Min, Max, IsBoolean, IsIn } from 'class-validator';

/**
 * 兑换码 DTO
 */
export class RedeemCodeDto {
  @ApiProperty({ description: '兑换码', example: 'ABCD1234' })
  @IsString()
  readonly code!: string;
}

/**
 * 生成兑换码 DTO
 */
export class GenerateCodesDto {
  @ApiProperty({ description: '类型', enum: ['FIXED', 'PERCENTAGE'], example: 'FIXED' })
  @IsString()
  @IsIn(['FIXED', 'PERCENTAGE'])
  readonly type!: string;

  @ApiProperty({ description: '金额（分）或百分比', example: 10000 })
  @IsInt()
  @Min(1)
  readonly value!: number;

  @ApiProperty({ description: '生成数量', example: 10 })
  @IsInt()
  @Min(1)
  @Max(1000)
  readonly count!: number;

  @ApiProperty({ description: '每个码的最大使用次数', example: 1 })
  @IsInt()
  @Min(1)
  readonly max_uses!: number;

  @ApiPropertyOptional({ description: '过期时间（ISO 8601）', example: '2026-12-31T23:59:59Z' })
  @IsOptional()
  @IsString()
  readonly expires_at?: string;
}

/**
 * 更新兑换码 DTO
 */
export class UpdateCodeDto {
  @ApiPropertyOptional({ description: '是否启用' })
  @IsOptional()
  @IsBoolean()
  readonly is_active?: boolean;

  @ApiPropertyOptional({ description: '过期时间（ISO 8601）' })
  @IsOptional()
  @IsString()
  readonly expires_at?: string;

  @ApiPropertyOptional({ description: '最大使用次数' })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly max_uses?: number;
}
