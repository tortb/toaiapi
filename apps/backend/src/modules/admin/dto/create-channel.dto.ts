import { IsString, IsOptional, IsInt, IsUrl, Min, Max, MaxLength, IsBoolean, IsJSON } from 'class-validator';
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

  @ApiPropertyOptional({ description: '组织ID' })
  @IsOptional()
  @IsString()
  readonly groupId?: string;

  @ApiPropertyOptional({ description: '标签（逗号分隔）' })
  @IsOptional()
  @IsString()
  readonly tags?: string;

  @ApiPropertyOptional({ description: '内部备注' })
  @IsOptional()
  @IsString()
  readonly notes?: string;

  @ApiPropertyOptional({ description: '模型映射（JSON 字符串）' })
  @IsOptional()
  @IsString()
  readonly modelMapping?: string;

  @ApiPropertyOptional({ description: '状态码映射（JSON 字符串）' })
  @IsOptional()
  @IsString()
  readonly statusCodeMapping?: string;

  @ApiPropertyOptional({ description: '参数覆盖（JSON 字符串）' })
  @IsOptional()
  @IsString()
  readonly paramOverrides?: string;

  @ApiPropertyOptional({ description: '请求头覆盖（JSON 字符串）' })
  @IsOptional()
  @IsString()
  readonly headerOverrides?: string;

  @ApiPropertyOptional({ description: '代理地址' })
  @IsOptional()
  @IsString()
  readonly proxy?: string;

  @ApiPropertyOptional({ description: '系统提示词' })
  @IsOptional()
  @IsString()
  readonly systemPrompt?: string;

  @ApiPropertyOptional({ description: '失败时自动禁用' })
  @IsOptional()
  @IsBoolean()
  readonly autoDisableOnFailure?: boolean;
}
