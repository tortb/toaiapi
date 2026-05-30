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
import { Injectable, UnauthorizedException, } from '@nestjs/common';
import * as argon2 from 'argon2';
/**
 * API Key 认证守卫
 *
 * 支持两种传递方式：
 * 1. X-API-Key 头
 * 2. Authorization: Bearer sk-toai-xxx
 *
 * 验证流程：
 * 1. 提取 API Key
 * 2. 按 prefix 查找
 * 3. Argon2id 验证
 * 4. 检查状态和过期时间
 * 5. 将 Key 信息附加到 request.apiKey
 */
let ApiKeyAuthGuard = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ApiKeyAuthGuard = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ApiKeyAuthGuard = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        redis;
        constructor(prisma, redis) {
            this.prisma = prisma;
            this.redis = redis;
        }
        async canActivate(context) {
            const request = context.switchToHttp().getRequest();
            const apiKey = this.extractApiKey(request);
            if (!apiKey) {
                throw new UnauthorizedException('API key is required');
            }
            // 验证 API Key 格式
            if (!apiKey.startsWith('sk-toai-')) {
                throw new UnauthorizedException('Invalid API key format');
            }
            // 从缓存中查找（按 prefix）
            const prefix = apiKey.substring(0, 16);
            const cacheKey = `apikey:prefix:${prefix}`;
            // 尝试从 Redis 获取 key ID
            const cachedKeyId = await this.redis.get(cacheKey);
            let keyRecord = null;
            if (cachedKeyId) {
                keyRecord = await this.prisma.apiKey.findUnique({
                    where: { id: cachedKeyId },
                    select: {
                        id: true,
                        key_hash: true,
                        user_id: true,
                        name: true,
                        is_active: true,
                        expires_at: true,
                        rate_limit: true,
                        token_limit: true,
                        model_limit: true,
                    },
                });
            }
            // 缓存未命中，从数据库查找
            if (!keyRecord) {
                keyRecord = await this.prisma.apiKey.findFirst({
                    where: { key_prefix: prefix },
                    select: {
                        id: true,
                        key_hash: true,
                        user_id: true,
                        name: true,
                        is_active: true,
                        expires_at: true,
                        rate_limit: true,
                        token_limit: true,
                        model_limit: true,
                    },
                });
                if (keyRecord) {
                    // 缓存 key ID，5 分钟过期
                    await this.redis.set(cacheKey, keyRecord.id, 300);
                }
            }
            if (!keyRecord) {
                throw new UnauthorizedException('Invalid API key');
            }
            // 检查是否激活
            if (!keyRecord.is_active) {
                throw new UnauthorizedException('API key is disabled');
            }
            // 检查是否过期
            if (keyRecord.expires_at && keyRecord.expires_at < new Date()) {
                throw new UnauthorizedException('API key has expired');
            }
            // 验证 key hash
            const isValid = await argon2.verify(keyRecord.key_hash, apiKey);
            if (!isValid) {
                throw new UnauthorizedException('Invalid API key');
            }
            // 将 key 信息附加到请求
            request['apiKey'] = {
                id: keyRecord.id,
                userId: keyRecord.user_id,
                name: keyRecord.name,
                rateLimit: keyRecord.rate_limit,
                tokenLimit: keyRecord.token_limit,
                modelLimit: keyRecord.model_limit,
            };
            return true;
        }
        /**
         * 从请求中提取 API Key
         */
        extractApiKey(request) {
            const headers = request['headers'];
            // 方式1: X-API-Key 头
            const headerKey = headers['x-api-key'];
            if (typeof headerKey === 'string') {
                return headerKey;
            }
            // 方式2: Authorization: Bearer sk-toai-xxx
            const authHeader = headers['authorization'];
            if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                if (token.startsWith('sk-toai-')) {
                    return token;
                }
            }
            return null;
        }
    };
    return ApiKeyAuthGuard = _classThis;
})();
export { ApiKeyAuthGuard };
//# sourceMappingURL=api-key-auth.guard.js.map