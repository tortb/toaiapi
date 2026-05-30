# ToAIAPI Payment Rules

## 核心原则

**支付系统涉及真实资金，任何错误都可能导致财务损失。**

## 支付状态机

```
PENDING ──→ SUCCESS
   │
   ├──→ FAILED
   │
   └──→ CANCELLED

SUCCESS ──→ REFUNDED (部分或全部)
```

### 状态流转规则

| 当前状态 | 允许的目标状态 | 触发条件 |
|---------|--------------|---------|
| PENDING | SUCCESS | 支付回调确认 |
| PENDING | FAILED | 支付失败回调 |
| PENDING | CANCELLED | 用户取消/超时 |
| SUCCESS | REFUNDED | 发起退款 |

**禁止直接将状态修改为 SUCCESS**，必须通过支付回调触发。

## 订单系统

### 订单号生成

```typescript
import { nanoid } from 'nanoid';

function generateOrderNo(): string {
  const timestamp = Date.now().toString(36);
  const random = nanoid(8);
  return `TOAI${timestamp}${random}`.toUpperCase();
}

// 示例: TOAI1NQZFK8X7M2P3R
```

### 订单数据库

```prisma
model Order {
  id           String      @id @default(cuid())
  order_no     String      @unique
  user_id      String
  user         User        @relation(fields: [user_id], references: [id])

  // 金额（分）
  amount       Int
  // 实际支付金额（可能有折扣）
  paid_amount  Int?

  // 支付方式
  payment_method PaymentMethod?

  // 状态
  status       OrderStatus @default(PENDING)

  // 商品信息
  product_type String      // 'recharge' | 'subscription'
  product_id   String?     // 套餐ID
  product_name String

  // 支付信息
  paid_at      DateTime?
  expired_at   DateTime?

  // 备注
  remark       String?

  created_at   DateTime    @default(now())
  updated_at   DateTime    @updatedAt

  // 关联支付记录
  payment      Payment?

  @@index([user_id, created_at])
  @@index([status])
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
```

## 微信支付

### 下单流程

```typescript
async function createWechatPayOrder(order: Order): Promise<WechatPayResult> {
  const params = {
    appid: process.env.WECHAT_PAY_APPID,
    mchid: process.env.WECHAT_PAY_MCHID,
    description: order.product_name,
    out_trade_no: order.order_no,
    notify_url: `${process.env.API_URL}/api/v1/payment/wechat/notify`,
    amount: {
      total: order.amount,
      currency: 'CNY',
    },
  };

  const response = await wechatPayApi.post('/v3/pay/transactions/native', params);
  return response.data;
}
```

### 回调处理

```typescript
async function handleWechatPayNotify(
  headers: WechatPayHeaders,
  body: string,
): Promise<void> {
  // 1. 验证签名
  const isValid = verifyWechatPaySignature(
    headers['wechatpay-timestamp'],
    headers['wechatpay-nonce'],
    body,
    headers['wechatpay-signature'],
    process.env.WECHAT_PAY_API_KEY,
  );

  if (!isValid) {
    throw new Error('Invalid signature');
  }

  // 2. 解密数据
  const data = decryptWechatPayData(body);

  // 3. 查找订单
  const order = await prisma.order.findUnique({
    where: { order_no: data.out_trade_no },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  // 4. 幂等检查
  if (order.status !== 'PENDING') {
    return; // 已处理，直接返回成功
  }

  // 5. 更新订单状态
  if (data.trade_state === 'SUCCESS') {
    await prisma.$transaction(async (tx) => {
      // 更新订单
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          paid_amount: data.amount.total,
          paid_at: new Date(),
          payment_method: 'WECHAT_PAY',
        },
      });

      // 增加用户余额
      await tx.userBalance.update({
        where: { user_id: order.user_id },
        data: { amount: { increment: order.amount } },
      });

      // 记录流水
      await tx.userTransaction.create({
        data: {
          user_id: order.user_id,
          type: 'RECHARGE',
          amount: order.amount,
          order_id: order.id,
          remark: `微信支付充值`,
        },
      });
    });
  }
}
```

### 退款

