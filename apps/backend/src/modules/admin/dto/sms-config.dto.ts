import {
  IsString,
  IsBoolean,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 更新短信配置 DTO
 */
export class UpdateSmsConfigDto {
  @ApiProperty({ description: '是否启用', required: false })
  @IsBoolean()
  @IsOptional()
  is_enabled?: boolean;

  @ApiProperty({ description: '显示名称', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  display_name?: string;

  @ApiProperty({ description: '阿里云 AccessKey ID', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  access_key_id?: string;

  @ApiProperty({ description: '阿里云 AccessKey Secret', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  access_key_secret?: string;

  @ApiProperty({ description: '短信签名', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  sign_name?: string;

  @ApiProperty({ description: '默认模板 CODE', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  template_code?: string;
}

/**
 * 短信配置响应 DTO
 */
export class SmsConfigResponseDto {
  @ApiProperty({ description: '配置ID' })
  id!: string;

  @ApiProperty({ description: '配置名称' })
  name!: string;

  @ApiProperty({ description: '显示名称' })
  display_name!: string;

  @ApiProperty({ description: '是否启用' })
  is_enabled!: boolean;

  @ApiProperty({ description: 'AccessKey ID' })
  access_key_id!: string | null;

  @ApiProperty({ description: 'AccessKey Secret（脱敏）' })
  access_key_secret!: string | null;

  @ApiProperty({ description: '短信签名' })
  sign_name!: string | null;

  @ApiProperty({ description: '默认模板 CODE' })
  template_code!: string | null;

  @ApiProperty({ description: '额外配置' })
  extra_config!: unknown;

  @ApiProperty({ description: '创建时间' })
  created_at!: Date;

  @ApiProperty({ description: '更新时间' })
  updated_at!: Date;
}

/**
 * 测试短信发送 DTO
 */
export class SendTestSmsDto {
  @ApiProperty({ description: '手机号', example: '13800138000' })
  @IsString()
  @MaxLength(20)
  phone!: string;

  @ApiProperty({
    description: '模板参数（JSON 字符串）',
    required: false,
    example: '{"code":"123456"}',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  templateParam?: string;

  @ApiProperty({ description: '模板 CODE', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  templateCode?: string;
}

/**
 * 测试短信发送响应 DTO
 */
export class TestSmsResponseDto {
  @ApiProperty({ description: '是否成功' })
  success!: boolean;

  @ApiProperty({ description: '消息' })
  message!: string;
}
