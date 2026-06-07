import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';
import { hashPassword } from '@toai/auth';
import { ApiKeyRepository, ApiKeyWithGroup, ApiKeyUsageWindow } from './api-key.repository';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { ApiKeyResponseDto } from './dto/api-key-response.dto';
import { RedisService } from '../../redis/redis.service';
import { SystemSettingService } from '../../common/services/system-setting.service';
import { toJsonArray, parseJsonArray } from '../../common/utils/json-array.util';

interface NormalizedApiKeyInput {
  readonly name?: string;
  readonly count: number;
  readonly expiresAt: Date | null | undefined;
  readonly rateLimit: number | null | undefined;
  readonly tokenLimit: number | null | undefined;
  readonly rpmLimit: number | null | undefined;
  readonly tpmLimit: number | null | undefined;
  readonly unlimitedQuota: boolean | undefined;
  readonly groupIdentifier: string | null | undefined;
  readonly modelLimit: string[] | undefined;
  readonly ipWhitelist: string[] | undefined;
}

interface CreatedKeyInfo {
  readonly id: string;
  readonly name: string | null;
  readonly key: string;
  readonly keyPrefix: string;
  readonly keySuffix: string;
}

/**
 * API Key 业务服务
 *
 * 处理 API Key 的创建、删除、验证等业务逻辑。
 *
 * 安全规则：
 * - Key 使用 Argon2id 哈希存储
 * - 只在创建和轮换时返回一次完整的 key
 * - 使用 prefix 进行快速查找
 */
@Injectable()
export class ApiKeyService {
  private readonly logger = new Logger(ApiKeyService.name);

  /** 每个用户最多创建的 API Key 数量。用户组未配置时使用该兜底值。 */
  private readonly MAX_KEYS_PER_USER = 20;

  constructor(
    private readonly apiKeyRepo: ApiKeyRepository,
    private readonly redis: RedisService,
    private readonly systemSettingService: SystemSettingService,
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
    const allowCreate = await this.systemSettingService.getTypedByKey<boolean>('allow_create_api_key', true);
    if (!allowCreate) {
      throw new ForbiddenException('API Key 创建功能已关闭');
    }

    const input = this.normalizeInput(dto, { forCreate: true });
    const maxKeys = await this.resolveMaxKeysPerUser(userId);
    const currentCount = await this.apiKeyRepo.countByUserId(userId);
    if (currentCount + input.count > maxKeys) {
      throw new ForbiddenException('Maximum ' + maxKeys + ' API keys per user');
    }

    const groupId = await this.resolveGroupId(input.groupIdentifier);
    const createdKeys: CreatedKeyInfo[] = [];
    let firstCreatedRecord: ApiKeyWithGroup | null = null;

    for (let i = 0; i < input.count; i++) {
      const rawKey = 'sk-toai-' + nanoid(48);
      const keyPrefix = rawKey.substring(0, 16);
      const keyHash = await hashPassword(rawKey);
      const name = this.resolveCreatedName(input.name, input.count, i);

      const apiKey = await this.apiKeyRepo.create({
        user: { connect: { id: userId } },
        ...(groupId ? { group: { connect: { id: groupId } } } : {}),
        key_hash: keyHash,
        key_prefix: keyPrefix,
        name,
        expires_at: input.expiresAt ?? null,
        rate_limit: input.rateLimit,
        token_limit: input.tokenLimit,
        rpm_limit: input.rpmLimit,
        tpm_limit: input.tpmLimit,
        unlimited_quota: input.unlimitedQuota ?? false,
        model_limit: toJsonArray(input.modelLimit),
        ip_whitelist: toJsonArray(input.ipWhitelist),
      });

      createdKeys.push({
        id: apiKey.id,
        name: apiKey.name,
        key: rawKey,
        keyPrefix: apiKey.key_prefix,
        keySuffix: this.getKeySuffix(rawKey),
      });

      if (!firstCreatedRecord) {
        firstCreatedRecord = { ...apiKey, group: null };
      }

      this.logger.log('API Key created: ' + apiKey.id + ' for user ' + userId);
    }

    const primaryKey = createdKeys[0];
    if (!primaryKey || !firstCreatedRecord) {
      throw new BadRequestException('API Key 创建失败');
    }

    return {
      ...this.toResponse(firstCreatedRecord, { rawKey: primaryKey.key }),
      keys: createdKeys,
    };
  }

