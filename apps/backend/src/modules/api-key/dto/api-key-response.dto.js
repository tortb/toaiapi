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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
/**
 * API Key 响应 DTO
 *
 * 创建时返回完整的 key，之后只返回 prefix
 */
let ApiKeyResponseDto = (() => {
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _keyPrefix_decorators;
    let _keyPrefix_initializers = [];
    let _keyPrefix_extraInitializers = [];
    let _key_decorators;
    let _key_initializers = [];
    let _key_extraInitializers = [];
    let _isActive_decorators;
    let _isActive_initializers = [];
    let _isActive_extraInitializers = [];
    let _expiresAt_decorators;
    let _expiresAt_initializers = [];
    let _expiresAt_extraInitializers = [];
    let _rateLimit_decorators;
    let _rateLimit_initializers = [];
    let _rateLimit_extraInitializers = [];
    let _tokenLimit_decorators;
    let _tokenLimit_initializers = [];
    let _tokenLimit_extraInitializers = [];
    let _modelLimit_decorators;
    let _modelLimit_initializers = [];
    let _modelLimit_extraInitializers = [];
    let _ipWhitelist_decorators;
    let _ipWhitelist_initializers = [];
    let _ipWhitelist_extraInitializers = [];
    let _lastUsedAt_decorators;
    let _lastUsedAt_initializers = [];
    let _lastUsedAt_extraInitializers = [];
    let _totalRequests_decorators;
    let _totalRequests_initializers = [];
    let _totalRequests_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    return class ApiKeyResponseDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [ApiProperty({ description: 'API Key ID' })];
            _name_decorators = [ApiProperty({ description: 'API Key 名称' })];
            _keyPrefix_decorators = [ApiProperty({ description: 'Key 前缀（用于展示）', example: 'sk-toai-xxxxxx' })];
            _key_decorators = [ApiPropertyOptional({
                    description: '完整的 API Key（仅创建时返回一次）',
                    example: 'sk-toai-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                })];
            _isActive_decorators = [ApiProperty({ description: '是否激活' })];
            _expiresAt_decorators = [ApiPropertyOptional({ description: '过期时间' })];
            _rateLimit_decorators = [ApiPropertyOptional({ description: '速率限制（请求/分钟）' })];
            _tokenLimit_decorators = [ApiPropertyOptional({ description: 'Token 限制（token/分钟）' })];
            _modelLimit_decorators = [ApiProperty({ description: '允许的模型列表', type: [String] })];
            _ipWhitelist_decorators = [ApiProperty({ description: 'IP 白名单', type: [String] })];
            _lastUsedAt_decorators = [ApiPropertyOptional({ description: '最后使用时间' })];
            _totalRequests_decorators = [ApiProperty({ description: '累计请求数' })];
            _createdAt_decorators = [ApiProperty({ description: '创建时间' })];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _keyPrefix_decorators, { kind: "field", name: "keyPrefix", static: false, private: false, access: { has: obj => "keyPrefix" in obj, get: obj => obj.keyPrefix, set: (obj, value) => { obj.keyPrefix = value; } }, metadata: _metadata }, _keyPrefix_initializers, _keyPrefix_extraInitializers);
            __esDecorate(null, null, _key_decorators, { kind: "field", name: "key", static: false, private: false, access: { has: obj => "key" in obj, get: obj => obj.key, set: (obj, value) => { obj.key = value; } }, metadata: _metadata }, _key_initializers, _key_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            __esDecorate(null, null, _expiresAt_decorators, { kind: "field", name: "expiresAt", static: false, private: false, access: { has: obj => "expiresAt" in obj, get: obj => obj.expiresAt, set: (obj, value) => { obj.expiresAt = value; } }, metadata: _metadata }, _expiresAt_initializers, _expiresAt_extraInitializers);
            __esDecorate(null, null, _rateLimit_decorators, { kind: "field", name: "rateLimit", static: false, private: false, access: { has: obj => "rateLimit" in obj, get: obj => obj.rateLimit, set: (obj, value) => { obj.rateLimit = value; } }, metadata: _metadata }, _rateLimit_initializers, _rateLimit_extraInitializers);
            __esDecorate(null, null, _tokenLimit_decorators, { kind: "field", name: "tokenLimit", static: false, private: false, access: { has: obj => "tokenLimit" in obj, get: obj => obj.tokenLimit, set: (obj, value) => { obj.tokenLimit = value; } }, metadata: _metadata }, _tokenLimit_initializers, _tokenLimit_extraInitializers);
            __esDecorate(null, null, _modelLimit_decorators, { kind: "field", name: "modelLimit", static: false, private: false, access: { has: obj => "modelLimit" in obj, get: obj => obj.modelLimit, set: (obj, value) => { obj.modelLimit = value; } }, metadata: _metadata }, _modelLimit_initializers, _modelLimit_extraInitializers);
            __esDecorate(null, null, _ipWhitelist_decorators, { kind: "field", name: "ipWhitelist", static: false, private: false, access: { has: obj => "ipWhitelist" in obj, get: obj => obj.ipWhitelist, set: (obj, value) => { obj.ipWhitelist = value; } }, metadata: _metadata }, _ipWhitelist_initializers, _ipWhitelist_extraInitializers);
            __esDecorate(null, null, _lastUsedAt_decorators, { kind: "field", name: "lastUsedAt", static: false, private: false, access: { has: obj => "lastUsedAt" in obj, get: obj => obj.lastUsedAt, set: (obj, value) => { obj.lastUsedAt = value; } }, metadata: _metadata }, _lastUsedAt_initializers, _lastUsedAt_extraInitializers);
            __esDecorate(null, null, _totalRequests_decorators, { kind: "field", name: "totalRequests", static: false, private: false, access: { has: obj => "totalRequests" in obj, get: obj => obj.totalRequests, set: (obj, value) => { obj.totalRequests = value; } }, metadata: _metadata }, _totalRequests_initializers, _totalRequests_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        id = __runInitializers(this, _id_initializers, void 0);
        name = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _name_initializers, void 0));
        keyPrefix = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _keyPrefix_initializers, void 0));
        key = (__runInitializers(this, _keyPrefix_extraInitializers), __runInitializers(this, _key_initializers, void 0));
        isActive = (__runInitializers(this, _key_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
        expiresAt = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _expiresAt_initializers, void 0));
        rateLimit = (__runInitializers(this, _expiresAt_extraInitializers), __runInitializers(this, _rateLimit_initializers, void 0));
        tokenLimit = (__runInitializers(this, _rateLimit_extraInitializers), __runInitializers(this, _tokenLimit_initializers, void 0));
        modelLimit = (__runInitializers(this, _tokenLimit_extraInitializers), __runInitializers(this, _modelLimit_initializers, void 0));
        ipWhitelist = (__runInitializers(this, _modelLimit_extraInitializers), __runInitializers(this, _ipWhitelist_initializers, void 0));
        lastUsedAt = (__runInitializers(this, _ipWhitelist_extraInitializers), __runInitializers(this, _lastUsedAt_initializers, void 0));
        totalRequests = (__runInitializers(this, _lastUsedAt_extraInitializers), __runInitializers(this, _totalRequests_initializers, void 0));
        createdAt = (__runInitializers(this, _totalRequests_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
        constructor() {
            __runInitializers(this, _createdAt_extraInitializers);
        }
    };
})();
export { ApiKeyResponseDto };
//# sourceMappingURL=api-key-response.dto.js.map