# ToAIAPI Gateway Rules

## 核心原则

**AI Gateway 是 ToAIAPI 的核心竞争力，必须保证高可用、高性能、协议兼容。**

## 渠道模型

```
Provider（提供商）
    │
    ├── Channel（渠道）
    │       │
    │       ├── Model（模型）
    │       │
    │       └── Model
    │
    └── Channel
            │
            └── Model
```

### 示例

```
Anthropic（提供商）
    │
    ├── Official Claude（官方渠道）
    │       │
    │       ├── claude-sonnet-4
    │       ├── claude-opus-4
    │       └── claude-haiku-4
    │
    └── Proxy Claude（代理渠道）
            │
            ├── claude-sonnet-4
            └── claude-opus-4
```

### 数据库设计

```prisma
model Provider {
  id          String    @id @default(cuid())
  name        String    @unique  // 'openai', 'anthropic', 'google', 'deepseek'
  display_name String
  base_url    String
  is_active   Boolean   @default(true)
  channels    Channel[]
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt
}

model Channel {
  id           String    @id @default(cuid())
  provider_id  String
  provider     Provider  @relation(fields: [provider_id], references: [id])
  name         String
  base_url     String
  api_key      String    // 加密存储

  // 负载均衡
  weight       Int       @default(1)
  priority     Int       @default(0)

  // 状态
  is_active    Boolean   @default(true)
  status       ChannelStatus @default(ACTIVE)

  // 统计
  total_requests Int     @default(0)
  failed_requests Int    @default(0)
  avg_latency_ms Int     @default(0)

  // 限制
  rate_limit   Int?      // 请求/分钟
  token_limit  Int?      // token/分钟

  models       ChannelModel[]
  created_at   DateTime  @default(now())
  updated_at   DateTime  @updatedAt

  @@index([provider_id, is_active])
}

model ChannelModel {
  id          String  @id @default(cuid())
  channel_id  String
  channel     Channel @relation(fields: [channel_id], references: [id])
  model_id    String
  model       Model   @relation(fields: [model_id], references: [id])

  // 模型别名（用户请求时使用的名称）
  alias       String?

  is_active   Boolean @default(true)

  @@unique([channel_id, model_id])
}

model Model {
  id           String    @id @default(cuid())
  name         String    @unique  // 'claude-sonnet-4', 'gpt-4o'
  display_name String
  provider_id  String

  // 模型能力
  max_context  Int
  supports_streaming Boolean @default(true)
  supports_tools     Boolean @default(false)
  supports_vision    Boolean @default(false)

  // 状态
  is_active    Boolean   @default(true)

  pricing      ModelPricing?
  channels     ChannelModel[]
  created_at   DateTime  @default(now())
  updated_at   DateTime  @updatedAt
}

enum ChannelStatus {
  ACTIVE
  RATE_LIMITED
  ERROR
  DISABLED
}
```

## 渠道选择策略

### 负载均衡

```typescript
interface ChannelSelector {
  selectChannel(modelName: string): Promise<Channel>;
}

// 权重轮询
class WeightedRoundRobinSelector implements ChannelSelector {
  async selectChannel(modelName: string): Promise<Channel> {
    const channels = await prisma.channelModel.findMany({
      where: {
        model: { name: modelName },
        is_active: true,
        channel: { is_active: true, status: 'ACTIVE' },
      },
      include: { channel: true },
    });

    if (channels.length === 0) {
      throw new NoAvailableChannelError(modelName);
    }

    // 按权重选择
    const totalWeight = channels.reduce((sum, c) => sum + c.channel.weight, 0);
    let random = Math.random() * totalWeight;

    for (const channelModel of channels) {
      random -= channelModel.channel.weight;
      if (random <= 0) {
        return channelModel.channel;
      }
    }

    return channels[0].channel;
  }
}

// 最低延迟
class LowestLatencySelector implements ChannelSelector {
  async selectChannel(modelName: string): Promise<Channel> {
    const channels = await prisma.channelModel.findMany({
      where: {
        model: { name: modelName },
        is_active: true,
        channel: { is_active: true, status: 'ACTIVE' },
      },
      include: { channel: true },
      orderBy: { channel: { avg_latency_ms: 'asc' } },
    });

    if (channels.length === 0) {
      throw new NoAvailableChannelError(modelName);
    }

    return channels[0].channel;
  }
}

// 优先级 + 权重
class PriorityWeightedSelector implements ChannelSelector {
  async selectChannel(modelName: string): Promise<Channel> {
    const channels = await prisma.channelModel.findMany({
      where: {
        model: { name: modelName },
        is_active: true,
        channel: { is_active: true, status: 'ACTIVE' },
      },
      include: { channel: true },
      orderBy: { channel: { priority: 'desc' } },
    });

    if (channels.length === 0) {
      throw new NoAvailableChannelError(modelName);
    }

    // 按优先级分组
    const maxPriority = channels[0].channel.priority;
    const topPriority = channels.filter(c => c.channel.priority === maxPriority);

    // 在最高优先级中按权重选择
    const totalWeight = topPriority.reduce((sum, c) => sum + c.channel.weight, 0);
    let random = Math.random() * totalWeight;

    for (const channelModel of topPriority) {
      random -= channelModel.channel.weight;
      if (random <= 0) {
        return channelModel.channel;
      }
    }

    return topPriority[0].channel;
  }
}
```

