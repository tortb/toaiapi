import { IsString, IsOptional, IsInt, IsUrl, Min, Max, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 更新 Channel 请求 DTO
 */
export class UpdateChannelDto {
  @ApiPropertyOptional({ description: '渠道名称', example: 'DeepSeek Main' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly name?: string;

  @ApiPropertyOptional({ description: 'API 基础 URL', example: 'https://api.deepseek.com' })
  @IsOptional()
  @IsUrl()
  readonly baseUrl?: string;

  @ApiPropertyOptional({ description: '上游 API Key' })
  @IsOptional()
  @IsString()
  readonly apiKey?: string;

  @ApiPropertyOptional({ description: '权重（1-100）', minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  readonly weight?: number;

  @ApiPropertyOptional({ description: '优先级（越高越优先）' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  readonly priority?: number;
}
