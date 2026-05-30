/**
 * 聊天消息
 */
export declare class ChatMessageDto {
    readonly role: 'system' | 'user' | 'assistant' | 'tool';
    readonly content: string;
    readonly tool_call_id?: string;
}
/**
 * 工具定义
 */
export declare class ToolDto {
    readonly type: string;
    readonly function: FunctionDto;
}
/**
 * 函数定义
 */
export declare class FunctionDto {
    readonly name: string;
    readonly description?: string;
    readonly parameters?: Record<string, unknown>;
}
/**
 * OpenAI 兼容的 Chat Completion 请求 DTO
 *
 * 支持标准 OpenAI 格式，同时也支持 Anthropic 和 Gemini 的请求。
 */
export declare class ChatCompletionDto {
    readonly model: string;
    readonly messages: ChatMessageDto[];
    readonly temperature?: number;
    readonly max_tokens?: number;
    readonly top_p?: number;
    readonly stream?: boolean;
    readonly tools?: ToolDto[];
    readonly tool_choice?: 'auto' | 'none' | {
        type: string;
        function: {
            name: string;
        };
    };
    readonly stop?: string[];
    readonly frequency_penalty?: number;
    readonly presence_penalty?: number;
    readonly seed?: number;
    readonly user?: string;
}
/**
 * Chat Completion 响应 DTO
 */
export declare class ChatCompletionResponseDto {
    readonly id: string;
    readonly object: string;
    readonly created: number;
    readonly model: string;
    readonly choices: Array<{
        readonly index: number;
        readonly message: {
            readonly role: string;
            readonly content: string;
            readonly tool_calls?: unknown[];
        };
        readonly finish_reason: string;
    }>;
    readonly usage: {
        readonly prompt_tokens: number;
        readonly completion_tokens: number;
        readonly total_tokens: number;
    };
}
/**
 * 模型列表响应 DTO
 */
export declare class ModelListResponseDto {
    readonly object: string;
    readonly data: Array<{
        readonly id: string;
        readonly object: string;
        readonly created: number;
        readonly owned_by: string;
    }>;
}
//# sourceMappingURL=chat-completion.dto.d.ts.map