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
import { Injectable } from '@nestjs/common';
/**
 * 用户数据访问层
 *
 * 封装所有 User 相关的数据库操作。
 * 只负责数据访问，不包含业务逻辑。
 */
let UserRepository = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var UserRepository = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            UserRepository = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        /**
         * 根据 ID 查找用户
         */
        async findById(id) {
            return this.prisma.user.findUnique({
                where: { id, deleted_at: null },
            });
        }
        /**
         * 根据邮箱查找用户
         * SECURITY: 排除已软删除的用户，防止信息泄露和已删除用户登录
         */
        async findByEmail(email) {
            return this.prisma.user.findUnique({
                where: { email, deleted_at: null },
            });
        }
        /**
         * 创建用户
         */
        async create(data) {
            return this.prisma.user.create({ data });
        }
        /**
         * 更新用户
         */
        async update(id, data) {
            return this.prisma.user.update({
                where: { id, deleted_at: null },
                data,
            });
        }
        /**
         * 软删除用户
         */
        async softDelete(id) {
            return this.prisma.user.update({
                where: { id },
                data: { deleted_at: new Date() },
            });
        }
        /**
         * 检查邮箱是否已注册
         */
        async existsByEmail(email) {
            const count = await this.prisma.user.count({
                where: { email },
            });
            return count > 0;
        }
        /**
         * 获取用户列表（分页）
         */
        async findMany(params) {
            const { skip, take, orderBy, where } = params;
            return this.prisma.user.findMany({
                skip,
                take,
                orderBy,
                where: {
                    ...where,
                    deleted_at: null,
                },
            });
        }
        /**
         * 统计用户数量
         */
        async count(where) {
            return this.prisma.user.count({
                where: {
                    ...where,
                    deleted_at: null,
                },
            });
        }
    };
    return UserRepository = _classThis;
})();
export { UserRepository };
//# sourceMappingURL=user.repository.js.map