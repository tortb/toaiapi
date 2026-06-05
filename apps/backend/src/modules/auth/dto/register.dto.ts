import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 注册请求 DTO
 */
export class RegisterDto {
  @ApiProperty({ description: '邮箱地址', example: 'user@example.com' })
  @IsEmail()
  readonly email!: string;

  @ApiProperty({
    description: '密码（8-128位，需包含大小写字母和数字）',
    example: 'SecurePass123',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  readonly password!: string;

  @ApiPropertyOptional({ description: '显示名称', example: 'John Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  readonly displayName?: string;

  @ApiPropertyOptional({ description: '邀请码', example: 'ABC123' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  readonly inviteCode?: string;

  @ApiPropertyOptional({ description: '阿里云验证码 Token' })
  @IsOptional()
  @IsString()
  readonly captchaToken?: string;

  @ApiPropertyOptional({ description: '邮箱验证码' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  readonly emailCode?: string;
}
