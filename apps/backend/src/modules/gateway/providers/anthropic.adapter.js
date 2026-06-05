import { Logger } from '@nestjs/common';
import { ProviderError } from './provider-error';
/**
 * Anthropic 适配器
 *
 * 适用于 Claude 系列模型。
 * 需要将 OpenAI 格式转换为 Anthropic Messages API 格式。
 */
export class AnthropicAdapter {
    name;
    provider;
    logger;
    config;
    constructor(provider, config) {
        this.name = provider;
        this.provider = 'Anthropic';
        this.config = config;
        this.logger = new Logger(`AnthropicAdapter:${provider}`);
    }
    /**
     * 同步聊天补全
     */
    async chat(request) {
        const anthropicRequest = this.convertRequest(request);
        const response = await fetch(`${this.config.baseUrl}/v1/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.config.apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify(anthropicRequest),
            signal: AbortSignal.timeout(60000),
        });
        if (!response.ok) {
            const errorText = await response.text();
            this.logger.error(`Anthropic error: ${response.status} ${response.statusText} - ${errorText}`);
            throw new ProviderError(`Anthropic returned ${response.status}: ${errorText}`, response.status, this.name);
        }
        const data = (await response.json());
        return this.normalizeResponse(data, request.model);
    }
    /**
     * 流式聊天补全
     */
    async *chatStream(request) {
        const anthropicRequest = this.convertRequest(request);
        const response = await fetch(`${this.config.baseUrl}/v1/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.config.apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({ ...anthropicRequest, stream: true }),
            signal: AbortSignal.timeout(120000),
        });
        if (!response.ok) {
            const errorText = await response.text();
            this.logger.error(`Anthropic stream error: ${response.status} ${response.statusText} - ${errorText}`);
            throw new ProviderError(`Anthropic returned ${response.status}: ${errorText}`, response.status, this.name);
        }
        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('Response body is not readable');
        }
        const decoder = new TextDecoder();
        let buffer = '';
        let contentBlockIndex = 0;
        let totalInputTokens = 0;
        let totalOutputTokens = 0;
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed)
                        continue;
                    if (trimmed.startsWith('event: ')) {
                        // 事件类型，忽略
                        continue;
                    }
                    if (trimmed.startsWith('data: ')) {
                        const data = trimmed.slice(6);
                        try {
                            const event = JSON.parse(data);
                            if (event.type === 'message_start') {
                                totalInputTokens = event.message?.usage?.input_tokens || 0;
                            }
                            else if (event.type === 'content_block_delta') {
                                if (event.delta?.type === 'text_delta') {
                                    yield {
                                        id: `anthropic-${Date.now()}`,
                                        model: request.model,
                                        choices: [{
                                                index: 0,
                                                delta: {
                                                    content: event.delta.text,
                                                },
                                                finish_reason: null,
                                            }],
                                    };
                                }
                            }
                            else if (event.type === 'message_delta') {
                                totalOutputTokens = event.usage?.output_tokens || 0;
                                yield {
                                    id: `anthropic-${Date.now()}`,
                                    model: request.model,
                                    choices: [{
                                            index: 0,
                                            delta: {},
                                            finish_reason: this.mapStopReason(event.delta?.stop_reason || 'end_turn', []),
                                        }],
                                    usage: {
                                        prompt_tokens: totalInputTokens,
                                        completion_tokens: totalOutputTokens,
                                        total_tokens: totalInputTokens + totalOutputTokens,
                                    },
                                };
                            }
                        }
                        catch {
                            this.logger.warn(`Failed to parse Anthropic event: ${data}`);
                        }
                    }
                }
            }
        }
        finally {
            reader.releaseLock();
        }
    }
    /**
     * 转换请求格式
     */
    convertRequest(request) {
        // 提取所有 system message 并拼接
        const systemMessages = request.messages.filter((m) => m.role === 'system');
        const systemContent = systemMessages.length > 0
            ? systemMessages.map((m) => m.content).join('\n\n')
            : undefined;
        const messages = request.messages
            .filter((m) => m.role !== 'system')
            .map((m) => {
            // Anthropic 使用 user 消息携带 tool_result
            if (m.role === 'tool') {
                return {
                    role: 'user',
                    content: [
                        {
                            type: 'tool_result',
                            tool_use_id: m.tool_call_id || '',
                            content: m.content,
                        },
                    ],
                };
            }
            return {
                role: m.role,
                content: m.content,
            };
        });
        return {
            model: request.model,
            max_tokens: request.max_tokens || 4096,
            system: systemContent,
            messages,
            temperature: request.temperature,
            top_p: request.top_p,
            stop_sequences: request.stop ? [...request.stop] : undefined,
        };
    }
    /**
     * 映射 Anthropic stop_reason 到 OpenAI finish_reason
     */
    mapStopReason(stopReason, content) {
        if (stopReason === 'tool_use')
            return 'tool_calls';
        if (stopReason === 'end_turn')
            return 'stop';
        if (stopReason === 'max_tokens')
            return 'length';
        // 兜底：检查内容中是否有 tool_use 块
        if (content.some((c) => c.type === 'tool_use'))
            return 'tool_calls';
        return 'stop';
    }
    /**
     * 标准化响应格式
     */
    normalizeResponse(data, model) {
        // 提取文本内容
        const textContent = data.content
            .filter((c) => c.type === 'text')
            .map((c) => c.text)
            .join('');
        // 提取工具调用
        const toolCalls = data.content
            .filter((c) => c.type === 'tool_use')
            .map((c) => ({
            id: c.id,
            type: 'function',
            function: {
                name: c.name,
                arguments: JSON.stringify(c.input),
            },
        }));
        return {
            id: data.id,
            model,
            choices: [{
                    index: 0,
                    message: {
                        role: 'assistant',
                        content: textContent,
                        tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
                    },
                    finish_reason: this.mapStopReason(data.stop_reason, data.content),
                }],
            usage: {
                prompt_tokens: data.usage.input_tokens,
                completion_tokens: data.usage.output_tokens,
                total_tokens: data.usage.input_tokens + data.usage.output_tokens,
            },
        };
    }
}
//# sourceMappingURL=anthropic.adapter.js.map