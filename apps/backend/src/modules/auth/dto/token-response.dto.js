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
import { ApiProperty } from '@nestjs/swagger';
/**
 * Token 响应 DTO
 *
 * 登录成功后返回的 token 信息
 */
let TokenResponseDto = (() => {
    let _accessToken_decorators;
    let _accessToken_initializers = [];
    let _accessToken_extraInitializers = [];
    let _refreshToken_decorators;
    let _refreshToken_initializers = [];
    let _refreshToken_extraInitializers = [];
    let _tokenType_decorators;
    let _tokenType_initializers = [];
    let _tokenType_extraInitializers = [];
    let _expiresIn_decorators;
    let _expiresIn_initializers = [];
    let _expiresIn_extraInitializers = [];
    return class TokenResponseDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _accessToken_decorators = [ApiProperty({ description: '访问令牌（15分钟有效）' })];
            _refreshToken_decorators = [ApiProperty({ description: '刷新令牌（7天有效）' })];
            _tokenType_decorators = [ApiProperty({ description: '令牌类型', example: 'Bearer' })];
            _expiresIn_decorators = [ApiProperty({ description: '访问令牌过期时间（秒）', example: 900 })];
            __esDecorate(null, null, _accessToken_decorators, { kind: "field", name: "accessToken", static: false, private: false, access: { has: obj => "accessToken" in obj, get: obj => obj.accessToken, set: (obj, value) => { obj.accessToken = value; } }, metadata: _metadata }, _accessToken_initializers, _accessToken_extraInitializers);
            __esDecorate(null, null, _refreshToken_decorators, { kind: "field", name: "refreshToken", static: false, private: false, access: { has: obj => "refreshToken" in obj, get: obj => obj.refreshToken, set: (obj, value) => { obj.refreshToken = value; } }, metadata: _metadata }, _refreshToken_initializers, _refreshToken_extraInitializers);
            __esDecorate(null, null, _tokenType_decorators, { kind: "field", name: "tokenType", static: false, private: false, access: { has: obj => "tokenType" in obj, get: obj => obj.tokenType, set: (obj, value) => { obj.tokenType = value; } }, metadata: _metadata }, _tokenType_initializers, _tokenType_extraInitializers);
            __esDecorate(null, null, _expiresIn_decorators, { kind: "field", name: "expiresIn", static: false, private: false, access: { has: obj => "expiresIn" in obj, get: obj => obj.expiresIn, set: (obj, value) => { obj.expiresIn = value; } }, metadata: _metadata }, _expiresIn_initializers, _expiresIn_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        accessToken = __runInitializers(this, _accessToken_initializers, void 0);
        refreshToken = (__runInitializers(this, _accessToken_extraInitializers), __runInitializers(this, _refreshToken_initializers, void 0));
        tokenType = (__runInitializers(this, _refreshToken_extraInitializers), __runInitializers(this, _tokenType_initializers, void 0));
        expiresIn = (__runInitializers(this, _tokenType_extraInitializers), __runInitializers(this, _expiresIn_initializers, void 0));
        constructor() {
            __runInitializers(this, _expiresIn_extraInitializers);
        }
    };
})();
export { TokenResponseDto };
/**
 * 用户信息 + Token 响应
 */
let AuthResponseDto = (() => {
    let _user_decorators;
    let _user_initializers = [];
    let _user_extraInitializers = [];
    let _tokens_decorators;
    let _tokens_initializers = [];
    let _tokens_extraInitializers = [];
    return class AuthResponseDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _user_decorators = [ApiProperty({ description: '用户信息' })];
            _tokens_decorators = [ApiProperty({ description: 'Token 信息' })];
            __esDecorate(null, null, _user_decorators, { kind: "field", name: "user", static: false, private: false, access: { has: obj => "user" in obj, get: obj => obj.user, set: (obj, value) => { obj.user = value; } }, metadata: _metadata }, _user_initializers, _user_extraInitializers);
            __esDecorate(null, null, _tokens_decorators, { kind: "field", name: "tokens", static: false, private: false, access: { has: obj => "tokens" in obj, get: obj => obj.tokens, set: (obj, value) => { obj.tokens = value; } }, metadata: _metadata }, _tokens_initializers, _tokens_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        user = __runInitializers(this, _user_initializers, void 0);
        tokens = (__runInitializers(this, _user_extraInitializers), __runInitializers(this, _tokens_initializers, void 0));
        constructor() {
            __runInitializers(this, _tokens_extraInitializers);
        }
    };
})();
export { AuthResponseDto };
//# sourceMappingURL=token-response.dto.js.map