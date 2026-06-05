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
import { Injectable, UnauthorizedException, ForbiddenException, } from '@nestjs/common';
import * as argon2 from 'argon2';
import { isIPv4 } from 'net';
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
            // 从缓存中查找（按完整 key 的 SHA-256 哈希作为缓存 key）
            const keyHash = this.hashApiKey(apiKey);
            const cacheKey = `apikey:verified:${keyHash}`;
            // 尝试从 Redis 获取已验证的 key 信息（缓存 5 分钟）
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                try {
                    const cachedInfo = JSON.parse(cached);
                    // 检查 IP 白名单
                    if (cachedInfo.ip_whitelist && cachedInfo.ip_whitelist.length > 0) {
                        const clientIp = this.extractClientIp(request);
                        if (!this.isIpWhitelisted(clientIp, cachedInfo.ip_whitelist)) {
                            throw new ForbiddenException(`IP ${clientIp} is not allowed by this API key's whitelist`);
                        }
                    }
                    request['apiKey'] = {
                        id: cachedInfo.id,
                        userId: cachedInfo.user_id,
                        name: cachedInfo.name,
                        rateLimit: cachedInfo.rate_limit,
                        tokenLimit: cachedInfo.token_limit,
                        modelLimit: cachedInfo.model_limit,
                        ipWhitelist: cachedInfo.ip_whitelist,
                    };
                    return true;
                }
                catch (e) {
                    if (e instanceof ForbiddenException)
                        throw e;
                    // 缓存解析失败，继续走数据库验证
                }
            }
            // 缓存未命中，从数据库查找（按 prefix）
            const prefix = apiKey.substring(0, 16);
            const keyRecord = await this.prisma.apiKey.findFirst({
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
                    ip_whitelist: true,
                },
            });
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
            // 验证 key hash（Argon2 是 CPU 密集型，只在缓存未命中时执行）
            const isValid = await argon2.verify(keyRecord.key_hash, apiKey);
            if (!isValid) {
                throw new UnauthorizedException('Invalid API key');
            }
            // 缓存验证结果（不含 key_hash），5 分钟过期
            const cacheData = JSON.stringify({
                id: keyRecord.id,
                user_id: keyRecord.user_id,
                name: keyRecord.name,
                rate_limit: keyRecord.rate_limit,
                token_limit: keyRecord.token_limit,
                model_limit: keyRecord.model_limit,
                ip_whitelist: keyRecord.ip_whitelist,
            });
            await this.redis.set(cacheKey, cacheData, 300);
            // SECURITY: 检查 IP 白名单
            if (keyRecord.ip_whitelist && keyRecord.ip_whitelist.length > 0) {
                const clientIp = this.extractClientIp(request);
                if (!this.isIpWhitelisted(clientIp, keyRecord.ip_whitelist)) {
                    throw new ForbiddenException(`IP ${clientIp} is not allowed by this API key's whitelist`);
                }
            }
            // 将 key 信息附加到请求
            request['apiKey'] = {
                id: keyRecord.id,
                userId: keyRecord.user_id,
                name: keyRecord.name,
                rateLimit: keyRecord.rate_limit,
                tokenLimit: keyRecord.token_limit,
                modelLimit: keyRecord.model_limit,
                ipWhitelist: keyRecord.ip_whitelist,
            };
            return true;
        }
        /**
         * 计算 API Key 的 SHA-256 哈希（用于 Redis 缓存 key）
         */
        hashApiKey(apiKey) {
            const { createHash } = require('crypto');
            return createHash('sha256').update(apiKey).digest('hex');
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
        /**
         * 提取客户端真实 IP
         * SECURITY: 优先使用 X-Forwarded-For（反向代理场景）
         */
        extractClientIp(request) {
            const headers = request['headers'];
            // X-Forwarded-For 可能包含多个 IP，取第一个（最接近客户端的）
            const forwarded = headers['x-forwarded-for'];
            if (typeof forwarded === 'string') {
                const firstIp = forwarded.split(',')[0]?.trim();
                if (firstIp)
                    return firstIp;
            }
            // X-Real-IP（Nginx 常用）
            const realIp = headers['x-real-ip'];
            if (typeof realIp === 'string')
                return realIp;
            // Fastify 默认的 IP
            return request['ip'] || '127.0.0.1';
        }
        /**
         * 检查 IP 是否在白名单中
         * 支持精确匹配和 CIDR 表示法（如 10.0.0.0/24）
         */
        isIpWhitelisted(clientIp, whitelist) {
            for (const entry of whitelist) {
                if (entry.includes('/')) {
                    // CIDR 表示法
                    if (this.isIpInCidr(clientIp, entry))
                        return true;
                }
                else {
                    // 精确匹配
                    if (clientIp === entry)
                        return true;
                }
            }
            return false;
        }
        /**
         * 检查 IPv4 地址是否在 CIDR 范围内
         */
        isIpInCidr(ip, cidr) {
            const [network, prefixStr] = cidr.split('/');
            if (!network || !prefixStr)
                return false;
            const prefix = parseInt(prefixStr, 10);
            if (!isIPv4(ip) || !isIPv4(network) || isNaN(prefix) || prefix < 0 || prefix > 32) {
                return false;
            }
            const ipNum = this.ipv4ToNumber(ip);
            const networkNum = this.ipv4ToNumber(network);
            const mask = (~0 << (32 - prefix)) >>> 0;
            return (ipNum & mask) === (networkNum & mask);
        }
        /**
         * IPv4 地址转 32 位整数
         */
        ipv4ToNumber(ip) {
            return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
        }
    };
    return ApiKeyAuthGuard = _classThis;
})();
export { ApiKeyAuthGuard };
//# sourceMappingURL=api-key-auth.guard.js.map