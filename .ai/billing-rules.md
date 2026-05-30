# ToAIAPI Billing Rules

## 核心原则

**Token 计费是 ToAIAPI 最核心的模块，直接关系到收入。**

**永远不能相信模型返回的 token 数。**

## 计费流程

```
用户请求
    ↓
API Gateway 接收
    ↓
鉴权 & 限流
    ↓
转发到 Provider（OpenAI/Anthropic/...）
    ↓
接收 Provider 响应
    ↓
Tokenizer 重新计算 token 数（双重验证）
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

## Token 计算

### 为什么不能相信 Provider 返回

```typescript
// ❌ Provider 返回的 usage 可能不准确
const usage = response.usage;
// {
//   "prompt_tokens": 100,      // 可能不准
//   "completion_tokens": 50,   // 可能不准
//   "total_tokens": 150        // 可能不准
// }

// ✅ 必须使用 Tokenizer 重新计算
const promptTokens = tokenizer.encode(prompt).length;
const completionTokens = tokenizer.encode(completion).length;
```

### Tokenizer 选择

```typescript
// OpenAI 模型: tiktoken (cl100k_base / o200k_base)
import { encoding_for_model } from 'tiktoken';
const enc = encoding_for_model('gpt-4');
const tokens = enc.encode(text);

// Anthropic 模型: @anthropic-ai/tokenizer
import { countTokens } from '@anthropic-ai/tokenizer';
const tokens = countTokens(text);

