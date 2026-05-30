import { Prisma, ApiKey } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
/**
 * API Key 数据访问层
 *
 * 封装所有 ApiKey 相关的数据库操作。
 */
export declare class ApiKeyRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    /**
     * 根据 ID 查找
     */
    findById(id: string): Promise<ApiKey | null>;
    /**
     * 根据 key_hash 查找
     */
    findByKeyHash(keyHash: string): Promise<ApiKey | null>;
    /**
     * 根据 key_prefix 查找
     */
    findByKeyPrefix(prefix: string): Promise<ApiKey | null>;
    /**
     * 创建 API Key
     */
    create(data: Prisma.ApiKeyCreateInput): Promise<ApiKey>;
    /**
     * 更新 API Key
     */
    update(id: string, data: Prisma.ApiKeyUpdateInput): Promise<ApiKey>;
    /**
     * 删除 API Key
     */
    delete(id: string): Promise<ApiKey>;
    /**
     * 获取用户的 API Key 列表
     */
    findByUserId(userId: string): Promise<ApiKey[]>;
    /**
     * 统计用户的 API Key 数量
     */
    countByUserId(userId: string): Promise<number>;
}
//# sourceMappingURL=api-key.repository.d.ts.map