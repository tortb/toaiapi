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
 * Model 响应 DTO
 */
let ModelResponseDto = (() => {
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _displayName_decorators;
    let _displayName_initializers = [];
    let _displayName_extraInitializers = [];
    let _providerId_decorators;
    let _providerId_initializers = [];
    let _providerId_extraInitializers = [];
    let _maxContext_decorators;
    let _maxContext_initializers = [];
    let _maxContext_extraInitializers = [];
    let _supportsStreaming_decorators;
    let _supportsStreaming_initializers = [];
    let _supportsStreaming_extraInitializers = [];
    let _supportsTools_decorators;
    let _supportsTools_initializers = [];
    let _supportsTools_extraInitializers = [];
    let _supportsVision_decorators;
    let _supportsVision_initializers = [];
    let _supportsVision_extraInitializers = [];
    let _isActive_decorators;
    let _isActive_initializers = [];
    let _isActive_extraInitializers = [];
    let _pricing_decorators;
    let _pricing_initializers = [];
    let _pricing_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    return class ModelResponseDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [ApiProperty({ description: '模型 ID' })];
            _name_decorators = [ApiProperty({ description: '模型名称', example: 'deepseek-chat' })];
            _displayName_decorators = [ApiProperty({ description: '显示名称', example: 'DeepSeek Chat' })];
            _providerId_decorators = [ApiProperty({ description: '所属 Provider ID' })];
            _maxContext_decorators = [ApiProperty({ description: '最大上下文长度' })];
            _supportsStreaming_decorators = [ApiProperty({ description: '是否支持流式输出' })];
            _supportsTools_decorators = [ApiProperty({ description: '是否支持工具调用' })];
            _supportsVision_decorators = [ApiProperty({ description: '是否支持视觉' })];
            _isActive_decorators = [ApiProperty({ description: '是否启用' })];
            _pricing_decorators = [ApiPropertyOptional({ description: '定价信息' })];
            _createdAt_decorators = [ApiProperty({ description: '创建时间' })];
            _updatedAt_decorators = [ApiProperty({ description: '更新时间' })];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _displayName_decorators, { kind: "field", name: "displayName", static: false, private: false, access: { has: obj => "displayName" in obj, get: obj => obj.displayName, set: (obj, value) => { obj.displayName = value; } }, metadata: _metadata }, _displayName_initializers, _displayName_extraInitializers);
            __esDecorate(null, null, _providerId_decorators, { kind: "field", name: "providerId", static: false, private: false, access: { has: obj => "providerId" in obj, get: obj => obj.providerId, set: (obj, value) => { obj.providerId = value; } }, metadata: _metadata }, _providerId_initializers, _providerId_extraInitializers);
            __esDecorate(null, null, _maxContext_decorators, { kind: "field", name: "maxContext", static: false, private: false, access: { has: obj => "maxContext" in obj, get: obj => obj.maxContext, set: (obj, value) => { obj.maxContext = value; } }, metadata: _metadata }, _maxContext_initializers, _maxContext_extraInitializers);
            __esDecorate(null, null, _supportsStreaming_decorators, { kind: "field", name: "supportsStreaming", static: false, private: false, access: { has: obj => "supportsStreaming" in obj, get: obj => obj.supportsStreaming, set: (obj, value) => { obj.supportsStreaming = value; } }, metadata: _metadata }, _supportsStreaming_initializers, _supportsStreaming_extraInitializers);
            __esDecorate(null, null, _supportsTools_decorators, { kind: "field", name: "supportsTools", static: false, private: false, access: { has: obj => "supportsTools" in obj, get: obj => obj.supportsTools, set: (obj, value) => { obj.supportsTools = value; } }, metadata: _metadata }, _supportsTools_initializers, _supportsTools_extraInitializers);
            __esDecorate(null, null, _supportsVision_decorators, { kind: "field", name: "supportsVision", static: false, private: false, access: { has: obj => "supportsVision" in obj, get: obj => obj.supportsVision, set: (obj, value) => { obj.supportsVision = value; } }, metadata: _metadata }, _supportsVision_initializers, _supportsVision_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            __esDecorate(null, null, _pricing_decorators, { kind: "field", name: "pricing", static: false, private: false, access: { has: obj => "pricing" in obj, get: obj => obj.pricing, set: (obj, value) => { obj.pricing = value; } }, metadata: _metadata }, _pricing_initializers, _pricing_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        id = __runInitializers(this, _id_initializers, void 0);
        name = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _name_initializers, void 0));
        displayName = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _displayName_initializers, void 0));
        providerId = (__runInitializers(this, _displayName_extraInitializers), __runInitializers(this, _providerId_initializers, void 0));
        maxContext = (__runInitializers(this, _providerId_extraInitializers), __runInitializers(this, _maxContext_initializers, void 0));
        supportsStreaming = (__runInitializers(this, _maxContext_extraInitializers), __runInitializers(this, _supportsStreaming_initializers, void 0));
        supportsTools = (__runInitializers(this, _supportsStreaming_extraInitializers), __runInitializers(this, _supportsTools_initializers, void 0));
        supportsVision = (__runInitializers(this, _supportsTools_extraInitializers), __runInitializers(this, _supportsVision_initializers, void 0));
        isActive = (__runInitializers(this, _supportsVision_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
        pricing = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _pricing_initializers, void 0));
        createdAt = (__runInitializers(this, _pricing_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
        updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
        constructor() {
            __runInitializers(this, _updatedAt_extraInitializers);
        }
    };
})();
export { ModelResponseDto };
//# sourceMappingURL=model-response.dto.js.map