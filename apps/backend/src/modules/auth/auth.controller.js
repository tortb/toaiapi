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
import { Controller, Post, HttpCode, HttpStatus, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse, } from '@nestjs/swagger';
import { AuthResponseDto, TokenResponseDto } from './dto/token-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
/**
 * 认证控制器
 *
 * 处理用户注册、登录、Token 刷新、密码修改等认证相关请求。
 */
let AuthController = (() => {
    let _classDecorators = [ApiTags('Auth'), Controller('auth')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _register_decorators;
    let _login_decorators;
    let _refresh_decorators;
    let _logout_decorators;
    let _changePassword_decorators;
    let _forgotPassword_decorators;
    let _resetPassword_decorators;
    var AuthController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _register_decorators = [Post('register'), ApiOperation({ summary: '用户注册', description: '使用邮箱注册新账号' }), ApiCreatedResponse({ type: AuthResponseDto })];
            _login_decorators = [Post('login'), HttpCode(HttpStatus.OK), ApiOperation({ summary: '用户登录', description: '使用邮箱和密码登录' }), ApiOkResponse({ type: AuthResponseDto })];
            _refresh_decorators = [Post('refresh'), HttpCode(HttpStatus.OK), ApiOperation({
                    summary: '刷新 Token',
                    description: '使用 Refresh Token 获取新的 Access Token',
                }), ApiOkResponse({ type: TokenResponseDto })];
            _logout_decorators = [Post('logout'), HttpCode(HttpStatus.OK), ApiBearerAuth(), UseGuards(JwtAuthGuard), ApiOperation({ summary: '登出', description: '撤销当前用户的 Refresh Token' })];
            _changePassword_decorators = [Post('change-password'), HttpCode(HttpStatus.OK), ApiBearerAuth(), UseGuards(JwtAuthGuard), ApiOperation({ summary: '修改密码', description: '使用当前密码修改为新密码' })];
            _forgotPassword_decorators = [Post('forgot-password'), HttpCode(HttpStatus.OK), ApiOperation({
                    summary: '忘记密码',
                    description: '发送密码重置链接到用户邮箱',
                })];
            _resetPassword_decorators = [Post('reset-password'), HttpCode(HttpStatus.OK), ApiOperation({
                    summary: '重置密码',
                    description: '使用重置 token 设置新密码',
                })];
            __esDecorate(this, null, _register_decorators, { kind: "method", name: "register", static: false, private: false, access: { has: obj => "register" in obj, get: obj => obj.register }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _login_decorators, { kind: "method", name: "login", static: false, private: false, access: { has: obj => "login" in obj, get: obj => obj.login }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _refresh_decorators, { kind: "method", name: "refresh", static: false, private: false, access: { has: obj => "refresh" in obj, get: obj => obj.refresh }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _logout_decorators, { kind: "method", name: "logout", static: false, private: false, access: { has: obj => "logout" in obj, get: obj => obj.logout }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _changePassword_decorators, { kind: "method", name: "changePassword", static: false, private: false, access: { has: obj => "changePassword" in obj, get: obj => obj.changePassword }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _forgotPassword_decorators, { kind: "method", name: "forgotPassword", static: false, private: false, access: { has: obj => "forgotPassword" in obj, get: obj => obj.forgotPassword }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _resetPassword_decorators, { kind: "method", name: "resetPassword", static: false, private: false, access: { has: obj => "resetPassword" in obj, get: obj => obj.resetPassword }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuthController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        authService = __runInitializers(this, _instanceExtraInitializers);
        constructor(authService) {
            this.authService = authService;
        }
        /**
         * 用户注册
         */
        async register(dto) {
            return this.authService.register(dto);
        }
        /**
         * 用户登录
         */
        async login(dto) {
            return this.authService.login(dto);
        }
        /**
         * 刷新 Token
         */
        async refresh(refreshToken) {
            return this.authService.refreshTokens(refreshToken);
        }
        /**
         * 登出
         */
        async logout(user) {
            await this.authService.logout(user.id);
        }
        /**
         * 修改密码
         */
        async changePassword(user, dto) {
            await this.authService.changePassword(user.id, dto.currentPassword, dto.newPassword);
        }
        /**
         *忘记密码 - 发送重置链接
         */
        async forgotPassword(dto) {
            await this.authService.forgotPassword(dto.email);
            return { message: 'If the email exists, a reset link has been sent' };
        }
        /**
         * 重置密码
         */
        async resetPassword(dto) {
            await this.authService.resetPassword(dto.token, dto.newPassword);
            return { message: 'Password has been reset successfully' };
        }
    };
    return AuthController = _classThis;
})();
export { AuthController };
//# sourceMappingURL=auth.controller.js.map