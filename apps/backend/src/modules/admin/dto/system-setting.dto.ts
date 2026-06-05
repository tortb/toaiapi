import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 单个设置项
 */
export class SettingItemDto {
  @ApiProperty({ description: '设置键名', example: 'site_name' })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiPropertyOptional({ description: '设置值（null 表示清除）', example: 'ToAIAPI' })
  @IsString()
  @IsOptional()
  value?: string | null;
}

/**
 * 批量更新设置
 */
export class BulkUpdateSettingsDto {
  @ApiProperty({ description: '设置项列表', type: [SettingItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SettingItemDto)
  settings!: SettingItemDto[];
}

/**
 * 更新单个设置
 */
export class UpdateSettingDto {
  @ApiPropertyOptional({ description: '设置值（null 表示清除）', example: 'ToAIAPI' })
  @IsString()
  @IsOptional()
  value?: string | null;
}

/**
 * 系统设置响应
 */
export class SystemSettingResponseDto {
  @ApiProperty({ description: '分类' })
  category!: string;

  @ApiProperty({ description: '键名' })
  key!: string;

  @ApiPropertyOptional({ description: '值' })
  value!: string | null;

  @ApiProperty({ description: '类型：string/number/boolean/json' })
  type!: string;
}
