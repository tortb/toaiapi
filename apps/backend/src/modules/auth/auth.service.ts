import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { hashPassword, verifyPassword, generateTokenPair, verifyToken, validatePasswordStrength } from '@toai/auth';
import { EmailService } from '../../common/services/email.service';
import { SystemSettingService } from '../../common/services/system-setting.service';
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
    private readonly systemSettingService: SystemSettingService,
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
  async register(dto: RegisterDto, captchaVerifyParam?: string) {
    // 功能开关：检查是否允许注册
    const allowRegister = await this.systemSettingService.getTypedByKey<boolean>('allow_register', true);
    if (!allowRegister) {
      throw new ForbiddenException('注册功能已关闭');
    }

    // 白名单检查
    const whitelistEnabled = await this.systemSettingService.getTypedByKey<boolean>('whitelist_enabled', false);
    if (whitelistEnabled) {
      const whitelistRaw = (await this.systemSettingService.getByKey('whitelist_emails')) ?? '';
      const whitelist = whitelistRaw
        .split(/[,;\n]/)
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
      if (whitelist.length > 0 && !whitelist.includes(dto.email.toLowerCase())) {
        throw new ForbiddenException('该邮箱不在允许注册的白名单中');
      }
    }

    // 邀请码检查
    const inviteCodeRequired = await this.systemSettingService.getTypedByKey<boolean>('invite_code_required', false);
    if (inviteCodeRequired && !dto.inviteCode) {
      throw new BadRequestException('请填写邀请码');
    }

    // 阿里云 ESA AI 验证码检查（每 URL 独立 Scene ID）
    const captchaRegisterEnabled = await this.systemSettingService.getTypedByKey<boolean>('captcha_register_enabled', false);
    if (captchaRegisterEnabled) {
      const sceneId = await this.systemSettingService.getByKey('captcha_register_scene_id');
      if (sceneId && !captchaVerifyParam) {
        throw new BadRequestException('请完成验证码验证');
      }
    }

    // 邮箱验证码检查
    const emailVerify = await this.systemSettingService.getTypedByKey<boolean>('email_verify', false);
    if (emailVerify && !dto.emailCode) {
      throw new BadRequestException('请输入邮箱验证码');
    }
    // TODO: 验证邮箱验证码的正确性

    // SECURITY: 验证密码强度（大小写字母 + 数字 + 长度 8-128）
    const strength = validatePasswordStrength(dto.password);
    if (!strength.valid) {
      throw new BadRequestException(strength.errors);
    }

    const passwordHash = await hashPassword(dto.password);

    // 读取默认赠送余额（元）和额度，余额转换为分存储
    const defaultBalanceYuan = (await this.systemSettingService.getTypedByKey<number>('default_balance', 0)) ?? 0;
    const defaultBalanceFen = Math.round(defaultBalanceYuan * 100);
    const defaultQuota = (await this.systemSettingService.getTypedByKey<number>('default_quota', 0)) ?? 0;

    // 读取默认角色和用户组
    const defaultRole = (await this.systemSettingService.getByKey('default_role')) ?? 'USER';
    const defaultGroupName = (await this.systemSettingService.getByKey('default_group')) ?? 'default';

    // 查找默认用户组 ID
    let groupId: string | undefined;
    if (defaultGroupName && defaultGroupName !== 'default') {
      const group = await this.prisma.userGroup.findUnique({
        where: { name: defaultGroupName },
      });
      if (group) {
        groupId = group.id;
      }
    }

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password_hash: passwordHash,
          display_name: dto.displayName,
          role: defaultRole as any,
          group_id: groupId,
          balance: {
            create: { amount: defaultBalanceFen, frozen: 0 },
          },
        },
        include: { balance: true },
      });

      const tokens = await this.generateTokens(user.id, user.email, user.role);

      this.logger.log(`User registered: ${user.id} (balance: ${defaultBalanceYuan} yuan, role: ${defaultRole})`);

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
  async login(dto: LoginDto, captchaVerifyParam?: string) {
    // 阿里云 ESA AI 验证码检查（每 URL 独立 Scene ID）
    const captchaLoginEnabled = await this.systemSettingService.getTypedByKey<boolean>('captcha_login_enabled', false);
    if (captchaLoginEnabled) {
      const sceneId = await this.systemSettingService.getByKey('captcha_login_scene_id');
      if (sceneId && !captchaVerifyParam) {
        throw new BadRequestException('请完成验证码验证');
      }
    }

    // SECURITY: 暴力破解防护 - 检查登录失败次数
    const failKey = `login-fail:${dto.email}`;
    const failCount = await this.redis.getCounter(failKey);

    if (failCount >= 5) {
      const lockoutSeconds = Math.min(Math.pow(2, failCount - 5) * 60, 3600);
      throw new UnauthorizedException(
        `登录失败次数过多，请 ${lockoutSeconds} 秒后再试`,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email, deleted_at: null },
    });
    if (!user) {
      await this.recordLoginFail(dto.email);
      throw new UnauthorizedException('邮箱或密码错误');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('账号未激活或已被暂停');
    }

    const valid = await verifyPassword(user.password_hash, dto.password);
    if (!valid) {
      await this.recordLoginFail(dto.email);
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 登录成功，清除失败计数
    await this.redis.del(failKey);

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
  async forgotPassword(email: string, captchaVerifyParam?: string) {
    // 阿里云 ESA AI 验证码检查（每 URL 独立 Scene ID）
    const captchaForgotEnabled = await this.systemSettingService.getTypedByKey<boolean>('captcha_forgot_password_enabled', false);
    if (captchaForgotEnabled) {
      const sceneId = await this.systemSettingService.getByKey('captcha_forgot_password_scene_id');
      if (sceneId && !captchaVerifyParam) {
        throw new BadRequestException('请完成验证码验证');
      }
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // SECURITY: 用户不存在时也返回成功，防止邮箱枚举
      return;
    }

    // SECURITY: 每用户每 5 分钟只能请求一次密码重置
    const rateLimitKey = `password-reset-rate:${user.id}`;
    const isRateLimited = await this.redis.exists(rateLimitKey);
    if (isRateLimited) {
      this.logger.warn(`Password reset rate limited for user: ${user.id}`);
      return;
    }

    const resetToken = randomBytes(32).toString('hex');
    const tokenKey = `password-reset:${resetToken}`;

    // 设置速率限制（5 分钟）和 token 有效期（1 小时）
    await this.redis.set(rateLimitKey, '1', 300);
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
   * 记录登录失败（指数退避）
   * 失败计数 15 分钟后自动过期
   */
  private async recordLoginFail(email: string): Promise<void> {
    const failKey = `login-fail:${email}`;
    await this.redis.incr(failKey);
    await this.redis.expire(failKey, 900);
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

    // 从配置读取 Access Token 过期时间（秒），默认 15 分钟
    const accessTokenExpiry = this.config.get<string>('JWT_EXPIRATION', '15m');
    const accessTtl = this.parseExpiryToSeconds(accessTokenExpiry);

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      tokenType: 'Bearer',
      expiresIn: accessTtl,
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
