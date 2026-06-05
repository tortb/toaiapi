# 03 Admin 数据库 Schema 设计

> 适用范围：`apps/backend/prisma/schema.prisma` / 配套：`02-rbac-design.md` / `04-api-spec.md`
> 版本：V1.0（2026-06-06） / DB：PostgreSQL 16 + Prisma 6

## 0. 文档目的

定义 ToAIAPI Admin 后台（用户/订单/模型/运营/安全/系统中心）及 RBAC 体系的**Schema 扩展方案**：

1. 一次性定义清楚所有数据模型、字段、索引、关系，Apply 阶段可直接生成 Prisma Migration。
2. 明确**与现有 `schema.prisma`（16 个 model）的 diff**，确保兼容、不破坏现有数据。
3. 给出**分阶段 Migration 计划**与回填策略，避免一次性大迁移的生产风险。
4. 给出**数据安全**与**索引策略**的统一规范。

## 1. 设计原则

- **兼容性（最高优先级）**：不破坏现有 16 个 model；所有新字段可空或带默认值；枚举值只能追加；主键仍为 `cuid()`。
- **命名规范**：表/字段 `snake_case`（`created_at` / `updated_at` / `deleted_at`）；关系 `camelCase`（`apiKeys` / `userRoles`）；枚举 `UPPER_SNAKE`。
- **通用字段**：`id String @id @default(cuid())` / `created_at @default(now())` / `updated_at @updatedAt` / `deleted_at DateTime?`（日志表除外）。
- **金额字段**：一律 `Int`（**分**），禁止 `Float` / `Decimal`。
- **软删除**：业务表用 `deleted_at`；日志表不设软删除（OperationLog / SecurityLog / LoginLog / RequestLog / SystemLog）。
- **外键策略**：

| 场景 | 策略 | 示例 |
|------|------|------|
| 业务强关联 | `onDelete: Cascade` | RolePermission 跟随 Role |
| 软删除关联 | `onDelete: SetNull` | Order.creator_id |
| 日志表高频写入 | **不设外键** | RequestLog / Bill / 5 张日志表 |
| 字典表必填 | `onDelete: Restrict` | User.group_id |

- **索引策略**：所有外键建索引；高频查询字段建索引；复合索引遵循"最左前缀"；列表查询的 `WHERE` + `ORDER BY` 字段建复合索引。

## 2. 现有表扩展（Diff 列表）

> **原则**：只新增可空/有默认值的字段，不修改、不删除任何现有字段。

### 2.1 User（用户表）

**现有字段（保留）**：`id, email, phone, password_hash, display_name, avatar_url, role, status, github_id, google_id, wechat_id, balance, apiKeys, subscriptions, orders, transactions, requestLogs, organization, organization_id, created_at, updated_at, deleted_at`

**新增字段**：

```prisma
username              String?   @unique  // 登录名（3-32 字符）
register_ip           String?              // 注册 IP
last_login_at         DateTime?            // 最后登录时间
last_login_ip         String?              // 最后登录 IP
last_login_user_agent String?              // 最后登录 UA
group_id              String?              // 用户组 ID
invite_code           String?              // 邀请码
invite_by             String?              // 邀请人 userId
real_name             String?              // 实名姓名（AES-256-GCM 加密）
id_card_hash          String?              // 身份证 hash（SHA-256 + 盐，不可逆）
enterprise_id         String?              // 企业 ID（冗余）
remark                String?              // 管理员备注
updated_password_at   DateTime?            // 密码最后修改时间
last_active_at        DateTime?            // 最后活跃时间
failed_login_count    Int        @default(0)  // 失败登录次数
locked_until          DateTime?            // 账号锁定到期

@@index([username])
@@index([register_ip])
@@index([last_login_at])
@@index([group_id])
@@index([enterprise_id])
@@index([invite_by])
@@index([last_active_at])
```

**反向关系新增**：`userRoles UserRole[]` / `group UserGroup?` / `invoices Invoice[]` / `tickets Ticket[]` / `inviteCodes InviteCode[] @relation("Inviter")`。**枚举**沿用 `UserRole { USER VIP ENTERPRISE AGENT ADMIN SUPER_ADMIN }` / `UserStatus { ACTIVE SUSPENDED BANNED }`。

---

### 2.2 ApiKey（API Key 表）

**现有字段（保留）**：`id, user_id, key_hash, key_prefix, name, is_active, expires_at, rate_limit, token_limit, model_limit, ip_whitelist, last_used_at, total_requests, created_at, updated_at`

**新增字段**：

```prisma
description    String?         // 备注
allowed_models String[] @default([])  // 允许的模型（覆盖 group；空=全部）
rpm            Int?            // RPM（null=继承 group）
tpm            Int?            // TPM（null=继承 group）
budget         Int?            // 总预算（分；null=无限制）
used_amount    Int      @default(0)  // 已使用金额（分）
group_id       String?         // 用户组（覆盖 user.group_id）
last_used_ip   String?         // 最后使用 IP
status         ApiKeyStatus @default(ACTIVE)  // 状态
total_tokens   BigInt   @default(0)  // 总 token 使用量
total_cost     Int      @default(0)  // 总费用（分）

@@index([status, expires_at])
@@index([group_id])
@@index([user_id, status])
```

**新增枚举**：`enum ApiKeyStatus { ACTIVE DISABLED EXPIRED REVOKED EXHAUSTED }`。> **兼容策略**：原 `is_active Boolean` 保留，新 `status` 与之并存（迁移期兼容），v2 可去除 `is_active`。

---

### 2.3 Order（订单表）

**现有字段（保留）**：`id, order_no, user_id, amount, paid_amount, payment_method, status, product_type, product_id, product_name, paid_at, expired_at, remark, payment, created_at, updated_at`

**新增字段**：

