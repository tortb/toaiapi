import { IsString, IsIn, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 修改用户状态请求 DTO
 */
export class UpdateUserStatusDto {
  @ApiProperty({
    description: '目标状态',
    enum: ['ACTIVE', 'SUSPENDED', 'BANNED'],
    example: 'SUSPENDED',
  })
  @IsString()
  @IsIn(['ACTIVE', 'SUSPENDED', 'BANNED'])
  readonly status!: string;

  @ApiPropertyOptional({ description: '操作原因', example: '违规行为' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly reason?: string;
}
