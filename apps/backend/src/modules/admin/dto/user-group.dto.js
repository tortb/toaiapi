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
import { IsString, IsOptional, IsBoolean, IsInt, IsNumber, Min, Max, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
/**
 * 创建用户组 DTO
 */
let CreateUserGroupDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _displayName_decorators;
    let _displayName_initializers = [];
    let _displayName_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _priceMultiplier_decorators;
    let _priceMultiplier_initializers = [];
    let _priceMultiplier_extraInitializers = [];
    let _rpmLimit_decorators;
    let _rpmLimit_initializers = [];
    let _rpmLimit_extraInitializers = [];
    let _tpmLimit_decorators;
    let _tpmLimit_initializers = [];
    let _tpmLimit_extraInitializers = [];
    let _maxApiKeys_decorators;
    let _maxApiKeys_initializers = [];
    let _maxApiKeys_extraInitializers = [];
    let _allowedModels_decorators;
    let _allowedModels_initializers = [];
    let _allowedModels_extraInitializers = [];
    let _allowedChannels_decorators;
    let _allowedChannels_initializers = [];
    let _allowedChannels_extraInitializers = [];
    let _allowProxy_decorators;
    let _allowProxy_initializers = [];
    let _allowProxy_extraInitializers = [];
    let _allowShare_decorators;
    let _allowShare_initializers = [];
    let _allowShare_extraInitializers = [];
    return class CreateUserGroupDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [ApiProperty({ description: '组名（英文，唯一）', example: 'vip' }), IsString(), Length(1, 50)];
            _displayName_decorators = [ApiProperty({ description: '显示名（中文）', example: 'VIP 用户' }), IsString(), Length(1, 50)];
            _description_decorators = [ApiPropertyOptional({ description: '描述' }), IsOptional(), IsString()];
            _priceMultiplier_decorators = [ApiProperty({ description: '价格倍率', example: 1.0 }), IsNumber(), Min(0.1), Max(10.0)];
            _rpmLimit_decorators = [ApiProperty({ description: '请求/分钟', example: 60 }), IsInt(), Min(1)];
            _tpmLimit_decorators = [ApiProperty({ description: 'Token/分钟', example: 60000 }), IsInt(), Min(1)];
            _maxApiKeys_decorators = [ApiProperty({ description: '最大 API Key 数', example: 10 }), IsInt(), Min(1)];
            _allowedModels_decorators = [ApiPropertyOptional({ description: '允许的模型（空=全部）', type: [String] }), IsOptional()];
            _allowedChannels_decorators = [ApiPropertyOptional({ description: '允许的渠道（空=全部）', type: [String] }), IsOptional()];
            _allowProxy_decorators = [ApiPropertyOptional({ description: '是否允许代理', default: true }), IsOptional(), IsBoolean()];
            _allowShare_decorators = [ApiPropertyOptional({ description: '是否允许分享', default: false }), IsOptional(), IsBoolean()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _displayName_decorators, { kind: "field", name: "displayName", static: false, private: false, access: { has: obj => "displayName" in obj, get: obj => obj.displayName, set: (obj, value) => { obj.displayName = value; } }, metadata: _metadata }, _displayName_initializers, _displayName_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _priceMultiplier_decorators, { kind: "field", name: "priceMultiplier", static: false, private: false, access: { has: obj => "priceMultiplier" in obj, get: obj => obj.priceMultiplier, set: (obj, value) => { obj.priceMultiplier = value; } }, metadata: _metadata }, _priceMultiplier_initializers, _priceMultiplier_extraInitializers);
            __esDecorate(null, null, _rpmLimit_decorators, { kind: "field", name: "rpmLimit", static: false, private: false, access: { has: obj => "rpmLimit" in obj, get: obj => obj.rpmLimit, set: (obj, value) => { obj.rpmLimit = value; } }, metadata: _metadata }, _rpmLimit_initializers, _rpmLimit_extraInitializers);
            __esDecorate(null, null, _tpmLimit_decorators, { kind: "field", name: "tpmLimit", static: false, private: false, access: { has: obj => "tpmLimit" in obj, get: obj => obj.tpmLimit, set: (obj, value) => { obj.tpmLimit = value; } }, metadata: _metadata }, _tpmLimit_initializers, _tpmLimit_extraInitializers);
            __esDecorate(null, null, _maxApiKeys_decorators, { kind: "field", name: "maxApiKeys", static: false, private: false, access: { has: obj => "maxApiKeys" in obj, get: obj => obj.maxApiKeys, set: (obj, value) => { obj.maxApiKeys = value; } }, metadata: _metadata }, _maxApiKeys_initializers, _maxApiKeys_extraInitializers);
            __esDecorate(null, null, _allowedModels_decorators, { kind: "field", name: "allowedModels", static: false, private: false, access: { has: obj => "allowedModels" in obj, get: obj => obj.allowedModels, set: (obj, value) => { obj.allowedModels = value; } }, metadata: _metadata }, _allowedModels_initializers, _allowedModels_extraInitializers);
            __esDecorate(null, null, _allowedChannels_decorators, { kind: "field", name: "allowedChannels", static: false, private: false, access: { has: obj => "allowedChannels" in obj, get: obj => obj.allowedChannels, set: (obj, value) => { obj.allowedChannels = value; } }, metadata: _metadata }, _allowedChannels_initializers, _allowedChannels_extraInitializers);
            __esDecorate(null, null, _allowProxy_decorators, { kind: "field", name: "allowProxy", static: false, private: false, access: { has: obj => "allowProxy" in obj, get: obj => obj.allowProxy, set: (obj, value) => { obj.allowProxy = value; } }, metadata: _metadata }, _allowProxy_initializers, _allowProxy_extraInitializers);
            __esDecorate(null, null, _allowShare_decorators, { kind: "field", name: "allowShare", static: false, private: false, access: { has: obj => "allowShare" in obj, get: obj => obj.allowShare, set: (obj, value) => { obj.allowShare = value; } }, metadata: _metadata }, _allowShare_initializers, _allowShare_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        displayName = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _displayName_initializers, void 0));
        description = (__runInitializers(this, _displayName_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        priceMultiplier = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _priceMultiplier_initializers, void 0));
        rpmLimit = (__runInitializers(this, _priceMultiplier_extraInitializers), __runInitializers(this, _rpmLimit_initializers, void 0));
        tpmLimit = (__runInitializers(this, _rpmLimit_extraInitializers), __runInitializers(this, _tpmLimit_initializers, void 0));
        maxApiKeys = (__runInitializers(this, _tpmLimit_extraInitializers), __runInitializers(this, _maxApiKeys_initializers, void 0));
        allowedModels = (__runInitializers(this, _maxApiKeys_extraInitializers), __runInitializers(this, _allowedModels_initializers, void 0));
        allowedChannels = (__runInitializers(this, _allowedModels_extraInitializers), __runInitializers(this, _allowedChannels_initializers, void 0));
        allowProxy = (__runInitializers(this, _allowedChannels_extraInitializers), __runInitializers(this, _allowProxy_initializers, void 0));
        allowShare = (__runInitializers(this, _allowProxy_extraInitializers), __runInitializers(this, _allowShare_initializers, void 0));
        constructor() {
            __runInitializers(this, _allowShare_extraInitializers);
        }
    };
})();
export { CreateUserGroupDto };
/**
 * 更新用户组 DTO
 */
