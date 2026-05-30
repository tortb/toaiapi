import { User } from '@prisma/client';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
/**
 * 用户业务服务
 *
 * 处理用户相关的业务逻辑。
 * 通过 UserRepository 访问数据库。
 */
export declare class UserService {
    private readonly userRepo;
    private readonly logger;
    constructor(userRepo: UserRepository);
    /**
     * 创建用户（注册）
     *
     * @throws {ConflictException} 邮箱已注册
     * @throws {Error} 密码强度不足
     */
    createUser(dto: CreateUserDto): Promise<UserEntity>;
    /**
     * 根据 ID 查找用户
     *
     * @throws {NotFoundException} 用户不存在
     */
    findById(id: string): Promise<UserEntity>;
    /**
     * 根据邮箱查找用户
     *
     * @returns 用户实体或 null
     */
    findByEmail(email: string): Promise<User | null>;
    /**
     * 更新用户信息
     *
     * @throws {NotFoundException} 用户不存在
     */
    updateUser(id: string, dto: UpdateUserDto): Promise<UserEntity>;
    /**
     * 软删除用户
     *
     * @throws {NotFoundException} 用户不存在
     */
    deleteUser(id: string): Promise<void>;
}
//# sourceMappingURL=user.service.d.ts.map