# ToAIAPI Provider Rules

## 核心原则

**所有 AI 提供商必须通过统一的适配器接口接入。**

## 支持的提供商

| Provider | 名称 | 协议 |
|----------|------|------|
| OpenAI | GPT 系列 | OpenAI API |
| Anthropic | Claude 系列 | Anthropic API |
| Google | Gemini 系列 | Google AI API |
| DeepSeek | DeepSeek 系列 | OpenAI 兼容 |
| Qwen | 通义千问 | OpenAI 兼容 |
| GLM | 智谱 | OpenAI 兼容 |
| Moonshot | Kimi | OpenAI 兼容 |
| Grok | xAI | OpenAI 兼容 |

## 适配器接口

```typescript
interface ProviderAdapter {
  // 基本信息
  readonly name: string;
  readonly provider: string;

  // 聊天补全
  chat(request: ChatRequest): Promise<ChatResponse>;
  chatStream(request: ChatRequest): AsyncGenerator<ChatChunk>;

  // 文本嵌入（可选）
  embeddings?(request: EmbeddingRequest): Promise<EmbeddingResponse>;

  // 图片生成（可选）
  generateImage?(request: ImageRequest): Promise<ImageResponse>;

  // 音频处理（可选）
  audio?(request: AudioRequest): Promise<AudioResponse>;
}

interface ChatRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string | Array<ContentPart>;
  }>;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
  tools?: Tool[];
  tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
}

interface ChatResponse {
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
```

## OpenAI 适配器

```typescript
class OpenAIAdapter implements ProviderAdapter {
  readonly name = 'openai';
  readonly provider = 'OpenAI';

  constructor(private readonly config: ProviderConfig) {}

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature,
        max_tokens: request.max_tokens,
        top_p: request.top_p,
        stream: false,
        tools: request.tools,
        tool_choice: request.tool_choice,
      }),
    });

    const data = await response.json();
    return this.normalizeResponse(data);
  }

  async *chatStream(request: ChatRequest): AsyncGenerator<ChatChunk> {
    const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        ...request,
        stream: true,
      }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split('\n').filter(line => line.startsWith('data: '));

      for (const line of lines) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        yield JSON.parse(data);
      }
    }
  }

  private normalizeResponse(data: any): ChatResponse {
    return {
      id: data.id,
      model: data.model,
      choices: data.choices,
      usage: data.usage,
    };
  }
}
```

## Anthropic 适配器

```typescript
class AnthropicAdapter implements ProviderAdapter {
  readonly name = 'anthropic';
  readonly provider = 'Anthropic';

  constructor(private readonly config: ProviderConfig) {}

  async chat(request: ChatRequest): Promise<ChatResponse> {
    // 转换为 Anthropic 格式
    const anthropicRequest = this.convertRequest(request);

    const response = await fetch(`${this.config.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(anthropicRequest),
    });

    const data = await response.json();
    return this.normalizeResponse(data);
  }

  private convertRequest(request: ChatRequest): any {
    // 提取 system message
    const systemMessage = request.messages.find(m => m.role === 'system');
    const messages = request.messages.filter(m => m.role !== 'system');

    return {
      model: request.model,
      max_tokens: request.max_tokens || 4096,
      system: systemMessage?.content,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      temperature: request.temperature,
      stream: request.stream || false,
    };
  }

  private normalizeResponse(data: any): ChatResponse {
    return {
      id: data.id,
      model: data.model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: data.content[0].text,
        },
        finish_reason: data.stop_reason === 'end_turn' ? 'stop' : 'length',
      }],
      usage: {
        prompt_tokens: data.usage.input_tokens,
        completion_tokens: data.usage.output_tokens,
        total_tokens: data.usage.input_tokens + data.usage.output_tokens,
      },
    };
  }
}
```

## Gemini 适配器

```typescript
class GeminiAdapter implements ProviderAdapter {
  readonly name = 'gemini';
  readonly provider = 'Google';

