# 支付系统 — PRD

## 状态：V3.0 计划中

## 功能清单

### 1. 支付方式

| 方式 | 状态 | 说明 |
|------|------|------|
| 微信支付 | 📋 V3.0 | Native / H5 / 小程序 |
| 支付宝 | 📋 V3.0 | 当面付 / 手机网站 |
| Stripe | 📋 V4.0 | 海外用户，信用卡 |
| USDT/Crypto | 📋 V6.0 | 加密货币 |

### 2. 订单状态机

```
                    ┌──────────┐
                    │ PENDING  │
                    └────┬─────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
              ▼          ▼          ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │   PAID   │ │  FAILED  │ │ CANCELLED│
        └────┬─────┘ └──────────┘ └──────────┘
             │
             ▼
        ┌──────────┐
        │ REFUNDED │
        └──────────┘
```

| 状态 | 说明 |
|------|------|
| PENDING | 待支付 |
| PAID | 已支付 |
| FAILED | 支付失败 |
| CANCELLED | 已取消 |
| REFUNDED | 已退款 |

### 3. 订单流程

```
用户选择充值金额
       │
       ▼
┌──────────────────┐
│ 创建 Order       │
│ status: PENDING  │
│ 生成 order_no    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 调用支付渠道      │
│ 获取支付凭证      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 用户完成支付      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 收到支付回调      │
│ 1. 验签           │
│ 2. 更新 Order     │
│ 3. 更新 Payment   │
│ 4. 充值余额       │
│ 5. 写入流水       │
└──────────────────┘
```

### 4. 安全要求

- 回调签名验证（`timingSafeEqual`）
- 订单幂等性（`order_no` 唯一）
- 状态变更仅通过回调
- 防重放攻击（时间戳校验）

### 5. 退款

- 仅支持全额退款（V3.0）
- 退款需管理员审批
- 退款后余额扣减（事务保证）
- 退款状态同步

## 数据库模型（待实现）

```prisma
model Order {
  id             String        @id @default(cuid())
  user_id        String
  order_no       String        @unique
  amount         Int           // 分
  paid_amount    Int?
  status         OrderStatus   @default(PENDING)
  product_type   String?
  product_id     String?
  product_name   String?
  payment_method PaymentMethod?
  created_at     DateTime      @default(now())
  updated_at      DateTime      @updatedAt

  user    User     @relation(fields: [user_id], references: [id])
  payment Payment?

  @@index([user_id])
  @@map("orders")
}

model Payment {
  id            String        @id @default(cuid())
  order_id      String        @unique
  trade_no      String?
  buyer_id      String?
  status        PaymentStatus @default(PENDING)
  refund_amount Int?
  refunded_at   DateTime?
  created_at    DateTime      @default(now())
  updated_at    DateTime      @updatedAt

  order Order @relation(fields: [order_id], references: [id])

  @@map("payments")
}
```

## 接口设计（待实现）

```
POST   /orders                    # 创建订单
GET    /orders/:order_no          # 查询订单
POST   /orders/:order_no/cancel   # 取消订单
POST   /webhooks/wechat-pay       # 微信支付回调
POST   /webhooks/alipay           # 支付宝回调
POST   /admin/orders/:id/refund   # 管理员退款
```


## 支付

