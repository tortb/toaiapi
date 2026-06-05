import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { nanoid } from 'nanoid';
import { hashPassword } from '@toai/auth';
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
@Injectable()
export class ApiKeyService {
  private readonly logger = new Logger(ApiKeyService.name);

  /** 每个用户最多创建的 API Key 数量 */
  private readonly MAX_KEYS_PER_USER = 20;

  constructor(
    private readonly apiKeyRepo: ApiKeyRepository,
    private readonly redis: RedisService,
  ) {}

  /**
   * 创建 API Key
   *
   * @param userId - 用户 ID
   * @param dto - 创建参数
   * @returns API Key 信息（包含完整的 key，仅此一次）
   * @throws {ForbiddenException} 超过最大数量限制
   */
  async createApiKey(
    userId: string,
    dto: CreateApiKeyDto,
  ): Promise<ApiKeyResponseDto> {
    // 检查数量限制
    const count = await this.apiKeyRepo.countByUserId(userId);
    if (count >= this.MAX_KEYS_PER_USER) {
      throw new ForbiddenException(
        `Maximum ${this.MAX_KEYS_PER_USER} API keys per user`,
      );
    }

    // 生成 API Key
    const rawKey = `sk-toai-${nanoid(48)}`;
    const keyPrefix = rawKey.substring(0, 16);

    // 哈希存储
    const keyHash = await hashPassword(rawKey);

    // 创建记录
    const apiKey = await this.apiKeyRepo.create({
      user: { connect: { id: userId } },
      key_hash: keyHash,
      key_prefix: keyPrefix,
      name: dto.name,
      expires_at: dto.expiresAt ? new Date(dto.expiresAt) : null,
      rate_limit: dto.rateLimit,
      token_limit: dto.tokenLimit,
      model_limit: dto.modelLimit || [],
      ip_whitelist: dto.ipWhitelist || [],
    });

    this.logger.log(`API Key created: ${apiKey.id} for user ${userId}`);

    return {
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix: apiKey.key_prefix,
      key: rawKey, // 仅创建时返回
      isActive: apiKey.is_active,
      expiresAt: apiKey.expires_at,
      rateLimit: apiKey.rate_limit,
      tokenLimit: apiKey.token_limit,
      modelLimit: apiKey.model_limit,
      ipWhitelist: apiKey.ip_whitelist,
      createdAt: apiKey.created_at,
    };
  }

  /**
   * 获取用户的 API Key 列表
   */
  async listApiKeys(userId: string): Promise<ApiKeyResponseDto[]> {
    const keys = await this.apiKeyRepo.findByUserId(userId);
    return keys.map((key) => ({
      id: key.id,
      name: key.name,
      keyPrefix: key.key_prefix,
      // 不返回完整的 key
      isActive: key.is_active,
      expiresAt: key.expires_at,
      rateLimit: key.rate_limit,
      tokenLimit: key.token_limit,
      modelLimit: key.model_limit,
      ipWhitelist: key.ip_whitelist,
      lastUsedAt: key.last_used_at,
      totalRequests: key.total_requests,
      createdAt: key.created_at,
    }));
  }

  /**
   * 删除 API Key
   *
   * @param userId - 用户 ID
   * @param keyId - API Key ID
   * @throws {NotFoundException} API Key 不存在
   * @throws {ForbiddenException} 无权删除
   */
  async deleteApiKey(userId: string, keyId: string): Promise<void> {
    const apiKey = await this.apiKeyRepo.findById(keyId);

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    if (apiKey.user_id !== userId) {
      throw new ForbiddenException('Not authorized to delete this API key');
    }

    await this.apiKeyRepo.delete(keyId);

    // 清除缓存
    await this.redis.del(`apikey:prefix:${apiKey.key_prefix}`);

    this.logger.log(`API Key deleted: ${keyId}`);
  }

