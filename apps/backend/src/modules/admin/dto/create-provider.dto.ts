import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 创建 Provider 请求 DTO
 */
export class CreateProviderDto {
  @ApiProperty({ description: 'Provider 名称（唯一标识）', example: 'deepseek' })
  @IsString()
  @MaxLength(50)
  readonly name!: string;

  @ApiProperty({ description: '显示名称', example: 'DeepSeek' })
  @IsString()
  @MaxLength(100)
  readonly displayName!: string;

  @ApiProperty({ description: 'API 基础 URL', example: 'https://api.deepseek.com' })
  @IsUrl()
  readonly baseUrl!: string;

  @ApiPropertyOptional({ description: '是否启用', example: true })
  @IsOptional()
  readonly isActive?: boolean;
}
