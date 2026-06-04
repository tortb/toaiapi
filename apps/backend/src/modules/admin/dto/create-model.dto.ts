import { IsString, IsOptional, IsInt, IsBoolean, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 创建 Model 请求 DTO
 */
export class CreateModelDto {
  @ApiProperty({ description: '模型名称（唯一标识）', example: 'deepseek-chat' })
  @IsString()
  @MaxLength(100)
  readonly name!: string;

  @ApiProperty({ description: '显示名称', example: 'DeepSeek Chat' })
  @IsString()
  @MaxLength(200)
  readonly displayName!: string;

  @ApiProperty({ description: '所属 Provider 名称', example: 'deepseek' })
  @IsString()
  @MaxLength(50)
  readonly providerId!: string;

  @ApiProperty({ description: '最大上下文长度', example: 128000 })
  @IsInt()
  @Min(1)
  readonly maxContext!: number;

  @ApiPropertyOptional({ description: '是否支持流式输出', example: true })
  @IsOptional()
  @IsBoolean()
  readonly supportsStreaming?: boolean;

  @ApiPropertyOptional({ description: '是否支持工具调用', example: true })
  @IsOptional()
  @IsBoolean()
  readonly supportsTools?: boolean;

  @ApiPropertyOptional({ description: '是否支持视觉', example: false })
  @IsOptional()
  @IsBoolean()
  readonly supportsVision?: boolean;
}
