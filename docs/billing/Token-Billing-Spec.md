# ToAIAPI Token Billing Specification

**版本**: 1.0
**日期**: 2026-05-30
**状态**: Draft

---

## 1. 概述

### 1.1 目的

本文档定义了 ToAIAPI 平台的 Token 计费系统规范。所有计费相关的开发、测试、审计都必须遵循本文档。

### 1.2 范围

- Token 计算与验证
- 价格模型与计算
- 余额系统与交易
- 套餐系统与计费
- 请求日志与审计

### 1.3 核心原则

1. **永远不能相信模型返回的 token 数** — 必须使用 Tokenizer 重新计算
2. **余额操作必须使用数据库事务** — 保证原子性
3. **所有金额使用整数（分）** — 避免浮点精度问题
4. **所有订单必须幂等** — 防止重复扣费
5. **费用计算向上取整** — 保护平台利益

---

## 2. Token 计算

### 2.1 Token 定义

Token 是 AI 模型处理文本的基本单位。不同模型使用不同的 Tokenizer，因此同一文本在不同模型下可能有不同的 token 数。

### 2.2 Token 类型

| 类型 | 说明 | 示例 |
|------|------|------|
| prompt_tokens | 输入 token | 用户消息、系统提示 |
| completion_tokens | 输出 token | 模型回复 |
| cached_tokens | 缓存命中 token | OpenAI 缓存 |
| reasoning_tokens | 推理 token | o1/o3 模型 |
| total_tokens | 总 token | 以上之和 |

### 2.3 Token 计算规则

#### 2.3.1 必须使用 Tokenizer 重新计算

```typescript
// ❌ 禁止：直接使用 Provider 返回的 token 数
const usage = response.usage;

// ✅ 必须：使用 Tokenizer 重新计算
const promptTokens = tokenizer.encode(prompt).length;
const completionTokens = tokenizer.encode(completion).length;
```

#### 2.3.2 Tokenizer 选择

| 模型 | Tokenizer | 包 |
|------|-----------|-----|
| GPT 系列 | cl100k_base / o200k_base | tiktoken |
| Claude 系列 | @anthropic-ai/tokenizer | @anthropic-ai/tokenizer |
| Gemini 系列 | 通用方案 | gpt-tokenizer |
| 其他模型 | 通用方案 | gpt-tokenizer |

#### 2.3.3 双重验证

生产环境必须进行双重验证：

```typescript
async function validateTokenUsage(
  providerUsage: TokenUsage,
  calculatedUsage: TokenUsage,
): Promise<TokenUsage> {
  const tolerance = 0.1; // 10% 容差

  const promptDiff = Math.abs(providerUsage.promptTokens - calculatedUsage.promptTokens) / calculatedUsage.promptTokens;
  const completionDiff = Math.abs(providerUsage.completionTokens - calculatedUsage.completionTokens) / calculatedUsage.completionTokens;

  if (promptDiff > tolerance || completionDiff > tolerance) {
    // 记录差异，使用计算值
    logger.warn('Token usage mismatch', {
      provider: providerUsage,
      calculated: calculatedUsage,
    });
  }

  // 始终使用计算值
  return calculatedUsage;
}
```

### 2.4 特殊 Token 处理

#### 2.4.1 缓存 Token（OpenAI）

```typescript
// OpenAI 的 cached_tokens 是 prompt_tokens 的子集
// 计费时需要单独计算
const uncachedPromptTokens = promptTokens - cachedTokens;
const cachedCost = Math.ceil((cachedTokens / 1_000_000) * cachedPrice);
const uncachedCost = Math.ceil((uncachedPromptTokens / 1_000_000) * inputPrice);
```

#### 2.4.2 推理 Token（o1/o3）

```typescript
// 推理 token 单独计费
const reasoningCost = Math.ceil((reasoningTokens / 1_000_000) * reasoningPrice);
```

---

## 3. 价格模型

### 3.1 价格单位

所有价格存储为 **分/百万 token**（整数）。

```typescript
// 例如：GPT-4o 输入价格
// 实际价格: $2.50 / 1M tokens
// 存储值: 250 (分/百万 token)

// 例如：Claude Sonnet 4 输入价格
// 实际价格: $3.00 / 1M tokens
// 存储值: 300 (分/百万 token)
```

### 3.2 价格表结构

