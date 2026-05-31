import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Token 响应 DTO
 *
 * 登录成功后返回的 token 信息
 */
export class TokenResponseDto {
  @ApiProperty({ description: '访问令牌（15分钟有效）' })
  readonly accessToken!: string;

  @ApiProperty({ description: '刷新令牌（7天有效）' })
  readonly refreshToken!: string;

  @ApiProperty({ description: '令牌类型', example: 'Bearer' })
  readonly tokenType!: string;

  @ApiProperty({ description: '访问令牌过期时间（秒）', example: 900 })
  readonly expiresIn!: number;
}

/**
 * 用户信息 + Token 响应
 */
export class AuthResponseDto {
  @ApiProperty({ description: '用户信息' })
  readonly user!: {
    readonly id: string;
    readonly email: string;
    readonly displayName: string | null;
    readonly role: string;
  };

  @ApiProperty({ description: 'Token 信息' })
  readonly tokens!: TokenResponseDto;
}
