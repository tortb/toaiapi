import { ApiKeyRepository } from './api-key.repository';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { ApiKeyResponseDto } from './dto/api-key-response.dto';
import { RedisService } from '../../redis/redis.service';
/**
 * API Key 业务服务
 *
 * 处理 API Key 的创建、删除、验证等业务逻辑。
 *
 * 安全规则：
 * - Key 使用 Argon2id 哈希存储
 * - 只在创建时返回一次完整的 key
 * - 使用 prefix 进行快速查找
 */
export declare class ApiKeyService {
    private readonly apiKeyRepo;
    private readonly redis;
    private readonly logger;
    /** 每个用户最多创建的 API Key 数量 */
    private readonly MAX_KEYS_PER_USER;
    constructor(apiKeyRepo: ApiKeyRepository, redis: RedisService);
    /**
     * 创建 API Key
     *
     * @param userId - 用户 ID
     * @param dto - 创建参数
     * @returns API Key 信息（包含完整的 key，仅此一次）
     * @throws {ForbiddenException} 超过最大数量限制
     */
    createApiKey(userId: string, dto: CreateApiKeyDto): Promise<ApiKeyResponseDto>;
    /**
     * 获取用户的 API Key 列表
     */
    listApiKeys(userId: string): Promise<ApiKeyResponseDto[]>;
    /**
     * 删除 API Key
     *
     * @param userId - 用户 ID
     * @param keyId - API Key ID
     * @throws {NotFoundException} API Key 不存在
     * @throws {ForbiddenException} 无权删除
     */
    deleteApiKey(userId: string, keyId: string): Promise<void>;
    /**
     * 更新 API Key
     *
     * @param userId - 用户 ID
     * @param keyId - API Key ID
     * @param dto - 更新参数
     * @throws {NotFoundException} API Key 不存在
     * @throws {ForbiddenException} 无权修改
     */
    updateApiKey(userId: string, keyId: string, dto: Partial<CreateApiKeyDto>): Promise<ApiKeyResponseDto>;
    /**
     * 启用/禁用 API Key
     */
    toggleApiKey(userId: string, keyId: string, isActive: boolean): Promise<ApiKeyResponseDto>;
}
//# sourceMappingURL=api-key.service.d.ts.map