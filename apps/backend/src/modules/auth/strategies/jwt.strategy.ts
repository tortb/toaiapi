import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { StrategyOptions } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

function buildJwtStrategyOptions(configService: ConfigService) {
  const publicKey = configService.get<string>('JWT_PUBLIC_KEY');
  const issuer = configService.get<string>('JWT_ISSUER');
  const audience = configService.get<string>('JWT_AUDIENCE');

  const asymmetricAlgorithms: StrategyOptions['algorithms'] = [configService.get<'RS256' | 'ES256'>('JWT_ALGORITHM', 'RS256')];
  const hmacAlgorithms: StrategyOptions['algorithms'] = ['HS256'];

  if (publicKey) {
    return {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey.replace(/\\n/g, '\n'),
      algorithms: asymmetricAlgorithms,
      ...(issuer ? { issuer } : {}),
      ...(audience ? { audience } : {}),
    };
  }

  return {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    algorithms: hmacAlgorithms,
    ...(issuer ? { issuer } : {}),
    ...(audience ? { audience } : {}),
  };
}

/**
 * JWT 策略
 *
 * 从 Authorization 头中提取 Bearer Token，验证 JWT 签名和有效期。
 * 验证通过后返回用户信息，附加到 request.user。
 * SECURITY: 优先使用 RS256/ES256；未配置公私钥时兼容旧版 HS256。
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super(buildJwtStrategyOptions(configService));
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
    // SECURITY: 只接受 access token（缺失 type 字段也拒绝）
    if (!payload.type || payload.type !== 'access') {
      throw new UnauthorizedException('Token 类型无效');
    }

    // SECURITY: 直接查询数据库，避免 UserService 的 NotFoundException
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub, deleted_at: null },
      select: { id: true, email: true, role: true, status: true },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在或已被删除，请重新登录');
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
