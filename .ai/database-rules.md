# ToAIAPI Database Rules

## 核心原则

**数据库是项目的命脉，任何变更必须经过严格流程。**

## 禁止事项

1. 直接执行 `DROP TABLE`
2. 直接执行 `ALTER COLUMN`（破坏性变更）
3. 直接在代码中写 SQL（必须使用 Prisma）
4. 手动修改生产数据库
5. 在 Service 中直接拼接 SQL
6. 使用 `prisma.$queryRawUnsafe`

## 必须遵守

1. 所有数据库变更必须使用 **Prisma Migration**
2. Migration 必须经过评审
3. Migration 必须可回滚
4. 生产环境 Migration 必须有备份方案

## 数据库变更流程

```
需求分析
  ↓
设计 Schema 变更
  ↓
编写 Migration
  ↓
本地测试
  ↓
Code Review
  ↓
测试环境验证
  ↓
生产环境执行
```

## 表命名规范

### 统一使用 snake_case

```prisma
// ✅ 正确
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  created_at  DateTime @default(now())
}

model UserBalance {
  id      String @id @default(cuid())
  user_id String @unique
  amount  Int    @default(0)
}

model ApiKey {
  id         String   @id @default(cuid())
  user_id    String
  key_hash   String   @unique
  created_at DateTime @default(now())
}

// ❌ 禁止
model userData { }
model MyUser { }
model abc { }
```

### 表名规范

| 表名 | 说明 |
|------|------|
| users | 用户表 |
| user_balance | 用户余额 |
| user_transactions | 用户交易流水 |
| api_keys | API Key |
| model_pricing | 模型定价 |
| channels | 渠道 |
| channel_models | 渠道模型关联 |
| requests | 请求日志 |
| orders | 订单 |
| payments | 支付记录 |
| organizations | 企业 |
| organization_members | 企业成员 |
| subscriptions | 套餐订阅 |
| subscription_plans | 套餐计划 |

## 字段规范

### 通用字段

每个表必须包含：

```prisma
model Example {
  id         String   @id @default(cuid())
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  deleted_at DateTime? // 软删除
}
```

### ID 规范

```prisma
// ✅ 使用 cuid() 生成 ID
id String @id @default(cuid())

// ✅ 需要人类可读 ID 时使用前缀
// user_xxxxx, order_xxxxx, key_xxxxx

// ❌ 禁止自增 ID（安全性差）
id Int @id @default(autoincrement())
```

### 金额字段

```prisma
// ✅ 使用整数存储（单位：分）
amount Int @default(0)  // 100 = 1.00 元

// ❌ 禁止浮点数（精度问题）
amount Float @default(0)
amount Decimal @default(0) // 也不推荐
```

### 枚举字段

```prisma
// ✅ 使用 Prisma enum
enum UserRole {
  USER
  VIP
  ADMIN
  SUPER_ADMIN
}

enum OrderStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
  CANCELLED
}

model User {
  role UserRole @default(USER)
}
```

### 索引规范

```prisma
model User {
  email String @unique

  @@index([created_at])
  @@index([role])
}

model ApiKey {
  key_hash String @unique
  user_id  String

  @@index([user_id])
  @@index([user_id, is_active])
}

model Request {
  user_id    String
  model_id   String
  created_at DateTime

  @@index([user_id, created_at])
  @@index([model_id, created_at])
  @@index([created_at])
}
```

## 关系规范

```prisma
// ✅ 使用明确的外键关系
model User {
  id      String      @id @default(cuid())
  balance UserBalance?
  apiKeys ApiKey[]
  orders  Order[]
}

model UserBalance {
  id      String @id @default(cuid())
  user_id String @unique
  user    User   @relation(fields: [user_id], references: [id])
}

model ApiKey {
  id      String @id @default(cuid())
  user_id String
  user    User   @relation(fields: [user_id], references: [id])

  @@index([user_id])
}
```

## 查询规范

```typescript
// ✅ 使用 Prisma Client
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { balance: true },
});

// ✅ 分页查询
const users = await prisma.user.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { created_at: 'desc' },
});

// ✅ 事务操作
await prisma.$transaction([
  prisma.userBalance.update({
    where: { user_id: userId },
    data: { amount: { decrement: amount } },
  }),
  prisma.userTransaction.create({
    data: { user_id: userId, amount: -amount, type: 'DEDUCT' },
  }),
]);

// ❌ 禁止原始 SQL
await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE id = '${userId}'`);

// ❌ 禁止字符串拼接
await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE id = '${userId}'`);
```

## Migration 规范

### 创建 Migration

```bash
# 修改 prisma/schema.prisma 后
pnpm prisma migrate dev --name add_user_balance_table
```

### Migration 命名

```
add_user_balance_table
alter_api_key_add_expires_at
create_order_payment_tables
add_index_to_requests
```

### Migration 必须可回滚

```sql
-- Migration: add_user_balance_table
CREATE TABLE user_balance (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  amount INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Rollback (在 down migration 中)
DROP TABLE user_balance;
```

## 性能规范

### N+1 查询

```typescript
// ❌ N+1 查询
const users = await prisma.user.findMany();
for (const user of users) {
  const balance = await prisma.userBalance.findUnique({
    where: { user_id: user.id },
  });
}

// ✅ 使用 include
const users = await prisma.user.findMany({
  include: { balance: true },
});

// ✅ 使用批量查询
const userIds = users.map(u => u.id);
const balances = await prisma.userBalance.findMany({
  where: { user_id: { in: userIds } },
});
```

### 大量数据

```typescript
// ✅ 使用游标分页
const users = await prisma.user.findMany({
  take: 100,
  cursor: { id: lastUserId },
  skip: 1, // 跳过 cursor
});

// ✅ 使用 select 减少数据传输
const users = await prisma.user.findMany({
  select: { id: true, email: true },
});
```

## 数据安全

### 敏感数据加密

```typescript
// API Key 必须加密存储
model ApiKey {
  id        String @id @default(cuid())
  key_hash  String @unique  // bcrypt hash
  key_prefix String         // sk-toai-xxxx (前8位，用于展示)
}

// 密码必须加密
model User {
  password_hash String  // bcrypt/argon2
}
```

### 软删除

```prisma
model User {
  deleted_at DateTime?

  @@index([deleted_at])
}
```

```typescript
// 查询时过滤已删除
const users = await prisma.user.findMany({
  where: { deleted_at: null },
});
```
