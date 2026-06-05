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
 * API Key 数据访问层
 *
 * 封装所有 ApiKey 相关的数据库操作。
 */
let ApiKeyRepository = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ApiKeyRepository = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ApiKeyRepository = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        /**
         * 根据 ID 查找
         */
        async findById(id) {
            return this.prisma.apiKey.findUnique({
                where: { id },
            });
        }
        /**
         * 根据 key_hash 查找
         */
        async findByKeyHash(keyHash) {
            return this.prisma.apiKey.findUnique({
                where: { key_hash: keyHash },
            });
        }
        /**
         * 根据 key_prefix 查找
         */
        async findByKeyPrefix(prefix) {
            return this.prisma.apiKey.findFirst({
                where: { key_prefix: prefix },
            });
        }
        /**
         * 创建 API Key
         */
        async create(data) {
            return this.prisma.apiKey.create({ data });
        }
        /**
         * 更新 API Key
         */
        async update(id, data) {
            return this.prisma.apiKey.update({
                where: { id },
                data,
            });
        }
        /**
         * 删除 API Key
         */
        async delete(id) {
            return this.prisma.apiKey.delete({
                where: { id },
            });
        }
        /**
         * 获取用户的 API Key 列表
         */
        async findByUserId(userId) {
            return this.prisma.apiKey.findMany({
                where: { user_id: userId },
                orderBy: { created_at: 'desc' },
            });
        }
        /**
         * 统计用户的 API Key 数量
         */
        async countByUserId(userId) {
            return this.prisma.apiKey.count({
                where: { user_id: userId },
            });
        }
        /**
         * 记录 API Key 使用（原子操作）
         * 更新最后使用时间并自增请求计数
         */
        async recordUsage(keyId) {
            await this.prisma.apiKey.update({
                where: { id: keyId },
                data: {
                    last_used_at: new Date(),
                    total_requests: { increment: 1 },
                },
            });
        }
    };
    return ApiKeyRepository = _classThis;
})();
export { ApiKeyRepository };
//# sourceMappingURL=api-key.repository.js.map