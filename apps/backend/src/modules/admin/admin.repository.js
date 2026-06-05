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
 * Admin 数据访问层
 *
 * 封装 Admin 管理所需的数据库操作。
 * Provider / Channel / Model / User 的 CRUD 和聚合查询。
 */
let AdminRepository = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AdminRepository = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AdminRepository = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        // ──────────────────────────────────────────────
        // Provider
        // ──────────────────────────────────────────────
        /**
         * 查询 Provider 列表（分页）
         *
         * @param params - 分页和筛选参数
         * @returns Provider 列表和总数
         */
        async findProviders(params) {
            const [items, total] = await Promise.all([
                this.prisma.provider.findMany({
                    where: params.where,
                    skip: params.skip,
                    take: params.take,
                    orderBy: { created_at: 'desc' },
                    include: {
                        _count: { select: { channels: true } },
                    },
                }),
                this.prisma.provider.count({ where: params.where }),
            ]);
            return { items, total };
        }
        /**
         * 根据 ID 查询 Provider（含关联 Channel）
         */
        async findProviderById(id) {
            return this.prisma.provider.findUnique({
                where: { id },
                include: {
                    channels: {
                        select: { id: true, name: true, is_active: true, status: true },
                    },
                },
            });
        }
        /**
         * 根据名称查询 Provider
         */
        async findProviderByName(name) {
            return this.prisma.provider.findUnique({ where: { name } });
        }
        async createProvider(data) {
            return this.prisma.provider.create({ data });
        }
        async updateProvider(id, data) {
            return this.prisma.provider.update({ where: { id }, data });
        }
        async deleteProvider(id) {
            return this.prisma.provider.delete({ where: { id } });
        }
        // ──────────────────────────────────────────────
        // Channel
        // ──────────────────────────────────────────────
        /**
         * 查询 Channel 列表（分页，含 Provider 和 Model 关联）
         */
        async findChannels(params) {
            const [items, total] = await Promise.all([
                this.prisma.channel.findMany({
                    where: params.where,
                    skip: params.skip,
                    take: params.take,
                    orderBy: [{ priority: 'desc' }, { weight: 'desc' }],
                    include: {
                        provider: { select: { id: true, name: true, display_name: true } },
                        models: { select: { id: true } },
                    },
                }),
                this.prisma.channel.count({ where: params.where }),
            ]);
            return { items, total };
        }
        /**
         * 根据 ID 查询 Channel（含 Provider 和 Model 详情）
         */
        async findChannelById(id) {
            return this.prisma.channel.findUnique({
                where: { id },
                include: {
                    provider: { select: { id: true, name: true, display_name: true } },
                    models: {
                        include: { model: { select: { id: true, name: true, display_name: true } } },
                    },
                },
            });
        }
        async createChannel(data) {
            return this.prisma.channel.create({ data });
        }
        async updateChannel(id, data) {
            return this.prisma.channel.update({ where: { id }, data });
        }
        async deleteChannel(id) {
            return this.prisma.channel.delete({ where: { id } });
        }
        /**
         * 设置 Channel 状态
         *
         * @param id - Channel ID
         * @param status - 新状态（使用 Prisma 枚举类型）
         * @param isActive - 是否激活
         */
        async setChannelStatus(id, status, isActive) {
            return this.prisma.channel.update({
                where: { id },
                data: { status, is_active: isActive },
            });
        }
        // ──────────────────────────────────────────────
        // Model
        // ──────────────────────────────────────────────
        /**
         * 查询 Model 列表（分页，含定价）
         */
        async findModels(params) {
            const [items, total] = await Promise.all([
                this.prisma.model.findMany({
                    where: params.where,
                    skip: params.skip,
                    take: params.take,
                    orderBy: { created_at: 'desc' },
                    include: { pricing: true },
                }),
                this.prisma.model.count({ where: params.where }),
            ]);
            return { items, total };
        }
        /**
         * 根据 ID 查询 Model（含定价和 Channel 关联）
         */
        async findModelById(id) {
            return this.prisma.model.findUnique({
                where: { id },
                include: {
                    pricing: true,
                    channels: {
                        include: { channel: { select: { id: true, name: true } } },
                    },
                },
            });
        }
        async findModelByName(name) {
            return this.prisma.model.findUnique({ where: { name } });
        }
        async createModel(data) {
            return this.prisma.model.create({ data, include: { pricing: true } });
        }
        async updateModel(id, data) {
            return this.prisma.model.update({ where: { id }, data, include: { pricing: true } });
        }
        async deleteModel(id) {
            return this.prisma.model.delete({ where: { id } });
        }
        async upsertModelPricing(modelId, data) {
            return this.prisma.modelPricing.upsert({
                where: { model_id: modelId },
                create: { model_id: modelId, ...data },
                update: data,
            });
        }
        // ──────────────────────────────────────────────
        // User
        // ──────────────────────────────────────────────
        /**
         * 查询 User 列表（分页）
         */
        async findUsers(params) {
            const [items, total] = await Promise.all([
                this.prisma.user.findMany({
                    where: params.where,
                    skip: params.skip,
                    take: params.take,
                    orderBy: { created_at: 'desc' },
                    select: {
                        id: true,
                        email: true,
                        display_name: true,
                        role: true,
                        status: true,
                        created_at: true,
                        updated_at: true,
                    },
                }),
                this.prisma.user.count({ where: params.where }),
            ]);
            return { items, total };
        }
        /**
         * 根据 ID 查询 User（含余额和统计）
         */
        async findUserById(id) {
            return this.prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    email: true,
                    display_name: true,
                    role: true,
                    status: true,
                    created_at: true,
                    updated_at: true,
                    balance: { select: { amount: true, frozen: true } },
                    _count: { select: { apiKeys: true, requestLogs: true } },
                },
            });
        }
        /**
         * 更新用户角色
         * SECURITY: 使用 Prisma 枚举类型，移除 `as never` 断言
         *
         * @param id - 用户 ID
         * @param role - 新角色（UserRole 枚举值）
         */
        async updateUserRole(id, role) {
            return this.prisma.user.update({
                where: { id },
                data: { role },
                select: { id: true, email: true, role: true },
            });
        }
        /**
         * 更新用户状态
         * SECURITY: 使用 Prisma 枚举类型，移除 `as never` 断言
         *
         * @param id - 用户 ID
         * @param status - 新状态（UserStatus 枚举值）
         */
        async updateUserStatus(id, status) {
            return this.prisma.user.update({
                where: { id },
                data: { status },
                select: { id: true, email: true, status: true },
            });
        }
        // ──────────────────────────────────────────────
        // Dashboard
        // ──────────────────────────────────────────────
        /**
         * 获取用户统计
         */
        async getUserStats(startDate, endDate) {
            const [totalUsers, previousPeriodUsers] = await Promise.all([
                this.prisma.user.count({
                    where: {
                        created_at: { gte: startDate, lte: endDate },
                        deleted_at: null,
                    },
                }),
                this.prisma.user.count({
                    where: {
                        created_at: {
                            gte: new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime())),
                            lt: startDate,
                        },
                        deleted_at: null,
                    },
                }),
            ]);
            return { totalUsers, previousPeriodUsers };
        }
        /**
         * 获取充值统计
         */
        async getRechargeStats(startDate, endDate) {
            const [current, previous] = await Promise.all([
                this.prisma.order.aggregate({
                    _sum: { amount: true },
                    where: {
                        status: 'PAID',
                        created_at: { gte: startDate, lte: endDate },
                    },
                }),
                this.prisma.order.aggregate({
                    _sum: { amount: true },
                    where: {
                        status: 'PAID',
                        created_at: {
                            gte: new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime())),
                            lt: startDate,
                        },
                    },
                }),
            ]);
            return {
                totalRecharge: current._sum.amount ?? 0,
                previousRecharge: previous._sum.amount ?? 0,
            };
        }
        /**
         * 获取消费统计
         */
        async getConsumptionStats(startDate, endDate) {
            const [current, previous] = await Promise.all([
                this.prisma.userTransaction.aggregate({
                    _sum: { amount: true },
                    where: {
                        type: 'DEDUCT',
                        created_at: { gte: startDate, lte: endDate },
                    },
                }),
                this.prisma.userTransaction.aggregate({
                    _sum: { amount: true },
                    where: {
                        type: 'DEDUCT',
                        created_at: {
                            gte: new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime())),
                            lt: startDate,
                        },
                    },
                }),
            ]);
            return {
                totalConsumption: current._sum.amount ?? 0,
                previousConsumption: previous._sum.amount ?? 0,
            };
        }
        /**
         * 获取调用统计
         */
        async getRequestStats(startDate, endDate) {
            const [current, previous] = await Promise.all([
                this.prisma.requestLog.count({
                    where: { created_at: { gte: startDate, lte: endDate } },
                }),
                this.prisma.requestLog.count({
                    where: {
                        created_at: {
                            gte: new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime())),
                            lt: startDate,
                        },
                    },
                }),
            ]);
            return { totalRequests: current, previousRequests: previous };
        }
        /**
         * 获取总余额
         */
        async getTotalBalance() {
            const result = await this.prisma.userBalance.aggregate({
                _sum: { amount: true },
            });
            return result._sum.amount ?? 0;
        }
        /**
         * 获取调用统计（按天分组）
         */
        async getCallStatsByDay(startDate, endDate) {
            const logs = await this.prisma.requestLog.findMany({
                where: { created_at: { gte: startDate, lte: endDate } },
                select: {
                    created_at: true,
                    total_tokens: true,
                    cost: true,
                },
            });
            // 按天分组
            const statsMap = new Map();
            for (const log of logs) {
                const date = log.created_at;
                const label = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                const existing = statsMap.get(label) ?? { requests: 0, tokens: 0, cost: 0 };
                existing.requests++;
                existing.tokens += log.total_tokens;
                existing.cost += log.cost;
                statsMap.set(label, existing);
            }
            // 填充空日期
            const result = [];
            const current = new Date(startDate);
            while (current <= endDate) {
                const label = `${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
                const stats = statsMap.get(label) ?? { requests: 0, tokens: 0, cost: 0 };
                result.push({ label, ...stats });
                current.setDate(current.getDate() + 1);
            }
            return result;
        }
        /**
         * 获取模型分布
         */
        async getModelDistribution(startDate, endDate) {
            const distribution = await this.prisma.requestLog.groupBy({
                by: ['model_id'],
                _count: { id: true },
                where: { created_at: { gte: startDate, lte: endDate } },
                orderBy: { _count: { id: 'desc' } },
                take: 5,
            });
            const totalCount = await this.prisma.requestLog.count({
                where: { created_at: { gte: startDate, lte: endDate } },
            });
            // 获取模型名称
            const modelIds = distribution.map((d) => d.model_id).filter(Boolean);
            const models = await this.prisma.model.findMany({
                where: { id: { in: modelIds } },
                select: { id: true, display_name: true, name: true },
            });
            const modelMap = new Map(models.map((m) => [m.id, m.display_name ?? m.name]));
            return distribution.map((d) => ({
                name: modelMap.get(d.model_id ?? '') ?? 'Unknown',
                count: d._count.id,
                percentage: totalCount > 0 ? Math.round((d._count.id / totalCount) * 1000) / 10 : 0,
            }));
        }
        /**
         * 获取最近订单
         */
        async getRecentOrders(limit = 10) {
            const orders = await this.prisma.order.findMany({
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    user: {
                        select: { email: true },
                    },
                    payment: {
                        select: { method: true },
                    },
                },
            });
            return orders.map((o) => ({
                id: o.id,
                orderNo: o.order_no,
                userEmail: this.maskEmail(o.user.email),
                amount: o.amount,
                paymentMethod: o.payment?.method ?? null,
                status: o.status,
                createdAt: o.created_at.toISOString(),
            }));
        }
        /**
         * 获取渠道状态
         */
        async getChannelStatus() {
            const channels = await this.prisma.channel.findMany({
                take: 10,
                orderBy: { created_at: 'desc' },
                select: {
                    id: true,
                    name: true,
                    status: true,
                },
            });
            // 获取今日每个渠道的调用次数
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const result = await Promise.all(channels.map(async (ch) => {
                const todayRequests = await this.prisma.requestLog.count({
                    where: {
                        channel_id: ch.id,
                        created_at: { gte: today },
                    },
                });
                return {
                    id: ch.id,
                    name: ch.name,
                    status: ch.status,
                    avgLatency: 0, // TODO: 需要从 RequestLog 计算平均延迟
                    todayRequests,
                };
            }));
            return result;
        }
        /**
         * 邮箱脱敏
         */
        maskEmail(email) {
            const [local = '', domain = ''] = email.split('@');
            if (!local || !domain)
                return email;
            if (local.length <= 3) {
                return `${local[0]}***@${domain}`;
            }
            return `${local.slice(0, 3)}***@${domain}`;
        }
    };
    return AdminRepository = _classThis;
})();
export { AdminRepository };
//# sourceMappingURL=admin.repository.js.map