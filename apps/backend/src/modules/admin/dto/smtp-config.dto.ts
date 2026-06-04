import {
  IsString,
  IsBoolean,
  IsInt,
  IsOptional,
  IsEmail,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 更新SMTP配置 DTO
 */
export class UpdateSmtpConfigDto {
  @ApiProperty({ description: '是否启用', required: false })
  @IsBoolean()
  @IsOptional()
  is_enabled?: boolean;

  @ApiProperty({ description: 'SMTP服务器地址', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  host?: string;

  @ApiProperty({ description: 'SMTP端口', required: false, default: 587 })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(65535)
  port?: number;

  @ApiProperty({ description: '是否使用TLS', required: false, default: false })
  @IsBoolean()
  @IsOptional()
  secure?: boolean;

  @ApiProperty({ description: 'SMTP用户名', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  username?: string;

  @ApiProperty({ description: 'SMTP密码', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  password?: string;

  @ApiProperty({ description: '发件人名称', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  from_name?: string;

  @ApiProperty({ description: '发件人邮箱', required: false })
  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  from_address?: string;
}

/**
 * SMTP配置响应 DTO
 */
export class SmtpConfigResponseDto {
  @ApiProperty({ description: '配置ID' })
  id!: string;

  @ApiProperty({ description: '配置名称' })
  name!: string;

  @ApiProperty({ description: '是否启用' })
  is_enabled!: boolean;

  @ApiProperty({ description: 'SMTP服务器地址' })
  host!: string | null;

  @ApiProperty({ description: 'SMTP端口' })
  port!: number;

  @ApiProperty({ description: '是否使用TLS' })
  secure!: boolean;

  @ApiProperty({ description: 'SMTP用户名' })
  username!: string | null;

  @ApiProperty({ description: 'SMTP密码（脱敏）' })
  password!: string | null;

  @ApiProperty({ description: '发件人名称' })
  from_name!: string | null;

  @ApiProperty({ description: '发件人邮箱' })
  from_address!: string | null;

  @ApiProperty({ description: '额外配置' })
  extra_config!: any;

  @ApiProperty({ description: '创建时间' })
  created_at!: Date;

  @ApiProperty({ description: '更新时间' })
  updated_at!: Date;
}

/**
 * 测试邮件发送 DTO
 */
export class SendTestEmailDto {
  @ApiProperty({ description: '测试邮箱地址' })
  @IsEmail()
  @MaxLength(255)
  email!: string;
}

/**
 * 测试SMTP连接响应 DTO
 */
export class TestSmtpResponseDto {
  @ApiProperty({ description: '是否成功' })
  success!: boolean;

  @ApiProperty({ description: '消息' })
  message!: string;
}
