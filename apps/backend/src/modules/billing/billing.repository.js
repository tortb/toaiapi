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
import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
/**
 * 计费数据访问层
 *
 * 封装余额和交易流水相关的数据库操作。
 * 余额操作必须使用事务保证原子性。
 */
let BillingRepository = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var BillingRepository = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            BillingRepository = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        /**
         * 创建用户余额
         */
        async createBalance(userId, initialAmount = 0) {
            return this.prisma.userBalance.create({
                data: {
                    user_id: userId,
                    amount: initialAmount,
                },
            });
        }
        /**
         * 获取用户余额
         */
        async getBalance(userId) {
            return this.prisma.userBalance.findUnique({
                where: { user_id: userId },
            });
        }
        /**
         * 扣减余额（事务）
         *
         * 保证扣余额和写流水的原子性。
         *
         * @param userId - 用户 ID
         * @param amount - 扣减金额（分）
         * @param orderId - 关联订单 ID（可选）
         * @param remark - 备注
         * @returns 交易记录
         * @throws {Error} 余额不足
         */
        async deductBalance(userId, amount, orderId, remark) {
            return this.prisma.$transaction(async (tx) => {
                // 1. 检查余额（SELECT ... FOR UPDATE 防止并发超扣）
                const [balance] = await tx.$queryRaw `SELECT user_id, amount, frozen FROM user_balances WHERE user_id = ${userId} FOR UPDATE`;
                if (!balance) {
                    throw new NotFoundException('User balance not found');
                }
                const available = balance.amount - balance.frozen;
                if (available < amount) {
                    throw new HttpException(`Insufficient balance: required ${amount}, available ${available}`, HttpStatus.PAYMENT_REQUIRED);
                }
                // 2. 扣减余额
                const updatedBalance = await tx.userBalance.update({
                    where: { user_id: userId },
                    data: { amount: { decrement: amount } },
                });
                // 3. 写入流水
                const transaction = await tx.userTransaction.create({
                    data: {
                        user_id: userId,
                        type: 'DEDUCT',
                        amount: -amount,
                        balance_after: updatedBalance.amount,
                        order_id: orderId,
                        remark: remark || 'API usage',
                    },
                });
                return transaction;
            });
        }
        /**
         * 充值余额（事务）
         *
         * @param userId - 用户 ID
         * @param amount - 充值金额（分）
         * @param remark - 备注
         * @returns 交易记录
         */
        async rechargeBalance(userId, amount, remark) {
            return this.prisma.$transaction(async (tx) => {
                // 1. 增加余额
                const updatedBalance = await tx.userBalance.update({
                    where: { user_id: userId },
                    data: { amount: { increment: amount } },
                });
                // 2. 写入流水
                const transaction = await tx.userTransaction.create({
                    data: {
                        user_id: userId,
                        type: 'RECHARGE',
                        amount,
                        balance_after: updatedBalance.amount,
                        remark: remark || 'Recharge',
                    },
                });
                return transaction;
            });
        }
        /**
         * 获取用户交易流水
         */
        async getTransactions(userId, params) {
            return this.prisma.userTransaction.findMany({
                where: {
                    user_id: userId,
                    ...params.where,
                },
                skip: params.skip,
                take: params.take,
                orderBy: params.orderBy || { created_at: 'desc' },
            });
        }
        /**
         * 统计用户交易数量
         */
        async countTransactions(userId, where) {
            return this.prisma.userTransaction.count({
                where: {
                    user_id: userId,
                    ...where,
                },
            });
        }
        /**
         * 获取模型定价
         */
        async getModelPricing(modelName) {
            return this.prisma.modelPricing.findFirst({
                where: { model: { name: modelName } },
                include: { model: true },
            });
        }
    };
    return BillingRepository = _classThis;
})();
export { BillingRepository };
//# sourceMappingURL=billing.repository.js.map