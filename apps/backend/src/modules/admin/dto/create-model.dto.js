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
import { IsString, IsOptional, IsInt, IsBoolean, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
/**
 * 创建 Model 请求 DTO
 */
let CreateModelDto = (() => {
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
    return class CreateModelDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [ApiProperty({ description: '模型名称（唯一标识）', example: 'deepseek-chat' }), IsString(), MaxLength(100)];
            _displayName_decorators = [ApiProperty({ description: '显示名称', example: 'DeepSeek Chat' }), IsString(), MaxLength(200)];
            _providerId_decorators = [ApiProperty({ description: '所属 Provider 名称', example: 'deepseek' }), IsString(), MaxLength(50)];
            _maxContext_decorators = [ApiProperty({ description: '最大上下文长度', example: 128000 }), IsInt(), Min(1)];
            _supportsStreaming_decorators = [ApiPropertyOptional({ description: '是否支持流式输出', example: true }), IsOptional(), IsBoolean()];
            _supportsTools_decorators = [ApiPropertyOptional({ description: '是否支持工具调用', example: true }), IsOptional(), IsBoolean()];
            _supportsVision_decorators = [ApiPropertyOptional({ description: '是否支持视觉', example: false }), IsOptional(), IsBoolean()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _displayName_decorators, { kind: "field", name: "displayName", static: false, private: false, access: { has: obj => "displayName" in obj, get: obj => obj.displayName, set: (obj, value) => { obj.displayName = value; } }, metadata: _metadata }, _displayName_initializers, _displayName_extraInitializers);
            __esDecorate(null, null, _providerId_decorators, { kind: "field", name: "providerId", static: false, private: false, access: { has: obj => "providerId" in obj, get: obj => obj.providerId, set: (obj, value) => { obj.providerId = value; } }, metadata: _metadata }, _providerId_initializers, _providerId_extraInitializers);
            __esDecorate(null, null, _maxContext_decorators, { kind: "field", name: "maxContext", static: false, private: false, access: { has: obj => "maxContext" in obj, get: obj => obj.maxContext, set: (obj, value) => { obj.maxContext = value; } }, metadata: _metadata }, _maxContext_initializers, _maxContext_extraInitializers);
            __esDecorate(null, null, _supportsStreaming_decorators, { kind: "field", name: "supportsStreaming", static: false, private: false, access: { has: obj => "supportsStreaming" in obj, get: obj => obj.supportsStreaming, set: (obj, value) => { obj.supportsStreaming = value; } }, metadata: _metadata }, _supportsStreaming_initializers, _supportsStreaming_extraInitializers);
            __esDecorate(null, null, _supportsTools_decorators, { kind: "field", name: "supportsTools", static: false, private: false, access: { has: obj => "supportsTools" in obj, get: obj => obj.supportsTools, set: (obj, value) => { obj.supportsTools = value; } }, metadata: _metadata }, _supportsTools_initializers, _supportsTools_extraInitializers);
            __esDecorate(null, null, _supportsVision_decorators, { kind: "field", name: "supportsVision", static: false, private: false, access: { has: obj => "supportsVision" in obj, get: obj => obj.supportsVision, set: (obj, value) => { obj.supportsVision = value; } }, metadata: _metadata }, _supportsVision_initializers, _supportsVision_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        displayName = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _displayName_initializers, void 0));
        providerId = (__runInitializers(this, _displayName_extraInitializers), __runInitializers(this, _providerId_initializers, void 0));
        maxContext = (__runInitializers(this, _providerId_extraInitializers), __runInitializers(this, _maxContext_initializers, void 0));
        supportsStreaming = (__runInitializers(this, _maxContext_extraInitializers), __runInitializers(this, _supportsStreaming_initializers, void 0));
        supportsTools = (__runInitializers(this, _supportsStreaming_extraInitializers), __runInitializers(this, _supportsTools_initializers, void 0));
        supportsVision = (__runInitializers(this, _supportsTools_extraInitializers), __runInitializers(this, _supportsVision_initializers, void 0));
        constructor() {
            __runInitializers(this, _supportsVision_extraInitializers);
        }
    };
})();
export { CreateModelDto };
//# sourceMappingURL=create-model.dto.js.map