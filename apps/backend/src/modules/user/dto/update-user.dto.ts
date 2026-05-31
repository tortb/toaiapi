import { IsString, MaxLength, IsOptional, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 更新用户 DTO
 *
 * 用于更新用户个人信息
 */
export class UpdateUserDto {
  @ApiPropertyOptional({ description: '显示名称', example: 'John Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  readonly displayName?: string;

  @ApiPropertyOptional({
    description: '头像 URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  readonly avatarUrl?: string;
}
