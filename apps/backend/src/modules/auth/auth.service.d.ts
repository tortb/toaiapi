import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { BillingService } from '../billing/billing.service';
import { RedisService } from '../../redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, TokenResponseDto } from './dto/token-response.dto';
/**
 * 认证业务服务
 *
 * 处理用户注册、登录、Token 刷新等认证相关逻辑。
 */
export declare class AuthService {
    private readonly userService;
    private readonly billingService;
    private readonly redis;
    private readonly configService;
    private readonly logger;
    /** Refresh Token 在 Redis 中的前缀 */
    private readonly REFRESH_TOKEN_PREFIX;
    /** Refresh Token 有效期（秒）：7 天 */
    private readonly REFRESH_TOKEN_TTL;
    constructor(userService: UserService, billingService: BillingService, redis: RedisService, configService: ConfigService);
    /**
     * 用户注册
     *
     * @returns 用户信息 + Token
     * @throws {ConflictException} 邮箱已注册
     */
    register(dto: RegisterDto): Promise<AuthResponseDto>;
    /**
     * 用户登录
     *
     * @returns 用户信息 + Token
     * @throws {UnauthorizedException} 邮箱或密码错误
     */
    login(dto: LoginDto): Promise<AuthResponseDto>;
    /**
     * 刷新 Token
     *
     * @param refreshToken - 刷新令牌
     * @returns 新的 Token 对
     * @throws {UnauthorizedException} Token 无效或已过期
     */
    refreshTokens(refreshToken: string): Promise<TokenResponseDto>;
    /**
     * 登出（撤销 Refresh Token）
     */
    logout(userId: string): Promise<void>;
    /**
     * 生成 Token 对
     *
     * @returns Token 响应
     */
    private generateTokens;
}
//# sourceMappingURL=auth.service.d.ts.map