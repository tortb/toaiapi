import { ProviderAdapter, ProviderConfig, ChatRequest, ChatResponse, ChatChunk } from './provider-adapter.interface';
/**
 * Anthropic 适配器
 *
 * 适用于 Claude 系列模型。
 * 需要将 OpenAI 格式转换为 Anthropic Messages API 格式。
 */
export declare class AnthropicAdapter implements ProviderAdapter {
    readonly name = "anthropic";
    readonly provider = "Anthropic";
    private readonly logger;
    private readonly config;
    constructor(config: ProviderConfig);
    /**
     * 同步聊天补全
     */
    chat(request: ChatRequest): Promise<ChatResponse>;
    /**
     * 流式聊天补全
     */
    chatStream(request: ChatRequest): AsyncGenerator<ChatChunk>;
    /**
     * 转换请求格式
     */
    private convertRequest;
    /**
     * 标准化响应格式
     */
    private normalizeResponse;
}
//# sourceMappingURL=anthropic.adapter.d.ts.map