```prisma
type              OrderType   @default(RECHARGE)  // 订单类型（细分）
product_meta      Json?        // 产品快照 JSON
refunded_amount   Int         @default(0)  // 已退款金额（分）
gift_amount       Int         @default(0)  // 赠送金额（分）
creator_id        String?      // 人工创建的管理员 userId
admin_remark      String?      // 管理员备注
source            OrderSource @default(WEB)  // 渠道来源
group_id_snapshot String?      // 用户组快照

@@index([type, status])
@@index([creator_id])
@@index([source])
```

**新增枚举**：`enum OrderType { RECHARGE SUBSCRIPTION PACKAGE MANUAL GIFT REFUND }` / `enum OrderSource { WEB API ADMIN AGENT }`。**现有 `OrderStatus` 保持**（PENDING / PAID / FAILED / REFUNDED / CANCELLED）。**关系新增**：`Order.creator User? @relation("OrderCreator", fields: [creator_id], references: [id], onDelete: SetNull)` / `Order.rechargeRecord RechargeRecord?`。

---

### 2.4 RequestLog（请求日志表）

**现有字段（保留）**：`id, user_id, api_key_id, model_id, channel_id, request_path, request_method, prompt_tokens, completion_tokens, cached_tokens, reasoning_tokens, total_tokens, cost, status_code, latency_ms, created_at`

**新增字段**：

```prisma
error_code          String?       // 业务错误码
error_message       String?       // 错误信息
request_id          String?  @unique  // 请求 ID（UUID，gateway 端生成）
user_agent          String?       // User-Agent
ip                  String?       // 客户端 IP
region              String?       // 地域（如 "CN-Beijing-Beijing"）
is_stream           Boolean @default(false)  // 是否流式
response_bytes      Int?          // 响应大小（字节）
request_model       String?       // 模型原始名称
channel_status_code Int?          // 渠道原始状态

@@index([request_id])
@@index([status_code, created_at])
@@index([ip])
@@index([error_code, created_at])
@@index([user_id, model_id, created_at])
```

> **不设外键约束**（沿用现有设计）。

## 3. 新增表（RBAC 体系 — 8 张）

### 3.1 Role（角色表）

**内置 6 个角色**（`super_admin` / `admin` / `operator` / `finance` / `auditor` / `user`），由 seed 脚本创建，业务层不可删除 `is_builtin=true` 的角色。

```prisma
/// 角色表
/// 关联：users（多对多 via UserRole）、permissions（多对多 via RolePermission）
model Role {
  id          String   @id @default(cuid())
  code        String   @unique  // 角色编码（super_admin / admin / operator / finance / auditor / user）
  name        String             // 显示名（中文）
  description String?
  is_builtin  Boolean  @default(false)  // 内置角色不可删除、不可改 code
  is_active   Boolean  @default(true)
  sort        Int      @default(0)
  data_scope  DataScope @default(SELF)  // 数据权限范围

  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  deleted_at  DateTime?

  permissions RolePermission[]
  users       UserRole[]

  @@index([is_active])
  @@index([deleted_at])
  @@index([sort])
}

enum DataScope { ALL DEPARTMENT SELF }
```

### 3.2 Permission（权限点表）

`code` 采用 `资源:动作` 命名规范（如 `user:create` / `order:refund`）。

```prisma
/// 权限点表
/// 命名规范：{resource}:{action}
model Permission {
  id          String   @id @default(cuid())
  code        String   @unique  // 权限编码（全局唯一）
  name        String             // 显示名
  resource    String             // 资源域（user / order / model / channel / finance / system）
  action      String             // 操作（create / read / update / delete / export / import）
  type        PermissionType     // 权限类型
  module      String?            // 所属模块
  description String?
  sort        Int      @default(0)

  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  deleted_at  DateTime?

  roles       RolePermission[]

  @@index([resource, action])
  @@index([type, module])
  @@index([deleted_at])
}

enum PermissionType { MENU BTN API DATA }
```

### 3.3 RolePermission（角色-权限关联表）

```prisma
/// 角色-权限关联表（多对多）
/// 强关联：删除角色或权限时级联删除
model RolePermission {
  id            String     @id @default(cuid())
  role_id       String
  role          Role       @relation(fields: [role_id], references: [id], onDelete: Cascade)
  permission_id String
  permission    Permission @relation(fields: [permission_id], references: [id], onDelete: Cascade)
  granted_at    DateTime   @default(now())  // 授权时间
  granted_by    String?                    // 授权人 userId

  @@unique([role_id, permission_id])
  @@index([permission_id])
}
```

### 3.4 UserRole（用户-角色关联表）

```prisma
/// 用户-角色关联表（多对多）
model UserRole {
  id          String   @id @default(cuid())
  user_id     String
  user        User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  role_id     String
  role        Role     @relation(fields: [role_id], references: [id], onDelete: Restrict)
  granted_at  DateTime @default(now())  // 授权时间
  granted_by  String?                    // 授权人 userId
  expires_at  DateTime?                  // 过期时间（null=永久）

  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  deleted_at  DateTime?

  @@unique([user_id, role_id])
  @@index([role_id])
  @@index([user_id, deleted_at])
}
```

### 3.5 Menu（菜单表）

`code` 与 `Permission.code` 对应；`parent_id` 自引用实现多级菜单。

```prisma
/// 菜单表
model Menu {
  id          String   @id @default(cuid())
  code        String   @unique  // 菜单编码（与 Permission.code 一致）
  name        String             // 菜单名称
  path        String?            // 前端路由路径
  component   String?            // 前端组件路径
  icon        String?            // 图标
  parent_id   String?            // 父菜单 ID
  parent      Menu?    @relation("MenuTree", fields: [parent_id], references: [id], onDelete: SetNull)
  children    Menu[]   @relation("MenuTree")
  sort        Int      @default(0)
  is_visible  Boolean  @default(true)
  is_active   Boolean  @default(true)
  is_external Boolean  @default(false)
  permission  String?  // 权限标识
  type        MenuType @default(MENU)

  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  deleted_at  DateTime?

  @@index([parent_id, sort])
  @@index([is_active, is_visible])
  @@index([deleted_at])
}

enum MenuType { DIR MENU BUTTON }
```

