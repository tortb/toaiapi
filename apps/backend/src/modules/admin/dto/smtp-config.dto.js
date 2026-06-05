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
import { IsString, IsBoolean, IsInt, IsOptional, IsEmail, MaxLength, Min, Max, } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
/**
 * 更新SMTP配置 DTO
 */
let UpdateSmtpConfigDto = (() => {
    let _is_enabled_decorators;
    let _is_enabled_initializers = [];
    let _is_enabled_extraInitializers = [];
    let _host_decorators;
    let _host_initializers = [];
    let _host_extraInitializers = [];
    let _port_decorators;
    let _port_initializers = [];
    let _port_extraInitializers = [];
    let _secure_decorators;
    let _secure_initializers = [];
    let _secure_extraInitializers = [];
    let _username_decorators;
    let _username_initializers = [];
    let _username_extraInitializers = [];
    let _password_decorators;
    let _password_initializers = [];
    let _password_extraInitializers = [];
    let _from_name_decorators;
    let _from_name_initializers = [];
    let _from_name_extraInitializers = [];
    let _from_address_decorators;
    let _from_address_initializers = [];
    let _from_address_extraInitializers = [];
    return class UpdateSmtpConfigDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _is_enabled_decorators = [ApiProperty({ description: '是否启用', required: false }), IsBoolean(), IsOptional()];
            _host_decorators = [ApiProperty({ description: 'SMTP服务器地址', required: false }), IsString(), IsOptional(), MaxLength(255)];
            _port_decorators = [ApiProperty({ description: 'SMTP端口', required: false, default: 587 }), IsInt(), IsOptional(), Min(1), Max(65535)];
            _secure_decorators = [ApiProperty({ description: '是否使用TLS', required: false, default: false }), IsBoolean(), IsOptional()];
            _username_decorators = [ApiProperty({ description: 'SMTP用户名', required: false }), IsString(), IsOptional(), MaxLength(255)];
            _password_decorators = [ApiProperty({ description: 'SMTP密码', required: false }), IsString(), IsOptional(), MaxLength(500)];
            _from_name_decorators = [ApiProperty({ description: '发件人名称', required: false }), IsString(), IsOptional(), MaxLength(100)];
            _from_address_decorators = [ApiProperty({ description: '发件人邮箱', required: false }), IsEmail(), IsOptional(), MaxLength(255)];
            __esDecorate(null, null, _is_enabled_decorators, { kind: "field", name: "is_enabled", static: false, private: false, access: { has: obj => "is_enabled" in obj, get: obj => obj.is_enabled, set: (obj, value) => { obj.is_enabled = value; } }, metadata: _metadata }, _is_enabled_initializers, _is_enabled_extraInitializers);
            __esDecorate(null, null, _host_decorators, { kind: "field", name: "host", static: false, private: false, access: { has: obj => "host" in obj, get: obj => obj.host, set: (obj, value) => { obj.host = value; } }, metadata: _metadata }, _host_initializers, _host_extraInitializers);
            __esDecorate(null, null, _port_decorators, { kind: "field", name: "port", static: false, private: false, access: { has: obj => "port" in obj, get: obj => obj.port, set: (obj, value) => { obj.port = value; } }, metadata: _metadata }, _port_initializers, _port_extraInitializers);
            __esDecorate(null, null, _secure_decorators, { kind: "field", name: "secure", static: false, private: false, access: { has: obj => "secure" in obj, get: obj => obj.secure, set: (obj, value) => { obj.secure = value; } }, metadata: _metadata }, _secure_initializers, _secure_extraInitializers);
            __esDecorate(null, null, _username_decorators, { kind: "field", name: "username", static: false, private: false, access: { has: obj => "username" in obj, get: obj => obj.username, set: (obj, value) => { obj.username = value; } }, metadata: _metadata }, _username_initializers, _username_extraInitializers);
            __esDecorate(null, null, _password_decorators, { kind: "field", name: "password", static: false, private: false, access: { has: obj => "password" in obj, get: obj => obj.password, set: (obj, value) => { obj.password = value; } }, metadata: _metadata }, _password_initializers, _password_extraInitializers);
            __esDecorate(null, null, _from_name_decorators, { kind: "field", name: "from_name", static: false, private: false, access: { has: obj => "from_name" in obj, get: obj => obj.from_name, set: (obj, value) => { obj.from_name = value; } }, metadata: _metadata }, _from_name_initializers, _from_name_extraInitializers);
            __esDecorate(null, null, _from_address_decorators, { kind: "field", name: "from_address", static: false, private: false, access: { has: obj => "from_address" in obj, get: obj => obj.from_address, set: (obj, value) => { obj.from_address = value; } }, metadata: _metadata }, _from_address_initializers, _from_address_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        is_enabled = __runInitializers(this, _is_enabled_initializers, void 0);
        host = (__runInitializers(this, _is_enabled_extraInitializers), __runInitializers(this, _host_initializers, void 0));
        port = (__runInitializers(this, _host_extraInitializers), __runInitializers(this, _port_initializers, void 0));
        secure = (__runInitializers(this, _port_extraInitializers), __runInitializers(this, _secure_initializers, void 0));
        username = (__runInitializers(this, _secure_extraInitializers), __runInitializers(this, _username_initializers, void 0));
        password = (__runInitializers(this, _username_extraInitializers), __runInitializers(this, _password_initializers, void 0));
        from_name = (__runInitializers(this, _password_extraInitializers), __runInitializers(this, _from_name_initializers, void 0));
        from_address = (__runInitializers(this, _from_name_extraInitializers), __runInitializers(this, _from_address_initializers, void 0));
        constructor() {
            __runInitializers(this, _from_address_extraInitializers);
        }
    };
})();
export { UpdateSmtpConfigDto };
/**
 * SMTP配置响应 DTO
 */
