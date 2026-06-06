import { IsEmail, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 发送邮箱验证码 DTO
 */
export class SendVerificationCodeDto {
  @ApiProperty({ description: '邮箱地址', example: 'user@example.com' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  readonly email!: string;

  @ApiPropertyOptional({ description: '用途', example: '注册', default: '注册' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  readonly purpose?: string;
}