### 3.6 OperationLog（操作日志表）

**不设外键**（高频写入避免锁竞争）；**不设 `updated_at`**（append-only）。

```prisma
/// 操作日志表 / SECURITY: 不设外键
model OperationLog {
  id            String   @id @default(cuid())
  user_id       String               // 操作人 userId
  user_email    String?              // 操作人邮箱（冗余）
  ip            String?              // 操作人 IP
  module        String               // 模块
  action        String               // 动作
  resource      String               // 对象类型
  resource_id   String?              // 对象 ID
  description   String?              // 描述
  method        String?              // 请求方法
  path          String?              // 请求路径
  request_data  Json?                // 请求参数（脱敏）
  response_data Json?                // 响应结果（截断 4KB）
  status        OperationStatus @default(SUCCESS)
  error         String?
  duration_ms   Int?                 // 耗时（毫秒）

  created_at    DateTime @default(now())

  @@index([user_id, created_at])
  @@index([module, action, created_at])
  @@index([resource, resource_id])
  @@index([created_at])
}

enum OperationStatus { SUCCESS FAILURE }
```

### 3.7 SecurityLog（安全日志表）

```prisma
/// 安全日志表
model SecurityLog {
  id          String   @id @default(cuid())
  event       String                          // 事件类型
  level       SecurityLevel @default(INFO)
  user_id     String?
  user_email  String?
  ip          String?                         // 客户端 IP
  user_agent  String?
  region      String?
  metadata    Json?                           // 事件详情
  status      SecurityStatus @default(PENDING) // 处理状态
  handled_by  String?
  handled_at  DateTime?
  remark      String?

  created_at  DateTime @default(now())

  @@index([event, created_at])
  @@index([user_id, created_at])
  @@index([level, status])
  @@index([ip, created_at])
}

enum SecurityLevel { INFO WARN CRITICAL }
enum SecurityStatus { PENDING RESOLVED IGNORED }
```

### 3.8 LoginLog（登录日志表）

```prisma
/// 登录日志表
model LoginLog {
  id          String   @id @default(cuid())
  method      LoginMethod
  identifier  String             // 登录标识
  user_id     String?            // 登录成功的 userId
  ip          String?
  user_agent  String?
  region      String?
  success     Boolean
  fail_reason String?            // 失败原因
  device_id   String?            // 设备指纹

  created_at  DateTime @default(now())

  @@index([user_id, created_at])
  @@index([identifier, created_at])
  @@index([ip, created_at])
  @@index([success, created_at])
  @@index([created_at])
}

enum LoginMethod { PASSWORD EMAIL_CODE PHONE_CODE OAUTH_GITHUB OAUTH_GOOGLE OAUTH_WECHAT SSO API_KEY }
```

## 4. 新增表（业务扩展 — 10 张）

### 4.1 UserGroup（用户分组）

**6 个内置组**（`free` / `vip` / `enterprise` / `agent_lv1` / `agent_lv2` / `admin`）。

```prisma
/// 用户分组表
/// 内置 6 个组：free / vip / enterprise / agent_lv1 / agent_lv2 / admin
model UserGroup {
  id               String   @id @default(cuid())
  code             String   @unique
  name             String
  description      String?
  is_builtin       Boolean  @default(false)
  is_active        Boolean  @default(true)
  sort             Int      @default(0)
  rpm              Int?             // 每分钟请求数
  tpm              Int?             // 每分钟 token 数
  allowed_models   String[] @default([])
  allowed_channels String[] @default([])
  max_keys         Int      @default(5)
  price_multiplier Decimal  @default(1.0) @db.Decimal(4, 2)
  is_agent_enabled Boolean  @default(false)
  is_default       Boolean  @default(false)
  daily_free_quota Int?             // 每日免费额度（分）

  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt
  deleted_at       DateTime?

  users            User[]

  @@index([is_active])
  @@index([is_default])
  @@index([deleted_at])
}
```

### 4.2 RechargeRecord（充值记录表）

```prisma
/// 充值记录表（与 Order 1:1 关联）
model RechargeRecord {
  id              String   @id @default(cuid())
  user_id         String
  order_id        String   @unique
  order           Order    @relation(fields: [order_id], references: [id], onDelete: Cascade)
  amount          Int             // 实际支付金额（分）
  gift_amount     Int      @default(0)
  payment_method  PaymentMethod
  trade_no        String?         // 第三方支付流水号
  status          RechargeStatus @default(PENDING)
  paid_at         DateTime?
  refunded_at     DateTime?
  refund_amount   Int?
  channel         String?         // 充值渠道（alipay_pc / wechat_h5 / stripe）
  client_ip       String?
  remark          String?

  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  @@index([user_id, created_at])
  @@index([status, created_at])
  @@index([trade_no])
}

enum RechargeStatus { PENDING SUCCESS FAILED REFUNDED }
```

### 4.3 Bill（账单表）

按请求粒度的计费明细，**财务对账的唯一依据**。**不设外键**（高频写入避免锁竞争）。

