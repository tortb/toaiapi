var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { Injectable, NotFoundException, ForbiddenException, Logger, } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { hashPassword } from '@toai/auth';
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
let ApiKeyService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ApiKeyService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ApiKeyService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        apiKeyRepo;
        redis;
        logger = new Logger(ApiKeyService.name);
        /** 每个用户最多创建的 API Key 数量 */
        MAX_KEYS_PER_USER = 20;
        constructor(apiKeyRepo, redis) {
            this.apiKeyRepo = apiKeyRepo;
            this.redis = redis;
        }
        /**
         * 创建 API Key
         *
         * @param userId - 用户 ID
         * @param dto - 创建参数
         * @returns API Key 信息（包含完整的 key，仅此一次）
         * @throws {ForbiddenException} 超过最大数量限制
         */
        async createApiKey(userId, dto) {
            // 检查数量限制
            const count = await this.apiKeyRepo.countByUserId(userId);
            if (count >= this.MAX_KEYS_PER_USER) {
                throw new ForbiddenException(`Maximum ${this.MAX_KEYS_PER_USER} API keys per user`);
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
        async listApiKeys(userId) {
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
        async deleteApiKey(userId, keyId) {
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
        async updateApiKey(userId, keyId, dto) {
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
        async toggleApiKey(userId, keyId, isActive) {
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
    };
    return ApiKeyService = _classThis;
})();
export { ApiKeyService };
//# sourceMappingURL=api-key.service.js.map