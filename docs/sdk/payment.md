# 支付系统 — PRD

## 状态：V3.0 进行中 (v0.4.3)

## 功能清单

### 1. 支付方式

| 方式 | 状态 | 说明 |
|------|------|------|
| 易支付 (EPay) | ✅ 已完成 | 支付宝/微信/QQ钱包 |
| 支付宝 | ✅ 已完成 | 网页支付 |
| 微信支付 | ✅ 已完成 | Native/H5支付 |
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
- 敏感字段AES-256-GCM加密存储

### 5. 退款

- 仅支持全额退款（V3.0）
- 退款需管理员审批
- 退款后余额扣减（事务保证）
- 退款状态同步

## 数据库模型

### PaymentConfig（支付配置）

```prisma
model PaymentConfig {
  id              String   @id @default(cuid())
  name            String   @unique  // 'epay', 'alipay', 'wechatpay'
  display_name    String
  is_enabled      Boolean  @default(false)

  // 商户配置（AES-256-GCM加密存储）
  merchant_id     String?  // 商户ID/pid
  merchant_key    String?  // 商户密钥（加密）
  merchant_secret String?  // 商户秘钥/私钥（加密）

  // API端点
  api_endpoint    String?  // 支付网关地址

  // 回调配置
  notify_url      String?  // 异步通知地址
  return_url      String?  // 同步跳转地址

  // 额外配置（JSON）
  extra_config    Json?

  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
}
```

### Order（订单）

```prisma
model Order {
  id           String        @id @default(cuid())
  user_id      String
  order_no     String        @unique
  amount       Int           // 分
  paid_amount  Int?
  status       OrderStatus   @default(PENDING)
  product_type String?
  product_id   String?
  product_name String?
  payment_method PaymentMethod?
  created_at   DateTime      @default(now())
  updated_at   DateTime      @updatedAt

  user    User     @relation(fields: [user_id], references: [id])
  payment Payment?

  @@index([user_id])
  @@map("orders")
}
```

### Payment（支付记录）

```prisma
model Payment {
  id            String        @id @default(cuid())
  order_id      String        @unique
  method        PaymentMethod
  amount        Int
  trade_no      String?
  buyer_id      String?
  status        PaymentStatus @default(PENDING)
  paid_at       DateTime?
  refunded_at   DateTime?
  refund_amount Int?
  created_at    DateTime      @default(now())
  updated_at    DateTime      @updatedAt

  order Order @relation(fields: [order_id], references: [id])

  @@map("payments")
}
```

## 接口设计

### 用户端 API

```
POST   /api/v1/payment/orders                    # 创建订单
GET    /api/v1/payment/orders                    # 获取订单列表
GET    /api/v1/payment/orders/:order_no          # 查询订单
POST   /api/v1/payment/orders/:order_no/cancel   # 取消订单
GET    /api/v1/payment/methods                   # 获取可用支付方式
```

### 支付回调 API

```
POST   /api/v1/payment/notify/epay         # 易支付异步通知
POST   /api/v1/payment/notify/alipay       # 支付宝异步通知
POST   /api/v1/payment/notify/wechatpay    # 微信支付异步通知
GET    /api/v1/payment/return/epay         # 易支付同步跳转
```

### Admin API

```
GET    /api/v1/admin/payment-configs           # 获取所有支付配置
GET    /api/v1/admin/payment-configs/:name     # 获取单个配置
PUT    /api/v1/admin/payment-configs/:name     # 更新配置
PATCH  /api/v1/admin/payment-configs/:name/toggle  # 启用/禁用
```

## 技术实现

### 服务层

| 服务 | 职责 |
|------|------|
| `EPayService` | 易支付签名生成、支付链接创建、回调验签 |
| `AlipayService` | 支付宝签名生成、表单/链接创建、回调验签 |
| `WechatPayService` | 微信支付签名生成、Native/H5支付、回调验签 |
| `PaymentService` | 统一支付接口、订单管理、回调处理 |
| `PaymentConfigService` | 支付配置CRUD、加密存储 |
| `ConfigEncryptionService` | AES-256-GCM加解密 |

### 加密存储

```typescript
// 敏感字段加密存储
merchant_key = AES-256-GCM(plaintext, ENCRYPTION_KEY)
merchant_secret = AES-256-GCM(plaintext, ENCRYPTION_KEY)

// API返回时脱敏显示
masked_key = "********" + key.slice(-4)
```

### 回调验签

```typescript
// 使用 timingSafeEqual 防止时序攻击
const isValid = crypto.timingSafeEqual(
  Buffer.from(expectedSign),
  Buffer.from(receivedSign)
);
```

## Admin 前端页面

### 支付配置页面 `/payment-config`

- 支持易支付、支付宝、微信支付三种配置
- 敏感字段（密钥、私钥）脱敏显示
- 启用/禁用开关
- 异步通知地址和同步跳转地址配置

### 订单管理页面 `/orders`

- 订单列表（分页）
- 按状态筛选
- 按订单号搜索
- 订单详情查看

## 待开发功能

### 用户端充值页面 `/recharge`

- 金额选择（预设金额 + 自定义金额）
- 支付方式选择
- 二维码展示（微信Native支付）
- 支付状态轮询

### 用户端订单列表 `/orders`

- 用户查看历史充值订单
- 订单状态筛选
- 订单详情查看

### 退款流程

- 管理员审批退款申请
- 调用支付渠道退款接口
- 余额扣减（事务保证）
- 退款状态同步

### 订单超时取消

- 定时任务扫描超时订单
- 自动取消超过30分钟未支付的订单
- 更新订单状态为CANCELLED