```prisma
/// 账单表
model Bill {
  id                String   @id @default(cuid())
  bill_no           String   @unique  // 账单号（BILL-yyyyMMdd-xxxxxx）
  user_id           String
  request_log_id    String   @unique
  model_id          String
  channel_id        String
  api_key_id        String
  prompt_tokens     Int
  completion_tokens Int
  cached_tokens     Int      @default(0)
  reasoning_tokens  Int      @default(0)
  total_tokens      Int
  cost              Int              // 成本（分；渠道底价）
  price             Int              // 标准售价（分；model_pricing × group 倍率）
  profit            Int              // 利润
  group_id          String?
  group_multiplier  Decimal? @db.Decimal(4, 2)
  bill_date         DateTime @db.Date  // 账单归属日

  created_at        DateTime @default(now())

  @@index([user_id, bill_date])
  @@index([model_id, bill_date])
  @@index([channel_id, bill_date])
  @@index([api_key_id, created_at])
  @@index([bill_date])
  @@index([group_id, bill_date])
}
```

### 4.4 Invoice（发票表）

```prisma
/// 发票表
model Invoice {
  id              String   @id @default(cuid())
  invoice_no      String   @unique
  user_id         String
  user            User     @relation(fields: [user_id], references: [id], onDelete: Restrict)
  bill_ids        Json             // 关联的 Bill ID 列表
  type            InvoiceType
  company_name    String?
  tax_id          String?
  company_address String?
  company_phone   String?
  bank_name       String?
  bank_account    String?          // 银行账号（加密）
  amount          Int              // 发票金额（分）
  content         String           // 发票内容
  status          InvoiceStatus @default(PENDING)
  applicant_email String
  applicant_phone String?
  mailing_address String?
  file_url        String?          // 发票 PDF/图片 URL
  applied_at      DateTime @default(now())
  reviewed_at     DateTime?
  reviewed_by     String?
  review_remark   String?
  issued_at       DateTime?

  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
  deleted_at      DateTime?

  @@index([user_id, status])
  @@index([status, applied_at])
  @@index([reviewed_by])
  @@index([deleted_at])
}

enum InvoiceType { COMPANY PERSONAL }
enum InvoiceStatus { PENDING APPROVED REJECTED ISSUED CANCELLED }
```

### 4.5 Announcement（公告表）

```prisma
/// 公告表
model Announcement {
  id           String   @id @default(cuid())
  title        String
  content      String             // Markdown
  type         AnnouncementType @default(SITE)
  is_top       Boolean  @default(false)
  is_active    Boolean  @default(true)
  position     AnnouncementPosition @default(ALL)
  published_at DateTime?
  expires_at   DateTime?
  link_url     String?
  created_by   String?

  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt
  deleted_at   DateTime?

  @@index([is_active, published_at])
  @@index([type, position])
  @@index([deleted_at])
}

enum AnnouncementType { SITE MAINTENANCE ACTIVITY BANNER }
enum AnnouncementPosition { HOME DASHBOARD RECHARGE LOGIN ALL }
```

### 4.6 Ticket（工单表） + TicketReply（工单回复表）

```prisma
/// 工单表
model Ticket {
  id              String   @id @default(cuid())
  no              String   @unique
  user_id         String
  user            User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  title           String
  content         String
  type            TicketType
  status          TicketStatus @default(OPEN)
  priority        TicketPriority @default(NORMAL)
  assigned_to     String?
  tags            Json?
  attachments     Json?
  closed_at       DateTime?
  rating          Int?            // 1-5 星
  rating_comment  String?

  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
  deleted_at      DateTime?

  replies         TicketReply[]

  @@index([user_id, status])
  @@index([status, priority, created_at])
  @@index([assigned_to, status])
  @@index([deleted_at])
}

enum TicketType { ACCOUNT BILLING TECHNICAL BUG OTHER }
enum TicketStatus { OPEN REPLIED WAITING RESOLVED CLOSED }
enum TicketPriority { LOW NORMAL HIGH URGENT }

/// 工单回复表
model TicketReply {
  id          String   @id @default(cuid())
  ticket_id   String
  ticket      Ticket   @relation(fields: [ticket_id], references: [id], onDelete: Cascade)
  user_id     String
  is_staff    Boolean  @default(false)
  content     String
  attachments Json?

  created_at  DateTime @default(now())

  @@index([ticket_id, created_at])
  @@index([user_id])
}
```

### 4.7 InviteCode（邀请码表）

```prisma
/// 邀请码表
model InviteCode {
  id              String   @id @default(cuid())
  code            String   @unique  // 8-16 位
  inviter_id      String
  inviter         User     @relation("Inviter", fields: [inviter_id], references: [id], onDelete: Cascade)
  invitee_id      String?
  reward_amount   Int      @default(0)  // 邀请人奖励（分）
  reward_gift     Int      @default(0)  // 被邀请人奖励（分）
  status          InviteCodeStatus @default(UNUSED)
  max_uses        Int      @default(1)
  used_count      Int      @default(0)
  expires_at      DateTime?
  used_at         DateTime?
  remark          String?

  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
  deleted_at      DateTime?

  @@index([inviter_id, status])
  @@index([invitee_id])
  @@index([status, expires_at])
  @@index([deleted_at])
}

enum InviteCodeStatus { UNUSED USED EXPIRED DISABLED }
```

### 4.8 Blacklist（黑名单表）

```prisma
/// 黑名单表
model Blacklist {
  id          String   @id @default(cuid())
  type        BlacklistType
  value       String
  reason      String
  expires_at  DateTime?
  created_by  String?
  status      BlacklistStatus @default(ACTIVE)
  lifted_at   DateTime?
  lifted_by   String?
  lift_reason String?

  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  deleted_at  DateTime?

  @@unique([type, value, status])  // 数据库层防重
  @@index([type, status])
  @@index([expires_at])
  @@index([deleted_at])
}

enum BlacklistType { USER EMAIL PHONE IP DEVICE CARD }
enum BlacklistStatus { ACTIVE LIFTED }
```

### 4.9 IpRule（IP 规则表）

