import { ProviderAdapter, ProviderConfig, ChatRequest, ChatResponse, ChatChunk } from './provider-adapter.interface';
/**
 * OpenAI 兼容适配器
 *
 * 适用于：OpenAI, DeepSeek, Qwen, GLM, Moonshot, Grok
 * 这些 provider 都使用 OpenAI 兼容的 API 格式。
 */
export declare class OpenAIAdapter implements ProviderAdapter {
    readonly name: string;
    readonly provider: string;
    private readonly logger;
    private readonly config;
    constructor(provider: string, config: ProviderConfig);
    /**
     * 同步聊天补全
     */
    chat(request: ChatRequest): Promise<ChatResponse>;
    /**
     * 流式聊天补全
     */
    chatStream(request: ChatRequest): AsyncGenerator<ChatChunk>;
    /**
     * 标准化响应格式
     */
    private normalizeResponse;
    /**
     * 标准化 chunk 格式
     */
    private normalizeChunk;
}
//# sourceMappingURL=openai.adapter.d.ts.map