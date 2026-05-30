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
import { IsString, IsOptional, IsInt, IsArray, Min, Max, MaxLength, IsDateString, } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
/**
 * 创建 API Key 请求 DTO
 */
let CreateApiKeyDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
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
    return class CreateApiKeyDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [ApiPropertyOptional({ description: 'API Key 名称', example: 'My App Key' }), IsOptional(), IsString(), MaxLength(100)];
            _expiresAt_decorators = [ApiPropertyOptional({
                    description: '过期时间（ISO 8601）',
                    example: '2025-12-31T23:59:59Z',
                }), IsOptional(), IsDateString()];
            _rateLimit_decorators = [ApiPropertyOptional({
                    description: '速率限制（请求/分钟）',
                    example: 60,
                    minimum: 1,
                    maximum: 10000,
                }), IsOptional(), IsInt(), Min(1), Max(10000)];
            _tokenLimit_decorators = [ApiPropertyOptional({
                    description: 'Token 限制（token/分钟）',
                    example: 100000,
                    minimum: 1,
                }), IsOptional(), IsInt(), Min(1)];
            _modelLimit_decorators = [ApiPropertyOptional({
                    description: '允许的模型列表',
                    example: ['gpt-4o', 'claude-sonnet-4'],
                    type: [String],
                }), IsOptional(), IsArray(), IsString({ each: true })];
            _ipWhitelist_decorators = [ApiPropertyOptional({
                    description: 'IP 白名单',
                    example: ['192.168.1.1', '10.0.0.0/24'],
                    type: [String],
                }), IsOptional(), IsArray(), IsString({ each: true })];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _expiresAt_decorators, { kind: "field", name: "expiresAt", static: false, private: false, access: { has: obj => "expiresAt" in obj, get: obj => obj.expiresAt, set: (obj, value) => { obj.expiresAt = value; } }, metadata: _metadata }, _expiresAt_initializers, _expiresAt_extraInitializers);
            __esDecorate(null, null, _rateLimit_decorators, { kind: "field", name: "rateLimit", static: false, private: false, access: { has: obj => "rateLimit" in obj, get: obj => obj.rateLimit, set: (obj, value) => { obj.rateLimit = value; } }, metadata: _metadata }, _rateLimit_initializers, _rateLimit_extraInitializers);
            __esDecorate(null, null, _tokenLimit_decorators, { kind: "field", name: "tokenLimit", static: false, private: false, access: { has: obj => "tokenLimit" in obj, get: obj => obj.tokenLimit, set: (obj, value) => { obj.tokenLimit = value; } }, metadata: _metadata }, _tokenLimit_initializers, _tokenLimit_extraInitializers);
            __esDecorate(null, null, _modelLimit_decorators, { kind: "field", name: "modelLimit", static: false, private: false, access: { has: obj => "modelLimit" in obj, get: obj => obj.modelLimit, set: (obj, value) => { obj.modelLimit = value; } }, metadata: _metadata }, _modelLimit_initializers, _modelLimit_extraInitializers);
            __esDecorate(null, null, _ipWhitelist_decorators, { kind: "field", name: "ipWhitelist", static: false, private: false, access: { has: obj => "ipWhitelist" in obj, get: obj => obj.ipWhitelist, set: (obj, value) => { obj.ipWhitelist = value; } }, metadata: _metadata }, _ipWhitelist_initializers, _ipWhitelist_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        expiresAt = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _expiresAt_initializers, void 0));
        rateLimit = (__runInitializers(this, _expiresAt_extraInitializers), __runInitializers(this, _rateLimit_initializers, void 0));
        tokenLimit = (__runInitializers(this, _rateLimit_extraInitializers), __runInitializers(this, _tokenLimit_initializers, void 0));
        modelLimit = (__runInitializers(this, _tokenLimit_extraInitializers), __runInitializers(this, _modelLimit_initializers, void 0));
        ipWhitelist = (__runInitializers(this, _modelLimit_extraInitializers), __runInitializers(this, _ipWhitelist_initializers, void 0));
        constructor() {
            __runInitializers(this, _ipWhitelist_extraInitializers);
        }
    };
})();
export { CreateApiKeyDto };
//# sourceMappingURL=create-api-key.dto.js.map