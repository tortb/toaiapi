# 代理商系统 — PRD

## 状态：V6.0 计划中

## 功能清单

### 1. 代理商管理

| 功能 | 说明 |
|------|------|
| 申请成为代理商 | 提交申请，管理员审核 |
| 代理商等级 | 铜牌/银牌/金牌/钻石 |
| 代理商配额 | 批量充值，阶梯价格 |
| 代理商利润 | 设置加价比例 |

### 2. 客户管理

| 功能 | 说明 |
|------|------|
| 创建客户 | 代理商创建子账户 |
| 客户配额 | 为客户分配配额 |
| 客户定价 | 为客户设置价格 |
| 客户用量 | 查看客户用量统计 |

### 3. 多级分销

```
平台
  └── 一级代理商（加价 20%）
        └── 二级代理商（加价 15%）
              └── 终端用户（加价 10%）
```

### 4. 利润报表

- 代理商利润统计
- 客户用量排行
- 模型使用分布
- 月度/季度报表

## 数据库模型（待实现）

```prisma
model Reseller {
  id          String   @id @default(cuid())
  user_id     String   @unique
  level       String   @default("bronze")
  commission  Decimal  @default(0)   // 佣金比例
  markup      Decimal  @default(0)   // 加价比例
  parent_id   String?                // 上级代理商
  status      String   @default("active")
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  user     User       @relation(fields: [user_id], references: [id])
  parent   Reseller?  @relation("ResellerTree", fields: [parent_id], references: [id])
  children Reseller[] @relation("ResellerTree")
  customers ResellerCustomer[]

  @@map("resellers")
}

model ResellerCustomer {
  id           String   @id @default(cuid())
  reseller_id  String
  user_id      String   @unique
  markup       Decimal  @default(0)
  created_at   DateTime @default(now())

  reseller Reseller @relation(fields: [reseller_id], references: [id])
  user     User     @relation(fields: [user_id], references: [id])

  @@map("reseller_customers")
}
```