```prisma
/// IP 规则表
model IpRule {
  id          String   @id @default(cuid())
  ip_range    String             // IP 或 CIDR
  type        IpRuleType
  rate_limit  Int?               // RATE_LIMIT 时生效
  reason      String?
  action      IpRuleAction @default(BLOCK)
  expires_at  DateTime?
  created_by  String?
  hit_count   Int      @default(0)
  last_hit_at DateTime?
  is_active   Boolean  @default(true)

  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  deleted_at  DateTime?

  @@index([type, is_active])
  @@index([ip_range])
  @@index([expires_at])
  @@index([deleted_at])
}

enum IpRuleType { ALLOW DENY RATE_LIMIT }
enum IpRuleAction { LOG BLOCK CHALLENGE }
```

## 5. 新增表（系统设置与日志 — 2 张）

### 5.1 SystemConfig（系统设置表）

```prisma
/// 系统设置表
model SystemConfig {
  id          String   @id @default(cuid())
  key         String   @unique
  value       String             // JSON 序列化字符串
  type        ConfigValueType @default(STRING)
  group       String             // SITE / REGISTER / PAYMENT / SMTP / SECURITY / FEATURE / AI / OTHER
  description String?
  is_hot      Boolean  @default(false)  // 运行时热更新
  is_public   Boolean  @default(false)  // 前端可读
  updated_by  String?

  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  @@index([group])
  @@index([is_hot])
}

enum ConfigValueType { STRING NUMBER BOOLEAN JSON }
```

### 5.2 SystemLog（系统日志表）

```prisma
/// 系统日志表
model SystemLog {
  id          String   @id @default(cuid())
  level       LogLevel
  module      String
  message     String
  metadata    Json?
  request_id  String?            // 关联请求 ID
  user_id     String?
  stack       String?            // 堆栈（仅 ERROR）

  created_at  DateTime @default(now())

  @@index([level, created_at])
  @@index([module, created_at])
  @@index([request_id])
  @@index([user_id, created_at])
}

enum LogLevel { DEBUG INFO WARN ERROR FATAL }
```

## 6. 索引策略汇总表

| 表 | 关键索引 | 用途 |
|----|----------|------|
| `users` | `username` UQ / `(register_ip)` / `(last_login_at)` / `(group_id)` | 用户名登录 / 黑名单 / 活跃统计 / 分组筛选 |
| `api_keys` | `(status, expires_at)` / `(user_id, status)` | 清理过期 / 我的 API Key |
| `orders` | `(user_id, created_at)` / `(type, status)` / `(creator_id)` | 用户订单 / 类型筛选 / 人工订单 |
| `request_logs` | `request_id` UQ / `(status_code, created_at)` / `(ip)` / `(error_code, created_at)` / `(user_id, model_id, created_at)` | 端到端追踪 / 错误率 / IP 维度 / 错误分类 / 用户模型统计 |
| `roles` / `permissions` | `code` UQ | 角色/权限编码 |
| `role_permissions` / `user_roles` | 复合 UQ | 防重 |
| `menus` | `code` UQ / `(parent_id, sort)` | 菜单树 |
| `operation_logs` | `(user_id, created_at)` / `(module, action, created_at)` / `(resource, resource_id)` | 操作审计 / 行为分析 / 对象变更 |
| `security_logs` | `(event, created_at)` / `(level, status)` | 事件统计 / 待处理高危 |
| `login_logs` | `(user_id, created_at)` / `(identifier, created_at)` / `(ip, created_at)` / `(success, created_at)` | 用户历史 / 失败重试 / IP 维度 |
| `user_groups` | `code` UQ / `(is_default)` | 分组编码 / 默认组 |
| `recharge_records` | `(user_id, created_at)` / `trade_no` | 充值历史 / 第三方对账 |
| `bills` | `bill_no` UQ / `(user_id, bill_date)` / `(model_id, bill_date)` / `(channel_id, bill_date)` / `(bill_date)` | 账单号 / 用户日账单 / 模型收入 / 渠道成本 / 全局日账单 |
| `invoices` | `invoice_no` UQ / `(user_id, status)` / `(status, applied_at)` | 发票号 / 用户发票 / 待审核 |
| `announcements` | `(is_active, published_at)` / `(type, position)` | 公告展示 / 类型位置 |
| `tickets` | `no` UQ / `(user_id, status)` / `(assigned_to, status)` | 工单号 / 用户工单 / 处理人 |
| `ticket_replies` | `(ticket_id, created_at)` | 工单回复 |
| `invite_codes` | `code` UQ / `(inviter_id, status)` | 邀请码 / 代理邀请 |
| `blacklists` | `(type, value, status)` UQ | 防重 |
| `ip_rules` | `ip_range` / `(type, is_active)` | IP 查询 / 规则筛选 |
| `system_configs` | `key` UQ / `(group)` | 配置键 / 分组 |
| `system_logs` | `(level, created_at)` / `(module, created_at)` / `request_id` | 错误监控 / 模块 / 链路追踪 |

## 7. 外键与级联策略

| 关系 | 策略 | 原因 |
|------|------|------|
| `UserRole.user` | `onDelete: Cascade` | 用户删除时清理角色关联 |
| `UserRole.role` | `onDelete: Restrict` | 不允许删除被引用的角色 |
| `RolePermission.role` / `permission` | `onDelete: Cascade` | 角色/权限删除时清理关联 |
| `Menu.parent` | `onDelete: SetNull` | 父菜单删除时子菜单升级为顶级 |
| `User.invoices` | `onDelete: Restrict` | 有发票的用户不可硬删除 |
| `User.tickets` | `onDelete: Cascade` | 工单跟随用户 |
| `Ticket.ticketReplies` | `onDelete: Cascade` | 工单删除时回复跟随 |
| `Order.rechargeRecord` | `onDelete: Cascade` | 订单删除时充值记录跟随 |
| `User.group` | `onDelete: Restrict` | 不允许删除被引用的分组 |
| `OperationLog / SecurityLog / LoginLog / RequestLog / SystemLog / Bill` | **不设外键** | 高频写入，外键导致锁竞争 |

