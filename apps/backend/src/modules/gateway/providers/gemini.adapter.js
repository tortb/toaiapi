import { Logger } from '@nestjs/common';
/**
 * Google Gemini 适配器
 *
 * 适用于 Gemini 系列模型。
 * 需要将 OpenAI 格式转换为 Google AI API 格式。
 */
export class GeminiAdapter {
    name = 'gemini';
    provider = 'Google';
    logger = new Logger('GeminiAdapter');
    config;
    constructor(config) {
        this.config = config;
    }
    /**
     * 同步聊天补全
     */
    async chat(request) {
        const geminiRequest = this.convertRequest(request);
        const url = `${this.config.baseUrl}/v1beta/models/${request.model}:generateContent?key=${this.config.apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiRequest),
        });
        if (!response.ok) {
            const errorText = await response.text();
            this.logger.error(`Gemini error: ${response.status} ${response.statusText} - ${errorText}`);
            throw new Error(`Gemini returned ${response.status}: ${errorText}`);
        }
        const data = (await response.json());
        return this.normalizeResponse(data, request.model);
    }
    /**
     * 流式聊天补全
     */
    async *chatStream(request) {
        const geminiRequest = this.convertRequest(request);
        const url = `${this.config.baseUrl}/v1beta/models/${request.model}:streamGenerateContent?alt=sse&key=${this.config.apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiRequest),
        });
        if (!response.ok) {
            const errorText = await response.text();
            this.logger.error(`Gemini stream error: ${response.status} ${response.statusText} - ${errorText}`);
            throw new Error(`Gemini returned ${response.status}: ${errorText}`);
        }
        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('Response body is not readable');
        }
        const decoder = new TextDecoder();
        let buffer = '';
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
                    if (!trimmed || trimmed.startsWith(':'))
                        continue;
                    if (trimmed.startsWith('data: ')) {
                        const data = trimmed.slice(6);
                        try {
                            const event = JSON.parse(data);
                            const text = event.candidates?.[0]?.content?.parts?.[0]?.text;
                            if (text) {
                                yield {
                                    id: `gemini-${Date.now()}`,
                                    model: request.model,
                                    choices: [{
                                            index: 0,
                                            delta: { content: text },
                                            finish_reason: null,
                                        }],
                                };
                            }
                            // 检查是否结束
                            if (event.candidates?.[0]?.finishReason) {
                                yield {
                                    id: `gemini-${Date.now()}`,
                                    model: request.model,
                                    choices: [{
                                            index: 0,
                                            delta: {},
                                            finish_reason: 'stop',
                                        }],
                                    usage: event.usageMetadata
                                        ? {
                                            prompt_tokens: event.usageMetadata.promptTokenCount || 0,
                                            completion_tokens: event.usageMetadata.candidatesTokenCount || 0,
                                            total_tokens: event.usageMetadata.totalTokenCount || 0,
                                        }
                                        : undefined,
                                };
                            }
                        }
                        catch {
                            this.logger.warn(`Failed to parse Gemini event: ${data}`);
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
        const systemMessage = request.messages.find((m) => m.role === 'system');
        const contents = request.messages
            .filter((m) => m.role !== 'system')
            .map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        }));
        return {
            contents,
            generationConfig: {
                temperature: request.temperature,
                maxOutputTokens: request.max_tokens,
                topP: request.top_p,
                stopSequences: request.stop ? [...request.stop] : undefined,
            },
            systemInstruction: systemMessage
                ? { parts: [{ text: systemMessage.content }] }
                : undefined,
        };
    }
    /**
     * 标准化响应格式
     */
    normalizeResponse(data, model) {
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return {
            id: `gemini-${Date.now()}`,
            model,
            choices: [{
                    index: 0,
                    message: {
                        role: 'assistant',
                        content: text,
                    },
                    finish_reason: 'stop',
                }],
            usage: {
                prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
                completion_tokens: data.usageMetadata?.candidatesTokenCount || 0,
                total_tokens: data.usageMetadata?.totalTokenCount || 0,
            },
        };
    }
}
//# sourceMappingURL=gemini.adapter.js.map