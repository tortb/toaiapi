# OpenAI 兼容 API

## 基础信息

- **Base URL:** `https://api.toaiapi.com/v1`
- **认证:** API Key (`X-API-Key: sk-toai-xxx` 或 `Authorization: Bearer sk-toai-xxx`)
- **限流:** 60 请求/分钟/Key

## Chat Completions

### 请求

```
POST /v1/chat/completions
Content-Type: application/json
X-API-Key: sk-toai-xxxxx
```

```json
{
  "model": "gpt-4o",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"}
  ],
  "temperature": 0.7,
  "max_tokens": 1024,
  "top_p": 1.0,
  "stream": false,
  "tools": null,
  "tool_choice": null,
  "stop": null,
  "frequency_penalty": 0,
  "presence_penalty": 0,
  "seed": null,
  "user": "user-123"
}
```

### 响应（非流式）

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 25,
    "completion_tokens": 9,
    "total_tokens": 34
  }
}
```

### 响应（流式）

```
Content-Type: text/event-stream

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1234567890,"model":"gpt-4o","choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1234567890,"model":"gpt-4o","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1234567890,"model":"gpt-4o","choices":[{"index":0,"delta":{"content":"!"},"finish_reason":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1234567890,"model":"gpt-4o","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

## Model List

### 请求

```
GET /v1/models
X-API-Key: sk-toai-xxxxx
```

### 响应

```json
{
  "object": "list",
  "data": [
    {
      "id": "gpt-4o",
      "object": "model",
      "created": 1234567890,
      "owned_by": "openai"
    },
    {
      "id": "claude-sonnet-4",
      "object": "model",
      "created": 1234567890,
      "owned_by": "anthropic"
    }
  ]
}
```

## 支持的模型

| 模型 | Provider | 能力 |
|------|----------|------|
| gpt-4o | OpenAI | 流式、工具、视觉 |
| gpt-4o-mini | OpenAI | 流式、工具、视觉 |
| claude-sonnet-4 | Anthropic | 流式、工具、视觉 |
| claude-haiku-3.5 | Anthropic | 流式、工具、视觉 |
| gemini-2.5-pro | Google | 流式、工具、视觉 |
| gemini-2.5-flash | Google | 流式、工具、视觉 |
| deepseek-chat | DeepSeek | 流式、工具 |
| deepseek-reasoner | DeepSeek | 流式、推理 |

## 错误码

| HTTP | 说明 |
|------|------|
| 401 | API Key 无效或已禁用 |
| 402 | 余额不足 |
| 404 | 模型不存在 |
| 429 | 请求频率超限 |
| 500 | 服务器内部错误 |
| 502 | Provider 返回错误 |
| 504 | Provider 请求超时 |

## 使用示例

### curl

```bash
curl https://api.toaiapi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk-toai-xxxxx" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Python (OpenAI SDK)

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-toai-xxxxx",
    base_url="https://api.toaiapi.com/v1"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)

print(response.choices[0].message.content)
```

### Node.js (OpenAI SDK)

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-toai-xxxxx',
  baseURL: 'https://api.toaiapi.com/v1',
});

const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello!' }],
});

console.log(response.choices[0].message.content);
```
