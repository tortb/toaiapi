import { Logger } from '@nestjs/common';
import {
  ProviderAdapter,
  ProviderConfig,
  ChatRequest,
  ChatResponse,
  ChatChunk,
} from './provider-adapter.interface';
import { ProviderError } from './provider-error';
import { fetchWithPool } from '../../../common/http/http-agent';
import { CreateAnthropicMessageDto } from '../dto/anthropic-message.dto';
import { AnthropicMessageResponse } from '../types/anthropic-response.types';

/**
 * Anthropic 适配器
 *
 * 适用于 Claude 系列模型。
 * 需要将 OpenAI 格式转换为 Anthropic Messages API 格式。
 */
export class AnthropicAdapter implements ProviderAdapter {
  readonly name: string;
  readonly provider: string;

  private readonly logger: Logger;
  private readonly config: ProviderConfig;

  constructor(provider: string, config: ProviderConfig) {
    this.name = provider;
    this.provider = 'Anthropic';
    this.config = config;
    this.logger = new Logger(`AnthropicAdapter:${provider}`);
  }

  /**
   * 同步聊天补全
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const anthropicRequest = this.convertRequest(request);

    const response = await fetchWithPool(`${this.config.baseUrl}/v1/messages`, {
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
      this.logger.error(
        `Anthropic error: ${response.status} ${response.statusText} - ${errorText}`,
      );
      throw new ProviderError(
        `Anthropic returned ${response.status}: ${errorText}`,
        response.status,
        this.name,
      );
    }

    const data = (await response.json()) as AnthropicMessageResponse;
    return this.normalizeResponse(data, request.model);
  }

  /**
   * 流式聊天补全
   */
  async *chatStream(request: ChatRequest): AsyncGenerator<ChatChunk> {
    const anthropicRequest = this.convertRequest(request);

    const response = await fetchWithPool(`${this.config.baseUrl}/v1/messages`, {
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
      this.logger.error(
        `Anthropic stream error: ${response.status} ${response.statusText} - ${errorText}`,
      );
      throw new ProviderError(
        `Anthropic returned ${response.status}: ${errorText}`,
        response.status,
        this.name,
      );
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
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('event: ')) {
            // 事件类型，忽略
            continue;
          }

          if (trimmed.startsWith('data: ')) {
            const data = trimmed.slice(6);

            try {
              const event = JSON.parse(data) as AnthropicStreamEvent;

              if (event.type === 'message_start') {
                totalInputTokens = event.message?.usage?.input_tokens || 0;
              } else if (event.type === 'content_block_delta') {
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
              } else if (event.type === 'message_delta') {
                totalOutputTokens = event.usage?.output_tokens || 0;
                yield {
                  id: `anthropic-${Date.now()}`,
                  model: request.model,
                  choices: [{
                    index: 0,
                    delta: {},
                    finish_reason: this.mapStopReason(
                      event.delta?.stop_reason || 'end_turn',
                      [],
                    ),
                  }],
                  usage: {
                    prompt_tokens: totalInputTokens,
                    completion_tokens: totalOutputTokens,
                    total_tokens: totalInputTokens + totalOutputTokens,
                  },
                };
              }
            } catch {
              this.logger.warn(`Failed to parse Anthropic event: ${data}`);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * 转换请求格式
   */
  private convertRequest(request: ChatRequest): AnthropicMessageRequest {
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
            role: 'user' as const,
            content: [
              {
                type: 'tool_result' as const,
                tool_use_id: m.tool_call_id || '',
                content: m.content,
              },
            ],
          };
        }
        return {
          role: m.role as 'user' | 'assistant',
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
  private mapStopReason(
    stopReason: string | null,
    content: any[],
  ): 'stop' | 'length' | 'tool_calls' {
    if (stopReason === 'tool_use') return 'tool_calls';
    if (stopReason === 'end_turn') return 'stop';
    if (stopReason === 'max_tokens') return 'length';
    // 兜底：检查内容中是否有 tool_use 块
    if (content.some((c: any) => c.type === 'tool_use')) return 'tool_calls';
    return 'stop';
  }

  /**
   * 标准化响应格式
   */
  private normalizeResponse(
    data: any,
    model: string,
  ): ChatResponse {
    // 提取文本内容
    const textContent = data.content
      .filter((c: any) => c.type === 'text')
      .map((c: any) => c.text)
      .join('');

    // 提取工具调用
    const toolCalls = data.content
      .filter((c: any) => c.type === 'tool_use')
      .map((c: any) => ({
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

  /**
   * 发送原生 Anthropic 格式请求（非流式）
   *
   * 直接透传 Anthropic Messages API 格式，无需转换
   */
  async sendNativeRequest(dto: CreateAnthropicMessageDto): Promise<AnthropicMessageResponse> {
    const response = await fetchWithPool(`${this.config.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: dto.model,
        max_tokens: dto.max_tokens,
        messages: dto.messages,
        system: dto.system,
        temperature: dto.temperature,
        top_p: dto.top_p,
        top_k: dto.top_k,
        stop_sequences: dto.stop_sequences,
        metadata: dto.metadata,
        stream: false,
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(
        `Anthropic native request error: ${response.status} ${response.statusText} - ${errorText}`,
      );
      throw new ProviderError(
        `Anthropic returned ${response.status}: ${errorText}`,
        response.status,
        this.name,
      );
    }

    return (await response.json()) as AnthropicMessageResponse;
  }

  /**
   * 发送原生 Anthropic 格式请求（流式）
   *
   * 直接透传 Anthropic SSE 格式事件
   */
  async *sendNativeStreamRequest(
    dto: CreateAnthropicMessageDto,
  ): AsyncGenerator<{ event: string; data: unknown }> {
    const response = await fetchWithPool(`${this.config.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: dto.model,
        max_tokens: dto.max_tokens,
        messages: dto.messages,
        system: dto.system,
        temperature: dto.temperature,
        top_p: dto.top_p,
        top_k: dto.top_k,
        stop_sequences: dto.stop_sequences,
        metadata: dto.metadata,
        stream: true,
      }),
      signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(
        `Anthropic native stream error: ${response.status} ${response.statusText} - ${errorText}`,
      );
      throw new ProviderError(
        `Anthropic returned ${response.status}: ${errorText}`,
        response.status,
        this.name,
      );
    }

    if (!response.body) {
      throw new ProviderError('No response body', 500, this.name);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          // 解析 Anthropic SSE 格式: event: xxx\ndata: {...}
          if (line.startsWith('event: ')) {
            const eventType = line.substring(7).trim();
            continue; // 暂存 event 类型，等待下一行的 data
          }

          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6).trim();
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);

              // 根据 data.type 判断事件类型
              const eventType = data.type || 'unknown';

              yield {
                event: eventType,
                data: data,
              };
            } catch (parseError) {
              this.logger.warn(`Failed to parse Anthropic SSE data: ${dataStr}`);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

/**
 * Anthropic API 请求格式
 */
interface AnthropicMessageRequest {
  model: string;
  max_tokens: number;
  system?: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string | Array<{
      type: 'text' | 'tool_result' | 'tool_use';
      text?: string;
      tool_use_id?: string;
      content?: string;
    }>;
  }>;
  temperature?: number;
  top_p?: number;
  stop_sequences?: string[];
  stream?: boolean;
}

/**
 * Anthropic 流式事件格式
 */
interface AnthropicStreamEvent {
  type: string;
  message?: {
    usage?: { input_tokens: number };
  };
  delta?: {
    type?: string;
    text?: string;
    stop_reason?: string;
  };
  usage?: { output_tokens: number };
}
