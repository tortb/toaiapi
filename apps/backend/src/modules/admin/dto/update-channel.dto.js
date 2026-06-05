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
import { IsString, IsOptional, IsInt, IsUrl, Min, Max, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
/**
 * 更新 Channel 请求 DTO
 */
let UpdateChannelDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _baseUrl_decorators;
    let _baseUrl_initializers = [];
    let _baseUrl_extraInitializers = [];
    let _apiKey_decorators;
    let _apiKey_initializers = [];
    let _apiKey_extraInitializers = [];
    let _weight_decorators;
    let _weight_initializers = [];
    let _weight_extraInitializers = [];
    let _priority_decorators;
    let _priority_initializers = [];
    let _priority_extraInitializers = [];
    return class UpdateChannelDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [ApiPropertyOptional({ description: '渠道名称', example: 'DeepSeek Main' }), IsOptional(), IsString(), MaxLength(100)];
            _baseUrl_decorators = [ApiPropertyOptional({ description: 'API 基础 URL', example: 'https://api.deepseek.com' }), IsOptional(), IsUrl()];
            _apiKey_decorators = [ApiPropertyOptional({ description: '上游 API Key' }), IsOptional(), IsString()];
            _weight_decorators = [ApiPropertyOptional({ description: '权重（1-100）', minimum: 1, maximum: 100 }), IsOptional(), IsInt(), Min(1), Max(100)];
            _priority_decorators = [ApiPropertyOptional({ description: '优先级（越高越优先）' }), IsOptional(), IsInt(), Min(0), Max(100)];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _baseUrl_decorators, { kind: "field", name: "baseUrl", static: false, private: false, access: { has: obj => "baseUrl" in obj, get: obj => obj.baseUrl, set: (obj, value) => { obj.baseUrl = value; } }, metadata: _metadata }, _baseUrl_initializers, _baseUrl_extraInitializers);
            __esDecorate(null, null, _apiKey_decorators, { kind: "field", name: "apiKey", static: false, private: false, access: { has: obj => "apiKey" in obj, get: obj => obj.apiKey, set: (obj, value) => { obj.apiKey = value; } }, metadata: _metadata }, _apiKey_initializers, _apiKey_extraInitializers);
            __esDecorate(null, null, _weight_decorators, { kind: "field", name: "weight", static: false, private: false, access: { has: obj => "weight" in obj, get: obj => obj.weight, set: (obj, value) => { obj.weight = value; } }, metadata: _metadata }, _weight_initializers, _weight_extraInitializers);
            __esDecorate(null, null, _priority_decorators, { kind: "field", name: "priority", static: false, private: false, access: { has: obj => "priority" in obj, get: obj => obj.priority, set: (obj, value) => { obj.priority = value; } }, metadata: _metadata }, _priority_initializers, _priority_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        baseUrl = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _baseUrl_initializers, void 0));
        apiKey = (__runInitializers(this, _baseUrl_extraInitializers), __runInitializers(this, _apiKey_initializers, void 0));
        weight = (__runInitializers(this, _apiKey_extraInitializers), __runInitializers(this, _weight_initializers, void 0));
        priority = (__runInitializers(this, _weight_extraInitializers), __runInitializers(this, _priority_initializers, void 0));
        constructor() {
            __runInitializers(this, _priority_extraInitializers);
        }
    };
})();
export { UpdateChannelDto };
//# sourceMappingURL=update-channel.dto.js.map