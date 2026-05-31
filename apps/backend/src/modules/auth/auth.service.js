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
import { Injectable, UnauthorizedException, Logger, } from '@nestjs/common';
import { verifyPassword, generateTokenPair, verifyToken, } from '@toai/auth';
/**
 * 认证业务服务
 *
 * 处理用户注册、登录、Token 刷新等认证相关逻辑。
 */
let AuthService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuthService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuthService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        userService;
        billingService;
        redis;
        configService;
        logger = new Logger(AuthService.name);
        /** Refresh Token 在 Redis 中的前缀 */
        REFRESH_TOKEN_PREFIX = 'refresh_token:';
        /** Refresh Token 有效期（秒）：7 天 */
        REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;
        constructor(userService, billingService, redis, configService) {
            this.userService = userService;
            this.billingService = billingService;
            this.redis = redis;
            this.configService = configService;
        }
        /**
         * 用户注册
         *
         * @returns 用户信息 + Token
         * @throws {ConflictException} 邮箱已注册
         */
        async register(dto) {
            // 创建用户
            const user = await this.userService.createUser({
                email: dto.email,
                password: dto.password,
                displayName: dto.displayName,
            });
            // 创建用户余额（初始为 0）
            await this.billingService.createBalance(user.id);
            // 生成 Token
            const tokens = await this.generateTokens(user.id, user.email, user.role);
            this.logger.log(`User registered: ${user.id} (${user.email})`);
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.display_name,
                    role: user.role,
                },
                tokens,
            };
        }
        /**
         * 用户登录
         *
         * @returns 用户信息 + Token
         * @throws {UnauthorizedException} 邮箱或密码错误
         */
        async login(dto) {
            // 查找用户
            const user = await this.userService.findByEmail(dto.email);
            if (!user) {
                throw new UnauthorizedException('Invalid email or password');
            }
            // 检查用户状态
            if (user.status !== 'ACTIVE') {
                throw new UnauthorizedException('User account is not active');
            }
            // 验证密码
            const isPasswordValid = await verifyPassword(user.password_hash, dto.password);
            if (!isPasswordValid) {
                throw new UnauthorizedException('Invalid email or password');
            }
            // 生成 Token
            const tokens = await this.generateTokens(user.id, user.email, user.role);
            this.logger.log(`User logged in: ${user.id} (${user.email})`);
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.display_name,
                    role: user.role,
                },
                tokens,
            };
        }
        /**
         * 刷新 Token
         *
         * @param refreshToken - 刷新令牌
         * @returns 新的 Token 对
         * @throws {UnauthorizedException} Token 无效或已过期
         */
        async refreshTokens(refreshToken) {
            // 验证 Refresh Token
            let payload;
            try {
                payload = verifyToken(refreshToken, this.configService.get('JWT_REFRESH_SECRET', 'default-refresh-secret'));
            }
            catch {
                throw new UnauthorizedException('Invalid or expired refresh token');
            }
            // 检查 Redis 中是否存在
            const storedTokenId = await this.redis.get(`${this.REFRESH_TOKEN_PREFIX}${payload.sub}`);
            if (!storedTokenId || storedTokenId !== payload.jti) {
                throw new UnauthorizedException('Refresh token has been revoked');
            }
            // 删除旧的 Refresh Token（一次性使用）
            await this.redis.del(`${this.REFRESH_TOKEN_PREFIX}${payload.sub}`);
            // 生成新的 Token 对
            return this.generateTokens(payload.sub, payload.email, payload.role);
        }
        /**
         * 登出（撤销 Refresh Token）
         */
        async logout(userId) {
            await this.redis.del(`${this.REFRESH_TOKEN_PREFIX}${userId}`);
            this.logger.log(`User logged out: ${userId}`);
        }
        /**
         * 生成 Token 对
         *
         * @returns Token 响应
         */
        async generateTokens(userId, email, role) {
            const tokenPair = generateTokenPair({
                sub: userId,
                email,
                role,
            });
            // 存储 Refresh Token 到 Redis
            await this.redis.set(`${this.REFRESH_TOKEN_PREFIX}${userId}`, tokenPair.refreshToken.slice(-36), // 存储 token 的一部分作为标识
            this.REFRESH_TOKEN_TTL);
            return {
                accessToken: tokenPair.accessToken,
                refreshToken: tokenPair.refreshToken,
                tokenType: 'Bearer',
                expiresIn: 900, // 15 分钟
            };
        }
    };
    return AuthService = _classThis;
})();
export { AuthService };
//# sourceMappingURL=auth.service.js.map