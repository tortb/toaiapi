# ToAIAPI Domain-Driven Design

## 领域模型

### 核心领域

```
┌─────────────────────────────────────────────────────────────┐
│                      AI Gateway                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Provider  │  │   Channel   │  │    Model    │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         └────────────────┼────────────────┘                 │
│                          │                                  │
│                    ┌─────▼─────┐                            │
│                    │  Gateway  │                            │
│                    └─────┬─────┘                            │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      用户系统                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    User     │  │   ApiKey    │  │    Auth     │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         └────────────────┼────────────────┘                 │
│                          │                                  │
│                    ┌─────▼─────┐                            │
│                    │   User    │                            │
│                    └─────┬─────┘                            │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      计费系统                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Billing    │  │   Balance   │  │   Order     │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         └────────────────┼────────────────┘                 │
│                          │                                  │
│                    ┌─────▼─────┐                            │
│                    │  Billing  │                            │
│                    └─────┬─────┘                            │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      支付系统                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Payment   │  │   Wechat    │  │   Alipay    │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         └────────────────┼────────────────┘                 │
│                          │                                  │
│                    ┌─────▼─────┐                            │
│                    │  Payment  │                            │
│                    └───────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

## 聚合根

### User（用户）

```typescript
class User {
  readonly id: string;
  readonly email: string;
  readonly role: UserRole;
  readonly status: UserStatus;

  // 关联
  balance: UserBalance;
  apiKeys: ApiKey[];
  subscriptions: UserSubscription[];

  // 行为
  changeRole(role: UserRole): void;
  suspend(): void;
  activate(): void;
}
```

### Order（订单）

```typescript
class Order {
  readonly id: string;
  readonly orderNo: string;
  readonly userId: string;
  readonly amount: number;
  readonly status: OrderStatus;

  // 关联
  payment: Payment;

  // 行为
  markAsPaid(amount: number, method: PaymentMethod): void;
  markAsFailed(): void;
  cancel(): void;
  refund(amount: number): void;
}
```

### Channel（渠道）

```typescript
class Channel {
  readonly id: string;
  readonly providerId: string;
  readonly name: string;
  readonly status: ChannelStatus;

  // 关联
  models: ChannelModel[];

  // 行为
  enable(): void;
  disable(): void;
  updateWeight(weight: number): void;
  recordRequest(latency: number, success: boolean): void;
}
```

## 值对象

### TokenUsage

```typescript
class TokenUsage {
  constructor(
    readonly promptTokens: number,
    readonly completionTokens: number,
    readonly cachedTokens: number,
    readonly reasoningTokens: number,
  ) {}

  get totalTokens(): number {
    return this.promptTokens + this.completionTokens +
           this.cachedTokens + this.reasoningTokens;
  }
}
```

### Money

```typescript
class Money {
  constructor(
    readonly amount: number,  // 单位：分
    readonly currency: 'CNY' | 'USD',
  ) {}

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Currency mismatch');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Currency mismatch');
    }
    if (this.amount < other.amount) {
      throw new Error('Insufficient amount');
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  toYuan(): string {
    return (this.amount / 100).toFixed(2);
  }
}
```

### ApiKeyHash

```typescript
class ApiKeyHash {
  constructor(
    readonly hash: string,
    readonly prefix: string,
  ) {}

  static async create(rawKey: string): Promise<ApiKeyHash> {
    const hash = await argon2.hash(rawKey);
    const prefix = rawKey.substring(0, 16);
    return new ApiKeyHash(hash, prefix);
  }

  async verify(rawKey: string): Promise<boolean> {
    return argon2.verify(this.hash, rawKey);
  }
}
```

## 领域事件

### 用户事件

```typescript
class UserCreatedEvent {
  constructor(
    readonly userId: string,
    readonly email: string,
    readonly role: UserRole,
  ) {}
}

class UserSuspendedEvent {
  constructor(
    readonly userId: string,
    readonly reason: string,
  ) {}
}
```

### 订单事件

```typescript
class OrderCreatedEvent {
  constructor(
    readonly orderId: string,
    readonly orderNo: string,
    readonly userId: string,
    readonly amount: number,
  ) {}
}

class OrderPaidEvent {
  constructor(
    readonly orderId: string,
    readonly orderNo: string,
    readonly userId: string,
    readonly amount: number,
    readonly paymentMethod: PaymentMethod,
  ) {}
}

class OrderRefundedEvent {
  constructor(
    readonly orderId: string,
    readonly orderNo: string,
    readonly userId: string,
    readonly amount: number,
  ) {}
}
```

### 计费事件

```typescript
class BalanceDeductedEvent {
  constructor(
    readonly userId: string,
    readonly amount: number,
    readonly orderId: string,
    readonly modelId: string,
    readonly tokenUsage: TokenUsage,
  ) {}
}

