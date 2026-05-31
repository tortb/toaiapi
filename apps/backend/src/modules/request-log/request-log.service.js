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
 * 请求日志业务服务
 *
 * 记录所有 API 请求的详细信息，用于计费审计和使用统计。
 */
let RequestLogService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var RequestLogService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            RequestLogService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        logger = new Logger(RequestLogService.name);
        constructor(prisma) {
            this.prisma = prisma;
        }
        /**
         * 记录请求日志
         */
        async logRequest(params) {
            try {
                await this.prisma.requestLog.create({
                    data: {
                        user_id: params.userId,
                        api_key_id: params.apiKeyId,
                        model_id: params.modelId,
                        channel_id: params.channelId,
                        request_path: params.requestPath,
                        request_method: params.requestMethod,
                        prompt_tokens: params.promptTokens,
                        completion_tokens: params.completionTokens,
                        cached_tokens: params.cachedTokens || 0,
                        reasoning_tokens: params.reasoningTokens || 0,
                        total_tokens: params.totalTokens,
                        cost: params.cost,
                        status_code: params.statusCode,
                        latency_ms: params.latencyMs,
                    },
                });
            }
            catch (error) {
                // 日志记录失败不应影响主流程
                this.logger.error(`Failed to log request: ${error}`);
            }
        }
        /**
         * 获取用户请求日志
         */
        async getUserLogs(userId, page = 1, pageSize = 20) {
            const skip = (page - 1) * pageSize;
            const [logs, total] = await Promise.all([
                this.prisma.requestLog.findMany({
                    where: { user_id: userId },
                    orderBy: { created_at: 'desc' },
                    skip,
                    take: pageSize,
                }),
                this.prisma.requestLog.count({
                    where: { user_id: userId },
                }),
            ]);
            return {
                items: logs.map((log) => ({
                    id: log.id,
                    modelId: log.model_id,
                    promptTokens: log.prompt_tokens,
                    completionTokens: log.completion_tokens,
                    totalTokens: log.total_tokens,
                    cost: log.cost,
                    statusCode: log.status_code,
                    latencyMs: log.latency_ms,
                    createdAt: log.created_at,
                })),
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            };
        }
    };
    return RequestLogService = _classThis;
})();
export { RequestLogService };
//# sourceMappingURL=request-log.service.js.map