  constructor(private readonly config: ProviderConfig) {}

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const geminiRequest = this.convertRequest(request);

    const response = await fetch(
      `${this.config.baseUrl}/v1beta/models/${request.model}:generateContent?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiRequest),
      },
    );

    const data = await response.json();
    return this.normalizeResponse(data, request.model);
  }

  private convertRequest(request: ChatRequest): any {
    return {
      contents: request.messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
      generationConfig: {
        temperature: request.temperature,
        maxOutputTokens: request.max_tokens,
        topP: request.top_p,
      },
      systemInstruction: request.messages.find(m => m.role === 'system')
        ? { parts: [{ text: request.messages.find(m => m.role === 'system')!.content }] }
        : undefined,
    };
  }

  private normalizeResponse(data: any, model: string): ChatResponse {
    return {
      id: `gemini-${Date.now()}`,
      model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: data.candidates[0].content.parts[0].text,
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
```

## 适配器注册

```typescript
// 适配器工厂
class ProviderAdapterFactory {
  private static adapters = new Map<string, new (config: ProviderConfig) => ProviderAdapter>();

  static register(provider: string, adapter: new (config: ProviderConfig) => ProviderAdapter) {
    this.adapters.set(provider, adapter);
  }

  static create(provider: string, config: ProviderConfig): ProviderAdapter {
    const Adapter = this.adapters.get(provider);
    if (!Adapter) {
      throw new Error(`Unknown provider: ${provider}`);
    }
    return new Adapter(config);
  }
}

// 注册所有适配器
ProviderAdapterFactory.register('openai', OpenAIAdapter);
ProviderAdapterFactory.register('anthropic', AnthropicAdapter);
ProviderAdapterFactory.register('google', GeminiAdapter);
ProviderAdapterFactory.register('deepseek', OpenAIAdapter); // DeepSeek 使用 OpenAI 兼容协议
ProviderAdapterFactory.register('qwen', OpenAIAdapter);     // 通义千问使用 OpenAI 兼容协议
ProviderAdapterFactory.register('glm', OpenAIAdapter);      // 智谱使用 OpenAI 兼容协议
ProviderAdapterFactory.register('moonshot', OpenAIAdapter); // Kimi 使用 OpenAI 兼容协议
ProviderAdapterFactory.register('grok', OpenAIAdapter);     // Grok 使用 OpenAI 兼容协议
```

## Claude Code 支持

Claude Code 使用 Anthropic API，需要特殊处理：

```typescript
// Claude Code 使用的端点
// POST /v1/messages
// POST /v1/messages?beta=true

class ClaudeCodeAdapter extends AnthropicAdapter {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    // Claude Code 特殊处理
    const anthropicRequest = this.convertRequest(request);

    // 添加 Claude Code 特定头
    const response = await fetch(`${this.config.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'messages-2023-12-15',
      },
      body: JSON.stringify(anthropicRequest),
    });

    const data = await response.json();
    return this.normalizeResponse(data);
  }
}
```

## Codex CLI 支持

Codex CLI 使用 OpenAI API，需要支持：

```typescript
// Codex 使用的端点
// POST /v1/chat/completions
// POST /v1/responses (Responses API)
// POST /v1/audio/transcriptions (Whisper)
// POST /v1/audio/speech (TTS)

class CodexAdapter extends OpenAIAdapter {
  // OpenAI 兼容，无需特殊处理
  // 但需要支持 Responses API

  async responses(request: ResponsesRequest): Promise<ResponsesResponse> {
    const response = await fetch(`${this.config.baseUrl}/v1/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(request),
    });

    return response.json();
  }
}
```

## 适配器检查清单

每个适配器相关 PR 必须检查：

- [ ] 是否实现 ProviderAdapter 接口？
- [ ] 请求格式转换是否正确？
- [ ] 响应格式转换是否正确？
- [ ] 流式响应是否支持？
- [ ] 错误处理是否完善？
- [ ] Token 计数是否准确？
- [ ] 是否已注册到工厂？
- [ ] 是否有单元测试？