  /**
   * 获取用户的 API Key 列表
   */
  async listApiKeys(userId: string): Promise<ApiKeyResponseDto[]> {
    const keys = await this.apiKeyRepo.findByUserId(userId);
    const usageMap = await this.apiKeyRepo.getBatchKeyUsage(keys.map((key) => key.id));
    return keys.map((key) => this.toResponse(key, { usage: usageMap.get(key.id) }));
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
    const allowDelete = await this.systemSettingService.getTypedByKey<boolean>('allow_delete_api_key', true);
    if (!allowDelete) {
      throw new ForbiddenException('API Key 删除功能已关闭');
    }

    const apiKey = await this.apiKeyRepo.findById(keyId);

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    if (apiKey.user_id !== userId) {
      throw new ForbiddenException('Not authorized to delete this API key');
    }

    await this.apiKeyRepo.delete(keyId);
    await this.clearApiKeyCache(apiKey.key_prefix);

    this.logger.log('API Key deleted: ' + keyId);
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

    const input = this.normalizeInput(dto, { forCreate: false });
    const groupId = await this.resolveGroupId(input.groupIdentifier);
    const updateData: Prisma.ApiKeyUpdateInput = {};

    if (dto.name !== undefined) updateData.name = input.name ?? null;
    if (input.expiresAt !== undefined) updateData.expires_at = input.expiresAt;
    if (input.rateLimit !== undefined) updateData.rate_limit = input.rateLimit;
    if (input.tokenLimit !== undefined) updateData.token_limit = input.tokenLimit;
    if (input.rpmLimit !== undefined) updateData.rpm_limit = input.rpmLimit;
    if (input.tpmLimit !== undefined) updateData.tpm_limit = input.tpmLimit;
    if (input.unlimitedQuota !== undefined) updateData.unlimited_quota = input.unlimitedQuota;
    if (input.modelLimit !== undefined) updateData.model_limit = toJsonArray(input.modelLimit);
    if (input.ipWhitelist !== undefined) updateData.ip_whitelist = toJsonArray(input.ipWhitelist);
    if (input.groupIdentifier !== undefined) {
      updateData.group = groupId ? { connect: { id: groupId } } : { disconnect: true };
    }

    const updated = await this.apiKeyRepo.update(keyId, updateData);
    await this.clearApiKeyCache(updated.key_prefix);

    return this.toResponse({ ...updated, group: null });
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

    await this.clearApiKeyCache(updated.key_prefix);

    this.logger.log('API Key ' + keyId + ' ' + (isActive ? 'enabled' : 'disabled'));

    return this.toResponse({ ...updated, group: null });
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

    const rawKey = 'sk-toai-' + nanoid(48);
    const keyPrefix = rawKey.substring(0, 16);
    const keyHash = await hashPassword(rawKey);

    const updated = await this.apiKeyRepo.update(keyId, {
      key_hash: keyHash,
      key_prefix: keyPrefix,
    });

    await this.clearApiKeyCache(apiKey.key_prefix);
    await this.clearApiKeyCache(updated.key_prefix);

    this.logger.log('API Key rotated: ' + keyId + ' for user ' + userId);

    return this.toResponse({ ...updated, group: null }, { rawKey });
  }

  private async resolveMaxKeysPerUser(userId: string): Promise<number> {
    const groupLimit = await this.apiKeyRepo.findUserGroupLimit(userId);
    return groupLimit ?? this.MAX_KEYS_PER_USER;
  }

  private async resolveGroupId(identifier: string | null | undefined): Promise<string | null> {
    const value = identifier?.trim();
    if (!value) return null;

    const group = await this.apiKeyRepo.findGroupByIdOrName(value);
    if (!group) {
      throw new BadRequestException('用户分组不存在');
    }
    return group.id;
  }

  private resolveCreatedName(name: string | undefined, count: number, index: number): string | null {
    const baseName = name?.trim() || null;
    if (!baseName) return null;
    if (count <= 1) return baseName;
    return baseName + '-' + String(index + 1).padStart(3, '0');
  }

