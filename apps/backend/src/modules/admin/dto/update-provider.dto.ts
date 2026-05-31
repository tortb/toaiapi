import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 更新 Provider 请求 DTO
 */
export class UpdateProviderDto {
  @ApiPropertyOptional({ description: '显示名称', example: 'DeepSeek' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly displayName?: string;

  @ApiPropertyOptional({ description: 'API 基础 URL', example: 'https://api.deepseek.com' })
  @IsOptional()
  @IsUrl()
  readonly baseUrl?: string;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsOptional()
  readonly isActive?: boolean;
}
