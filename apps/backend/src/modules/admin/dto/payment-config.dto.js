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
import { IsString, IsBoolean, IsOptional, IsObject, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
/**
 * 更新支付配置 DTO
 */
let UpdatePaymentConfigDto = (() => {
    let _display_name_decorators;
    let _display_name_initializers = [];
    let _display_name_extraInitializers = [];
    let _is_enabled_decorators;
    let _is_enabled_initializers = [];
    let _is_enabled_extraInitializers = [];
    let _merchant_id_decorators;
    let _merchant_id_initializers = [];
    let _merchant_id_extraInitializers = [];
    let _merchant_key_decorators;
    let _merchant_key_initializers = [];
    let _merchant_key_extraInitializers = [];
    let _merchant_secret_decorators;
    let _merchant_secret_initializers = [];
    let _merchant_secret_extraInitializers = [];
    let _api_endpoint_decorators;
    let _api_endpoint_initializers = [];
    let _api_endpoint_extraInitializers = [];
    let _notify_url_decorators;
    let _notify_url_initializers = [];
    let _notify_url_extraInitializers = [];
    let _return_url_decorators;
    let _return_url_initializers = [];
    let _return_url_extraInitializers = [];
    let _extra_config_decorators;
    let _extra_config_initializers = [];
    let _extra_config_extraInitializers = [];
    return class UpdatePaymentConfigDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _display_name_decorators = [ApiProperty({ description: '显示名称', required: false }), IsString(), IsOptional(), MaxLength(50)];
            _is_enabled_decorators = [ApiProperty({ description: '是否启用', required: false }), IsBoolean(), IsOptional()];
            _merchant_id_decorators = [ApiProperty({ description: '商户ID', required: false }), IsString(), IsOptional(), MaxLength(100)];
            _merchant_key_decorators = [ApiProperty({ description: '商户密钥', required: false }), IsString(), IsOptional(), MaxLength(500)];
            _merchant_secret_decorators = [ApiProperty({ description: '商户秘钥/私钥', required: false }), IsString(), IsOptional(), MaxLength(5000)];
            _api_endpoint_decorators = [ApiProperty({ description: 'API网关地址', required: false }), IsString(), IsOptional(), MaxLength(500)];
            _notify_url_decorators = [ApiProperty({ description: '异步通知地址', required: false }), IsString(), IsOptional(), MaxLength(500)];
            _return_url_decorators = [ApiProperty({ description: '同步跳转地址', required: false }), IsString(), IsOptional(), MaxLength(500)];
            _extra_config_decorators = [ApiProperty({ description: '额外配置', required: false }), IsObject(), IsOptional()];
            __esDecorate(null, null, _display_name_decorators, { kind: "field", name: "display_name", static: false, private: false, access: { has: obj => "display_name" in obj, get: obj => obj.display_name, set: (obj, value) => { obj.display_name = value; } }, metadata: _metadata }, _display_name_initializers, _display_name_extraInitializers);
            __esDecorate(null, null, _is_enabled_decorators, { kind: "field", name: "is_enabled", static: false, private: false, access: { has: obj => "is_enabled" in obj, get: obj => obj.is_enabled, set: (obj, value) => { obj.is_enabled = value; } }, metadata: _metadata }, _is_enabled_initializers, _is_enabled_extraInitializers);
            __esDecorate(null, null, _merchant_id_decorators, { kind: "field", name: "merchant_id", static: false, private: false, access: { has: obj => "merchant_id" in obj, get: obj => obj.merchant_id, set: (obj, value) => { obj.merchant_id = value; } }, metadata: _metadata }, _merchant_id_initializers, _merchant_id_extraInitializers);
            __esDecorate(null, null, _merchant_key_decorators, { kind: "field", name: "merchant_key", static: false, private: false, access: { has: obj => "merchant_key" in obj, get: obj => obj.merchant_key, set: (obj, value) => { obj.merchant_key = value; } }, metadata: _metadata }, _merchant_key_initializers, _merchant_key_extraInitializers);
            __esDecorate(null, null, _merchant_secret_decorators, { kind: "field", name: "merchant_secret", static: false, private: false, access: { has: obj => "merchant_secret" in obj, get: obj => obj.merchant_secret, set: (obj, value) => { obj.merchant_secret = value; } }, metadata: _metadata }, _merchant_secret_initializers, _merchant_secret_extraInitializers);
            __esDecorate(null, null, _api_endpoint_decorators, { kind: "field", name: "api_endpoint", static: false, private: false, access: { has: obj => "api_endpoint" in obj, get: obj => obj.api_endpoint, set: (obj, value) => { obj.api_endpoint = value; } }, metadata: _metadata }, _api_endpoint_initializers, _api_endpoint_extraInitializers);
            __esDecorate(null, null, _notify_url_decorators, { kind: "field", name: "notify_url", static: false, private: false, access: { has: obj => "notify_url" in obj, get: obj => obj.notify_url, set: (obj, value) => { obj.notify_url = value; } }, metadata: _metadata }, _notify_url_initializers, _notify_url_extraInitializers);
            __esDecorate(null, null, _return_url_decorators, { kind: "field", name: "return_url", static: false, private: false, access: { has: obj => "return_url" in obj, get: obj => obj.return_url, set: (obj, value) => { obj.return_url = value; } }, metadata: _metadata }, _return_url_initializers, _return_url_extraInitializers);
            __esDecorate(null, null, _extra_config_decorators, { kind: "field", name: "extra_config", static: false, private: false, access: { has: obj => "extra_config" in obj, get: obj => obj.extra_config, set: (obj, value) => { obj.extra_config = value; } }, metadata: _metadata }, _extra_config_initializers, _extra_config_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        display_name = __runInitializers(this, _display_name_initializers, void 0);
        is_enabled = (__runInitializers(this, _display_name_extraInitializers), __runInitializers(this, _is_enabled_initializers, void 0));
        merchant_id = (__runInitializers(this, _is_enabled_extraInitializers), __runInitializers(this, _merchant_id_initializers, void 0));
        merchant_key = (__runInitializers(this, _merchant_id_extraInitializers), __runInitializers(this, _merchant_key_initializers, void 0));
        merchant_secret = (__runInitializers(this, _merchant_key_extraInitializers), __runInitializers(this, _merchant_secret_initializers, void 0));
        api_endpoint = (__runInitializers(this, _merchant_secret_extraInitializers), __runInitializers(this, _api_endpoint_initializers, void 0));
        notify_url = (__runInitializers(this, _api_endpoint_extraInitializers), __runInitializers(this, _notify_url_initializers, void 0));
        return_url = (__runInitializers(this, _notify_url_extraInitializers), __runInitializers(this, _return_url_initializers, void 0));
        extra_config = (__runInitializers(this, _return_url_extraInitializers), __runInitializers(this, _extra_config_initializers, void 0));
        constructor() {
            __runInitializers(this, _extra_config_extraInitializers);
        }
    };
})();
export { UpdatePaymentConfigDto };
/**
 * 支付配置响应 DTO
 */
let PaymentConfigResponseDto = (() => {
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _display_name_decorators;
    let _display_name_initializers = [];
    let _display_name_extraInitializers = [];
    let _is_enabled_decorators;
    let _is_enabled_initializers = [];
    let _is_enabled_extraInitializers = [];
    let _merchant_id_decorators;
    let _merchant_id_initializers = [];
    let _merchant_id_extraInitializers = [];
    let _merchant_key_decorators;
    let _merchant_key_initializers = [];
    let _merchant_key_extraInitializers = [];
    let _merchant_secret_decorators;
    let _merchant_secret_initializers = [];
    let _merchant_secret_extraInitializers = [];
    let _api_endpoint_decorators;
    let _api_endpoint_initializers = [];
    let _api_endpoint_extraInitializers = [];
    let _notify_url_decorators;
    let _notify_url_initializers = [];
    let _notify_url_extraInitializers = [];
    let _return_url_decorators;
    let _return_url_initializers = [];
    let _return_url_extraInitializers = [];
    let _extra_config_decorators;
    let _extra_config_initializers = [];
    let _extra_config_extraInitializers = [];
    let _created_at_decorators;
    let _created_at_initializers = [];
    let _created_at_extraInitializers = [];
    let _updated_at_decorators;
    let _updated_at_initializers = [];
    let _updated_at_extraInitializers = [];
    return class PaymentConfigResponseDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [ApiProperty({ description: '配置ID' })];
            _name_decorators = [ApiProperty({ description: '配置名称' })];
            _display_name_decorators = [ApiProperty({ description: '显示名称' })];
            _is_enabled_decorators = [ApiProperty({ description: '是否启用' })];
            _merchant_id_decorators = [ApiProperty({ description: '商户ID' })];
            _merchant_key_decorators = [ApiProperty({ description: '商户密钥（脱敏）' })];
            _merchant_secret_decorators = [ApiProperty({ description: '商户秘钥（脱敏）' })];
            _api_endpoint_decorators = [ApiProperty({ description: 'API网关地址' })];
            _notify_url_decorators = [ApiProperty({ description: '异步通知地址' })];
            _return_url_decorators = [ApiProperty({ description: '同步跳转地址' })];
            _extra_config_decorators = [ApiProperty({ description: '额外配置' })];
            _created_at_decorators = [ApiProperty({ description: '创建时间' })];
            _updated_at_decorators = [ApiProperty({ description: '更新时间' })];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _display_name_decorators, { kind: "field", name: "display_name", static: false, private: false, access: { has: obj => "display_name" in obj, get: obj => obj.display_name, set: (obj, value) => { obj.display_name = value; } }, metadata: _metadata }, _display_name_initializers, _display_name_extraInitializers);
            __esDecorate(null, null, _is_enabled_decorators, { kind: "field", name: "is_enabled", static: false, private: false, access: { has: obj => "is_enabled" in obj, get: obj => obj.is_enabled, set: (obj, value) => { obj.is_enabled = value; } }, metadata: _metadata }, _is_enabled_initializers, _is_enabled_extraInitializers);
            __esDecorate(null, null, _merchant_id_decorators, { kind: "field", name: "merchant_id", static: false, private: false, access: { has: obj => "merchant_id" in obj, get: obj => obj.merchant_id, set: (obj, value) => { obj.merchant_id = value; } }, metadata: _metadata }, _merchant_id_initializers, _merchant_id_extraInitializers);
            __esDecorate(null, null, _merchant_key_decorators, { kind: "field", name: "merchant_key", static: false, private: false, access: { has: obj => "merchant_key" in obj, get: obj => obj.merchant_key, set: (obj, value) => { obj.merchant_key = value; } }, metadata: _metadata }, _merchant_key_initializers, _merchant_key_extraInitializers);
            __esDecorate(null, null, _merchant_secret_decorators, { kind: "field", name: "merchant_secret", static: false, private: false, access: { has: obj => "merchant_secret" in obj, get: obj => obj.merchant_secret, set: (obj, value) => { obj.merchant_secret = value; } }, metadata: _metadata }, _merchant_secret_initializers, _merchant_secret_extraInitializers);
            __esDecorate(null, null, _api_endpoint_decorators, { kind: "field", name: "api_endpoint", static: false, private: false, access: { has: obj => "api_endpoint" in obj, get: obj => obj.api_endpoint, set: (obj, value) => { obj.api_endpoint = value; } }, metadata: _metadata }, _api_endpoint_initializers, _api_endpoint_extraInitializers);
            __esDecorate(null, null, _notify_url_decorators, { kind: "field", name: "notify_url", static: false, private: false, access: { has: obj => "notify_url" in obj, get: obj => obj.notify_url, set: (obj, value) => { obj.notify_url = value; } }, metadata: _metadata }, _notify_url_initializers, _notify_url_extraInitializers);
            __esDecorate(null, null, _return_url_decorators, { kind: "field", name: "return_url", static: false, private: false, access: { has: obj => "return_url" in obj, get: obj => obj.return_url, set: (obj, value) => { obj.return_url = value; } }, metadata: _metadata }, _return_url_initializers, _return_url_extraInitializers);
            __esDecorate(null, null, _extra_config_decorators, { kind: "field", name: "extra_config", static: false, private: false, access: { has: obj => "extra_config" in obj, get: obj => obj.extra_config, set: (obj, value) => { obj.extra_config = value; } }, metadata: _metadata }, _extra_config_initializers, _extra_config_extraInitializers);
            __esDecorate(null, null, _created_at_decorators, { kind: "field", name: "created_at", static: false, private: false, access: { has: obj => "created_at" in obj, get: obj => obj.created_at, set: (obj, value) => { obj.created_at = value; } }, metadata: _metadata }, _created_at_initializers, _created_at_extraInitializers);
            __esDecorate(null, null, _updated_at_decorators, { kind: "field", name: "updated_at", static: false, private: false, access: { has: obj => "updated_at" in obj, get: obj => obj.updated_at, set: (obj, value) => { obj.updated_at = value; } }, metadata: _metadata }, _updated_at_initializers, _updated_at_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        id = __runInitializers(this, _id_initializers, void 0);
        name = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _name_initializers, void 0));
        display_name = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _display_name_initializers, void 0));
        is_enabled = (__runInitializers(this, _display_name_extraInitializers), __runInitializers(this, _is_enabled_initializers, void 0));
        merchant_id = (__runInitializers(this, _is_enabled_extraInitializers), __runInitializers(this, _merchant_id_initializers, void 0));
        merchant_key = (__runInitializers(this, _merchant_id_extraInitializers), __runInitializers(this, _merchant_key_initializers, void 0));
        merchant_secret = (__runInitializers(this, _merchant_key_extraInitializers), __runInitializers(this, _merchant_secret_initializers, void 0));
        api_endpoint = (__runInitializers(this, _merchant_secret_extraInitializers), __runInitializers(this, _api_endpoint_initializers, void 0));
        notify_url = (__runInitializers(this, _api_endpoint_extraInitializers), __runInitializers(this, _notify_url_initializers, void 0));
        return_url = (__runInitializers(this, _notify_url_extraInitializers), __runInitializers(this, _return_url_initializers, void 0));
        extra_config = (__runInitializers(this, _return_url_extraInitializers), __runInitializers(this, _extra_config_initializers, void 0));
        created_at = (__runInitializers(this, _extra_config_extraInitializers), __runInitializers(this, _created_at_initializers, void 0));
        updated_at = (__runInitializers(this, _created_at_extraInitializers), __runInitializers(this, _updated_at_initializers, void 0));
        constructor() {
            __runInitializers(this, _updated_at_extraInitializers);
        }
    };
})();
export { PaymentConfigResponseDto };
//# sourceMappingURL=payment-config.dto.js.map