let SmtpConfigResponseDto = (() => {
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _is_enabled_decorators;
    let _is_enabled_initializers = [];
    let _is_enabled_extraInitializers = [];
    let _host_decorators;
    let _host_initializers = [];
    let _host_extraInitializers = [];
    let _port_decorators;
    let _port_initializers = [];
    let _port_extraInitializers = [];
    let _secure_decorators;
    let _secure_initializers = [];
    let _secure_extraInitializers = [];
    let _username_decorators;
    let _username_initializers = [];
    let _username_extraInitializers = [];
    let _password_decorators;
    let _password_initializers = [];
    let _password_extraInitializers = [];
    let _from_name_decorators;
    let _from_name_initializers = [];
    let _from_name_extraInitializers = [];
    let _from_address_decorators;
    let _from_address_initializers = [];
    let _from_address_extraInitializers = [];
    let _extra_config_decorators;
    let _extra_config_initializers = [];
    let _extra_config_extraInitializers = [];
    let _created_at_decorators;
    let _created_at_initializers = [];
    let _created_at_extraInitializers = [];
    let _updated_at_decorators;
    let _updated_at_initializers = [];
    let _updated_at_extraInitializers = [];
    return class SmtpConfigResponseDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [ApiProperty({ description: '配置ID' })];
            _name_decorators = [ApiProperty({ description: '配置名称' })];
            _is_enabled_decorators = [ApiProperty({ description: '是否启用' })];
            _host_decorators = [ApiProperty({ description: 'SMTP服务器地址' })];
            _port_decorators = [ApiProperty({ description: 'SMTP端口' })];
            _secure_decorators = [ApiProperty({ description: '是否使用TLS' })];
            _username_decorators = [ApiProperty({ description: 'SMTP用户名' })];
            _password_decorators = [ApiProperty({ description: 'SMTP密码（脱敏）' })];
            _from_name_decorators = [ApiProperty({ description: '发件人名称' })];
            _from_address_decorators = [ApiProperty({ description: '发件人邮箱' })];
            _extra_config_decorators = [ApiProperty({ description: '额外配置' })];
            _created_at_decorators = [ApiProperty({ description: '创建时间' })];
            _updated_at_decorators = [ApiProperty({ description: '更新时间' })];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _is_enabled_decorators, { kind: "field", name: "is_enabled", static: false, private: false, access: { has: obj => "is_enabled" in obj, get: obj => obj.is_enabled, set: (obj, value) => { obj.is_enabled = value; } }, metadata: _metadata }, _is_enabled_initializers, _is_enabled_extraInitializers);
            __esDecorate(null, null, _host_decorators, { kind: "field", name: "host", static: false, private: false, access: { has: obj => "host" in obj, get: obj => obj.host, set: (obj, value) => { obj.host = value; } }, metadata: _metadata }, _host_initializers, _host_extraInitializers);
            __esDecorate(null, null, _port_decorators, { kind: "field", name: "port", static: false, private: false, access: { has: obj => "port" in obj, get: obj => obj.port, set: (obj, value) => { obj.port = value; } }, metadata: _metadata }, _port_initializers, _port_extraInitializers);
            __esDecorate(null, null, _secure_decorators, { kind: "field", name: "secure", static: false, private: false, access: { has: obj => "secure" in obj, get: obj => obj.secure, set: (obj, value) => { obj.secure = value; } }, metadata: _metadata }, _secure_initializers, _secure_extraInitializers);
            __esDecorate(null, null, _username_decorators, { kind: "field", name: "username", static: false, private: false, access: { has: obj => "username" in obj, get: obj => obj.username, set: (obj, value) => { obj.username = value; } }, metadata: _metadata }, _username_initializers, _username_extraInitializers);
            __esDecorate(null, null, _password_decorators, { kind: "field", name: "password", static: false, private: false, access: { has: obj => "password" in obj, get: obj => obj.password, set: (obj, value) => { obj.password = value; } }, metadata: _metadata }, _password_initializers, _password_extraInitializers);
            __esDecorate(null, null, _from_name_decorators, { kind: "field", name: "from_name", static: false, private: false, access: { has: obj => "from_name" in obj, get: obj => obj.from_name, set: (obj, value) => { obj.from_name = value; } }, metadata: _metadata }, _from_name_initializers, _from_name_extraInitializers);
            __esDecorate(null, null, _from_address_decorators, { kind: "field", name: "from_address", static: false, private: false, access: { has: obj => "from_address" in obj, get: obj => obj.from_address, set: (obj, value) => { obj.from_address = value; } }, metadata: _metadata }, _from_address_initializers, _from_address_extraInitializers);
            __esDecorate(null, null, _extra_config_decorators, { kind: "field", name: "extra_config", static: false, private: false, access: { has: obj => "extra_config" in obj, get: obj => obj.extra_config, set: (obj, value) => { obj.extra_config = value; } }, metadata: _metadata }, _extra_config_initializers, _extra_config_extraInitializers);
            __esDecorate(null, null, _created_at_decorators, { kind: "field", name: "created_at", static: false, private: false, access: { has: obj => "created_at" in obj, get: obj => obj.created_at, set: (obj, value) => { obj.created_at = value; } }, metadata: _metadata }, _created_at_initializers, _created_at_extraInitializers);
            __esDecorate(null, null, _updated_at_decorators, { kind: "field", name: "updated_at", static: false, private: false, access: { has: obj => "updated_at" in obj, get: obj => obj.updated_at, set: (obj, value) => { obj.updated_at = value; } }, metadata: _metadata }, _updated_at_initializers, _updated_at_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        id = __runInitializers(this, _id_initializers, void 0);
        name = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _name_initializers, void 0));
        is_enabled = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _is_enabled_initializers, void 0));
        host = (__runInitializers(this, _is_enabled_extraInitializers), __runInitializers(this, _host_initializers, void 0));
        port = (__runInitializers(this, _host_extraInitializers), __runInitializers(this, _port_initializers, void 0));
        secure = (__runInitializers(this, _port_extraInitializers), __runInitializers(this, _secure_initializers, void 0));
        username = (__runInitializers(this, _secure_extraInitializers), __runInitializers(this, _username_initializers, void 0));
        password = (__runInitializers(this, _username_extraInitializers), __runInitializers(this, _password_initializers, void 0));
        from_name = (__runInitializers(this, _password_extraInitializers), __runInitializers(this, _from_name_initializers, void 0));
        from_address = (__runInitializers(this, _from_name_extraInitializers), __runInitializers(this, _from_address_initializers, void 0));
        extra_config = (__runInitializers(this, _from_address_extraInitializers), __runInitializers(this, _extra_config_initializers, void 0));
        created_at = (__runInitializers(this, _extra_config_extraInitializers), __runInitializers(this, _created_at_initializers, void 0));
        updated_at = (__runInitializers(this, _created_at_extraInitializers), __runInitializers(this, _updated_at_initializers, void 0));
        constructor() {
            __runInitializers(this, _updated_at_extraInitializers);
        }
    };
})();
export { SmtpConfigResponseDto };
/**
 * 测试邮件发送 DTO
 */
