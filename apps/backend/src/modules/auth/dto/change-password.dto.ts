import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: '当前密码' })
  @IsString()
  readonly currentPassword!: string;

  @ApiProperty({ description: '新密码（8-128位）', minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  readonly newPassword!: string;
}