import { IsOptional, IsString, IsIn, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * 排行榜查询 DTO
 */
export class LeaderboardQueryDto {
  @ApiPropertyOptional({
    description: '时间周期',
    enum: ['TODAY', 'WEEK', 'MONTH', 'YEAR', 'ALL'],
    default: 'WEEK',
  })
  @IsOptional()
  @IsString()
  @IsIn(['TODAY', 'WEEK', 'MONTH', 'YEAR', 'ALL'])
  period?: string = 'WEEK';

  @ApiPropertyOptional({ description: '返回数量限制', default: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}
