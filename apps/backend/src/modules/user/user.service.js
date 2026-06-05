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
import { Injectable, ConflictException, BadRequestException, NotFoundException, Logger, } from '@nestjs/common';
import { userFromPrisma } from './entities/user.entity';
import { hashPassword, validatePasswordStrength } from '@toai/auth';
import { maskEmail } from '@toai/common';
/**
 * 用户业务服务
 *
 * 处理用户相关的业务逻辑。
 * 通过 UserRepository 访问数据库。
 * SECURITY: 日志中使用 maskEmail 脱敏邮箱
 * SECURITY: findByEmail 返回脱敏实体，不暴露 password_hash
 */
let UserService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var UserService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            UserService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        userRepo;
        redis;
        logger = new Logger(UserService.name);
        constructor(userRepo, redis) {
            this.userRepo = userRepo;
            this.redis = redis;
        }
        /**
         * 创建用户（注册）
         *
         * @param dto - 创建用户数据
         * @returns 脱敏后的用户实体
         * @throws ConflictException 邮箱已注册
         * @throws BadRequestException 密码强度不足
         */
        async createUser(dto) {
            // 检查邮箱是否已注册
            const exists = await this.userRepo.existsByEmail(dto.email);
            if (exists) {
                throw new ConflictException('该邮箱已被注册');
            }
            // 验证密码强度
            const passwordValidation = validatePasswordStrength(dto.password);
            if (!passwordValidation.valid) {
                throw new BadRequestException(`密码不符合要求: ${passwordValidation.errors.join(', ')}`);
            }
            // 哈希密码
            const passwordHash = await hashPassword(dto.password);
            // 创建用户
            const user = await this.userRepo.create({
                email: dto.email,
                password_hash: passwordHash,
                display_name: dto.displayName,
            });
            // SECURITY: 日志中脱敏邮箱
            this.logger.log(`User created: ${user.id} (${maskEmail(user.email)})`);
            return userFromPrisma(user);
        }
        /**
         * 根据 ID 查找用户
         *
         * @param id - 用户 ID
         * @returns 脱敏后的用户实体
         * @throws NotFoundException 用户不存在
         */
        async findById(id) {
            const user = await this.userRepo.findById(id);
            if (!user) {
                throw new NotFoundException('用户不存在');
            }
            return userFromPrisma(user);
        }
        /**
         * 根据邮箱查找用户
         * SECURITY: 返回脱敏实体，不暴露 password_hash
         *
         * @param email - 用户邮箱
         * @returns 脱敏后的用户实体或 null
         */
        async findByEmail(email) {
            const user = await this.userRepo.findByEmail(email);
            if (!user)
                return null;
            return userFromPrisma(user);
        }
        /**
         * 更新用户信息
         *
         * @param id - 用户 ID
         * @param dto - 更新数据
         * @returns 脱敏后的用户实体
         * @throws NotFoundException 用户不存在
         */
        async updateUser(id, dto) {
            // 检查用户是否存在
            await this.findById(id);
            const user = await this.userRepo.update(id, {
                display_name: dto.displayName,
                avatar_url: dto.avatarUrl,
            });
            this.logger.log(`User updated: ${id}`);
            return userFromPrisma(user);
        }
        /**
         * 软删除用户
         *
         * @param id - 用户 ID
         * @throws NotFoundException 用户不存在
         */
        async deleteUser(id) {
            await this.findById(id);
            await this.userRepo.softDelete(id);
            // SECURITY: 软删除后撤销所有 Refresh Token，强制下线
            await this.redis.del(`refresh:${id}`);
            this.logger.log(`User soft-deleted: ${id}`);
        }
    };
    return UserService = _classThis;
})();
export { UserService };
//# sourceMappingURL=user.service.js.map