## 8. 与现有 schema.prisma 的完整 diff

### 8.1 新增表（共 20 张）

| # | 模型 | 表名 | 模块 |
|---|------|------|------|
| 1 | `Role` | `roles` | RBAC |
| 2 | `Permission` | `permissions` | RBAC |
| 3 | `RolePermission` | `role_permissions` | RBAC |
| 4 | `UserRole` | `user_roles` | RBAC |
| 5 | `Menu` | `menus` | RBAC |
| 6 | `OperationLog` | `operation_logs` | 安全中心 |
| 7 | `SecurityLog` | `security_logs` | 安全中心 |
| 8 | `LoginLog` | `login_logs` | 安全中心 |
| 9 | `UserGroup` | `user_groups` | 用户中心 |
| 10 | `RechargeRecord` | `recharge_records` | 订单中心 |
| 11 | `Bill` | `bills` | 订单中心 |
| 12 | `Invoice` | `invoices` | 订单中心 |
| 13 | `Announcement` | `announcements` | 运营中心 |
| 14 | `Ticket` | `tickets` | 运营中心 |
| 15 | `TicketReply` | `ticket_replies` | 运营中心 |
| 16 | `InviteCode` | `invite_codes` | 用户中心 |
| 17 | `Blacklist` | `blacklists` | 安全中心 |
| 18 | `IpRule` | `ip_rules` | 安全中心 |
| 19 | `SystemConfig` | `system_configs` | 系统中心 |
| 20 | `SystemLog` | `system_logs` | 系统中心 |

> 规范要求 11 张核心新增表，**新增总计 20 张**（含 RBAC 4 张、3 张日志表、与 `Ticket` 强耦合的 `TicketReply`）。

### 8.2 现有表扩展（4 张）

| 表 | 新增字段 | 新增索引 | 新增枚举 |
|----|----------|----------|----------|
| `User` | 15 | 7 | 0（沿用） |
| `ApiKey` | 11 | 3 | 1（`ApiKeyStatus`） |
| `Order` | 7 | 3 | 2（`OrderType` / `OrderSource`） |
| `RequestLog` | 10 | 5 | 0（沿用） |
| **合计** | **43** | **18** | **3** |

### 8.3 新增枚举（共 25 个）

```prisma
// 扩展表挂钩（3）
enum ApiKeyStatus { ACTIVE DISABLED EXPIRED REVOKED EXHAUSTED }
enum OrderType { RECHARGE SUBSCRIPTION PACKAGE MANUAL GIFT REFUND }
enum OrderSource { WEB API ADMIN AGENT }

// RBAC（7）
enum DataScope { ALL DEPARTMENT SELF }
enum PermissionType { MENU BTN API DATA }
enum MenuType { DIR MENU BUTTON }
enum OperationStatus { SUCCESS FAILURE }
enum SecurityLevel { INFO WARN CRITICAL }
enum SecurityStatus { PENDING RESOLVED IGNORED }
enum LoginMethod { PASSWORD EMAIL_CODE PHONE_CODE OAUTH_GITHUB OAUTH_GOOGLE OAUTH_WECHAT SSO API_KEY }

// 业务（13）
enum RechargeStatus { PENDING SUCCESS FAILED REFUNDED }
enum InvoiceType { COMPANY PERSONAL }
enum InvoiceStatus { PENDING APPROVED REJECTED ISSUED CANCELLED }
enum AnnouncementType { SITE MAINTENANCE ACTIVITY BANNER }
enum AnnouncementPosition { HOME DASHBOARD RECHARGE LOGIN ALL }
enum TicketType { ACCOUNT BILLING TECHNICAL BUG OTHER }
enum TicketStatus { OPEN REPLIED WAITING RESOLVED CLOSED }
enum TicketPriority { LOW NORMAL HIGH URGENT }
enum InviteCodeStatus { UNUSED USED EXPIRED DISABLED }
enum BlacklistType { USER EMAIL PHONE IP DEVICE CARD }
enum BlacklistStatus { ACTIVE LIFTED }
enum IpRuleType { ALLOW DENY RATE_LIMIT }
enum IpRuleAction { LOG BLOCK CHALLENGE }

// 系统（2）
enum ConfigValueType { STRING NUMBER BOOLEAN JSON }
enum LogLevel { DEBUG INFO WARN ERROR FATAL }
```

### 8.4 兼容性保证

- 现有 16 个 model **零字段删除、零字段重命名、零类型变更**。
- 所有新字段均可空或带默认值，旧数据可平滑回填。
- 现有 `User.is_active` / `ApiKey.is_active` 等 Boolean 字段保留，新枚举与之并存（迁移期兼容）。
- 现有外键约束零修改；仅在 User model 增补反向关系字段（不影响数据）。

## 9. 分阶段 Migration 计划

> **原则**：阶段越小越安全，阶段间可独立回滚。

### 阶段 1：RBAC 体系（**最优先**，P0）

**目标**：解决 `/admin` 无鉴权漏洞，建立权限基础设施。

```
20260606_010000_add_rbac_baseline/
20260606_010100_seed_builtin_roles_permissions/
```

**包含**：8 张表（Role / Permission / RolePermission / UserRole / Menu / OperationLog / SecurityLog / LoginLog）+ 7 个枚举 + User model `userRoles` 反向关系 + Seed 脚本（6 角色 + 100+ 权限 + 完整菜单树 + super_admin 默认账号）。

**回滚**：