  private normalizeInput(dto: Partial<CreateApiKeyDto>, options: { forCreate: boolean }): NormalizedApiKeyInput {
    const count = options.forCreate ? dto.count ?? 1 : 1;
    const expiresAtRaw = this.pickFirstDefined(dto.expiresAt, dto.expires_at);
    const rateLimit = this.normalizeLimit(this.pickFirstDefined(dto.rateLimit, dto.rate_limit));
    const tokenLimit = this.normalizeLimit(this.pickFirstDefined(dto.tokenLimit, dto.token_limit));
    const rpmLimit = this.normalizeLimit(this.pickFirstDefined(dto.rpmLimit, dto.rpm_limit, rateLimit));
    const tpmLimit = this.normalizeLimit(this.pickFirstDefined(dto.tpmLimit, dto.tpm_limit, tokenLimit));
    const unlimitedQuota = this.pickFirstDefined(dto.unlimitedQuota, dto.unlimited_quota);
    const groupIdentifier = this.normalizeGroupIdentifier(this.pickFirstDefined(dto.groupId, dto.group_id));

    return {
      name: dto.name?.trim() || undefined,
      count,
      expiresAt: expiresAtRaw === undefined ? undefined : this.parseExpiry(expiresAtRaw),
      rateLimit,
      tokenLimit,
      rpmLimit,
      tpmLimit,
      unlimitedQuota,
      groupIdentifier,
      modelLimit: this.normalizeStringArray(this.pickFirstDefined(dto.modelLimit, dto.model_limit)),
      ipWhitelist: this.normalizeStringArray(this.pickFirstDefined(dto.ipWhitelist, dto.ip_whitelist)),
    };
  }

  private pickFirstDefined<T>(...values: Array<T | undefined>): T | undefined {
    return values.find((value) => value !== undefined);
  }

  private normalizeLimit(value: number | null | undefined): number | null | undefined {
    if (value === undefined) return undefined;
    if (value === null || value === 0) return null;
    return value;
  }

  private normalizeGroupIdentifier(value: string | null | undefined): string | null | undefined {
    if (value === undefined) return undefined;
    const trimmed = value?.trim();
    return trimmed || null;
  }

  private parseExpiry(value: string | null | undefined): Date | null | undefined {
    if (value === undefined) return undefined;
    if (value === null || value === '') return null;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('过期时间格式无效');
    }
    if (date <= new Date()) {
      throw new BadRequestException('过期时间必须晚于当前时间');
    }
    return date;
  }

  private normalizeStringArray(value: string[] | string | null | undefined): string[] | undefined {
    if (value === undefined) return undefined;
    if (value === null || value === '') return [];

    const arr = Array.isArray(value) ? value : parseJsonArray(value);
    return [...new Set(arr.map((item) => item.trim()).filter(Boolean))];
  }

  private toResponse(
    key: ApiKeyWithGroup,
    options: { rawKey?: string; usage?: ApiKeyUsageWindow } = {},
  ): ApiKeyResponseDto {
    const keySuffix = options.rawKey ? this.getKeySuffix(options.rawKey) : this.getKeySuffix(key.key_prefix);
    const group = key.group
      ? {
          id: key.group.id,
          name: key.group.display_name || key.group.name,
        }
      : null;

    return {
      id: key.id,
      name: key.name,
      keyPrefix: key.key_prefix,
      keySuffix,
      key: options.rawKey,
      status: key.is_active ? 'ACTIVE' : 'DISABLED',
      isActive: key.is_active,
      groupId: key.group_id,
      groupName: group?.name ?? null,
      group,
      usageToday: options.usage?.today ?? 0,
      usage30d: options.usage?.thirtyDays ?? 0,
      rpmLimit: key.rpm_limit ?? key.rate_limit,
      tpmLimit: key.tpm_limit ?? key.token_limit,
      unlimitedQuota: key.unlimited_quota,
      expiresAt: key.expires_at,
      rateLimit: key.rate_limit,
      tokenLimit: key.token_limit,
      modelLimit: parseJsonArray(key.model_limit),
      ipWhitelist: parseJsonArray(key.ip_whitelist),
      lastUsedAt: key.last_used_at,
      totalRequests: key.total_requests,
      createdAt: key.created_at,
    };
  }

  private getKeySuffix(value: string): string {
    return value.slice(-4);
  }

  private async clearApiKeyCache(keyPrefix: string): Promise<void> {
    await this.redis.del('apikey:prefix:' + keyPrefix);
  }
}
