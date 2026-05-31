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
import { Injectable, NotFoundException, Logger, } from '@nestjs/common';
import { ProviderAdapterFactory } from '../providers/provider-adapter.factory';
/**
 * 渠道业务服务
 *
 * 负责渠道选择、故障转移、Provider 适配器管理。
 *
 * 选择策略：优先级 + 权重
 * 1. 按优先级降序排列
 * 2. 在最高优先级中按权重随机选择
 * 3. 失败时自动尝试下一个渠道
 */
let ChannelService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ChannelService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ChannelService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        channelRepo;
        logger = new Logger(ChannelService.name);
        constructor(channelRepo) {
            this.channelRepo = channelRepo;
        }
        /**
         * 选择渠道并创建适配器
         *
         * @param modelName - 模型名称
         * @returns 渠道选择结果
         * @throws {NotFoundException} 没有可用渠道
         */
        async selectChannel(modelName) {
            const channels = await this.channelRepo.findAvailableChannels(modelName);
            if (channels.length === 0) {
                throw new NotFoundException(`No available channel for model: ${modelName}`);
            }
            // 按优先级分组
            const maxPriority = channels[0].channel.priority;
            const topPriority = channels.filter((c) => c.channel.priority === maxPriority);
            // 在最高优先级中按权重选择
            const selected = this.selectByWeight(topPriority);
            // 创建适配器
            const config = {
                baseUrl: selected.channel.base_url,
                apiKey: selected.channel.api_key,
            };
            const adapter = ProviderAdapterFactory.create(selected.channel.provider.name, config);
            return {
                channelId: selected.channel.id,
                providerName: selected.channel.provider.name,
                baseUrl: selected.channel.base_url,
                apiKey: selected.channel.api_key,
                adapter,
            };
        }
        /**
         * 选择渠道（带故障转移）
         *
         * @param modelName - 模型名称
         * @returns 渠道选择结果列表（用于故障转移）
         */
        async selectChannelsWithFallback(modelName) {
            const channels = await this.channelRepo.findAvailableChannels(modelName);
            if (channels.length === 0) {
                throw new NotFoundException(`No available channel for model: ${modelName}`);
            }
            // 按优先级分组并排序
            const results = [];
            for (const channelModel of channels) {
                try {
                    const config = {
                        baseUrl: channelModel.channel.base_url,
                        apiKey: channelModel.channel.api_key,
                    };
                    const adapter = ProviderAdapterFactory.create(channelModel.channel.provider.name, config);
                    results.push({
                        channelId: channelModel.channel.id,
                        providerName: channelModel.channel.provider.name,
                        baseUrl: channelModel.channel.base_url,
                        apiKey: channelModel.channel.api_key,
                        adapter,
                    });
                }
                catch (error) {
                    this.logger.warn(`Failed to create adapter for channel ${channelModel.channel.id}: ${error}`);
                }
            }
            return results;
        }
        /**
         * 更新渠道统计
         */
        async updateChannelStats(channelId, latencyMs, success) {
            await this.channelRepo.updateChannelStats(channelId, latencyMs, success);
        }
        /**
         * 标记渠道错误
         */
        async markChannelError(channelId) {
            await this.channelRepo.markChannelError(channelId);
            this.logger.warn(`Channel ${channelId} marked as ERROR`);
        }
        /**
         * 获取可用模型列表
         */
        async getAvailableModels() {
            return this.channelRepo.findAvailableModels();
        }
        /**
         * 按权重随机选择
         */
        selectByWeight(items) {
            const totalWeight = items.reduce((sum, item) => sum + item.channel.weight, 0);
            let random = Math.random() * totalWeight;
            for (const item of items) {
                random -= item.channel.weight;
                if (random <= 0) {
                    return item;
                }
            }
            return items[0];
        }
    };
    return ChannelService = _classThis;
})();
export { ChannelService };
//# sourceMappingURL=channel.service.js.map