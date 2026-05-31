import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

/**
 * JWT 策略
 *
 * 从 Authorization 头中提取 Bearer Token，验证 JWT 签名和有效期。
 * 验证通过后返回用户信息，附加到 request.user。
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'default-jwt-secret-change-me',
      ),
    });
  }

  /**
   * 验证 JWT payload
   *
   * @param payload - 解码后的 JWT payload
   * @returns 用户信息
   */
  async validate(payload: {
    sub: string;
    email: string;
    role: string;
  }): Promise<{ id: string; email: string; role: string }> {
    // 检查用户是否存在且状态正常
    const user = await this.userService.findById(payload.sub);

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is not active');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
