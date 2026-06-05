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
import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
/**
 * 设置/更新模型定价请求 DTO
 *
 * 所有价格单位：分/百万 token
 */
let UpsertPricingDto = (() => {
    let _inputPrice_decorators;
    let _inputPrice_initializers = [];
    let _inputPrice_extraInitializers = [];
    let _outputPrice_decorators;
    let _outputPrice_initializers = [];
    let _outputPrice_extraInitializers = [];
    let _cachedPrice_decorators;
    let _cachedPrice_initializers = [];
    let _cachedPrice_extraInitializers = [];
    let _reasoningPrice_decorators;
    let _reasoningPrice_initializers = [];
    let _reasoningPrice_extraInitializers = [];
    let _multiplier_decorators;
    let _multiplier_initializers = [];
    let _multiplier_extraInitializers = [];
    return class UpsertPricingDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _inputPrice_decorators = [ApiProperty({ description: '输入价格（分/百万 token）', example: 2 }), IsInt(), Min(0)];
            _outputPrice_decorators = [ApiProperty({ description: '输出价格（分/百万 token）', example: 10 }), IsInt(), Min(0)];
            _cachedPrice_decorators = [ApiPropertyOptional({ description: '缓存输入价格（分/百万 token）', example: 1 }), IsOptional(), IsInt(), Min(0)];
            _reasoningPrice_decorators = [ApiPropertyOptional({ description: '推理 token 价格（分/百万 token）', example: 20 }), IsOptional(), IsInt(), Min(0)];
            _multiplier_decorators = [ApiPropertyOptional({ description: '价格倍率', example: 1.0 }), IsOptional()];
            __esDecorate(null, null, _inputPrice_decorators, { kind: "field", name: "inputPrice", static: false, private: false, access: { has: obj => "inputPrice" in obj, get: obj => obj.inputPrice, set: (obj, value) => { obj.inputPrice = value; } }, metadata: _metadata }, _inputPrice_initializers, _inputPrice_extraInitializers);
            __esDecorate(null, null, _outputPrice_decorators, { kind: "field", name: "outputPrice", static: false, private: false, access: { has: obj => "outputPrice" in obj, get: obj => obj.outputPrice, set: (obj, value) => { obj.outputPrice = value; } }, metadata: _metadata }, _outputPrice_initializers, _outputPrice_extraInitializers);
            __esDecorate(null, null, _cachedPrice_decorators, { kind: "field", name: "cachedPrice", static: false, private: false, access: { has: obj => "cachedPrice" in obj, get: obj => obj.cachedPrice, set: (obj, value) => { obj.cachedPrice = value; } }, metadata: _metadata }, _cachedPrice_initializers, _cachedPrice_extraInitializers);
            __esDecorate(null, null, _reasoningPrice_decorators, { kind: "field", name: "reasoningPrice", static: false, private: false, access: { has: obj => "reasoningPrice" in obj, get: obj => obj.reasoningPrice, set: (obj, value) => { obj.reasoningPrice = value; } }, metadata: _metadata }, _reasoningPrice_initializers, _reasoningPrice_extraInitializers);
            __esDecorate(null, null, _multiplier_decorators, { kind: "field", name: "multiplier", static: false, private: false, access: { has: obj => "multiplier" in obj, get: obj => obj.multiplier, set: (obj, value) => { obj.multiplier = value; } }, metadata: _metadata }, _multiplier_initializers, _multiplier_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        inputPrice = __runInitializers(this, _inputPrice_initializers, void 0);
        outputPrice = (__runInitializers(this, _inputPrice_extraInitializers), __runInitializers(this, _outputPrice_initializers, void 0));
        cachedPrice = (__runInitializers(this, _outputPrice_extraInitializers), __runInitializers(this, _cachedPrice_initializers, void 0));
        reasoningPrice = (__runInitializers(this, _cachedPrice_extraInitializers), __runInitializers(this, _reasoningPrice_initializers, void 0));
        multiplier = (__runInitializers(this, _reasoningPrice_extraInitializers), __runInitializers(this, _multiplier_initializers, void 0));
        constructor() {
            __runInitializers(this, _multiplier_extraInitializers);
        }
    };
})();
export { UpsertPricingDto };
//# sourceMappingURL=upsert-pricing.dto.js.map