let UpdateUserGroupDto = (() => {
    let _displayName_decorators;
    let _displayName_initializers = [];
    let _displayName_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _priceMultiplier_decorators;
    let _priceMultiplier_initializers = [];
    let _priceMultiplier_extraInitializers = [];
    let _rpmLimit_decorators;
    let _rpmLimit_initializers = [];
    let _rpmLimit_extraInitializers = [];
    let _tpmLimit_decorators;
    let _tpmLimit_initializers = [];
    let _tpmLimit_extraInitializers = [];
    let _maxApiKeys_decorators;
    let _maxApiKeys_initializers = [];
    let _maxApiKeys_extraInitializers = [];
    let _allowedModels_decorators;
    let _allowedModels_initializers = [];
    let _allowedModels_extraInitializers = [];
    let _allowedChannels_decorators;
    let _allowedChannels_initializers = [];
    let _allowedChannels_extraInitializers = [];
    let _allowProxy_decorators;
    let _allowProxy_initializers = [];
    let _allowProxy_extraInitializers = [];
    let _allowShare_decorators;
    let _allowShare_initializers = [];
    let _allowShare_extraInitializers = [];
    return class UpdateUserGroupDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _displayName_decorators = [ApiPropertyOptional({ description: '显示名（中文）' }), IsOptional(), IsString(), Length(1, 50)];
            _description_decorators = [ApiPropertyOptional({ description: '描述' }), IsOptional(), IsString()];
            _priceMultiplier_decorators = [ApiPropertyOptional({ description: '价格倍率' }), IsOptional(), IsNumber(), Min(0.1), Max(10.0)];
            _rpmLimit_decorators = [ApiPropertyOptional({ description: '请求/分钟' }), IsOptional(), IsInt(), Min(1)];
            _tpmLimit_decorators = [ApiPropertyOptional({ description: 'Token/分钟' }), IsOptional(), IsInt(), Min(1)];
            _maxApiKeys_decorators = [ApiPropertyOptional({ description: '最大 API Key 数' }), IsOptional(), IsInt(), Min(1)];
            _allowedModels_decorators = [ApiPropertyOptional({ description: '允许的模型', type: [String] }), IsOptional()];
            _allowedChannels_decorators = [ApiPropertyOptional({ description: '允许的渠道', type: [String] }), IsOptional()];
            _allowProxy_decorators = [ApiPropertyOptional({ description: '是否允许代理' }), IsOptional(), IsBoolean()];
            _allowShare_decorators = [ApiPropertyOptional({ description: '是否允许分享' }), IsOptional(), IsBoolean()];
            __esDecorate(null, null, _displayName_decorators, { kind: "field", name: "displayName", static: false, private: false, access: { has: obj => "displayName" in obj, get: obj => obj.displayName, set: (obj, value) => { obj.displayName = value; } }, metadata: _metadata }, _displayName_initializers, _displayName_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _priceMultiplier_decorators, { kind: "field", name: "priceMultiplier", static: false, private: false, access: { has: obj => "priceMultiplier" in obj, get: obj => obj.priceMultiplier, set: (obj, value) => { obj.priceMultiplier = value; } }, metadata: _metadata }, _priceMultiplier_initializers, _priceMultiplier_extraInitializers);
            __esDecorate(null, null, _rpmLimit_decorators, { kind: "field", name: "rpmLimit", static: false, private: false, access: { has: obj => "rpmLimit" in obj, get: obj => obj.rpmLimit, set: (obj, value) => { obj.rpmLimit = value; } }, metadata: _metadata }, _rpmLimit_initializers, _rpmLimit_extraInitializers);
            __esDecorate(null, null, _tpmLimit_decorators, { kind: "field", name: "tpmLimit", static: false, private: false, access: { has: obj => "tpmLimit" in obj, get: obj => obj.tpmLimit, set: (obj, value) => { obj.tpmLimit = value; } }, metadata: _metadata }, _tpmLimit_initializers, _tpmLimit_extraInitializers);
            __esDecorate(null, null, _maxApiKeys_decorators, { kind: "field", name: "maxApiKeys", static: false, private: false, access: { has: obj => "maxApiKeys" in obj, get: obj => obj.maxApiKeys, set: (obj, value) => { obj.maxApiKeys = value; } }, metadata: _metadata }, _maxApiKeys_initializers, _maxApiKeys_extraInitializers);
            __esDecorate(null, null, _allowedModels_decorators, { kind: "field", name: "allowedModels", static: false, private: false, access: { has: obj => "allowedModels" in obj, get: obj => obj.allowedModels, set: (obj, value) => { obj.allowedModels = value; } }, metadata: _metadata }, _allowedModels_initializers, _allowedModels_extraInitializers);
            __esDecorate(null, null, _allowedChannels_decorators, { kind: "field", name: "allowedChannels", static: false, private: false, access: { has: obj => "allowedChannels" in obj, get: obj => obj.allowedChannels, set: (obj, value) => { obj.allowedChannels = value; } }, metadata: _metadata }, _allowedChannels_initializers, _allowedChannels_extraInitializers);
            __esDecorate(null, null, _allowProxy_decorators, { kind: "field", name: "allowProxy", static: false, private: false, access: { has: obj => "allowProxy" in obj, get: obj => obj.allowProxy, set: (obj, value) => { obj.allowProxy = value; } }, metadata: _metadata }, _allowProxy_initializers, _allowProxy_extraInitializers);
            __esDecorate(null, null, _allowShare_decorators, { kind: "field", name: "allowShare", static: false, private: false, access: { has: obj => "allowShare" in obj, get: obj => obj.allowShare, set: (obj, value) => { obj.allowShare = value; } }, metadata: _metadata }, _allowShare_initializers, _allowShare_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        displayName = __runInitializers(this, _displayName_initializers, void 0);
        description = (__runInitializers(this, _displayName_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        priceMultiplier = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _priceMultiplier_initializers, void 0));
        rpmLimit = (__runInitializers(this, _priceMultiplier_extraInitializers), __runInitializers(this, _rpmLimit_initializers, void 0));
        tpmLimit = (__runInitializers(this, _rpmLimit_extraInitializers), __runInitializers(this, _tpmLimit_initializers, void 0));
        maxApiKeys = (__runInitializers(this, _tpmLimit_extraInitializers), __runInitializers(this, _maxApiKeys_initializers, void 0));
        allowedModels = (__runInitializers(this, _maxApiKeys_extraInitializers), __runInitializers(this, _allowedModels_initializers, void 0));
        allowedChannels = (__runInitializers(this, _allowedModels_extraInitializers), __runInitializers(this, _allowedChannels_initializers, void 0));
        allowProxy = (__runInitializers(this, _allowedChannels_extraInitializers), __runInitializers(this, _allowProxy_initializers, void 0));
        allowShare = (__runInitializers(this, _allowProxy_extraInitializers), __runInitializers(this, _allowShare_initializers, void 0));
        constructor() {
            __runInitializers(this, _allowShare_extraInitializers);
        }
    };
})();
export { UpdateUserGroupDto };
/**
 * 用户组响应 DTO
 */
