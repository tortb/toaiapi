import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { hashPassword, verifyPassword, generateTokenPair, verifyToken, validatePasswordStrength } from '@toai/auth';
import { EmailService } from '../../common/services/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { randomBytes, createHash } from 'crypto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * 用户注册
   *
   * 流程：Argon2id 哈希密码 → 创建用户（依赖 DB 唯一约束） → 创建初始余额 → 返回 Token
   * SECURITY: 使用数据库唯一约束防止并发注册，捕获 P2002 错误
   *
   * @param dto - 注册数据（邮箱、密码、显示名称）
   * @returns 用户信息和 Token
   * @throws ConflictException 邮箱已注册
   */
  async register(dto: RegisterDto) {
    // SECURITY: 验证密码强度（大小写字母 + 数字 + 长度 8-128）
    const strength = validatePasswordStrength(dto.password);
    if (!strength.valid) {
      throw new BadRequestException(strength.errors);
    }

    const passwordHash = await hashPassword(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password_hash: passwordHash,
          display_name: dto.displayName,
          balance: {
            create: { amount: 0, frozen: 0 },
          },
        },
        include: { balance: true },
      });

      const tokens = await this.generateTokens(user.id, user.email, user.role);

      this.logger.log(`User registered: ${user.id}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          role: user.role,
        },
        tokens,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('该邮箱已被注册');
      }
      throw error;
    }
  }

  /**
   * 用户登录
   *
   * 流程：查找用户 → 检查状态 → Argon2id 验证密码 → 返回 Token
   * SECURITY: 登录失败统一返回相同错误信息，防止邮箱枚举
   *
   * @param dto - 登录数据（邮箱、密码）
   * @returns 用户信息和 Token
   * @throws UnauthorizedException 凭证无效或账号未激活
   */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('账号未激活或已被暂停');
    }

    const valid = await verifyPassword(user.password_hash, dto.password);
    if (!valid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    this.logger.log(`User logged in: ${user.id}`);

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
   *
   * 流程：验证 Refresh Token → 检查 Redis 中的指纹 → 删除旧指纹 → 生成新 Token 对
   * SECURITY: 使用 SHA-256 哈希存储 Refresh Token 指纹，而非截断字符串
   *
   * @param refreshToken - 刷新令牌
   * @returns 新的 Token 对
   * @throws UnauthorizedException Token 无效或已撤销
   */
  async refreshTokens(refreshToken: string) {
    let payload;
    try {
      payload = verifyToken(
        refreshToken,
        this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      );
    } catch {
      throw new UnauthorizedException('Refresh Token 无效或已过期');
    }

    // SECURITY: 使用 SHA-256 哈希比较，而非截断字符串
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.redis.get(`refresh:${payload.sub}`);

    if (!stored || stored !== tokenHash) {
      throw new UnauthorizedException('Refresh Token 已被撤销');
    }

    // 删除旧指纹，生成新 Token
    await this.redis.del(`refresh:${payload.sub}`);
    return this.generateTokens(payload.sub, payload.email, payload.role);
  }

  /**
   * 登出 - 撤销 Refresh Token
   *
   * @param userId - 用户 ID
   */
  async logout(userId: string) {
    await this.redis.del(`refresh:${userId}`);
    this.logger.log(`User logged out: ${userId}`);
  }

  /**
   * 修改密码
   *
   * 流程：验证当前密码 → 哈希新密码 → 更新数据库 → 撤销所有 Refresh Token
   * SECURITY: 新密码不能与旧密码相同
   *
   * @param userId - 用户 ID
   * @param currentPassword - 当前密码
   * @param newPassword - 新密码
   * @throws UnauthorizedException 用户不存在
   * @throws BadRequestException 当前密码错误或新旧密码相同
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    const valid = await verifyPassword(user.password_hash, currentPassword);
    if (!valid) {
      throw new BadRequestException('当前密码错误');
    }

    // SECURITY: 验证新密码强度
    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) {
      throw new BadRequestException(strength.errors);
    }

    // SECURITY: 新密码不能与旧密码相同
    if (currentPassword === newPassword) {
      throw new BadRequestException('新密码不能与当前密码相同');
    }

    const newHash = await hashPassword(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password_hash: newHash },
    });

    // 修改密码后撤销所有 Refresh Token，强制重新登录
    await this.redis.del(`refresh:${userId}`);
    this.logger.log(`Password changed for user: ${userId}`);
  }

  /**
   * 忘记密码 - 生成重置 Token 并缓存
   *
   * Token 有效期 1 小时，存储在 Redis 中。
   * 无论邮箱是否存在都返回相同消息，防止邮箱枚举。
   * SECURITY: 重置 Token 使用 crypto.randomBytes 生成
   * SECURITY: 不在日志中输出重置链接（防止日志泄露）
   *
   * @param email - 用户邮箱
   */
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // SECURITY: 用户不存在时也返回成功，防止邮箱枚举
      return;
    }

    const resetToken = randomBytes(32).toString('hex');
    const tokenKey = `password-reset:${resetToken}`;

    await this.redis.set(tokenKey, user.id, 3600);

    // SECURITY: 不在日志中输出重置链接，防止日志泄露
    this.logger.log(`Password reset token generated for user: ${user.id}`);

    // 发送密码重置邮件
    await this.emailService.sendPasswordResetEmail(email, resetToken);
  }

  /**
   * 重置密码
   *
   * 流程：验证重置 Token → 哈希新密码 → 更新数据库 → 删除 Token
   * SECURITY: 验证用户是否存在（防止已删除用户的 Token 被利用）
   *
   * @param token - 重置 Token
   * @param newPassword - 新密码
   * @throws BadRequestException Token 无效或已过期
   */
  async resetPassword(token: string, newPassword: string) {
    const tokenKey = `password-reset:${token}`;
    const userId = await this.redis.get(tokenKey);

    if (!userId) {
      throw new BadRequestException('重置 Token 无效或已过期');
    }

    // SECURITY: 验证新密码强度
    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) {
      throw new BadRequestException(strength.errors);
    }

    // SECURITY: 验证用户仍存在
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      await this.redis.del(tokenKey);
      throw new BadRequestException('用户不存在');
    }

    const newHash = await hashPassword(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password_hash: newHash },
    });

    // 删除重置 Token 和所有 Refresh Token
    await this.redis.del(tokenKey);
    await this.redis.del(`refresh:${userId}`);
    this.logger.log(`Password reset for user: ${userId}`);
  }

  /**
   * 生成 JWT Token 对并将 Refresh Token 指纹存入 Redis
   * SECURITY: 使用 SHA-256 哈希存储 Refresh Token 指纹
   *
   * @param userId - 用户 ID
   * @param email - 用户邮箱
   * @param role - 用户角色
   * @returns Token 响应对象
   */
  private async generateTokens(userId: string, email: string, role: string) {
    const tokenPair = generateTokenPair(
      { sub: userId, email, role, type: 'access' },
      {
        jwtSecret: this.config.getOrThrow<string>('JWT_SECRET'),
        jwtRefreshSecret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        accessTokenExpiry: this.config.get<string>('JWT_EXPIRATION', '15m'),
        refreshTokenExpiry: this.config.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
      },
    );

    // SECURITY: 使用 SHA-256 哈希存储 Refresh Token 指纹
    const tokenHash = this.hashToken(tokenPair.refreshToken);

    // 从配置读取 Refresh Token TTL（秒），默认 7 天
    const refreshTokenExpiry = this.config.get<string>('JWT_REFRESH_EXPIRATION', '7d');
    const refreshTtl = this.parseExpiryToSeconds(refreshTokenExpiry);

    await this.redis.set(`refresh:${userId}`, tokenHash, refreshTtl);

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900,
    };
  }

  /**
   * 计算 Token 的 SHA-256 哈希值
   * SECURITY: 用于安全存储 Refresh Token 指纹
   *
   * @param token - 原始 Token 字符串
   * @returns SHA-256 哈希（64 字符十六进制）
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * 解析过期时间字符串为秒数
   * 支持格式：'15m'、'1h'、'7d'、'30d'
   *
   * @param expiry - 过期时间字符串
   * @returns 秒数
   */
  private parseExpiryToSeconds(expiry: string): number {
    const match = expiry.match(/^(\d+)([mhd])$/);
    if (!match || !match[1] || !match[2]) {
      return 7 * 24 * 60 * 60; // 默认 7 天
    }
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return 7 * 24 * 60 * 60;
    }
  }
}