```sql
DROP TABLE IF EXISTS "user_roles" CASCADE;
DROP TABLE IF EXISTS "role_permissions" CASCADE;
DROP TABLE IF EXISTS "menus" CASCADE;
DROP TABLE IF EXISTS "operation_logs" CASCADE;
DROP TABLE IF EXISTS "security_logs" CASCADE;
DROP TABLE IF EXISTS "login_logs" CASCADE;
DROP TABLE IF EXISTS "permissions" CASCADE;
DROP TABLE IF EXISTS "roles" CASCADE;
DROP TYPE IF EXISTS "DataScope";
DROP TYPE IF EXISTS "PermissionType";
DROP TYPE IF EXISTS "MenuType";
DROP TYPE IF EXISTS "OperationStatus";
DROP TYPE IF EXISTS "SecurityLevel";
DROP TYPE IF EXISTS "SecurityStatus";
DROP TYPE IF EXISTS "LoginMethod";
```

### 阶段 2：用户与 API Key 扩展（P0）

```
20260613_020000_add_user_apikey_extensions/
20260613_020100_seed_user_groups/
```

**包含**：1 张新表（UserGroup）+ 1 个枚举（ApiKeyStatus）+ User/ApiKey 字段扩展 + Seed（6 个内置用户组）。

### 阶段 3：订单与账单扩展（P1）

```
20260620_030000_add_order_billing_extensions/
```

**包含**：2 张新表（RechargeRecord / Bill）+ 3 个枚举（OrderType / OrderSource / RechargeStatus）+ Order/RequestLog 字段扩展。

### 阶段 4：业务新增表（P1）

```
20260627_040000_add_business_tables/
```

**包含**：5 张新表（Invoice / Announcement / Ticket / TicketReply / InviteCode）+ 8 个枚举 + User model 反向关系。

### 阶段 5：系统设置与日志（P2）

```
20260704_050000_add_system_config_and_logs/
```

**包含**：4 张新表（Blacklist / IpRule / SystemConfig / SystemLog）+ 6 个枚举 + Seed（50+ 基础系统配置项）。

## 10. 数据迁移与回填

### 10.1 新建表

20 张新表创建后**无需历史数据回填**。

### 10.2 User model 字段回填（阶段 2 migration 内执行）

```sql
-- 1. username 从 email 提取（cuid 前 6 位避免冲突）
UPDATE users
SET username = split_part(email, '@', 1) || '_' || substr(id, 1, 6)
WHERE username IS NULL;

-- 2. group_id 设为 free 组
UPDATE users
SET group_id = (SELECT id FROM user_groups WHERE code = 'free' LIMIT 1)
WHERE group_id IS NULL;
```

| 字段 | 策略 |
|------|------|
| `register_ip` / `last_login_at` / `last_login_ip` | 无法回填，保持 `NULL` |
| `invite_code` / `invite_by` / `real_name` / `id_card_hash` / `enterprise_id` / `remark` / `updated_password_at` / `last_active_at` / `failed_login_count` / `locked_until` | 全部保持 `NULL`，按业务自然生成 |

### 10.3 ApiKey 字段回填

| 字段 | 策略 |
|------|------|
| `description` / `rpm` / `tpm` / `budget` / `last_used_ip` | 保持 `NULL` |
| `allowed_models` | 默认 `[]` |
| `used_amount` / `total_tokens` / `total_cost` | 默认 `0` |
| `ip_whitelist` | 复制现有字段值（已存在） |
| `status` | 推断：`ACTIVE` if `is_active=true`; `DISABLED` if `is_active=false`; `EXPIRED` if `expires_at < NOW()` |

### 10.4 Order 字段回填

| 字段 | 策略 |
|------|------|
| `type` | 推断：`RECHARGE` if `product_type='recharge'` else `SUBSCRIPTION` if `product_type='subscription'` else `PACKAGE` |
| `product_meta` / `creator_id` / `admin_remark` / `group_id_snapshot` | 保持 `NULL` |
| `refunded_amount` / `gift_amount` | 默认 `0` |
| `source` | 默认 `WEB` |

### 10.5 RequestLog 字段回填

所有新增字段（`error_code` / `error_message` / `request_id` / `user_agent` / `ip` / `region` / `is_stream` / `response_bytes` / `request_model` / `channel_status_code`）保持 `NULL`，新数据自然填充。

### 10.6 super_admin 启动保护

在 `bootstrap.ts` 中实现：

```typescript
// 启动时检查 super_admin 是否存在；不存在则：
// 1. 创建系统账号 super@toaiapi.local
// 2. 密码随机生成并打印到启动日志（生产环境从环境变量读取）
// 3. 分配 super_admin 角色
// 4. 发送 webhook 通知运维
```

> **风险缓解**：防止 RBAC 误配置锁死管理员（参考 Spec 中"必须保留 super_admin 内置账号 + 启动时自动修复脚本"）。

### 10.7 Seed 文件清单

| Seed 内容 | 文件 | 阶段 |
|-----------|------|------|
| 6 个内置角色 | `prisma/seed/roles.ts` | 1 |
| 100+ 权限点 | `prisma/seed/permissions.ts` | 1 |
| 完整菜单树 | `prisma/seed/menus.ts` | 1 |
| super_admin 默认账号 | `prisma/seed/super-admin.ts` | 1 |
| 6 个内置用户组 | `prisma/seed/user-groups.ts` | 2 |
| 50+ 基础系统配置 | `prisma/seed/system-configs.ts` | 5 |

## 11. 数据安全

### 11.1 必须加密字段

| 字段 | 表 | 加密方式 | 密钥管理 |
|------|----|----------|----------|
| `password_hash` | `users` | Argon2id（不可逆） | 框架内置 |
| `key_hash` | `api_keys` | Argon2id（不可逆） | 框架内置 |
| `api_key` | `channels` | AES-256-GCM | KMS / env `CHANNEL_KEY_ENCRYPTION_KEY` |
| `merchant_key` / `merchant_secret` | `payment_configs` | AES-256-GCM | KMS / env `PAYMENT_KEY_ENCRYPTION_KEY` |
| `password` | `smtp_configs` | AES-256-GCM | KMS / env `SMTP_KEY_ENCRYPTION_KEY` |
| `id_card_hash` | `users` | SHA-256 + 盐 | env `ID_CARD_SALT`（不可逆） |
| `real_name` | `users` | AES-256-GCM | KMS / env `PII_ENCRYPTION_KEY` |
| `bank_account` | `invoices` | AES-256-GCM | KMS / env `PII_ENCRYPTION_KEY` |