let UserGroupResponseDto = (() => {
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _displayName_decorators;
    let _displayName_initializers = [];
    let _displayName_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _priceMultiplier_decorators;
    let _priceMultiplier_initializers = [];
    let _priceMultiplier_extraInitializers = [];
    let _rpmLimit_decorators;
    let _rpmLimit_initializers = [];
    let _rpmLimit_extraInitializers = [];
    let _tpmLimit_decorators;
    let _tpmLimit_initializers = [];
    let _tpmLimit_extraInitializers = [];
    let _maxApiKeys_decorators;
    let _maxApiKeys_initializers = [];
    let _maxApiKeys_extraInitializers = [];
    let _allowedModels_decorators;
    let _allowedModels_initializers = [];
    let _allowedModels_extraInitializers = [];
    let _allowedChannels_decorators;
    let _allowedChannels_initializers = [];
    let _allowedChannels_extraInitializers = [];
    let _allowProxy_decorators;
    let _allowProxy_initializers = [];
    let _allowProxy_extraInitializers = [];
    let _allowShare_decorators;
    let _allowShare_initializers = [];
    let _allowShare_extraInitializers = [];
    let _isActive_decorators;
    let _isActive_initializers = [];
    let _isActive_extraInitializers = [];
    let _isBuiltin_decorators;
    let _isBuiltin_initializers = [];
    let _isBuiltin_extraInitializers = [];
    let _userCount_decorators;
    let _userCount_initializers = [];
    let _userCount_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    return class UserGroupResponseDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [ApiProperty()];
            _name_decorators = [ApiProperty()];
            _displayName_decorators = [ApiProperty()];
            _description_decorators = [ApiProperty()];
            _priceMultiplier_decorators = [ApiProperty()];
            _rpmLimit_decorators = [ApiProperty()];
            _tpmLimit_decorators = [ApiProperty()];
            _maxApiKeys_decorators = [ApiProperty()];
            _allowedModels_decorators = [ApiProperty()];
            _allowedChannels_decorators = [ApiProperty()];
            _allowProxy_decorators = [ApiProperty()];
            _allowShare_decorators = [ApiProperty()];
            _isActive_decorators = [ApiProperty()];
            _isBuiltin_decorators = [ApiProperty()];
            _userCount_decorators = [ApiProperty()];
            _createdAt_decorators = [ApiProperty()];
            _updatedAt_decorators = [ApiProperty()];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _displayName_decorators, { kind: "field", name: "displayName", static: false, private: false, access: { has: obj => "displayName" in obj, get: obj => obj.displayName, set: (obj, value) => { obj.displayName = value; } }, metadata: _metadata }, _displayName_initializers, _displayName_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _priceMultiplier_decorators, { kind: "field", name: "priceMultiplier", static: false, private: false, access: { has: obj => "priceMultiplier" in obj, get: obj => obj.priceMultiplier, set: (obj, value) => { obj.priceMultiplier = value; } }, metadata: _metadata }, _priceMultiplier_initializers, _priceMultiplier_extraInitializers);
            __esDecorate(null, null, _rpmLimit_decorators, { kind: "field", name: "rpmLimit", static: false, private: false, access: { has: obj => "rpmLimit" in obj, get: obj => obj.rpmLimit, set: (obj, value) => { obj.rpmLimit = value; } }, metadata: _metadata }, _rpmLimit_initializers, _rpmLimit_extraInitializers);
            __esDecorate(null, null, _tpmLimit_decorators, { kind: "field", name: "tpmLimit", static: false, private: false, access: { has: obj => "tpmLimit" in obj, get: obj => obj.tpmLimit, set: (obj, value) => { obj.tpmLimit = value; } }, metadata: _metadata }, _tpmLimit_initializers, _tpmLimit_extraInitializers);
            __esDecorate(null, null, _maxApiKeys_decorators, { kind: "field", name: "maxApiKeys", static: false, private: false, access: { has: obj => "maxApiKeys" in obj, get: obj => obj.maxApiKeys, set: (obj, value) => { obj.maxApiKeys = value; } }, metadata: _metadata }, _maxApiKeys_initializers, _maxApiKeys_extraInitializers);
            __esDecorate(null, null, _allowedModels_decorators, { kind: "field", name: "allowedModels", static: false, private: false, access: { has: obj => "allowedModels" in obj, get: obj => obj.allowedModels, set: (obj, value) => { obj.allowedModels = value; } }, metadata: _metadata }, _allowedModels_initializers, _allowedModels_extraInitializers);
            __esDecorate(null, null, _allowedChannels_decorators, { kind: "field", name: "allowedChannels", static: false, private: false, access: { has: obj => "allowedChannels" in obj, get: obj => obj.allowedChannels, set: (obj, value) => { obj.allowedChannels = value; } }, metadata: _metadata }, _allowedChannels_initializers, _allowedChannels_extraInitializers);
            __esDecorate(null, null, _allowProxy_decorators, { kind: "field", name: "allowProxy", static: false, private: false, access: { has: obj => "allowProxy" in obj, get: obj => obj.allowProxy, set: (obj, value) => { obj.allowProxy = value; } }, metadata: _metadata }, _allowProxy_initializers, _allowProxy_extraInitializers);
            __esDecorate(null, null, _allowShare_decorators, { kind: "field", name: "allowShare", static: false, private: false, access: { has: obj => "allowShare" in obj, get: obj => obj.allowShare, set: (obj, value) => { obj.allowShare = value; } }, metadata: _metadata }, _allowShare_initializers, _allowShare_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            __esDecorate(null, null, _isBuiltin_decorators, { kind: "field", name: "isBuiltin", static: false, private: false, access: { has: obj => "isBuiltin" in obj, get: obj => obj.isBuiltin, set: (obj, value) => { obj.isBuiltin = value; } }, metadata: _metadata }, _isBuiltin_initializers, _isBuiltin_extraInitializers);
            __esDecorate(null, null, _userCount_decorators, { kind: "field", name: "userCount", static: false, private: false, access: { has: obj => "userCount" in obj, get: obj => obj.userCount, set: (obj, value) => { obj.userCount = value; } }, metadata: _metadata }, _userCount_initializers, _userCount_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        id = __runInitializers(this, _id_initializers, void 0);
        name = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _name_initializers, void 0));
        displayName = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _displayName_initializers, void 0));
        description = (__runInitializers(this, _displayName_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        priceMultiplier = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _priceMultiplier_initializers, void 0));
        rpmLimit = (__runInitializers(this, _priceMultiplier_extraInitializers), __runInitializers(this, _rpmLimit_initializers, void 0));
        tpmLimit = (__runInitializers(this, _rpmLimit_extraInitializers), __runInitializers(this, _tpmLimit_initializers, void 0));
        maxApiKeys = (__runInitializers(this, _tpmLimit_extraInitializers), __runInitializers(this, _maxApiKeys_initializers, void 0));
        allowedModels = (__runInitializers(this, _maxApiKeys_extraInitializers), __runInitializers(this, _allowedModels_initializers, void 0));
        allowedChannels = (__runInitializers(this, _allowedModels_extraInitializers), __runInitializers(this, _allowedChannels_initializers, void 0));
        allowProxy = (__runInitializers(this, _allowedChannels_extraInitializers), __runInitializers(this, _allowProxy_initializers, void 0));
        allowShare = (__runInitializers(this, _allowProxy_extraInitializers), __runInitializers(this, _allowShare_initializers, void 0));
        isActive = (__runInitializers(this, _allowShare_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
        isBuiltin = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _isBuiltin_initializers, void 0));
        userCount = (__runInitializers(this, _isBuiltin_extraInitializers), __runInitializers(this, _userCount_initializers, void 0));
        createdAt = (__runInitializers(this, _userCount_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
        updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
        constructor() {
            __runInitializers(this, _updatedAt_extraInitializers);
        }
    };
})();
export { UserGroupResponseDto };
//# sourceMappingURL=user-group.dto.js.map