```prisma
model ModelPricing {
  id              String   @id @default(cuid())
  model_id        String   @unique
  model           Model    @relation(fields: [model_id], references: [id])

  // 价格单位：分/百万 token
  input_price     Int      // 输入价格
  output_price    Int      // 输出价格
  cached_price    Int?     // 缓存价格
  reasoning_price Int?     // 推理价格

  // 倍率（用于套餐折扣）
  multiplier      Decimal  @default(1.0)

  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
}
```

### 3.3 价格计算

```typescript
interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
  reasoningTokens: number;
}

interface ModelPricing {
  inputPrice: number;      // 分/百万 token
  outputPrice: number;     // 分/百万 token
  cachedPrice?: number;    // 分/百万 token
  reasoningPrice?: number; // 分/百万 token
  multiplier: number;      // 倍率
}

function calculateCost(usage: TokenUsage, pricing: ModelPricing): number {
  // 计算各项费用
  const inputCost = Math.ceil(
    (usage.promptTokens / 1_000_000) * pricing.inputPrice
  );

  const outputCost = Math.ceil(
    (usage.completionTokens / 1_000_000) * pricing.outputPrice
  );

  const cachedCost = usage.cachedTokens
    ? Math.ceil((usage.cachedTokens / 1_000_000) * (pricing.cachedPrice || 0))
    : 0;

  const reasoningCost = usage.reasoningTokens
    ? Math.ceil((usage.reasoningTokens / 1_000_000) * (pricing.reasoningPrice || 0))
    : 0;

  // 汇总
  const subtotal = inputCost + outputCost + cachedCost + reasoningCost;

  // 应用倍率
  return Math.ceil(subtotal * pricing.multiplier);
}
```

### 3.4 向上取整规则

所有费用计算必须向上取整（`Math.ceil`），保护平台利益：

```typescript
// ✅ 正确：向上取整
const cost = Math.ceil(tokenCount * pricePerToken);

// ❌ 禁止：四舍五入
const cost = Math.round(tokenCount * pricePerToken);

// ❌ 禁止：向下取整
const cost = Math.floor(tokenCount * pricePerToken);
```

---

## 4. 余额系统

### 4.1 余额类型

| 类型 | 说明 | 单位 |
|------|------|------|
| CNY | 人民币 | 分 |
| USD | 美元 | 分 |
| Credits | 积分 | 分 |

### 4.2 余额表结构

```prisma
model UserBalance {
  id         String   @id @default(cuid())
  user_id    String   @unique
  user       User     @relation(fields: [user_id], references: [id])

  // 余额单位：分
  amount     Int      @default(0)

  // 冻结金额（正在处理中的订单）
  frozen     Int      @default(0)

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
}
```

### 4.3 可用余额计算

```typescript
function getAvailableBalance(balance: UserBalance): number {
  return balance.amount - balance.frozen;
}
```

### 4.4 余额操作规则

#### 4.4.1 必须使用数据库事务

```typescript
// ✅ 正确：使用事务
async function deductBalance(
  userId: string,
  amount: number,
  orderId: string,
): Promise<UserTransaction> {
  return prisma.$transaction(async (tx) => {
    // 1. 检查余额
    const balance = await tx.userBalance.findUnique({
      where: { user_id: userId },
    });

    if (!balance || balance.amount < amount) {
      throw new InsufficientBalanceError(amount, balance?.amount || 0);
    }

    // 2. 扣减余额
    const updatedBalance = await tx.userBalance.update({
      where: { user_id: userId },
      data: { amount: { decrement: amount } },
    });

    // 3. 写入流水
    const transaction = await tx.userTransaction.create({
      data: {
        user_id: userId,
        type: 'DEDUCT',
        amount: -amount,
        balance_after: updatedBalance.amount,
        order_id: orderId,
      },
    });

    return transaction;
  });
}

// ❌ 禁止：不在事务中
async function deductBalanceWrong(userId: string, amount: number) {
  // 先扣余额
  await prisma.userBalance.update({
    where: { user_id: userId },
    data: { amount: { decrement: amount } },
  });

  // 如果这里失败，余额已扣但没有流水记录！
  await prisma.userTransaction.create({
    data: { user_id: userId, type: 'DEDUCT', amount: -amount },
  });
}
```

#### 4.4.2 余额不足处理

```typescript
class InsufficientBalanceError extends Error {
  constructor(required: number, available: number) {
    super(`Insufficient balance: required ${required}, available ${available}`);
    this.name = 'InsufficientBalanceError';
  }
}
```

### 4.5 交易流水

