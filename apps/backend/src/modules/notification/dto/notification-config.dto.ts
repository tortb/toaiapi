import { IsBoolean, IsOptional, IsString, IsNumber, Min, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 更新通知配置 DTO
 */
export class UpdateNotificationConfigDto {
  @ApiPropertyOptional({ description: '是否启用邮件通知' })
  @IsOptional()
  @IsBoolean()
  email_enabled?: boolean;

  @ApiPropertyOptional({ description: '是否启用 Webhook 通知' })
  @IsOptional()
  @IsBoolean()
  webhook_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Webhook URL' })
  @IsOptional()
  @IsUrl()
  webhook_url?: string;

  @ApiPropertyOptional({ description: '是否启用 WxPusher 通知' })
  @IsOptional()
  @IsBoolean()
  wxpusher_enabled?: boolean;

  @ApiPropertyOptional({ description: 'WxPusher UID' })
  @IsOptional()
  @IsString()
  wxpusher_uid?: string;

  @ApiPropertyOptional({ description: '余额不足阈值（分）', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  low_balance_threshold?: number;
}

/**
 * 测试通知 DTO
 */
export class TestNotificationDto {
  @ApiProperty({ description: '通知渠道', enum: ['email', 'webhook', 'wxpusher'] })
  @IsString()
  channel!: string;
}
