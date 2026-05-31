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
import { Injectable, Logger } from '@nestjs/common';
/**
 * 网关业务服务
 *
 * 核心职责：
 * 1. 接收 OpenAI 兼容请求
 * 2. 选择渠道和 provider
 * 3. 转发请求并获取响应
 * 4. 计算 token 使用和费用
 * 5. 扣减用户余额
 * 6. 记录请求日志
 * 7. 处理故障转移
 *
 * 计费流程（严格遵循 billing-rules.md）：
 * - NEVER 信任 provider 返回的 token 数
 * - 使用 Tokenizer 重新计算
 * - 所有金额单位：分
 * - 所有费用计算使用 Math.ceil
 * - 余额扣减使用数据库事务
 */
let GatewayService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var GatewayService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            GatewayService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        channelService;
        billingService;
        requestLogService;
        logger = new Logger(GatewayService.name);
        /** 最大重试次数 */
        MAX_RETRIES = 2;
        constructor(channelService, billingService, requestLogService) {
            this.channelService = channelService;
            this.billingService = billingService;
            this.requestLogService = requestLogService;
        }
        /**
         * 处理聊天补全请求
         *
         * @param request - 聊天请求
         * @param apiKey - API Key 信息
         * @param requestPath - 请求路径
         * @returns 聊天响应
         */
        async handleChatCompletion(request, apiKey, requestPath) {
            const startTime = Date.now();
            // 检查模型限制
            if (apiKey.modelLimit.length > 0 &&
                !apiKey.modelLimit.includes(request.model)) {
                throw new Error(`Model ${request.model} is not allowed for this API key`);
            }
            // 获取可用渠道（带故障转移）
            const channels = await this.channelService.selectChannelsWithFallback(request.model);
            let lastError = null;
            // 尝试每个渠道
            for (let i = 0; i < Math.min(channels.length, this.MAX_RETRIES + 1); i++) {
                const channel = channels[i];
                try {
                    // 调用 provider
                    const response = await channel.adapter.chat(request);
                    // 计算延迟
                    const latencyMs = Date.now() - startTime;
                    // 更新渠道统计（成功）
                    await this.channelService.updateChannelStats(channel.channelId, latencyMs, true);
                    // 计算费用并扣减余额
                    const cost = await this.billingService.processUsage(apiKey.userId, apiKey.id, channel.channelId, request.model, response.usage);
                    // 记录请求日志
                    await this.requestLogService.logRequest({
                        userId: apiKey.userId,
                        apiKeyId: apiKey.id,
                        modelId: request.model,
                        channelId: channel.channelId,
                        requestPath,
                        requestMethod: 'POST',
                        promptTokens: response.usage.prompt_tokens,
                        completionTokens: response.usage.completion_tokens,
                        totalTokens: response.usage.total_tokens,
                        cost,
                        statusCode: 200,
                        latencyMs,
                    });
                    return response;
                }
                catch (error) {
                    lastError = error instanceof Error ? error : new Error(String(error));
                    this.logger.warn(`Channel ${channel.channelId} failed: ${lastError.message}`);
                    // 更新渠道统计（失败）
                    await this.channelService.updateChannelStats(channel.channelId, Date.now() - startTime, false);
                    // 如果是最后一个渠道，抛出错误
                    if (i === channels.length - 1) {
                        break;
                    }
                }
            }
            // 所有渠道都失败
            throw lastError || new Error('All channels failed');
        }
        /**
         * 处理流式聊天补全请求
         *
         * @param request - 聊天请求
         * @param apiKey - API Key 信息
         * @param requestPath - 请求路径
         * @returns 流式响应生成器
         */
        async *handleChatCompletionStream(request, apiKey, requestPath) {
            const startTime = Date.now();
            // 检查模型限制
            if (apiKey.modelLimit.length > 0 &&
                !apiKey.modelLimit.includes(request.model)) {
                throw new Error(`Model ${request.model} is not allowed for this API key`);
            }
            // 选择渠道
            const channel = await this.channelService.selectChannel(request.model);
            let totalPromptTokens = 0;
            let totalCompletionTokens = 0;
            let totalTokens = 0;
            try {
                // 流式调用 provider
                const stream = channel.adapter.chatStream(request);
                for await (const chunk of stream) {
                    // 提取 usage 信息（如果 provider 返回）
                    if (chunk.usage) {
                        totalPromptTokens = chunk.usage.prompt_tokens;
                        totalCompletionTokens = chunk.usage.completion_tokens;
                        totalTokens = chunk.usage.total_tokens;
                    }
                    yield chunk;
                }
                // 计算延迟
                const latencyMs = Date.now() - startTime;
                // 更新渠道统计（成功）
                await this.channelService.updateChannelStats(channel.channelId, latencyMs, true);
                // 计算费用并扣减余额
                // 注意：流式响应中，如果 provider 不返回 usage，需要使用 Tokenizer 重算
                if (totalTokens > 0) {
                    const cost = await this.billingService.processUsage(apiKey.userId, apiKey.id, channel.channelId, request.model, {
                        prompt_tokens: totalPromptTokens,
                        completion_tokens: totalCompletionTokens,
                        total_tokens: totalTokens,
                    });
                    // 记录请求日志
                    await this.requestLogService.logRequest({
                        userId: apiKey.userId,
                        apiKeyId: apiKey.id,
                        modelId: request.model,
                        channelId: channel.channelId,
                        requestPath,
                        requestMethod: 'POST',
                        promptTokens: totalPromptTokens,
                        completionTokens: totalCompletionTokens,
                        totalTokens,
                        cost,
                        statusCode: 200,
                        latencyMs,
                    });
                }
            }
            catch (error) {
                // 更新渠道统计（失败）
                await this.channelService.updateChannelStats(channel.channelId, Date.now() - startTime, false);
                throw error;
            }
        }
    };
    return GatewayService = _classThis;
})();
export { GatewayService };
//# sourceMappingURL=gateway.service.js.map