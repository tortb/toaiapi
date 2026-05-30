export interface ChatMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string | ContentPart[];
}
export interface ContentPart {
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
        url: string;
    };
}
export interface Tool {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
    };
}
export interface ToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;
    };
}
export interface ChatRequest {
    model: string;
    messages: ChatMessage[];
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    stream?: boolean;
    tools?: Tool[];
    tool_choice?: 'auto' | 'none' | {
        type: 'function';
        function: {
            name: string;
        };
    };
}
export interface ChatResponse {
    id: string;
    model: string;
    choices: Array<{
        index: number;
        message: {
            role: 'assistant';
            content: string;
            tool_calls?: ToolCall[];
        };
        finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter';
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
export interface ChatChunk {
    id: string;
    model: string;
    choices: Array<{
        index: number;
        delta: {
            role?: 'assistant';
            content?: string;
            tool_calls?: ToolCall[];
        };
        finish_reason: 'stop' | 'length' | 'tool_calls' | null;
    }>;
}
export interface ProviderConfig {
    name: string;
    baseUrl: string;
    apiKey: string;
}
//# sourceMappingURL=types.d.ts.map