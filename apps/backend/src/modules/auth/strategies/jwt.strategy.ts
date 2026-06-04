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
 * SECURITY: 显式指定 HS256 算法，防止算法混淆攻击
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
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      algorithms: ['HS256'], // SECURITY: 显式指定算法
    });
  }

  /**
   * 验证 JWT payload
   *
   * SECURITY: 检查用户存在性，防止已删除用户的 Token 被利用
   * SECURITY: 检查 Token 类型，只接受 access token
   *
   * @param payload - 解码后的 JWT payload
   * @returns 用户信息（附加到 request.user）
   * @throws UnauthorizedException 用户不存在、未激活或 Token 类型错误
   */
  async validate(payload: {
    sub: string;
    email: string;
    role: string;
    type?: string;
  }): Promise<{ id: string; email: string; role: string }> {
    // SECURITY: 只接受 access token
    if (payload.type && payload.type !== 'access') {
      throw new UnauthorizedException('Token 类型无效');
    }

    // SECURITY: 检查用户是否存在
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // SECURITY: 检查用户状态
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('账号未激活或已被暂停');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
