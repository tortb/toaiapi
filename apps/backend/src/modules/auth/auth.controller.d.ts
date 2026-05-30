import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, TokenResponseDto } from './dto/token-response.dto';
import { CurrentUserInfo } from '../../common/decorators/current-user.decorator';
/**
 * 认证控制器
 *
 * 处理用户注册、登录、Token 刷新等认证相关请求。
 */
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    /**
     * 用户注册
     */
    register(dto: RegisterDto): Promise<AuthResponseDto>;
    /**
     * 用户登录
     */
    login(dto: LoginDto): Promise<AuthResponseDto>;
    /**
     * 刷新 Token
     */
    refresh(refreshToken: string): Promise<TokenResponseDto>;
    /**
     * 登出
     */
    logout(user: CurrentUserInfo): Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map