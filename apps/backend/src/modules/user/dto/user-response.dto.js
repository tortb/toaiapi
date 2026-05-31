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
 * 用户响应 DTO
 *
 * 排除敏感字段（password_hash）
 */
let UserResponseDto = (() => {
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _email_decorators;
    let _email_initializers = [];
    let _email_extraInitializers = [];
    let _phone_decorators;
    let _phone_initializers = [];
    let _phone_extraInitializers = [];
    let _displayName_decorators;
    let _displayName_initializers = [];
    let _displayName_extraInitializers = [];
    let _avatarUrl_decorators;
    let _avatarUrl_initializers = [];
    let _avatarUrl_extraInitializers = [];
    let _role_decorators;
    let _role_initializers = [];
    let _role_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    return class UserResponseDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [ApiProperty({ description: '用户 ID' })];
            _email_decorators = [ApiProperty({ description: '邮箱地址' })];
            _phone_decorators = [ApiPropertyOptional({ description: '手机号' })];
            _displayName_decorators = [ApiPropertyOptional({ description: '显示名称' })];
            _avatarUrl_decorators = [ApiPropertyOptional({ description: '头像 URL' })];
            _role_decorators = [ApiProperty({ description: '用户角色', enum: ['USER', 'VIP', 'ENTERPRISE', 'AGENT', 'ADMIN', 'SUPER_ADMIN'] })];
            _status_decorators = [ApiProperty({ description: '用户状态', enum: ['ACTIVE', 'SUSPENDED', 'BANNED'] })];
            _createdAt_decorators = [ApiProperty({ description: '创建时间' })];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: obj => "phone" in obj, get: obj => obj.phone, set: (obj, value) => { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
            __esDecorate(null, null, _displayName_decorators, { kind: "field", name: "displayName", static: false, private: false, access: { has: obj => "displayName" in obj, get: obj => obj.displayName, set: (obj, value) => { obj.displayName = value; } }, metadata: _metadata }, _displayName_initializers, _displayName_extraInitializers);
            __esDecorate(null, null, _avatarUrl_decorators, { kind: "field", name: "avatarUrl", static: false, private: false, access: { has: obj => "avatarUrl" in obj, get: obj => obj.avatarUrl, set: (obj, value) => { obj.avatarUrl = value; } }, metadata: _metadata }, _avatarUrl_initializers, _avatarUrl_extraInitializers);
            __esDecorate(null, null, _role_decorators, { kind: "field", name: "role", static: false, private: false, access: { has: obj => "role" in obj, get: obj => obj.role, set: (obj, value) => { obj.role = value; } }, metadata: _metadata }, _role_initializers, _role_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        id = __runInitializers(this, _id_initializers, void 0);
        email = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _email_initializers, void 0));
        phone = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _phone_initializers, void 0));
        displayName = (__runInitializers(this, _phone_extraInitializers), __runInitializers(this, _displayName_initializers, void 0));
        avatarUrl = (__runInitializers(this, _displayName_extraInitializers), __runInitializers(this, _avatarUrl_initializers, void 0));
        role = (__runInitializers(this, _avatarUrl_extraInitializers), __runInitializers(this, _role_initializers, void 0));
        status = (__runInitializers(this, _role_extraInitializers), __runInitializers(this, _status_initializers, void 0));
        createdAt = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
        constructor() {
            __runInitializers(this, _createdAt_extraInitializers);
        }
    };
})();
export { UserResponseDto };
//# sourceMappingURL=user-response.dto.js.map