### 故障转移

```typescript
async function selectChannelWithFallback(modelName: string): Promise<Channel> {
  const channels = await prisma.channelModel.findMany({
    where: {
      model: { name: modelName },
      is_active: true,
      channel: { is_active: true },
    },
    include: { channel: true },
    orderBy: { channel: { priority: 'desc' } },
  });

  // 按优先级尝试
  for (const channelModel of channels) {
    const channel = channelModel.channel;

    // 跳过已禁用或错误状态的渠道
    if (channel.status === 'DISABLED' || channel.status === 'ERROR') {
      continue;
    }

    // 跳过限流的渠道
    if (channel.status === 'RATE_LIMITED') {
      continue;
    }

    return channel;
  }

  throw new NoAvailableChannelError(modelName);
}
```

## 协议兼容

### OpenAI 兼容

```typescript
// POST /v1/chat/completions
interface OpenAIChatRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  tools?: Array<{
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: object;
    };
  }>;
}

// 响应格式
interface OpenAIChatResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: 'stop' | 'length' | 'tool_calls';
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
```

### Anthropic 兼容

```typescript
// POST /v1/messages
interface AnthropicMessageRequest {
  model: string;
  max_tokens: number;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  system?: string;
  temperature?: number;
  stream?: boolean;
}

// 响应格式
interface AnthropicMessageResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{
    type: 'text';
    text: string;
  }>;
  model: string;
  stop_reason: 'end_turn' | 'max_tokens';
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}
```

## 流式响应

```typescript
// SSE 流式响应
async function handleStreamResponse(
  req: Request,
  res: Response,
  channel: Channel,
  model: string,
): Promise<void> {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const stream = await callProviderStream(channel, model, req.body);

  let totalTokens = 0;

  for await (const chunk of stream) {
    // 解析 chunk
    const data = parseStreamChunk(chunk);

    // 累计 token
    if (data.usage) {
      totalTokens = data.usage.total_tokens;
    }

    // 转发给客户端
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  res.write('data: [DONE]\n\n');
  res.end();

  // 异步记录计费
  await recordBilling(req.userId, model, totalTokens);
}
```

## 请求转发

```typescript
async function forwardRequest(
  channel: Channel,
  path: string,
  method: string,
  body: any,
  headers: Record<string, string>,
): Promise<any> {
  const url = `${channel.base_url}${path}`;

  // 构建请求头
  const requestHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${channel.api_key}`,
    ...headers,
  };

  // 发送请求
  const startTime = Date.now();
  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: JSON.stringify(body),
    });

    const latency = Date.now() - startTime;

    // 更新渠道统计
    await updateChannelStats(channel.id, latency, true);

    return response.json();
  } catch (error) {
    const latency = Date.now() - startTime;
    await updateChannelStats(channel.id, latency, false);

    // 标记渠道状态
    await markChannelError(channel.id);

    throw error;
  }
}
```

## 网关检查清单

每个网关相关 PR 必须检查：

- [ ] 是否支持 OpenAI 协议兼容？
- [ ] 是否支持 Anthropic 协议兼容？
- [ ] 是否支持流式响应？
- [ ] 渠道选择是否正确？
- [ ] 故障转移是否生效？
- [ ] 是否正确记录 token 使用？
- [ ] 是否正确触发计费？
- [ ] 渠道统计是否更新？
- [ ] 是否有超时处理？
- [ ] 是否有重试机制？
