import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsInt, Min } from 'class-validator';

/**
 * 更新签到配置 DTO
 */
export class UpdateCheckinConfigDto {
  @ApiPropertyOptional({ description: '是否启用签到功能' })
  @IsOptional()
  @IsBoolean()
  readonly is_enabled?: boolean;

  @ApiPropertyOptional({ description: '最小奖励（分）', example: 1000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly min_reward?: number;

  @ApiPropertyOptional({ description: '最大奖励（分）', example: 5000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly max_reward?: number;
}
