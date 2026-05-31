import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { CurrentUserInfo } from '../../common/decorators/current-user.decorator';
/**
 * 用户控制器
 *
 * 处理用户相关的 HTTP 请求。
 * 所有接口都需要 JWT 认证。
 */
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    /**
     * 获取当前用户信息
     */
    getCurrentUser(user: CurrentUserInfo): Promise<UserResponseDto>;
    /**
     * 更新当前用户信息
     */
    updateCurrentUser(user: CurrentUserInfo, dto: UpdateUserDto): Promise<UserResponseDto>;
    /**
     * 删除当前用户（软删除）
     */
    deleteCurrentUser(user: CurrentUserInfo): Promise<void>;
    /**
     * 转换为响应 DTO
     */
    private toResponseDto;
}
//# sourceMappingURL=user.controller.d.ts.map