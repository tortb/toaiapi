import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Provider 响应 DTO
 */
export class ProviderResponseDto {
  @ApiProperty({ description: 'Provider ID' })
  readonly id!: string;

  @ApiProperty({ description: '名称', example: 'deepseek' })
  readonly name!: string;

  @ApiProperty({ description: '显示名称', example: 'DeepSeek' })
  readonly displayName!: string;

  @ApiProperty({ description: 'API 基础 URL' })
  readonly baseUrl!: string;

  @ApiProperty({ description: '是否启用' })
  readonly isActive!: boolean;

  @ApiPropertyOptional({ description: '关联渠道数量' })
  readonly channelCount?: number;

  @ApiProperty({ description: '创建时间' })
  readonly createdAt!: Date;

  @ApiProperty({ description: '更新时间' })
  readonly updatedAt!: Date;
}
