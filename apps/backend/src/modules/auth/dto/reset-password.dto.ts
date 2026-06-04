import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: '密码重置 Token' })
  @IsString()
  readonly token!: string;

  @ApiProperty({ description: '新密码（8-128位）', minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  readonly newPassword!: string;
}