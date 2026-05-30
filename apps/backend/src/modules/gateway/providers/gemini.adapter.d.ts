import { ProviderAdapter, ProviderConfig, ChatRequest, ChatResponse, ChatChunk } from './provider-adapter.interface';
/**
 * Google Gemini 适配器
 *
 * 适用于 Gemini 系列模型。
 * 需要将 OpenAI 格式转换为 Google AI API 格式。
 */
export declare class GeminiAdapter implements ProviderAdapter {
    readonly name = "gemini";
    readonly provider = "Google";
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
//# sourceMappingURL=gemini.adapter.d.ts.map