import { IsString, IsOptional, IsInt, IsBoolean, MaxLength, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 更新 Model 请求 DTO
 */
export class UpdateModelDto {
  @ApiPropertyOptional({ description: '显示名称', example: 'DeepSeek Chat' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  readonly displayName?: string;

  @ApiPropertyOptional({ description: '最大上下文长度', example: 128000 })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly maxContext?: number;

  @ApiPropertyOptional({ description: '是否支持流式输出' })
  @IsOptional()
  @IsBoolean()
  readonly supportsStreaming?: boolean;

  @ApiPropertyOptional({ description: '是否支持工具调用' })
  @IsOptional()
  @IsBoolean()
  readonly supportsTools?: boolean;

  @ApiPropertyOptional({ description: '是否支持视觉' })
  @IsOptional()
  @IsBoolean()
  readonly supportsVision?: boolean;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;
}