// 通用方案: gpt-tokenizer
import { encode } from 'gpt-tokenizer';
const tokens = encode(text);
```

### Token 类型

必须记录以下 token 类型：

```typescript
interface TokenUsage {
  prompt_tokens: number;       // 输入 token
  completion_tokens: number;   // 输出 token
  cached_tokens: number;       // 缓存命中 token（OpenAI）
  reasoning_tokens: number;    // 推理 token（o1/o3）
  total_tokens: number;        // 总 token
}
```

## 定价模型

### 数据库设计

```prisma
model ModelPricing {
  id               String   @id @default(cuid())
  model_id         String   @unique
  model            Model    @relation(fields: [model_id], references: [id])

  // 价格单位：分/百万 token
  input_price      Int      // 输入价格
  output_price     Int      // 输出价格
  cached_price     Int?     // 缓存价格
  reasoning_price  Int?     // 推理价格

  // 倍率（用于套餐折扣）
  multiplier       Decimal  @default(1.0)

  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt
}
```

### 价格计算

```typescript
async function calculateCost(
  modelId: string,
  usage: TokenUsage,
): Promise<number> {
  const pricing = await prisma.modelPricing.findUnique({
    where: { model_id: modelId },
  });

  if (!pricing) {
    throw new Error(`Pricing not found for model: ${modelId}`);
  }

  // 计算费用（单位：分）
  const inputCost = Math.ceil(
    (usage.prompt_tokens / 1_000_000) * pricing.input_price
  );
  const outputCost = Math.ceil(
    (usage.completion_tokens / 1_000_000) * pricing.output_price
  );
  const cachedCost = usage.cached_tokens
    ? Math.ceil((usage.cached_tokens / 1_000_000) * (pricing.cached_price || 0))
    : 0;
  const reasoningCost = usage.reasoning_tokens
    ? Math.ceil((usage.reasoning_tokens / 1_000_000) * (pricing.reasoning_price || 0))
    : 0;

  const totalCost = inputCost + outputCost + cachedCost + reasoningCost;

  // 应用倍率
  return Math.ceil(totalCost * Number(pricing.multiplier));
}
```

## 余额系统

### 数据库设计

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

model UserTransaction {
  id           String   @id @default(cuid())
  user_id      String
  user         User     @relation(fields: [user_id], references: [id])

  // 交易类型
  type         TransactionType

  // 金额（正数为收入，负数为支出）
  amount       Int

  // 交易后余额
  balance_after Int

  // 关联订单
  order_id     String?

  // 备注
  remark       String?

  created_at   DateTime @default(now())

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

### 余额操作

**必须使用数据库事务，保证扣余额和写流水的原子性。**

```typescript
async function deductBalance(
  userId: string,
  amount: number,
  orderId: string,
): Promise<UserTransaction> {
  // ✅ 正确：使用事务
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

// ❌ 错误：不在事务中
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

### 余额检查

```typescript
async function checkBalance(userId: string, requiredAmount: number): Promise<boolean> {
  const balance = await prisma.userBalance.findUnique({
    where: { user_id: userId },
  });

  if (!balance) {
    return false;
  }

  // 可用余额 = 总余额 - 冻结金额
  const available = balance.amount - balance.frozen;
  return available >= requiredAmount;
}
```

## 套餐系统

### 套餐类型

```typescript
enum SubscriptionType {
  PAY_AS_YOU_GO = 'pay_as_you_go',  // 按量付费
  SUBSCRIPTION = 'subscription',      // 订阅套餐
  HYBRID = 'hybrid',                  // 混合模式
}

enum SubscriptionPlan {
  FREE = 'free',           // 免费版
  STARTER = 'starter',     // 入门版
  PRO = 'pro',             // 专业版
  TEAM = 'team',           // 团队版
  ENTERPRISE = 'enterprise', // 企业版
}
```

### 套餐数据库

```prisma
model SubscriptionPlan {
  id                String   @id @default(cuid())
  name              String   @unique
  display_name      String

  // 月付价格（分）
  monthly_price     Int
  // 年付价格（分）
  yearly_price      Int

  // 每月额度（token 数）
  monthly_quota     Int

  // 速率限制
  rate_limit        Int      // 请求/分钟
  token_limit       Int      // token/分钟

  // 功能权限
  features          Json

  is_active         Boolean  @default(true)
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
}

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

enum SubscriptionStatus {
  ACTIVE
  EXPIRED
  CANCELLED
  SUSPENDED
}
```

### 混合模式计费

```typescript
async function deductWithSubscription(
  userId: string,
  tokenUsage: TokenUsage,
  modelId: string,
): Promise<void> {
  const subscription = await prisma.userSubscription.findUnique({
    where: { user_id: userId },
    include: { plan: true },
  });

  if (subscription && subscription.status === 'ACTIVE') {
    // 有套餐，先扣套餐额度
    const remainingQuota = subscription.plan.monthly_quota - subscription.used_quota;

    if (remainingQuota >= tokenUsage.total_tokens) {
      // 套餐额度足够
      await prisma.userSubscription.update({
        where: { id: subscription.id },
        data: { used_quota: { increment: tokenUsage.total_tokens } },
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
    const remainingTokens = tokenUsage.total_tokens - remainingQuota;
    const cost = await calculateCost(modelId, {
      ...tokenUsage,
      total_tokens: remainingTokens,
    });
    await deductBalance(userId, cost, orderId);
  } else {
    // 无套餐，直接按量计费
    const cost = await calculateCost(modelId, tokenUsage);
    await deductBalance(userId, cost, orderId);
  }
}
```

## 金额计算规则

### 使用整数

```typescript
// ✅ 使用整数（分）
const amount = 100; // 1.00 元

// ❌ 禁止浮点数
const amount = 1.00; // 精度问题

// ✅ 金额转换
function yuanToFen(yuan: number): number {
  return Math.round(yuan * 100);
}

function fenToYuan(fen: number): string {
  return (fen / 100).toFixed(2);
}
```

### 向上取整

```typescript
// ✅ 费用计算向上取整（保护平台利益）
const cost = Math.ceil(tokenCount * pricePerToken);

// ❌ 四舍五入
const cost = Math.round(tokenCount * pricePerToken);

// ❌ 向下取整
const cost = Math.floor(tokenCount * pricePerToken);
```

## 请求日志

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

## 计费检查清单

每个计费相关 PR 必须检查：

- [ ] 是否使用 Tokenizer 重新计算 token？
- [ ] 金额是否使用整数（分）？
- [ ] 余额操作是否使用数据库事务？
- [ ] 扣余额和写流水是否原子？
- [ ] 费用计算是否向上取整？
- [ ] 是否有幂等保护？
- [ ] 是否有并发安全保护？
- [ ] 是否记录完整的请求日志？
- [ ] 是否有余额不足的处理？
- [ ] 套餐额度用完后是否正确切换按量计费？