class BalanceRechargedEvent {
  constructor(
    readonly userId: string,
    readonly amount: number,
    readonly orderId: string,
  ) {}
}
```

## 领域服务

### BillingDomainService

```typescript
class BillingDomainService {
  calculateCost(tokenUsage: TokenUsage, pricing: ModelPricing): Money {
    const inputCost = Math.ceil(
      (tokenUsage.promptTokens / 1_000_000) * pricing.inputPrice
    );
    const outputCost = Math.ceil(
      (tokenUsage.completionTokens / 1_000_000) * pricing.outputPrice
    );
    const cachedCost = Math.ceil(
      (tokenUsage.cachedTokens / 1_000_000) * (pricing.cachedPrice || 0)
    );
    const reasoningCost = Math.ceil(
      (tokenUsage.reasoningTokens / 1_000_000) * (pricing.reasoningPrice || 0)
    );

    const total = inputCost + outputCost + cachedCost + reasoningCost;
    return new Money(Math.ceil(total * pricing.multiplier), 'CNY');
  }
}
```

### ChannelDomainService

```typescript
class ChannelDomainService {
  selectChannel(channels: Channel[], strategy: SelectionStrategy): Channel {
    switch (strategy) {
      case 'weighted_round_robin':
        return this.weightedRoundRobin(channels);
      case 'lowest_latency':
        return this.lowestLatency(channels);
      case 'priority_weighted':
        return this.priorityWeighted(channels);
      default:
        throw new Error(`Unknown strategy: ${strategy}`);
    }
  }

  private weightedRoundRobin(channels: Channel[]): Channel {
    const totalWeight = channels.reduce((sum, c) => sum + c.weight, 0);
    let random = Math.random() * totalWeight;

    for (const channel of channels) {
      random -= channel.weight;
      if (random <= 0) return channel;
    }

    return channels[0];
  }
}
```

## 限界上下文

### 1. 用户上下文（User Context）

**职责**：用户注册、认证、授权、信息管理

**聚合根**：User

**实体**：User, UserBalance, UserSubscription

**值对象**：Email, Password, UserRole

**领域事件**：UserCreated, UserSuspended, UserActivated

### 2. API Key 上下文（ApiKey Context）

**职责**：API Key 创建、管理、验证

**聚合根**：ApiKey

**值对象**：ApiKeyHash, ApiKeyPrefix

**领域事件**：ApiKeyCreated, ApiKeyRevoked

### 3. 计费上下文（Billing Context）

**职责**：Token 计费、余额管理、交易流水

**聚合根**：UserBalance

**实体**：UserTransaction

**值对象**：Money, TokenUsage

**领域事件**：BalanceDeducted, BalanceRecharged

### 4. 订单上下文（Order Context）

**职责**：订单创建、支付、退款

**聚合根**：Order

**实体**：Payment

**值对象**：OrderNo, Money

**领域事件**：OrderCreated, OrderPaid, OrderRefunded

### 5. 支付上下文（Payment Context）

**职责**：支付渠道对接、回调处理

**实体**：WechatPayOrder, AlipayOrder

**领域事件**：PaymentCompleted, PaymentFailed

### 6. 网关上下文（Gateway Context）

**职责**：API 转发、协议兼容、流式响应

**聚合根**：Channel

**实体**：ChannelModel

**值对象**：ProviderConfig, ModelConfig

### 7. 模型上下文（Model Context）

**职责**：模型配置、定价管理

**聚合根**：Model

**实体**：ModelPricing

**领域事件**：ModelAdded, ModelPricingUpdated

### 8. 企业上下文（Organization Context）

**职责**：企业管理、团队管理、成员管理

**聚合根**：Organization

**实体**：OrganizationMember

**领域事件**：OrganizationCreated, MemberAdded

## 上下文映射

```
用户上下文 ──→ API Key 上下文 (客户-供应商)
用户上下文 ──→ 计费上下文 (客户-供应商)
用户上下文 ──→ 订单上下文 (客户-供应商)
订单上下文 ──→ 支付上下文 (客户-供应商)
计费上下文 ──→ 网关上下文 (客户-供应商)
网关上下文 ──→ 模型上下文 (客户-供应商)
企业上下文 ──→ 用户上下文 (客户-供应商)
```

## 实现指南

### 聚合根实现

```typescript
// 使用 Prisma 实现聚合根
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        balance: true,
        apiKeys: true,
        subscriptions: true,
      },
    });
  }

  async save(user: User): Promise<User> {
    return this.prisma.user.upsert({
      where: { id: user.id },
      update: user,
      create: user,
    });
  }
}
```

### 领域事件实现

```typescript
// 使用 NestJS EventEmitter
@Injectable()
export class UserDomainService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const user = await this.userRepo.create(dto);

    this.eventEmitter.emit(
      'user.created',
      new UserCreatedEvent(user.id, user.email, user.role),
    );

    return user;
  }
}

// 事件处理器
@Injectable()
export class UserEventHandler {
  @OnEvent('user.created')
  async handleUserCreated(event: UserCreatedEvent) {
    // 创建用户余额
    await this.billingService.createBalance(event.userId);
    // 发送欢迎邮件
    await this.emailService.sendWelcome(event.email);
  }
}
```
