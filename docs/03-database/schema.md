# 数据库 Schema 文档

## 概览

- **数据库：** PostgreSQL 16
- **ORM：** Prisma 6
- **金额单位：** 分（fen），1 元 = 100 分
- **ID 策略：** cuid()

## 模型清单（16 个）

| 模型 | 表名 | 说明 |
|------|------|------|
| User | users | 用户 |
| UserBalance | user_balances | 用户余额 |
| UserTransaction | user_transactions | 交易流水 |
| ApiKey | api_keys | API 密钥 |
| Model | models | AI 模型 |
| ModelPricing | model_pricing | 模型定价 |
| Provider | providers | AI 服务商 |
| Channel | channels | 渠道 |
| ChannelModel | channel_models | 渠道-模型关联 |
| Order | orders | 订单 |
| Payment | payments | 支付记录 |
| SubscriptionPlan | subscription_plans | 订阅计划 |
| UserSubscription | user_subscriptions | 用户订阅 |
| Organization | organizations | 组织 |
| RequestLog | request_logs | 请求日志 |

## 枚举类型（9 个）

```prisma
enum UserRole {
  USER
  VIP
  ENTERPRISE
  AGENT
  ADMIN
  SUPER_ADMIN
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  BANNED
}

enum TransactionType {
  RECHARGE
  DEDUCT
  REFUND
  GIFT
  REWARD
  FREEZE
  UNFREEZE
}

enum ChannelStatus {
  ACTIVE
  RATE_LIMITED
  ERROR
  DISABLED
}

enum OrderStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
  CANCELLED
}

enum PaymentMethod {
  WECHAT_PAY
  ALIPAY
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
  REFUNDED
}

enum SubscriptionType {
  PAY_AS_YOU_GO
  SUBSCRIPTION
  HYBRID
}

enum SubscriptionStatus {
  ACTIVE
  EXPIRED
  CANCELLED
  SUSPENDED
}
```

## 关系图

```
User ──1:1──▶ UserBalance
User ──1:N──▶ ApiKey
User ──1:N──▶ UserTransaction
User ──1:N──▶ Order
User ──1:N──▶ RequestLog
User ──1:1──▶ UserSubscription
User ──N:1──▶ Organization

Organization ──1:N──▶ User

Provider ──1:N──▶ Channel
Channel ──N:N──▶ Model (via ChannelModel)
Model ──1:1──▶ ModelPricing

Order ──1:1──▶ Payment
```

## 索引策略

| 表 | 索引 | 用途 |
|----|------|------|
| user_transactions | (user_id, created_at) | 用户交易查询 |
| user_transactions | (order_id) | 订单关联查询 |
| request_logs | (user_id, created_at) | 用户日志查询 |
| request_logs | (model_id, created_at) | 模型统计 |
| request_logs | (channel_id, created_at) | 渠道统计 |
| request_logs | (created_at) | 全局时间查询 |
| api_keys | (user_id) | 用户 Key 查询 |
| channel_models | (channel_id, model_id) UNIQUE | 渠道模型唯一 |
| orders | (user_id) | 用户订单查询 |

## 设计决策

| 决策 | 选择 | 理由 |
|------|------|------|
| ID 类型 | cuid() | 有序、不可预测、分布式友好 |
| 金额类型 | Int | 避免浮点精度问题 |
| 删除策略 | 软删除（User） | 保留审计数据 |
| 外键约束 | 部分有、部分无 | RequestLog 等日志表不设外键，避免写入阻塞 |
| JSON 字段 | SubscriptionPlan.features | 灵活存储功能配置 |