### 11.2 必须脱敏字段（API 响应层）

| 字段 | 脱敏规则 | 示例 |
|------|----------|------|
| `phone` | 中间 4 位 `*` | `138****1234` |
| `email` | `@` 前保留首字符 | `a***@example.com` |
| `id_card` | 不返回（仅 hash） | — |
| `real_name` | 姓 + `*` | `张*` |
| `password_hash` / `key_hash` | 不返回 | — |
| `api_key` | 前 8 位 + `***` | `sk-toai***` |
| `bank_account` | 仅后 4 位 | `****1234` |
| `ip` | 日志可读，列表脱敏 | `192.168.***.***` |

**脱敏实现位置**：

- **列表接口**（`GET /admin/users`）：Service 层 `serializeUser()` 统一处理。
- **详情接口**（`GET /admin/users/:id`）：返回完整字段，前端按角色控制显示。
- **导出接口**（`GET /admin/users/export`）：需 `user:export` 权限，导出完整字段。
- **审计日志**：记录**脱敏后**的值（防止日志成为泄露源）。

### 11.3 访问控制

- **字段级权限**：`real_name` / `id_card_hash` / `bank_account` 仅 `super_admin` / `finance` 角色可读（`@FieldPermission` 装饰器）。
- **行级权限**：`data_scope = SELF` 的管理员只能看自己创建的工单/订单（应用层过滤）。
- **操作权限**：所有写操作必须经过 `OperationLog` 记录。

### 11.4 审计追溯

| 操作 | 必须记录到 | 保留期 |
|------|-----------|--------|
| 用户登录/登出 | `LoginLog` | 180 天 |
| 管理员登录 | `LoginLog` + `OperationLog` | 永久 |
| 管理员增删改 | `OperationLog` | 永久 |
| 充值/退款/调账 | `OperationLog` + `Bill` | 永久 |
| 余额变动 | `UserTransaction`（已有） | 永久 |
| 黑名单变更 | `OperationLog` | 永久 |
| 系统配置变更 | `OperationLog` + `SystemConfig.updated_by` | 永久 |
| 安全事件 | `SecurityLog` | 365 天 |

## 12. 附录：Prisma Schema 合并顺序

将本设计应用到 `apps/backend/prisma/schema.prisma` 时按以下顺序（最小化冲突）：

1. **保留** `generator` / `datasource` 块（顶部）。
2. **追加** 新增枚举（按字母序）：ApiKeyStatus → BlacklistStatus → BlacklistType → ConfigValueType → DataScope → InvoiceStatus → InvoiceType → IpRuleAction → IpRuleType → LogLevel → LoginMethod → MenuType → OperationStatus → OrderSource → OrderType → PermissionType → RechargeStatus → SecurityLevel → SecurityStatus → TicketPriority → TicketStatus → TicketType → AnnouncementPosition → AnnouncementType → InviteCodeStatus。
3. **修改** 现有 model：User / ApiKey / Order / RequestLog（按 §2 增补字段）。
4. **追加** 新增 model（按模块顺序）：
   - RBAC：Role → Permission → RolePermission → UserRole → Menu
   - 日志：OperationLog → SecurityLog → LoginLog
   - 业务：UserGroup → RechargeRecord → Bill → Invoice → Announcement → Ticket → TicketReply → InviteCode → Blacklist → IpRule
   - 系统：SystemConfig → SystemLog
5. **更新** 现有 `User` 反向关系：`userRoles` / `group` / `invoices` / `tickets` / `inviteCodes`。

**User model 反向关系补充**：

```prisma
model User {
  // ... 现有字段
  userRoles         UserRole[]  // RBAC
  group             UserGroup? @relation(fields: [group_id], references: [id], onDelete: Restrict)
  invoices          Invoice[]
  tickets           Ticket[]
  inviteCodes       InviteCode[] @relation("Inviter")
  // Order.creator / Order.rechargeRecord 在 Order 侧定义
}
```

**合并后模型清单**：36 个 model + 25 个 enum：

```
用户与认证（6）：User, UserBalance, UserTransaction, UserGroup, UserRole, LoginLog
API 与 Key（1）：ApiKey
模型与渠道（4）：Model, ModelPricing, Provider, Channel, ChannelModel
订单与账单（5）：Order, Payment, RechargeRecord, Bill, Invoice
订阅与套餐（2）：SubscriptionPlan, UserSubscription
企业与组织（1）：Organization
RBAC（5）：      Role, Permission, RolePermission, UserRole, Menu
运营与工单（3）： Announcement, Ticket, TicketReply
邀请与黑名单（3）：InviteCode, Blacklist, IpRule
系统（3）：       SystemConfig, SmtpConfig, PaymentConfig
日志（4）：       RequestLog, OperationLog, SecurityLog, SystemLog
```

## 13. 文档交叉引用

- 权限点设计 → `docs/03-admin/02-rbac-design.md` §3 权限矩阵
- API 接口 → `docs/03-admin/04-api-spec.md`
- 前端路由 → `docs/03-admin/06-frontend-route-map.md`
- 实施计划 → `docs/03-admin/07-integration-plan.md`
- 数据库规则 → `.ai/database-rules.md`
- 现有 schema → `apps/backend/prisma/schema.prisma` + `docs/03-database/schema.md`
- 现有 ERD → `docs/03-database/erd.md`
