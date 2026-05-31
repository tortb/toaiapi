import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { hashPassword, verifyPassword, generateTokenPair, verifyToken } from '@toai/auth';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * 用户注册
   *
   * 流程：验证邮箱唯一性 → Argon2id 哈希密码 → 创建用户 → 创建初始余额 → 返回 Token
   */
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password_hash: passwordHash,
        display_name: dto.displayName,
      },
    });

    await this.prisma.userBalance.create({
      data: {
        user_id: user.id,
        amount: 0,
        frozen: 0,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    this.logger.log(`User registered: ${user.id} (${user.email})`);

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: user.role,
      },
      tokens,
    };
  }

  /**
   * 用户登录
   *
   * 流程：查找用户 → Argon2id 验证密码 → 返回 Token
   */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is not active');
    }

    const valid = await verifyPassword(user.password_hash, dto.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    this.logger.log(`User logged in: ${user.id} (${user.email})`);

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: user.role,
      },
      tokens,
    };
  }

  /**
   * 刷新 Token
   */
  async refreshTokens(refreshToken: string) {
    let payload;
    try {
      payload = verifyToken(
        refreshToken,
        this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const stored = await this.redis.get(`refresh:${payload.sub}`);
    if (!stored || stored !== refreshToken.slice(-36)) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    await this.redis.del(`refresh:${payload.sub}`);

    return this.generateTokens(payload.sub, payload.email, payload.role);
  }

  /**
   * 登出 - 撤销 Refresh Token
   */
  async logout(userId: string) {
    await this.redis.del(`refresh:${userId}`);
    this.logger.log(`User logged out: ${userId}`);
  }

  /**
   * 修改密码
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const valid = await verifyPassword(user.password_hash, currentPassword);
    if (!valid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const newHash = await hashPassword(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password_hash: newHash },
    });

    await this.redis.del(`refresh:${userId}`);
    this.logger.log(`Password changed for user: ${userId}`);
  }

  /**
   * 忘记密码 - 生成重置 Token 并缓存
   *
   * Token 有效期 1 小时，存储在 Redis 中。
   * 无论邮箱是否存在都返回相同消息，防止邮箱枚举。
   */
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return;
    }

    const resetToken = randomBytes(32).toString('hex');
    const tokenKey = `password-reset:${resetToken}`;

    await this.redis.set(tokenKey, user.id, 3600);

    const appUrl = this.config.get('APP_URL', 'http://localhost:3000');
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;
    this.logger.log(`Password reset link for ${email}: ${resetUrl}`);

    // TODO: 集成邮件服务后，发送邮件替代控制台输出
  }

  /**
   * 重置密码
   */
  async resetPassword(token: string, newPassword: string) {
    const tokenKey = `password-reset:${token}`;
    const userId = await this.redis.get(tokenKey);

    if (!userId) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const newHash = await hashPassword(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password_hash: newHash },
    });

    await this.redis.del(tokenKey);
    await this.redis.del(`refresh:${userId}`);
    this.logger.log(`Password reset for user: ${userId}`);
  }

  /**
   * 生成 JWT Token 对
   */
  private async generateTokens(userId: string, email: string, role: string) {
    const tokenPair = generateTokenPair(
      { sub: userId, email, role },
      {
        jwtSecret: this.config.getOrThrow<string>('JWT_SECRET'),
        jwtRefreshSecret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        accessTokenExpiry: this.config.get<string>('JWT_EXPIRATION', '15m'),
        refreshTokenExpiry: this.config.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
      },
    );

    const refreshTtl = 7 * 24 * 60 * 60;
    await this.redis.set(
      `refresh:${userId}`,
      tokenPair.refreshToken.slice(-36),
      refreshTtl,
    );

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900,
    };
  }
}