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

/**
 * OpenAI 兼容适配器
 *
 * 适用于：OpenAI, DeepSeek, Qwen, GLM, Moonshot, Grok
 * 这些 provider 都使用 OpenAI 兼容的 API 格式。
 */
export class OpenAIAdapter implements ProviderAdapter {
  readonly name: string;
  readonly provider: string;

  private readonly logger: Logger;
  private readonly config: ProviderConfig;

  constructor(provider: string, config: ProviderConfig) {
    this.name = provider;
    this.provider = provider;
    this.config = config;
    this.logger = new Logger(`OpenAIAdapter:${provider}`);
  }

  /**
   * 同步聊天补全
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const url = `${this.config.baseUrl}/v1/chat/completions`;

    const body = {
      model: request.model,
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.max_tokens,
      top_p: request.top_p,
      stream: false,
      tools: request.tools,
      tool_choice: request.tool_choice,
      stop: request.stop,
      frequency_penalty: request.frequency_penalty,
      presence_penalty: request.presence_penalty,
      seed: request.seed,
      user: request.user,
    };

    const startTime = Date.now();

    const response = await fetchWithPool(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(
        `Provider error: ${response.status} ${response.statusText} - ${errorText}`,
      );
      throw new ProviderError(
        `Provider returned ${response.status}: ${errorText}`,
        response.status,
        this.name,
      );
    }

    const data = (await response.json()) as OpenAIChatResponse;
    const latency = Date.now() - startTime;

    this.logger.debug(`Chat completed in ${latency}ms, model: ${request.model}`);

    return this.normalizeResponse(data);
  }

  /**
   * 流式聊天补全
   */
  async *chatStream(request: ChatRequest): AsyncGenerator<ChatChunk> {
    const url = `${this.config.baseUrl}/v1/chat/completions`;

    const body = {
      model: request.model,
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.max_tokens,
      top_p: request.top_p,
      stream: true,
      tools: request.tools,
      tool_choice: request.tool_choice,
      stop: request.stop,
      frequency_penalty: request.frequency_penalty,
      presence_penalty: request.presence_penalty,
      seed: request.seed,
      user: request.user,
      stream_options: { include_usage: true },
    };

    const response = await fetchWithPool(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(
        `Provider stream error: ${response.status} ${response.statusText} - ${errorText}`,
      );
      throw new ProviderError(
        `Provider returned ${response.status}: ${errorText}`,
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

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;

          if (trimmed.startsWith('data: ')) {
            const data = trimmed.slice(6);
            if (data === '[DONE]') return;

            try {
              const chunk = JSON.parse(data) as OpenAIChatChunk;
              yield this.normalizeChunk(chunk);
            } catch {
              this.logger.warn(`Failed to parse chunk: ${data}`);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * 标准化响应格式
   */
  private normalizeResponse(data: OpenAIChatResponse): ChatResponse {
    return {
      id: data.id,
      model: data.model,
      choices: data.choices.map((choice) => ({
        index: choice.index,
        message: {
          role: choice.message.role,
          content: choice.message.content || '',
          tool_calls: choice.message.tool_calls,
        },
        finish_reason: choice.finish_reason as ChatResponse['choices'][0]['finish_reason'],
      })),
      usage: {
        prompt_tokens: data.usage.prompt_tokens,
        completion_tokens: data.usage.completion_tokens,
        total_tokens: data.usage.total_tokens,
      },
    };
  }

  /**
   * 标准化 chunk 格式
   */
  private normalizeChunk(chunk: OpenAIChatChunk): ChatChunk {
    return {
      id: chunk.id,
      model: chunk.model,
      choices: chunk.choices.map((choice) => ({
        index: choice.index,
        delta: {
          role: choice.delta.role,
          content: choice.delta.content,
          tool_calls: choice.delta.tool_calls,
        },
        finish_reason: choice.finish_reason as ChatChunk['choices'][0]['finish_reason'],
      })),
      usage: chunk.usage
        ? {
            prompt_tokens: chunk.usage.prompt_tokens,
            completion_tokens: chunk.usage.completion_tokens,
            total_tokens: chunk.usage.total_tokens,
          }
        : undefined,
    };
  }
}

/**
 * OpenAI API 响应格式（内部类型）
 */
interface OpenAIChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: string;
        function: { name: string; arguments: string };
      }>;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * OpenAI API 流式响应格式（内部类型）
 */
interface OpenAIChatChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
      tool_calls?: Array<{
        id: string;
        type: string;
        function: { name: string; arguments: string };
      }>;
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