```prisma
model UserTransaction {
  id            String          @id @default(cuid())
  user_id       String
  user          User            @relation(fields: [user_id], references: [id])

  // 交易类型
  type          TransactionType

  // 金额（正数为收入，负数为支出）
  amount        Int

  // 交易后余额
  balance_after Int

  // 关联订单
  order_id      String?

  // 备注
  remark        String?

  created_at    DateTime        @default(now())

  @@index([user_id, created_at])
  @@index([order_id])
}

enum TransactionType {
  RECHARGE    // 充值
  DEDUCT      // 消费
  REFUND      // 退款
  GIFT        // 赠送
  REWARD      // 活动奖励
  FREEZE      // 冻结
  UNFREEZE    // 解冻
}
```

---

## 5. 套餐系统

### 5.1 套餐类型

| 类型 | 说明 |
|------|------|
| PAY_AS_YOU_GO | 按量付费 |
| SUBSCRIPTION | 订阅套餐 |
| HYBRID | 混合模式 |

### 5.2 套餐计划

```prisma
model SubscriptionPlan {
  id              String   @id @default(cuid())
  name            String   @unique
  display_name    String

  // 月付价格（分）
  monthly_price   Int
  // 年付价格（分）
  yearly_price    Int

  // 每月额度（token 数）
  monthly_quota   Int

  // 速率限制
  rate_limit      Int      // 请求/分钟
  token_limit     Int      // token/分钟

  // 功能权限
  features        Json

  is_active       Boolean  @default(true)
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
}
```

### 5.3 用户订阅

```prisma
model UserSubscription {
  id              String           @id @default(cuid())
  user_id         String           @unique
  plan_id         String
  plan            SubscriptionPlan @relation(fields: [plan_id], references: [id])

  type            SubscriptionType

  // 订阅周期
  period          String           // 'monthly' | 'yearly'
  start_date      DateTime
  end_date        DateTime

  // 已使用额度
  used_quota      Int              @default(0)

  // 自动续费
  auto_renew      Boolean          @default(true)

  status          SubscriptionStatus @default(ACTIVE)
  created_at      DateTime         @default(now())
  updated_at      DateTime         @updatedAt
}
```

### 5.4 混合模式计费

```typescript
async function deductWithSubscription(
  userId: string,
  tokenUsage: TokenUsage,
  modelId: string,
  orderId: string,
): Promise<void> {
  const subscription = await prisma.userSubscription.findUnique({
    where: { user_id: userId },
    include: { plan: true },
  });

  if (subscription && subscription.status === 'ACTIVE') {
    // 有套餐，先扣套餐额度
    const remainingQuota = subscription.plan.monthly_quota - subscription.used_quota;

    if (remainingQuota >= tokenUsage.totalTokens) {
      // 套餐额度足够
      await prisma.userSubscription.update({
        where: { id: subscription.id },
        data: { used_quota: { increment: tokenUsage.totalTokens } },
      });
      return;
    }

    // 套餐额度不足，先扣完套餐额度
    if (remainingQuota > 0) {
      await prisma.userSubscription.update({
        where: { id: subscription.id },
        data: { used_quota: subscription.plan.monthly_quota },
      });
    }

    // 剩余部分按量计费
    const remainingTokens = tokenUsage.totalTokens - remainingQuota;
    const cost = calculateCost(
      { ...tokenUsage, promptTokens: remainingTokens, completionTokens: 0 },
      await getModelPricing(modelId),
    );
    await deductBalance(userId, cost, orderId);
  } else {
    // 无套餐，直接按量计费
    const cost = calculateCost(tokenUsage, await getModelPricing(modelId));
    await deductBalance(userId, cost, orderId);
  }
}
```

---

## 6. 请求日志

### 6.1 日志表结构

```prisma
model RequestLog {
  id                String   @id @default(cuid())
  user_id           String
  api_key_id        String
  model_id          String
  channel_id        String

  // 请求信息
  request_path      String
  request_method    String

  // Token 使用
  prompt_tokens     Int
  completion_tokens Int
  cached_tokens     Int      @default(0)
  reasoning_tokens  Int      @default(0)
  total_tokens      Int

  // 费用
  cost              Int      // 单位：分

  // 响应信息
  status_code       Int
  latency_ms        Int

  // 时间
  created_at        DateTime @default(now())

  @@index([user_id, created_at])
  @@index([model_id, created_at])
  @@index([channel_id, created_at])
  @@index([created_at])
}
```

### 6.2 日志记录流程

