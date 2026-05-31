import { IsString, IsOptional, IsInt, IsUrl, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 创建 Channel 请求 DTO
 */
export class CreateChannelDto {
  @ApiProperty({ description: '所属 Provider ID' })
  @IsString()
  readonly providerId!: string;

  @ApiProperty({ description: '渠道名称', example: 'DeepSeek Main' })
  @IsString()
  @MaxLength(100)
  readonly name!: string;

  @ApiProperty({ description: 'API 基础 URL', example: 'https://api.deepseek.com' })
  @IsUrl()
  readonly baseUrl!: string;

  @ApiProperty({ description: '上游 API Key' })
  @IsString()
  readonly apiKey!: string;

  @ApiPropertyOptional({ description: '权重（1-100）', example: 1, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  readonly weight?: number;

  @ApiPropertyOptional({ description: '优先级（越高越优先）', example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  readonly priority?: number;
}
