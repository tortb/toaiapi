import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 登录请求 DTO
 */
export class LoginDto {
  @ApiProperty({ description: '邮箱地址', example: 'user@example.com' })
  @IsEmail()
  readonly email!: string;

  @ApiProperty({ description: '密码', example: 'SecurePass123' })
  @IsString()
  readonly password!: string;
}
