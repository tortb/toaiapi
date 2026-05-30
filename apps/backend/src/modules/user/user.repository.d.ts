import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
/**
 * 用户数据访问层
 *
 * 封装所有 User 相关的数据库操作。
 * 只负责数据访问，不包含业务逻辑。
 */
export declare class UserRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    /**
     * 根据 ID 查找用户
     */
    findById(id: string): Promise<User | null>;
    /**
     * 根据邮箱查找用户
     */
    findByEmail(email: string): Promise<User | null>;
    /**
     * 创建用户
     */
    create(data: Prisma.UserCreateInput): Promise<User>;
    /**
     * 更新用户
     */
    update(id: string, data: Prisma.UserUpdateInput): Promise<User>;
    /**
     * 软删除用户
     */
    softDelete(id: string): Promise<User>;
    /**
     * 检查邮箱是否已注册
     */
    existsByEmail(email: string): Promise<boolean>;
    /**
     * 获取用户列表（分页）
     */
    findMany(params: {
        skip?: number;
        take?: number;
        orderBy?: Prisma.UserOrderByWithRelationInput;
        where?: Prisma.UserWhereInput;
    }): Promise<User[]>;
    /**
     * 统计用户数量
     */
    count(where?: Prisma.UserWhereInput): Promise<number>;
}
//# sourceMappingURL=user.repository.d.ts.map