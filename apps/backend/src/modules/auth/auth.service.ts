import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { BillingService } from '../billing/billing.service';
import { RedisService } from '../../redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, TokenResponseDto } from './dto/token-response.dto';
import {
  hashPassword,
  verifyPassword,
  generateTokenPair,
  verifyToken,
} from '@toai/auth';

/**
 * 认证业务服务
 *
 * 处理用户注册、登录、Token 刷新等认证相关逻辑。
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  /** Refresh Token 在 Redis 中的前缀 */
  private readonly REFRESH_TOKEN_PREFIX = 'refresh_token:';

  /** Refresh Token 有效期（秒）：7 天 */
  private readonly REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;

  constructor(
    private readonly userService: UserService,
    private readonly billingService: BillingService,
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 用户注册
   *
   * @returns 用户信息 + Token
   * @throws {ConflictException} 邮箱已注册
   */
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    // 创建用户
    const user = await this.userService.createUser({
      email: dto.email,
      password: dto.password,
      displayName: dto.displayName,
    });

    // 创建用户余额（初始为 0）
    await this.billingService.createBalance(user.id);

    // 生成 Token
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
   * @returns 用户信息 + Token
   * @throws {UnauthorizedException} 邮箱或密码错误
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    // 查找用户
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 检查用户状态
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is not active');
    }

    // 验证密码
    const isPasswordValid = await verifyPassword(user.password_hash, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 生成 Token
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
   *
   * @param refreshToken - 刷新令牌
   * @returns 新的 Token 对
   * @throws {UnauthorizedException} Token 无效或已过期
   */
  async refreshTokens(refreshToken: string): Promise<TokenResponseDto> {
    // 验证 Refresh Token
    let payload;
    try {
      payload = verifyToken(
        refreshToken,
        this.configService.get<string>('JWT_REFRESH_SECRET', 'default-refresh-secret'),
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // 检查 Redis 中是否存在
    const storedTokenId = await this.redis.get(
      `${this.REFRESH_TOKEN_PREFIX}${payload.sub}`,
    );
    if (!storedTokenId || storedTokenId !== payload.jti) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    // 删除旧的 Refresh Token（一次性使用）
    await this.redis.del(`${this.REFRESH_TOKEN_PREFIX}${payload.sub}`);

    // 生成新的 Token 对
    return this.generateTokens(payload.sub, payload.email, payload.role);
  }

  /**
   * 登出（撤销 Refresh Token）
   */
  async logout(userId: string): Promise<void> {
    await this.redis.del(`${this.REFRESH_TOKEN_PREFIX}${userId}`);
    this.logger.log(`User logged out: ${userId}`);
  }

  /**
   * 生成 Token 对
   *
   * @returns Token 响应
   */
  private async generateTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<TokenResponseDto> {
    const tokenPair = generateTokenPair({
      sub: userId,
      email,
      role,
    });

    // 存储 Refresh Token 到 Redis
    await this.redis.set(
      `${this.REFRESH_TOKEN_PREFIX}${userId}`,
      tokenPair.refreshToken.slice(-36), // 存储 token 的一部分作为标识
      this.REFRESH_TOKEN_TTL,
    );

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900, // 15 分钟
    };
  }
}
