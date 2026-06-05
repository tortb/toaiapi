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
import { IsString, IsOptional, IsBoolean, IsInt, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
/**
 * 创建角色 DTO
 */
let CreateRoleDto = (() => {
    let _code_decorators;
    let _code_initializers = [];
    let _code_extraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _level_decorators;
    let _level_initializers = [];
    let _level_extraInitializers = [];
    let _dataScope_decorators;
    let _dataScope_initializers = [];
    let _dataScope_extraInitializers = [];
    return class CreateRoleDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _code_decorators = [ApiProperty({ description: '角色编码', example: 'editor' }), IsString()];
            _name_decorators = [ApiProperty({ description: '显示名', example: '编辑员' }), IsString()];
            _description_decorators = [ApiPropertyOptional({ description: '描述' }), IsOptional(), IsString()];
            _level_decorators = [ApiProperty({ description: '角色等级', example: 30 }), IsInt()];
            _dataScope_decorators = [ApiPropertyOptional({ description: '数据范围', default: 'SELF' }), IsOptional(), IsString()];
            __esDecorate(null, null, _code_decorators, { kind: "field", name: "code", static: false, private: false, access: { has: obj => "code" in obj, get: obj => obj.code, set: (obj, value) => { obj.code = value; } }, metadata: _metadata }, _code_initializers, _code_extraInitializers);
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _level_decorators, { kind: "field", name: "level", static: false, private: false, access: { has: obj => "level" in obj, get: obj => obj.level, set: (obj, value) => { obj.level = value; } }, metadata: _metadata }, _level_initializers, _level_extraInitializers);
            __esDecorate(null, null, _dataScope_decorators, { kind: "field", name: "dataScope", static: false, private: false, access: { has: obj => "dataScope" in obj, get: obj => obj.dataScope, set: (obj, value) => { obj.dataScope = value; } }, metadata: _metadata }, _dataScope_initializers, _dataScope_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        code = __runInitializers(this, _code_initializers, void 0);
        name = (__runInitializers(this, _code_extraInitializers), __runInitializers(this, _name_initializers, void 0));
        description = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        level = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _level_initializers, void 0));
        dataScope = (__runInitializers(this, _level_extraInitializers), __runInitializers(this, _dataScope_initializers, void 0));
        constructor() {
            __runInitializers(this, _dataScope_extraInitializers);
        }
    };
})();
export { CreateRoleDto };
/**
 * 更新角色 DTO
 */
let UpdateRoleDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _level_decorators;
    let _level_initializers = [];
    let _level_extraInitializers = [];
    let _dataScope_decorators;
    let _dataScope_initializers = [];
    let _dataScope_extraInitializers = [];
    let _isActive_decorators;
    let _isActive_initializers = [];
    let _isActive_extraInitializers = [];
    return class UpdateRoleDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [ApiPropertyOptional({ description: '显示名' }), IsOptional(), IsString()];
            _description_decorators = [ApiPropertyOptional({ description: '描述' }), IsOptional(), IsString()];
            _level_decorators = [ApiPropertyOptional({ description: '角色等级' }), IsOptional(), IsInt()];
            _dataScope_decorators = [ApiPropertyOptional({ description: '数据范围' }), IsOptional(), IsString()];
            _isActive_decorators = [ApiPropertyOptional({ description: '是否启用' }), IsOptional(), IsBoolean()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _level_decorators, { kind: "field", name: "level", static: false, private: false, access: { has: obj => "level" in obj, get: obj => obj.level, set: (obj, value) => { obj.level = value; } }, metadata: _metadata }, _level_initializers, _level_extraInitializers);
            __esDecorate(null, null, _dataScope_decorators, { kind: "field", name: "dataScope", static: false, private: false, access: { has: obj => "dataScope" in obj, get: obj => obj.dataScope, set: (obj, value) => { obj.dataScope = value; } }, metadata: _metadata }, _dataScope_initializers, _dataScope_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        description = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        level = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _level_initializers, void 0));
        dataScope = (__runInitializers(this, _level_extraInitializers), __runInitializers(this, _dataScope_initializers, void 0));
        isActive = (__runInitializers(this, _dataScope_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
        constructor() {
            __runInitializers(this, _isActive_extraInitializers);
        }
    };
})();
export { UpdateRoleDto };
/**
 * 分配权限 DTO
 */
let AssignPermissionsDto = (() => {
    let _permissionIds_decorators;
    let _permissionIds_initializers = [];
    let _permissionIds_extraInitializers = [];
    return class AssignPermissionsDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _permissionIds_decorators = [ApiProperty({ description: '权限 ID 列表', type: [String] }), IsArray()];
            __esDecorate(null, null, _permissionIds_decorators, { kind: "field", name: "permissionIds", static: false, private: false, access: { has: obj => "permissionIds" in obj, get: obj => obj.permissionIds, set: (obj, value) => { obj.permissionIds = value; } }, metadata: _metadata }, _permissionIds_initializers, _permissionIds_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        permissionIds = __runInitializers(this, _permissionIds_initializers, void 0);
        constructor() {
            __runInitializers(this, _permissionIds_extraInitializers);
        }
    };
})();
export { AssignPermissionsDto };
/**
 * 角色响应 DTO
 */
