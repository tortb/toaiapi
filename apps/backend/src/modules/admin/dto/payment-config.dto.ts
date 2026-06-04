import { IsString, IsBoolean, IsOptional, IsUrl, IsObject, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 更新支付配置 DTO
 */
export class UpdatePaymentConfigDto {
  @ApiProperty({ description: '显示名称', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  display_name?: string;

  @ApiProperty({ description: '是否启用', required: false })
  @IsBoolean()
  @IsOptional()
  is_enabled?: boolean;

  @ApiProperty({ description: '商户ID', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  merchant_id?: string;

  @ApiProperty({ description: '商户密钥', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  merchant_key?: string;

  @ApiProperty({ description: '商户秘钥/私钥', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  merchant_secret?: string;

  @ApiProperty({ description: 'API网关地址', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  api_endpoint?: string;

  @ApiProperty({ description: '异步通知地址', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notify_url?: string;

  @ApiProperty({ description: '同步跳转地址', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  return_url?: string;

  @ApiProperty({ description: '额外配置', required: false })
  @IsObject()
  @IsOptional()
  extra_config?: Record<string, any>;
}

/**
 * 支付配置响应 DTO
 */
export class PaymentConfigResponseDto {
  @ApiProperty({ description: '配置ID' })
  id!: string;

  @ApiProperty({ description: '配置名称' })
  name!: string;

  @ApiProperty({ description: '显示名称' })
  display_name!: string;

  @ApiProperty({ description: '是否启用' })
  is_enabled!: boolean;

  @ApiProperty({ description: '商户ID' })
  merchant_id!: string | null;

  @ApiProperty({ description: '商户密钥（脱敏）' })
  merchant_key!: string | null;

  @ApiProperty({ description: '商户秘钥（脱敏）' })
  merchant_secret!: string | null;

  @ApiProperty({ description: 'API网关地址' })
  api_endpoint!: string | null;

  @ApiProperty({ description: '异步通知地址' })
  notify_url!: string | null;

  @ApiProperty({ description: '同步跳转地址' })
  return_url!: string | null;

  @ApiProperty({ description: '额外配置' })
  extra_config!: any;

  @ApiProperty({ description: '创建时间' })
  created_at!: Date;

  @ApiProperty({ description: '更新时间' })
  updated_at!: Date;
}
