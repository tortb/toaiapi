# Gateway 技术规范

## 架构

```
Client (OpenAI SDK / curl)
       │
       ▼
┌─────────────────────────────────────┐
│          Gateway Controller          │
│  POST /v1/chat/completions           │
│  GET  /v1/models                     │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│          ApiKeyAuthGuard             │
│  1. 提取 API Key                     │
│  2. 验证 Key (Argon2id)              │
│  3. 检查状态/过期/限流                 │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│          GatewayService              │
│  1. 选择 Channel                     │
│  2. 获取 Provider Adapter            │
│  3. 转发请求                          │
│  4. 计算费用                          │
│  5. 扣减余额                          │
│  6. 记录日志                          │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│         ChannelService               │
│  selectChannel(model)                │
│  selectChannelsWithFallback(model)   │
│  updateChannelStats(...)             │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│      Provider Adapter Factory        │
│  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │ OpenAI │ │Anthropic│ │ Gemini │  │
│  └────────┘ └────────┘ └────────┘  │
│  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │DeepSeek│ │  Qwen  │ │  GLM   │  │
│  └────────┘ └────────┘ └────────┘  │
└─────────────────────────────────────┘
```

## Provider 适配器

### 接口定义

```typescript
interface ProviderAdapter {
  chat(request: ChatRequest): Promise<ChatResponse>;
  chatStream(request: ChatRequest): AsyncGenerator<ChatChunk>;
}
```

### 支持的 Provider

| Provider | 适配器 | API 格式 | 认证方式 |
|----------|--------|---------|---------|
| OpenAI | OpenAIAdapter | /v1/chat/completions | Bearer token |
| DeepSeek | OpenAIAdapter | /v1/chat/completions | Bearer token |
| Qwen | OpenAIAdapter | /v1/chat/completions | Bearer token |
| GLM | OpenAIAdapter | /v1/chat/completions | Bearer token |
| Moonshot | OpenAIAdapter | /v1/chat/completions | Bearer token |
| Grok | OpenAIAdapter | /v1/chat/completions | Bearer token |
| Anthropic | AnthropicAdapter | /v1/messages | x-api-key |
| Google | GeminiAdapter | /v1beta/models/{model}:generateContent | x-goog-api-key |

### 统一请求格式

```typescript
interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
  tools?: Tool[];
  tool_choice?: string | object;
  stop?: string[];
  frequency_penalty?: number;
  presence_penalty?: number;
  seed?: number;
  user?: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
}
```

### 统一响应格式

```typescript
interface ChatResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: 'stop' | 'length' | 'tool_calls';
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
```

## 渠道选择算法

### 单渠道选择

```
selectChannel(modelName):
  1. 查询所有支持该 model 的 active Channel
  2. 按 priority DESC 排序
  3. 同 priority 内按 weight 加权随机
  4. 返回选中 Channel
```

### 故障转移

```
selectChannelsWithFallback(modelName):
  1. 查询所有支持该 model 的 active Channel
  2. 按 priority DESC, weight DESC 排序
  3. 返回有序列表

GatewayService 使用:
  - 最多重试 3 次（首次 + 2 次重试）
  - 每次选择不同 Channel
  - 失败的 Channel 标记 ERROR 并更新统计
```

### 健康追踪

```typescript
// 指数移动平均延迟
newLatency = oldLatency * 0.8 + currentLatency * 0.2

// 失败率
failureRate = failed_requests / total_requests

// 状态转换
ACTIVE → RATE_LIMITED (收到 429)
ACTIVE → ERROR (连续失败)
ERROR → ACTIVE (手动恢复或定时检测)
```

## 限流

```typescript
// 每 API Key 60 请求/分钟
@Throttle({ default: { limit: 60, ttl: 60000 } })
```

## 流式输出

```
Client                    Gateway                   Provider
  │                         │                          │
  │ POST /v1/chat/          │                          │
  │ completions             │                          │
  │ (stream: true)          │                          │
  │────────────────────────▶│                          │
  │                         │ POST /v1/chat/           │
  │                         │ completions              │
  │                         │ (stream: true)           │
  │                         │─────────────────────────▶│
  │                         │                          │
  │                         │◀─ SSE events ───────────│
  │◀─ SSE events ──────────│                          │
  │                         │                          │
  │                         │ [DONE]                   │
  │                         │◀─────────────────────────│
  │                         │                          │
  │                         │ 计算费用                  │
  │                         │ 扣减余额                  │
  │                         │ 记录日志                  │
  │ [DONE]                  │                          │
  │◀────────────────────────│                          │
```

SSE 格式：
```
data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","choices":[{"delta":{"content":"Hello"}}]}

data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","choices":[{"delta":{"content":" world"}}]}

data: [DONE]
```

## 错误处理

| 场景 | 处理方式 |
|------|---------|
| Provider 超时 | 标记 Channel ERROR，重试下一渠道 |
| Provider 429 | 标记 Channel RATE_LIMITED，重试 |
| Provider 5xx | 重试下一渠道 |
| 余额不足 | 直接返回 402 |
| Key 限流 | 返回 429 |
| 模型不存在 | 返回 404 |
