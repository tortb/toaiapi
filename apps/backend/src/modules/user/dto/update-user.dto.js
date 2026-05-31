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
import { IsString, MaxLength, IsOptional, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
/**
 * 更新用户 DTO
 *
 * 用于更新用户个人信息
 */
let UpdateUserDto = (() => {
    let _displayName_decorators;
    let _displayName_initializers = [];
    let _displayName_extraInitializers = [];
    let _avatarUrl_decorators;
    let _avatarUrl_initializers = [];
    let _avatarUrl_extraInitializers = [];
    return class UpdateUserDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _displayName_decorators = [ApiPropertyOptional({ description: '显示名称', example: 'John Doe' }), IsOptional(), IsString(), MaxLength(50)];
            _avatarUrl_decorators = [ApiPropertyOptional({
                    description: '头像 URL',
                    example: 'https://example.com/avatar.jpg',
                }), IsOptional(), IsUrl(), MaxLength(500)];
            __esDecorate(null, null, _displayName_decorators, { kind: "field", name: "displayName", static: false, private: false, access: { has: obj => "displayName" in obj, get: obj => obj.displayName, set: (obj, value) => { obj.displayName = value; } }, metadata: _metadata }, _displayName_initializers, _displayName_extraInitializers);
            __esDecorate(null, null, _avatarUrl_decorators, { kind: "field", name: "avatarUrl", static: false, private: false, access: { has: obj => "avatarUrl" in obj, get: obj => obj.avatarUrl, set: (obj, value) => { obj.avatarUrl = value; } }, metadata: _metadata }, _avatarUrl_initializers, _avatarUrl_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        displayName = __runInitializers(this, _displayName_initializers, void 0);
        avatarUrl = (__runInitializers(this, _displayName_extraInitializers), __runInitializers(this, _avatarUrl_initializers, void 0));
        constructor() {
            __runInitializers(this, _avatarUrl_extraInitializers);
        }
    };
})();
export { UpdateUserDto };
//# sourceMappingURL=update-user.dto.js.map