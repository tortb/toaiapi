/**
 * Provider 适配器接口
 *
 * 所有 AI 提供商必须实现此接口。
 * 适配器负责将统一的请求格式转换为 provider 原生格式，
 * 并将 provider 响应转换回统一格式。
 */
export interface ProviderAdapter {
    /** 适配器名称 */
    readonly name: string;
    /** 提供商名称 */
    readonly provider: string;
    /**
     * 同步聊天补全
     */
    chat(request: ChatRequest): Promise<ChatResponse>;
    /**
     * 流式聊天补全
     */
    chatStream(request: ChatRequest): AsyncGenerator<ChatChunk>;
}
/**
 * 统一的聊天请求格式
 */
export interface ChatRequest {
    readonly model: string;
    readonly messages: ReadonlyArray<ChatMessage>;
    readonly temperature?: number;
    readonly max_tokens?: number;
    readonly top_p?: number;
    readonly stream?: boolean;
    readonly tools?: ReadonlyArray<Tool>;
    readonly tool_choice?: 'auto' | 'none' | {
        type: string;
        function: {
            name: string;
        };
    };
    readonly stop?: ReadonlyArray<string>;
    readonly frequency_penalty?: number;
    readonly presence_penalty?: number;
    readonly seed?: number;
    readonly user?: string;
}
/**
 * 聊天消息
 */
export interface ChatMessage {
    readonly role: 'system' | 'user' | 'assistant' | 'tool';
    readonly content: string;
    readonly tool_call_id?: string;
}
/**
 * 工具定义
 */
export interface Tool {
    readonly type: string;
    readonly function: {
        readonly name: string;
        readonly description?: string;
        readonly parameters?: Record<string, unknown>;
    };
}
/**
 * 统一的聊天响应格式
 */
export interface ChatResponse {
    readonly id: string;
    readonly model: string;
    readonly choices: ReadonlyArray<{
        readonly index: number;
        readonly message: {
            readonly role: string;
            readonly content: string;
            readonly tool_calls?: ReadonlyArray<ToolCall>;
        };
        readonly finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter';
    }>;
    readonly usage: {
        readonly prompt_tokens: number;
        readonly completion_tokens: number;
        readonly total_tokens: number;
    };
}
/**
 * 工具调用
 */
export interface ToolCall {
    readonly id: string;
    readonly type: string;
    readonly function: {
        readonly name: string;
        readonly arguments: string;
    };
}
/**
 * 流式响应 chunk
 */
export interface ChatChunk {
    readonly id: string;
    readonly model: string;
    readonly choices: ReadonlyArray<{
        readonly index: number;
        readonly delta: {
            readonly role?: string;
            readonly content?: string;
            readonly tool_calls?: ReadonlyArray<ToolCall>;
        };
        readonly finish_reason: 'stop' | 'length' | 'tool_calls' | null;
    }>;
    readonly usage?: {
        readonly prompt_tokens: number;
        readonly completion_tokens: number;
        readonly total_tokens: number;
    };
}
/**
 * Provider 配置
 */
export interface ProviderConfig {
    readonly baseUrl: string;
    readonly apiKey: string;
}
//# sourceMappingURL=provider-adapter.interface.d.ts.map