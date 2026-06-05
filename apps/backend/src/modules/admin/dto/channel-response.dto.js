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
 * Channel 响应 DTO
 *
 * api_key 字段脱敏为 keyPrefix，不返回明文
 */
let ChannelResponseDto = (() => {
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _providerId_decorators;
    let _providerId_initializers = [];
    let _providerId_extraInitializers = [];
    let _provider_decorators;
    let _provider_initializers = [];
    let _provider_extraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _baseUrl_decorators;
    let _baseUrl_initializers = [];
    let _baseUrl_extraInitializers = [];
    let _keyPrefix_decorators;
    let _keyPrefix_initializers = [];
    let _keyPrefix_extraInitializers = [];
    let _weight_decorators;
    let _weight_initializers = [];
    let _weight_extraInitializers = [];
    let _priority_decorators;
    let _priority_initializers = [];
    let _priority_extraInitializers = [];
    let _isActive_decorators;
    let _isActive_initializers = [];
    let _isActive_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _totalRequests_decorators;
    let _totalRequests_initializers = [];
    let _totalRequests_extraInitializers = [];
    let _failedRequests_decorators;
    let _failedRequests_initializers = [];
    let _failedRequests_extraInitializers = [];
    let _avgLatencyMs_decorators;
    let _avgLatencyMs_initializers = [];
    let _avgLatencyMs_extraInitializers = [];
    let _modelCount_decorators;
    let _modelCount_initializers = [];
    let _modelCount_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    return class ChannelResponseDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [ApiProperty({ description: '渠道 ID' })];
            _providerId_decorators = [ApiProperty({ description: '所属 Provider ID' })];
            _provider_decorators = [ApiPropertyOptional({ description: '所属 Provider 信息' })];
            _name_decorators = [ApiProperty({ description: '渠道名称' })];
            _baseUrl_decorators = [ApiProperty({ description: 'API 基础 URL' })];
            _keyPrefix_decorators = [ApiProperty({ description: 'API Key 前缀（脱敏）', example: 'sk-1234****' })];
            _weight_decorators = [ApiProperty({ description: '权重' })];
            _priority_decorators = [ApiProperty({ description: '优先级' })];
            _isActive_decorators = [ApiProperty({ description: '是否启用' })];
            _status_decorators = [ApiProperty({ description: '状态', example: 'ACTIVE' })];
            _totalRequests_decorators = [ApiProperty({ description: '总请求数' })];
            _failedRequests_decorators = [ApiProperty({ description: '失败请求数' })];
            _avgLatencyMs_decorators = [ApiProperty({ description: '平均延迟（毫秒）' })];
            _modelCount_decorators = [ApiPropertyOptional({ description: '关联模型数量' })];
            _createdAt_decorators = [ApiProperty({ description: '创建时间' })];
            _updatedAt_decorators = [ApiProperty({ description: '更新时间' })];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _providerId_decorators, { kind: "field", name: "providerId", static: false, private: false, access: { has: obj => "providerId" in obj, get: obj => obj.providerId, set: (obj, value) => { obj.providerId = value; } }, metadata: _metadata }, _providerId_initializers, _providerId_extraInitializers);
            __esDecorate(null, null, _provider_decorators, { kind: "field", name: "provider", static: false, private: false, access: { has: obj => "provider" in obj, get: obj => obj.provider, set: (obj, value) => { obj.provider = value; } }, metadata: _metadata }, _provider_initializers, _provider_extraInitializers);
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _baseUrl_decorators, { kind: "field", name: "baseUrl", static: false, private: false, access: { has: obj => "baseUrl" in obj, get: obj => obj.baseUrl, set: (obj, value) => { obj.baseUrl = value; } }, metadata: _metadata }, _baseUrl_initializers, _baseUrl_extraInitializers);
            __esDecorate(null, null, _keyPrefix_decorators, { kind: "field", name: "keyPrefix", static: false, private: false, access: { has: obj => "keyPrefix" in obj, get: obj => obj.keyPrefix, set: (obj, value) => { obj.keyPrefix = value; } }, metadata: _metadata }, _keyPrefix_initializers, _keyPrefix_extraInitializers);
            __esDecorate(null, null, _weight_decorators, { kind: "field", name: "weight", static: false, private: false, access: { has: obj => "weight" in obj, get: obj => obj.weight, set: (obj, value) => { obj.weight = value; } }, metadata: _metadata }, _weight_initializers, _weight_extraInitializers);
            __esDecorate(null, null, _priority_decorators, { kind: "field", name: "priority", static: false, private: false, access: { has: obj => "priority" in obj, get: obj => obj.priority, set: (obj, value) => { obj.priority = value; } }, metadata: _metadata }, _priority_initializers, _priority_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _totalRequests_decorators, { kind: "field", name: "totalRequests", static: false, private: false, access: { has: obj => "totalRequests" in obj, get: obj => obj.totalRequests, set: (obj, value) => { obj.totalRequests = value; } }, metadata: _metadata }, _totalRequests_initializers, _totalRequests_extraInitializers);
            __esDecorate(null, null, _failedRequests_decorators, { kind: "field", name: "failedRequests", static: false, private: false, access: { has: obj => "failedRequests" in obj, get: obj => obj.failedRequests, set: (obj, value) => { obj.failedRequests = value; } }, metadata: _metadata }, _failedRequests_initializers, _failedRequests_extraInitializers);
            __esDecorate(null, null, _avgLatencyMs_decorators, { kind: "field", name: "avgLatencyMs", static: false, private: false, access: { has: obj => "avgLatencyMs" in obj, get: obj => obj.avgLatencyMs, set: (obj, value) => { obj.avgLatencyMs = value; } }, metadata: _metadata }, _avgLatencyMs_initializers, _avgLatencyMs_extraInitializers);
            __esDecorate(null, null, _modelCount_decorators, { kind: "field", name: "modelCount", static: false, private: false, access: { has: obj => "modelCount" in obj, get: obj => obj.modelCount, set: (obj, value) => { obj.modelCount = value; } }, metadata: _metadata }, _modelCount_initializers, _modelCount_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        id = __runInitializers(this, _id_initializers, void 0);
        providerId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _providerId_initializers, void 0));
        provider = (__runInitializers(this, _providerId_extraInitializers), __runInitializers(this, _provider_initializers, void 0));
        name = (__runInitializers(this, _provider_extraInitializers), __runInitializers(this, _name_initializers, void 0));
        baseUrl = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _baseUrl_initializers, void 0));
        keyPrefix = (__runInitializers(this, _baseUrl_extraInitializers), __runInitializers(this, _keyPrefix_initializers, void 0));
        weight = (__runInitializers(this, _keyPrefix_extraInitializers), __runInitializers(this, _weight_initializers, void 0));
        priority = (__runInitializers(this, _weight_extraInitializers), __runInitializers(this, _priority_initializers, void 0));
        isActive = (__runInitializers(this, _priority_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
        status = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _status_initializers, void 0));
        totalRequests = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _totalRequests_initializers, void 0));
        failedRequests = (__runInitializers(this, _totalRequests_extraInitializers), __runInitializers(this, _failedRequests_initializers, void 0));
        avgLatencyMs = (__runInitializers(this, _failedRequests_extraInitializers), __runInitializers(this, _avgLatencyMs_initializers, void 0));
        modelCount = (__runInitializers(this, _avgLatencyMs_extraInitializers), __runInitializers(this, _modelCount_initializers, void 0));
        createdAt = (__runInitializers(this, _modelCount_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
        updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
        constructor() {
            __runInitializers(this, _updatedAt_extraInitializers);
        }
    };
})();
export { ChannelResponseDto };
//# sourceMappingURL=channel-response.dto.js.map