let SendTestEmailDto = (() => {
    let _email_decorators;
    let _email_initializers = [];
    let _email_extraInitializers = [];
    return class SendTestEmailDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _email_decorators = [ApiProperty({ description: '测试邮箱地址' }), IsEmail(), MaxLength(255)];
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        email = __runInitializers(this, _email_initializers, void 0);
        constructor() {
            __runInitializers(this, _email_extraInitializers);
        }
    };
})();
export { SendTestEmailDto };
/**
 * 测试SMTP连接响应 DTO
 */
let TestSmtpResponseDto = (() => {
    let _success_decorators;
    let _success_initializers = [];
    let _success_extraInitializers = [];
    let _message_decorators;
    let _message_initializers = [];
    let _message_extraInitializers = [];
    return class TestSmtpResponseDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _success_decorators = [ApiProperty({ description: '是否成功' })];
            _message_decorators = [ApiProperty({ description: '消息' })];
            __esDecorate(null, null, _success_decorators, { kind: "field", name: "success", static: false, private: false, access: { has: obj => "success" in obj, get: obj => obj.success, set: (obj, value) => { obj.success = value; } }, metadata: _metadata }, _success_initializers, _success_extraInitializers);
            __esDecorate(null, null, _message_decorators, { kind: "field", name: "message", static: false, private: false, access: { has: obj => "message" in obj, get: obj => obj.message, set: (obj, value) => { obj.message = value; } }, metadata: _metadata }, _message_initializers, _message_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        success = __runInitializers(this, _success_initializers, void 0);
        message = (__runInitializers(this, _success_extraInitializers), __runInitializers(this, _message_initializers, void 0));
        constructor() {
            __runInitializers(this, _message_extraInitializers);
        }
    };
})();
export { TestSmtpResponseDto };
//# sourceMappingURL=smtp-config.dto.js.map