let RoleResponseDto = (() => {
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _code_decorators;
    let _code_initializers = [];
    let _code_extraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _level_decorators;
    let _level_initializers = [];
    let _level_extraInitializers = [];
    let _isSystem_decorators;
    let _isSystem_initializers = [];
    let _isSystem_extraInitializers = [];
    let _isActive_decorators;
    let _isActive_initializers = [];
    let _isActive_extraInitializers = [];
    let _dataScope_decorators;
    let _dataScope_initializers = [];
    let _dataScope_extraInitializers = [];
    let _permissionCount_decorators;
    let _permissionCount_initializers = [];
    let _permissionCount_extraInitializers = [];
    let _userCount_decorators;
    let _userCount_initializers = [];
    let _userCount_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    return class RoleResponseDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [ApiProperty()];
            _code_decorators = [ApiProperty()];
            _name_decorators = [ApiProperty()];
            _description_decorators = [ApiProperty()];
            _level_decorators = [ApiProperty()];
            _isSystem_decorators = [ApiProperty()];
            _isActive_decorators = [ApiProperty()];
            _dataScope_decorators = [ApiProperty()];
            _permissionCount_decorators = [ApiProperty()];
            _userCount_decorators = [ApiProperty()];
            _createdAt_decorators = [ApiProperty()];
            _updatedAt_decorators = [ApiProperty()];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _code_decorators, { kind: "field", name: "code", static: false, private: false, access: { has: obj => "code" in obj, get: obj => obj.code, set: (obj, value) => { obj.code = value; } }, metadata: _metadata }, _code_initializers, _code_extraInitializers);
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _level_decorators, { kind: "field", name: "level", static: false, private: false, access: { has: obj => "level" in obj, get: obj => obj.level, set: (obj, value) => { obj.level = value; } }, metadata: _metadata }, _level_initializers, _level_extraInitializers);
            __esDecorate(null, null, _isSystem_decorators, { kind: "field", name: "isSystem", static: false, private: false, access: { has: obj => "isSystem" in obj, get: obj => obj.isSystem, set: (obj, value) => { obj.isSystem = value; } }, metadata: _metadata }, _isSystem_initializers, _isSystem_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            __esDecorate(null, null, _dataScope_decorators, { kind: "field", name: "dataScope", static: false, private: false, access: { has: obj => "dataScope" in obj, get: obj => obj.dataScope, set: (obj, value) => { obj.dataScope = value; } }, metadata: _metadata }, _dataScope_initializers, _dataScope_extraInitializers);
            __esDecorate(null, null, _permissionCount_decorators, { kind: "field", name: "permissionCount", static: false, private: false, access: { has: obj => "permissionCount" in obj, get: obj => obj.permissionCount, set: (obj, value) => { obj.permissionCount = value; } }, metadata: _metadata }, _permissionCount_initializers, _permissionCount_extraInitializers);
            __esDecorate(null, null, _userCount_decorators, { kind: "field", name: "userCount", static: false, private: false, access: { has: obj => "userCount" in obj, get: obj => obj.userCount, set: (obj, value) => { obj.userCount = value; } }, metadata: _metadata }, _userCount_initializers, _userCount_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        id = __runInitializers(this, _id_initializers, void 0);
        code = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _code_initializers, void 0));
        name = (__runInitializers(this, _code_extraInitializers), __runInitializers(this, _name_initializers, void 0));
        description = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        level = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _level_initializers, void 0));
        isSystem = (__runInitializers(this, _level_extraInitializers), __runInitializers(this, _isSystem_initializers, void 0));
        isActive = (__runInitializers(this, _isSystem_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
        dataScope = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _dataScope_initializers, void 0));
        permissionCount = (__runInitializers(this, _dataScope_extraInitializers), __runInitializers(this, _permissionCount_initializers, void 0));
        userCount = (__runInitializers(this, _permissionCount_extraInitializers), __runInitializers(this, _userCount_initializers, void 0));
        createdAt = (__runInitializers(this, _userCount_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
        updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
        constructor() {
            __runInitializers(this, _updatedAt_extraInitializers);
        }
    };
})();
export { RoleResponseDto };
/**
 * 权限响应 DTO
 */
let PermissionResponseDto = (() => {
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _code_decorators;
    let _code_initializers = [];
    let _code_extraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _resource_decorators;
    let _resource_initializers = [];
    let _resource_extraInitializers = [];
    let _action_decorators;
    let _action_initializers = [];
    let _action_extraInitializers = [];
    return class PermissionResponseDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [ApiProperty()];
            _code_decorators = [ApiProperty()];
            _name_decorators = [ApiProperty()];
            _resource_decorators = [ApiProperty()];
            _action_decorators = [ApiProperty()];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _code_decorators, { kind: "field", name: "code", static: false, private: false, access: { has: obj => "code" in obj, get: obj => obj.code, set: (obj, value) => { obj.code = value; } }, metadata: _metadata }, _code_initializers, _code_extraInitializers);
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _resource_decorators, { kind: "field", name: "resource", static: false, private: false, access: { has: obj => "resource" in obj, get: obj => obj.resource, set: (obj, value) => { obj.resource = value; } }, metadata: _metadata }, _resource_initializers, _resource_extraInitializers);
            __esDecorate(null, null, _action_decorators, { kind: "field", name: "action", static: false, private: false, access: { has: obj => "action" in obj, get: obj => obj.action, set: (obj, value) => { obj.action = value; } }, metadata: _metadata }, _action_initializers, _action_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        id = __runInitializers(this, _id_initializers, void 0);
        code = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _code_initializers, void 0));
        name = (__runInitializers(this, _code_extraInitializers), __runInitializers(this, _name_initializers, void 0));
        resource = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _resource_initializers, void 0));
        action = (__runInitializers(this, _resource_extraInitializers), __runInitializers(this, _action_initializers, void 0));
        constructor() {
            __runInitializers(this, _action_extraInitializers);
        }
    };
})();
export { PermissionResponseDto };
//# sourceMappingURL=role.dto.js.map