# 计费系统 — PRD

## 设计原则

1. **不信任 Provider** — 永远不使用 Provider 返回的 Token 数，平台自行计算
2. **金额单位：分（fen）** — 所有金额以 Int 类型存储，1 元 = 100 分
3. **向上取整** — 所有费用计算使用 `Math.ceil`
4. **事务保证** — 余额扣减必须在数据库事务中完成

## 功能清单

### 1. Token 计费

| Token 类型 | 说明 | 计价 |
|-----------|------|------|
| input_tokens | 输入 Token | input_price |
| output_tokens | 输出 Token | output_price |
| cached_tokens | 缓存命中 Token | cached_price（通常低于 input） |
| reasoning_tokens | 推理 Token（o1 等） | reasoning_price（通常高于 output） |

**费用计算公式：**

```
cost = ceil(
  input_tokens * input_price / 1_000_000 +
  output_tokens * output_price / 1_000_000 +
  cached_tokens * cached_price / 1_000_000 +
  reasoning_tokens * reasoning_price / 1_000_000
) * multiplier
```

所有价格单位：**元 / 百万 Token**

### 2. 余额系统

```
┌───────────────────────────────┐
│         UserBalance           │
├───────────────────────────────┤
│  amount: Int    (可用余额)     │
│  frozen: Int    (冻结金额)     │
├───────────────────────────────┤
│  available = amount - frozen   │
└───────────────────────────────┘
```

**余额操作：**

| 操作 | 事务 | 说明 |
|------|------|------|
| 充值 | ✅ | amount += recharge_amount |
| 扣费 | ✅ | amount -= cost, 检查余额充足 |
| 冻结 | ✅ | frozen += freeze_amount, amount -= freeze_amount |
| 解冻 | ✅ | frozen -= unfreeze_amount, amount += unfreeze_amount |
| 退款 | ✅ | amount += refund_amount |

### 3. 交易流水

```prisma
enum TransactionType {
  RECHARGE   # 充值
  DEDUCT     # 消费
  REFUND     # 退款
  GIFT       # 赠送
  REWARD     # 奖励
  FREEZE     # 冻结
  UNFREEZE   # 解冻
}
```

每笔交易记录：
- 类型
- 金额
- 操作后余额（balance_after）
- 关联订单（order_id，可选）
- 备注

### 4. 请求日志

每次 API 调用记录：
- 用户 ID、API Key ID、模型 ID、渠道 ID
- Token 使用明细（input/output/cached/reasoning）
- 费用
- 状态码
- 延迟（ms）

## API 端点

```
GET  /balance                 # 查看余额
POST /balance/recharge        # 充值（管理员）
GET  /balance/transactions    # 交易记录
GET  /balance/logs            # 调用日志
```

## 计费流程

```
API Request
    │
    ▼
┌──────────────┐
│ Gateway 接收  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 选择 Channel  │
│ 转发请求      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 获取响应      │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ 平台计算 Token 数     │ ← 不信任 Provider
│ (Tokenizer / 估算)    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 查询 ModelPricing    │
│ 计算费用              │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 数据库事务：          │
│ 1. 检查余额 ≥ cost    │
│ 2. 扣减余额           │
│ 3. 写入 Transaction   │
│ 4. 写入 RequestLog    │
└──────────────────────┘
```

## 数据库模型

```prisma
model UserBalance {
  id      String @id @default(cuid())
  user_id String @unique
  amount  Int    @default(0)   // 可用余额（分）
  frozen  Int    @default(0)   // 冻结金额（分）

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("user_balances")
}

model UserTransaction {
  id             String          @id @default(cuid())
  user_id        String
  type           TransactionType
  amount         Int
  balance_after  Int
  remark         String?
  order_id       String?
  created_at     DateTime        @default(now())

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id, created_at])
  @@index([order_id])
  @@map("user_transactions")
}

model RequestLog {
  id                String   @id @default(cuid())
  user_id           String
  api_key_id        String
  model_id          String
  channel_id        String
  request_path      String
  request_method    String
  prompt_tokens     Int
  completion_tokens Int
  cached_tokens     Int      @default(0)
  reasoning_tokens  Int      @default(0)
  total_tokens      Int
  cost              Int      // 分
  status_code       Int
  latency_ms        Int
  created_at        DateTime @default(now())

  @@index([user_id, created_at])
  @@index([model_id, created_at])
  @@index([channel_id, created_at])
  @@index([created_at])
  @@map("request_logs")
}
```

## 模型定价

```prisma
model ModelPricing {
  id              String   @id @default(cuid())
  model_id        String   @unique
  input_price     Int      // 分/百万Token
  output_price    Int      // 分/百万Token
  cached_price    Int?     // 分/百万Token
  reasoning_price Int?     // 分/百万Token
  multiplier      Decimal  @default(1.0)
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  model Model @relation(fields: [model_id], references: [id], onDelete: Cascade)

  @@map("model_pricing")
}
```

## Seed 默认定价（参考）

| 模型 | Input | Output | Cached | Reasoning |
|------|-------|--------|--------|-----------|
| gpt-4o | 250 | 1000 | 125 | — |
| gpt-4o-mini | 15 | 60 | 7.5 | — |
| claude-sonnet-4 | 300 | 1500 | 30 | — |
| claude-haiku-3.5 | 80 | 400 | 8 | — |
| gemini-2.5-pro | 125 | 500 | 31.25 | — |
| gemini-2.5-flash | 15 | 60 | 3.75 | — |
| deepseek-chat | 14 | 28 | 14 | — |
| deepseek-reasoner | 55 | 219 | 55 | 219 |
