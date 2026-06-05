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
import { ChannelStatus } from '@prisma/client';
/**
 * 渠道数据访问层
 *
 * 封装 Channel、Provider、Model 相关的数据库操作。
 */
let ChannelRepository = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ChannelRepository = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ChannelRepository = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        /**
         * 根据模型名称查找可用渠道
         *
         * @param modelName - 模型名称
         * @returns 可用渠道列表（按优先级降序、权重降序排列）
         */
        async findAvailableChannels(modelName) {
            return this.prisma.channelModel.findMany({
                where: {
                    model: { name: modelName, is_active: true },
                    is_active: true,
                    channel: {
                        is_active: true,
                        status: ChannelStatus.ACTIVE,
                    },
                },
                include: {
                    channel: {
                        include: {
                            provider: true,
                        },
                    },
                    model: {
                        include: {
                            pricing: true,
                        },
                    },
                },
                orderBy: [
                    { channel: { priority: 'desc' } },
                    { channel: { weight: 'desc' } },
                ],
            });
        }
        /**
         * 更新渠道统计
         *
         * @param channelId - 渠道 ID
         * @param latencyMs - 延迟（毫秒）
         * @param success - 是否成功
         */
        async updateChannelStats(channelId, latencyMs, success) {
            // 使用原子 increment 操作避免并发竞态条件
            // avg_latency_ms 仍需 read-modify-write，但影响较小
            const channel = await this.prisma.channel.findUnique({
                where: { id: channelId },
                select: { avg_latency_ms: true },
            });
            if (!channel)
                return;
            // 计算平均延迟（指数移动平均）
            const alpha = 0.1;
            const avgLatency = Math.round(alpha * latencyMs + (1 - alpha) * channel.avg_latency_ms);
            const updateData = {
                total_requests: { increment: 1 },
                avg_latency_ms: avgLatency,
            };
            if (!success) {
                updateData.failed_requests = { increment: 1 };
            }
            await this.prisma.channel.update({
                where: { id: channelId },
                data: updateData,
            });
        }
        /**
         * 标记渠道为错误状态
         */
        async markChannelError(channelId) {
            await this.prisma.channel.update({
                where: { id: channelId },
                data: { status: ChannelStatus.ERROR },
            });
        }
        /**
         * 标记渠道为限流状态
         */
        async markChannelRateLimited(channelId) {
            await this.prisma.channel.update({
                where: { id: channelId },
                data: { status: ChannelStatus.RATE_LIMITED },
            });
        }
        /**
         * 恢复渠道状态
         */
        async restoreChannel(channelId) {
            await this.prisma.channel.update({
                where: { id: channelId },
                data: { status: ChannelStatus.ACTIVE },
            });
        }
        /**
         * 获取渠道详情
         */
        async findById(channelId) {
            return this.prisma.channel.findUnique({
                where: { id: channelId },
                include: {
                    provider: true,
                    models: {
                        include: {
                            model: true,
                        },
                    },
                },
            });
        }
        /**
         * 获取所有活跃渠道的统计信息（公开状态页用）
         */
        async findChannelStats() {
            return this.prisma.channel.findMany({
                where: {
                    is_active: true,
                },
                include: {
                    provider: {
                        select: {
                            name: true,
                            display_name: true,
                        },
                    },
                },
                orderBy: [
                    { provider: { name: 'asc' } },
                    { name: 'asc' },
                ],
            });
        }
        /**
         * 获取所有可用模型
         */
        async findAvailableModels() {
            return this.prisma.model.findMany({
                where: {
                    is_active: true,
                    channels: {
                        some: {
                            is_active: true,
                            channel: {
                                is_active: true,
                                status: ChannelStatus.ACTIVE,
                            },
                        },
                    },
                },
                include: {
                    pricing: true,
                },
                orderBy: { name: 'asc' },
            });
        }
    };
    return ChannelRepository = _classThis;
})();
export { ChannelRepository };
//# sourceMappingURL=channel.repository.js.map