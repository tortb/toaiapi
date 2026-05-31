var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
import { Controller, Get, Patch, Delete, UseGuards, HttpCode, HttpStatus, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiNoContentResponse, } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
/**
 * 用户控制器
 *
 * 处理用户相关的 HTTP 请求。
 * 所有接口都需要 JWT 认证。
 */
let UserController = (() => {
    let _classDecorators = [ApiTags('Users'), ApiBearerAuth(), UseGuards(JwtAuthGuard), Controller('users')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getCurrentUser_decorators;
    let _updateCurrentUser_decorators;
    let _deleteCurrentUser_decorators;
    var UserController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getCurrentUser_decorators = [Get('me'), ApiOperation({ summary: '获取当前用户信息' }), ApiOkResponse({ type: UserResponseDto })];
            _updateCurrentUser_decorators = [Patch('me'), ApiOperation({ summary: '更新当前用户信息' }), ApiOkResponse({ type: UserResponseDto })];
            _deleteCurrentUser_decorators = [Delete('me'), HttpCode(HttpStatus.NO_CONTENT), ApiOperation({ summary: '删除当前用户' }), ApiNoContentResponse()];
            __esDecorate(this, null, _getCurrentUser_decorators, { kind: "method", name: "getCurrentUser", static: false, private: false, access: { has: obj => "getCurrentUser" in obj, get: obj => obj.getCurrentUser }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateCurrentUser_decorators, { kind: "method", name: "updateCurrentUser", static: false, private: false, access: { has: obj => "updateCurrentUser" in obj, get: obj => obj.updateCurrentUser }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteCurrentUser_decorators, { kind: "method", name: "deleteCurrentUser", static: false, private: false, access: { has: obj => "deleteCurrentUser" in obj, get: obj => obj.deleteCurrentUser }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            UserController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        userService = __runInitializers(this, _instanceExtraInitializers);
        constructor(userService) {
            this.userService = userService;
        }
        /**
         * 获取当前用户信息
         */
        async getCurrentUser(user) {
            const userEntity = await this.userService.findById(user.id);
            return this.toResponseDto(userEntity);
        }
        /**
         * 更新当前用户信息
         */
        async updateCurrentUser(user, dto) {
            const userEntity = await this.userService.updateUser(user.id, dto);
            return this.toResponseDto(userEntity);
        }
        /**
         * 删除当前用户（软删除）
         */
        async deleteCurrentUser(user) {
            await this.userService.deleteUser(user.id);
        }
        /**
         * 转换为响应 DTO
         */
        toResponseDto(user) {
            return {
                id: user.id,
                email: user.email,
                phone: user.phone,
                displayName: user.display_name,
                avatarUrl: user.avatar_url,
                role: user.role,
                status: user.status,
                createdAt: user.created_at,
            };
        }
    };
    return UserController = _classThis;
})();
export { UserController };
//# sourceMappingURL=user.controller.js.map