```typescript
async function refundOrder(orderId: string, amount?: number): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order || order.status !== 'PAID') {
    throw new Error('Order cannot be refunded');
  }

  const refundAmount = amount || order.paid_amount;

  // 1. 调用微信退款接口
  const refundResult = await wechatPayApi.post('/v3/refund/domestic/refunds', {
    out_trade_no: order.order_no,
    out_refund_no: `REFUND_${order.order_no}`,
    amount: {
      refund: refundAmount,
      total: order.paid_amount,
      currency: 'CNY',
    },
  });

  // 2. 更新订单状态
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'REFUNDED' },
    });

    // 扣减用户余额
    await tx.userBalance.update({
      where: { user_id: order.user_id },
      data: { amount: { decrement: refundAmount } },
    });

    // 记录流水
    await tx.userTransaction.create({
      data: {
        user_id: order.user_id,
        type: 'REFUND',
        amount: -refundAmount,
        order_id: orderId,
        remark: `订单退款`,
      },
    });
  });
}
```

## 支付宝

### 下单流程

```typescript
async function createAlipayOrder(order: Order): Promise<string> {
  const params = {
    method: 'alipay.trade.page.pay',
    biz_content: JSON.stringify({
      out_trade_no: order.order_no,
      product_code: 'FAST_INSTANT_TRADE_PAY',
      total_amount: fenToYuan(order.amount),
      subject: order.product_name,
    }),
    notify_url: `${process.env.API_URL}/api/v1/payment/alipay/notify`,
    return_url: `${process.env.FRONTEND_URL}/payment/success`,
  };

  // 生成签名
  const sign = generateAlipaySign(params, process.env.ALIPAY_PRIVATE_KEY);
  params.sign = sign;

  return buildAlipayUrl(params);
}
```

### 回调处理

```typescript
async function handleAlipayNotify(params: Record<string, string>): Promise<void> {
  // 1. 验证签名
  const isValid = verifyAlipaySignature(params, process.env.ALIPAY_PUBLIC_KEY);
  if (!isValid) {
    throw new Error('Invalid signature');
  }

  // 2. 查找订单
  const order = await prisma.order.findUnique({
    where: { order_no: params.out_trade_no },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  // 3. 幂等检查
  if (order.status !== 'PENDING') {
    return;
  }

  // 4. 处理支付结果
  if (params.trade_status === 'TRADE_SUCCESS') {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          paid_amount: yuanToFen(parseFloat(params.total_amount)),
          paid_at: new Date(),
          payment_method: 'ALIPAY',
        },
      });

      await tx.userBalance.update({
        where: { user_id: order.user_id },
        data: { amount: { increment: order.amount } },
      });

      await tx.userTransaction.create({
        data: {
          user_id: order.user_id,
          type: 'RECHARGE',
          amount: order.amount,
          order_id: order.id,
          remark: `支付宝充值`,
        },
      });
    });
  }
}
```

## 支付安全

### 防重复支付

```typescript
// 使用分布式锁防止并发支付
async function processPayment(orderNo: string): Promise<void> {
  const lockKey = `payment:lock:${orderNo}`;
  const locked = await redis.set(lockKey, '1', 'NX', 'EX', 30);

  if (!locked) {
    throw new Error('Payment is being processed');
  }

  try {
    // 处理支付...
  } finally {
    await redis.del(lockKey);
  }
}
```

### 超时处理

```typescript
// 订单超时自动取消
async function cancelExpiredOrders(): Promise<void> {
  const expiredOrders = await prisma.order.findMany({
    where: {
      status: 'PENDING',
      created_at: {
        lt: new Date(Date.now() - 30 * 60 * 1000), // 30分钟超时
      },
    },
  });

  for (const order of expiredOrders) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' },
    });
  }
}
```

## 支付检查清单

每个支付相关 PR 必须检查：

- [ ] 是否验证支付回调签名？
- [ ] 是否使用 timingSafeEqual 比较签名？
- [ ] 是否有幂等保护？
- [ ] 订单状态是否只能通过回调修改？
- [ ] 余额操作是否使用数据库事务？
- [ ] 是否有超时处理？
- [ ] 是否有防重复支付机制？
- [ ] 退款是否正确扣减余额？
- [ ] 敏感信息是否加密存储？
- [ ] 日志是否脱敏？
