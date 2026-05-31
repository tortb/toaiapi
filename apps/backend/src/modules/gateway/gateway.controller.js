var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
import { Controller, Post, Get, UseGuards, HttpCode, HttpStatus, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity, ApiOkResponse, } from '@nestjs/swagger';
import { ChatCompletionResponseDto, ModelListResponseDto } from './dto/chat-completion.dto';
import { ApiKeyAuthGuard } from '../../common/guards/api-key-auth.guard';
/**
 * 网关控制器
 *
 * 提供 OpenAI 兼容的 API 端点。
 * 支持两种认证方式：
 * 1. X-API-Key 头
 * 2. Authorization: Bearer sk-toai-xxx
 */
let GatewayController = (() => {
    let _classDecorators = [ApiTags('Gateway'), Controller()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _chatCompletions_decorators;
    let _listModels_decorators;
    var GatewayController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _chatCompletions_decorators = [Post('v1/chat/completions'), UseGuards(ApiKeyAuthGuard), HttpCode(HttpStatus.OK), ApiSecurity('api-key'), ApiOperation({
                    summary: '聊天补全',
                    description: 'OpenAI 兼容的聊天补全接口，支持同步和流式输出',
                }), ApiOkResponse({ type: ChatCompletionResponseDto })];
            _listModels_decorators = [Get('v1/models'), UseGuards(ApiKeyAuthGuard), ApiSecurity('api-key'), ApiOperation({
                    summary: '获取模型列表',
                    description: '获取当前 API Key 可用的模型列表',
                }), ApiOkResponse({ type: ModelListResponseDto })];
            __esDecorate(this, null, _chatCompletions_decorators, { kind: "method", name: "chatCompletions", static: false, private: false, access: { has: obj => "chatCompletions" in obj, get: obj => obj.chatCompletions }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _listModels_decorators, { kind: "method", name: "listModels", static: false, private: false, access: { has: obj => "listModels" in obj, get: obj => obj.listModels }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            GatewayController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        gatewayService = __runInitializers(this, _instanceExtraInitializers);
        channelService;
        constructor(gatewayService, channelService) {
            this.gatewayService = gatewayService;
            this.channelService = channelService;
        }
        /**
         * OpenAI 兼容的聊天补全接口
         *
         * POST /v1/chat/completions
         *
         * 支持同步和流式两种模式。
         */
        async chatCompletions(dto, apiKey, request, reply) {
            // 构建内部请求格式
            const chatRequest = {
                model: dto.model,
                messages: dto.messages.map((m) => ({
                    role: m.role,
                    content: m.content,
                    tool_call_id: m.tool_call_id,
                })),
                temperature: dto.temperature,
                max_tokens: dto.max_tokens,
                top_p: dto.top_p,
                stream: dto.stream,
                tools: dto.tools,
                tool_choice: dto.tool_choice,
                stop: dto.stop,
                frequency_penalty: dto.frequency_penalty,
                presence_penalty: dto.presence_penalty,
                seed: dto.seed,
                user: dto.user,
            };
            // 流式响应
            if (dto.stream) {
                const rawReply = reply;
                rawReply.raw.setHeader('Content-Type', 'text/event-stream');
                rawReply.raw.setHeader('Cache-Control', 'no-cache');
                rawReply.raw.setHeader('Connection', 'keep-alive');
                const stream = this.gatewayService.handleChatCompletionStream(chatRequest, apiKey, request['url']);
                for await (const chunk of stream) {
                    rawReply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`);
                }
                rawReply.raw.write('data: [DONE]\n\n');
                rawReply.raw.end();
                return;
            }
            // 同步响应
            const response = await this.gatewayService.handleChatCompletion(chatRequest, apiKey, request['url']);
            reply.send(response);
        }
        /**
         * 获取可用模型列表
         *
         * GET /v1/models
         */
        async listModels() {
            const models = await this.channelService.getAvailableModels();
            return {
                object: 'list',
                data: models.map((model) => ({
                    id: model.name,
                    object: 'model',
                    created: Math.floor(model.created_at.getTime() / 1000),
                    owned_by: model.provider_id,
                })),
            };
        }
    };
    return GatewayController = _classThis;
})();
export { GatewayController };
//# sourceMappingURL=gateway.controller.js.map