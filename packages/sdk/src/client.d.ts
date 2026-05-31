import type { ToAIAPIConfig, ChatCompletionRequest, ChatCompletionResponse } from './types';
/**
 * ToAIAPI Client SDK
 */
export declare class ToAIAPI {
    private readonly baseUrl;
    private readonly apiKey;
    constructor(config: ToAIAPIConfig);
    /**
     * Create chat completion
     */
    chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse>;
    /**
     * Create streaming chat completion
     */
    chatCompletionStream(request: ChatCompletionRequest): AsyncGenerator<string>;
}
//# sourceMappingURL=client.d.ts.map