```typescript
async function recordRequestLog(
  userId: string,
  apiKeyId: string,
  modelId: string,
  channelId: string,
  requestPath: string,
  requestMethod: string,
  tokenUsage: TokenUsage,
  cost: number,
  statusCode: number,
  latencyMs: number,
): Promise<void> {
  await prisma.requestLog.create({
    data: {
      user_id: userId,
      api_key_id: apiKeyId,
      model_id: modelId,
      channel_id: channelId,
      request_path: requestPath,
      request_method: requestMethod,
      prompt_tokens: tokenUsage.promptTokens,
      completion_tokens: tokenUsage.completionTokens,
      cached_tokens: tokenUsage.cachedTokens,
      reasoning_tokens: tokenUsage.reasoningTokens,
      total_tokens: tokenUsage.promptTokens + tokenUsage.completionTokens,
      cost: cost,
      status_code: statusCode,
      latency_ms: latencyMs,
    },
  });
}
```

---

## 7. 计费流程

### 7.1 完整流程

```
用户请求
    ↓
API Gateway 接收
    ↓
鉴权 & 限流
    ↓
转发到 Provider
    ↓
接收 Provider 响应
    ↓
Tokenizer 重新计算 token
    ↓
验证 token 使用（双重验证）
    ↓
查询模型定价
    ↓
计算费用
    ↓
检查用户余额
    ↓
扣减余额（数据库事务）
    ↓
记录请求日志
    ↓
返回响应给用户
```

### 7.2 异常处理

#### 7.2.1 余额不足

```typescript
async function handleInsufficientBalance(userId: string, required: number) {
  // 返回 402 Payment Required
  throw new HttpException(
    {
      code: 'INSUFFICIENT_BALANCE',
      message: 'Insufficient balance',
      required,
      available: await getAvailableBalance(userId),
    },
    HttpStatus.PAYMENT_REQUIRED,
  );
}
```

#### 7.2.2 Provider 错误

```typescript
async function handleProviderError(error: ProviderError) {
  // 不扣费，记录日志
  await recordRequestLog({
    statusCode: error.statusCode,
    cost: 0, // 错误不扣费
  });

  throw error;
}
```

#### 7.2.3 流式响应中断

```typescript
async function handleStreamInterruption(
  userId: string,
  modelId: string,
  partialUsage: TokenUsage,
) {
  // 按实际使用量计费
  const cost = calculateCost(partialUsage, await getModelPricing(modelId));
  await deductBalance(userId, cost, orderId);
}
```

---

## 8. 审计要求

### 8.1 审计日志

所有计费相关操作必须记录审计日志：

- 余额变动
- 订单状态变更
- 套餐订阅变更
- 价格调整

### 8.2 对账

每日对账：

1. 统计当日所有请求的 token 使用
2. 统计当日所有扣费
3. 对比 Provider 账单
4. 记录差异

### 8.3 报表

- 用户消费统计
- 模型使用统计
- 渠道使用统计
- 收入统计

---

## 9. 安全要求

### 9.1 防篡改

- 所有金额字段使用整数
- 余额操作使用数据库事务
- 交易流水不可修改

### 9.2 防重复

- 订单号唯一约束
- 支付回调幂等
- 扣费操作幂等

### 9.3 防溢出

- 金额使用 BigInt 或 Int64
- 检查溢出边界

---

## 10. 测试要求

### 10.1 单元测试

- Token 计算准确性
- 费用计算准确性
- 余额操作原子性
- 套餐额度计算

### 10.2 集成测试

- 完整计费流程
- 并发扣费
- 余额不足处理
- 套餐切换

### 10.3 E2E 测试

- 用户充值 → 消费 → 查询
- 套餐订阅 → 使用 → 到期
- 支付 → 回调 → 入账

---

## 附录 A: 价格示例

| 模型 | 输入价格 | 输出价格 | 缓存价格 |
|------|---------|---------|---------|
| GPT-4o | 250 | 1000 | 125 |
| GPT-4o-mini | 15 | 60 | 7.5 |
| Claude Sonnet 4 | 300 | 1500 | 150 |
| Claude Haiku 4 | 25 | 125 | 12.5 |
| DeepSeek V3 | 14 | 28 | 7 |

（单位：分/百万 token）

## 附录 B: 套餐示例

| 套餐 | 月付 | 年付 | 额度 |
|------|------|------|------|
| Free | 0 | 0 | 100K tokens |
| Starter | 4900 | 47000 | 10M tokens |
| Pro | 19900 | 191000 | 50M tokens |
| Team | 49900 | 479000 | 200M tokens |
| Enterprise | 定制 | 定制 | 定制 |

（价格单位：分）