  /**
   * 更新 API Key
   *
   * @param userId - 用户 ID
   * @param keyId - API Key ID
   * @param dto - 更新参数
   * @throws {NotFoundException} API Key 不存在
   * @throws {ForbiddenException} 无权修改
   */
  async updateApiKey(
    userId: string,
    keyId: string,
    dto: Partial<CreateApiKeyDto>,
  ): Promise<ApiKeyResponseDto> {
    const apiKey = await this.apiKeyRepo.findById(keyId);

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    if (apiKey.user_id !== userId) {
      throw new ForbiddenException('Not authorized to update this API key');
    }

    const updated = await this.apiKeyRepo.update(keyId, {
      name: dto.name !== undefined ? dto.name : undefined,
      expires_at: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      rate_limit: dto.rateLimit,
      token_limit: dto.tokenLimit,
      model_limit: dto.modelLimit,
      ip_whitelist: dto.ipWhitelist,
    });

    // 清除缓存
    await this.redis.del(`apikey:prefix:${updated.key_prefix}`);

    return {
      id: updated.id,
      name: updated.name,
      keyPrefix: updated.key_prefix,
      isActive: updated.is_active,
      expiresAt: updated.expires_at,
      rateLimit: updated.rate_limit,
      tokenLimit: updated.token_limit,
      modelLimit: updated.model_limit,
      ipWhitelist: updated.ip_whitelist,
      createdAt: updated.created_at,
    };
  }

  /**
   * 启用/禁用 API Key
   */
  async toggleApiKey(
    userId: string,
    keyId: string,
    isActive: boolean,
  ): Promise<ApiKeyResponseDto> {
    const apiKey = await this.apiKeyRepo.findById(keyId);

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    if (apiKey.user_id !== userId) {
      throw new ForbiddenException('Not authorized to modify this API key');
    }

    const updated = await this.apiKeyRepo.update(keyId, {
      is_active: isActive,
    });

    // 清除缓存
    await this.redis.del(`apikey:prefix:${updated.key_prefix}`);

    this.logger.log(`API Key ${keyId} ${isActive ? 'enabled' : 'disabled'}`);

    return {
      id: updated.id,
      name: updated.name,
      keyPrefix: updated.key_prefix,
      isActive: updated.is_active,
      expiresAt: updated.expires_at,
      rateLimit: updated.rate_limit,
      tokenLimit: updated.token_limit,
      modelLimit: updated.model_limit,
      ipWhitelist: updated.ip_whitelist,
      createdAt: updated.created_at,
    };
  }

  /**
   * 轮换 API Key
   *
   * 生成新的 key 值，保留原有配置。旧 key 立即失效。
   *
   * @param userId - 用户 ID
   * @param keyId - API Key ID
   * @returns 新的 API Key 信息（包含完整 key，仅此一次）
   * @throws {NotFoundException} API Key 不存在
   * @throws {ForbiddenException} 无权操作
   */
  async rotateApiKey(userId: string, keyId: string): Promise<ApiKeyResponseDto> {
    const apiKey = await this.apiKeyRepo.findById(keyId);

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    if (apiKey.user_id !== userId) {
      throw new ForbiddenException('Not authorized to rotate this API key');
    }

    // 生成新的 key
    const rawKey = `sk-toai-${nanoid(48)}`;
    const keyPrefix = rawKey.substring(0, 16);
    const keyHash = await hashPassword(rawKey);

    // 更新记录（保留原有配置）
    const updated = await this.apiKeyRepo.update(keyId, {
      key_hash: keyHash,
      key_prefix: keyPrefix,
    });

    // 清除旧的缓存
    await this.redis.del(`apikey:prefix:${apiKey.key_prefix}`);

    this.logger.log(`API Key rotated: ${keyId} for user ${userId}`);

    return {
      id: updated.id,
      name: updated.name,
      keyPrefix: updated.key_prefix,
      key: rawKey, // 仅轮换时返回
      isActive: updated.is_active,
      expiresAt: updated.expires_at,
      rateLimit: updated.rate_limit,
      tokenLimit: updated.token_limit,
      modelLimit: updated.model_limit,
      ipWhitelist: updated.ip_whitelist,
      createdAt: updated.created_at,
    };
  }
}
