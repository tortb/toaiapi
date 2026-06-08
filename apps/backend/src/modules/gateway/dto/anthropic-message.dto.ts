import { IsString, IsOptional, IsArray, IsNumber, IsBoolean, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Anthropic Message 内容项
 */
export class AnthropicContentItem {
  @ApiProperty({ description: '内容类型', example: 'text' })
  @IsString()
  type!: string;

  @ApiPropertyOptional({ description: '文本内容' })
  @IsOptional()
  @IsString()
  text?: string;
}

/**
 * Anthropic Message 消息项
 */
export class AnthropicMessage {
  @ApiProperty({ description: '角色', enum: ['user', 'assistant'] })
  @IsString()
  role!: 'user' | 'assistant';

  @ApiProperty({ description: '消息内容', type: [AnthropicContentItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnthropicContentItem)
  content!: AnthropicContentItem[] | string;
}

/**
 * Anthropic Messages API 请求 DTO
 */
export class CreateAnthropicMessageDto {
  @ApiProperty({ description: '模型名称', example: 'claude-sonnet-4-6' })
  @IsString()
  model!: string;

  @ApiProperty({ description: '最大输出 Token 数', example: 4096 })
  @IsNumber()
  @Min(1)
  @Max(200000)
  max_tokens!: number;

  @ApiProperty({ description: '消息列表', type: [AnthropicMessage] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnthropicMessage)
  messages!: AnthropicMessage[];

  @ApiPropertyOptional({ description: '系统提示词' })
  @IsOptional()
  @IsString()
  system?: string;

  @ApiPropertyOptional({ description: '是否流式输出', default: false })
  @IsOptional()
  @IsBoolean()
  stream?: boolean;

  @ApiPropertyOptional({ description: '温度参数', minimum: 0, maximum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  temperature?: number;

  @ApiPropertyOptional({ description: 'Top-p 采样', minimum: 0, maximum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  top_p?: number;

  @ApiPropertyOptional({ description: 'Top-k 采样' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  top_k?: number;

  @ApiPropertyOptional({ description: '停止序列', type: [String] })
  @IsOptional()
  @IsArray()
  stop_sequences?: string[];

  @ApiPropertyOptional({ description: '元数据' })
  @IsOptional()
  metadata?: Record<string, unknown>;
}
