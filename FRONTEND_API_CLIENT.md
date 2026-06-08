# ToAIAPI 前端接口体系文档

> 版本: 1.0 | 更新日期: 2026-06-08

---

## 目录

1. [前端架构概览](#1-前端架构概览)
2. [API 客户端层结构](#2-api-客户端层结构)
3. [认证流程](#3-认证流程)
4. [公开接口模块](#4-公开接口模块-publicapi)
5. [用户端接口模块](#5-用户端接口模块-user-api)
6. [支付接口模块](#6-支付接口模块-payment-api)
7. [管理后台接口模块](#7-管理后台接口模块-admin-api)
8. [前端类型定义体系](#8-前端类型定义体系)
9. [状态管理](#9-状态管理)
10. [错误处理机制](#10-错误处理机制)
11. [前后端对接注意事项](#11-前后端对接注意事项)

---

## 1. 前端架构概览

### 1.1 前端技术栈

- **框架**: Next.js 16 + React 19
- **状态管理**: Zustand（轻量级状态库）
- **HTTP 客户端**: 原生 `fetch` API（无 axios）
- **认证存储**: `localStorage`（Token / 用户信息）

### 1.2 项目目录结构（API 相关）

```
src/
├── lib/                      # API 客户端层
│   ├── http.ts               #    URL 构建工具（区分 CSR/SSR）
│   ├── api-client.ts         #    统一 API 客户端（自动刷新 Token）
│   ├── api.ts                #    公开接口（模型/状态，SSR 友好）
│   ├── auth-api.ts           #    认证接口（登录/注册/登出）
│   ├── user-api.ts           #    用户端接口（信息/API Key/分析）
│   ├── payment-api.ts        #    支付接口（余额/订单/消费明细）
│   └── admin-api.ts          #    管理后台接口（全量 Admin API）
├── types/                    # 类型定义
│   ├── api.ts                #     通用类型（ApiResponse, PaginatedData）
│   ├── auth.ts               #     认证类型
│   ├── api-key.ts            #     API Key 类型
│   ├── billing.ts            #     账单/订单类型
│   ├── dashboard.ts          #     用户 Dashboard 类型
│   ├── admin.ts              #     管理后台类型
│   └── public.ts             #     公开配置类型
├── providers/                # React Context Provider
│   ├── auth-provider.tsx     #     认证状态恢复
│   └── public-config-provider.tsx  # 站点配置获取
└── stores/
    └── auth-store.ts         # Zustand 认证状态管理
```

### 1.3 前后端通信方式

```
浏览器 → Next.js (3000) ──rewrite──→ NestJS (3001)  /api/v1/*
                             或直连 ──→ 外部 API 地址 (NEXT_PUBLIC_API_URL)
```

- **客户端模式**: 通过 Next.js `rewrites` 代理，使用相对路径（如 `/api/v1/auth/login`）
- **服务端 SSR**: 直连 `http://localhost:3001`，无跨域问题
- **生产部署**: 配置 `NEXT_PUBLIC_API_URL` 环境变量指定后端地址

---

## 2. API 客户端层结构

前端将 API 客户端分为 **4 个独立模块**，每个模块有不同的认证策略和用途：

### 2.1 客户端分层总览

| 模块 | 文件 | 认证方式 | 用途 |
|------|------|----------|------|
| `api.ts` | `lib/api.ts` | 无认证（public） | 模型列表、服务状态 |
| `auth-api.ts` | `lib/auth-api.ts` | 混合 | 登录/注册/登出 |
| `user-api.ts` | `lib/user-api.ts` | JWT Bearer | 用户端所有操作 |
| `payment-api.ts` | `lib/payment-api.ts` | JWT Bearer | 支付/余额/账单 |
| `admin-api.ts` | `lib/admin-api.ts` | JWT Bearer + 管理角色 | 管理后台全量操作 |
| `api-client.ts` | `lib/api-client.ts` | 通用（统一客户端） | 被上述模块间接使用 |

### 2.2 `api-client.ts` — 统一请求客户端

这是最完善的客户端封装，提供自动 Token 刷新、统一错误处理、请求方法封装。

```typescript
// 三个导出的实例
export const publicApi = createApi(false); // 无需认证
export const authApi = createApi(true);    // 需要 JWT
export const adminApi = createApi(true);   // 需要 JWT

// 每个实例提供的方法
authApi.get<T>(path, options?)
authApi.post<T>(path, body?, options?)
authApi.put<T>(path, body?, options?)
authApi.patch<T>(path, body?, options?)
authApi.delete<T>(path, options?)
```

**核心机制**:
- `auth=true` 时自动附加 `Authorization: Bearer <token>` 头
- 遇到 `401` 状态码自动调用 `/auth/refresh` 刷新 Token
- 刷新失败清除本地 Token 并跳转 `/login`
- 自动解析后端 `{code, message, data}` 包装格式

### 2.3 `http.ts` — URL 构建工具

```typescript
export function buildApiUrl(path: string): string
```

- 有 `NEXT_PUBLIC_API_URL` 环境变量 → 使用该地址
- 浏览器端 → 返回相对路径（通过 Next.js rewrite 代理）
- 服务端 SSR → 返回 `http://localhost:3001` + 路径

### 2.4 响应格式处理

所有客户端模块统一处理后端响应格式：

```typescript
// 后端返回
{ "code": 0, "message": "success", "data": { ... } }

// 前端解包后返回 data 部分
return json.data as T;
```

**关键细节**: 前端对 `204 No Content` 做特判返回 `undefined`。

---

## 3. 认证流程

### 3.1 Token 存储

```
localStorage:
  toaiapi_access_token   ← JWT accessToken (15min)
  toaiapi_refresh_token  ← refreshToken (7天)
  toaiapi_user           ← JSON 用户信息 {id, email, displayName, role}
```

### 3.2 登录流程

```
用户提交表单 (email + password)
    ↓
POST /api/v1/auth/login
    ↓
收到 { user, tokens: { accessToken, refreshToken } }
    ↓
存入 localStorage
    ↓
Zustand 更新状态: user, isAuthenticated=true
    ↓
跳转到对应页面（普通用户→/dashboard, 管理员→/admin）
```

### 3.3 Token 自动刷新机制

```
API 请求发送（带 Authorization: Bearer token）
    ↓
收到 401 响应
    ↓
调用 POST /api/v1/auth/refresh (body: { refreshToken })
    ↓
成功 → 更新 localStorage 中新 Token → 重放原请求
失败 → 清除认证数据 → 跳转 /login
```

**并发安全**: `api-client.ts` 使用 `refreshPromise` 变量防止并发刷新。

### 3.4 会话恢复流程

```
应用启动 → AuthProvider 挂载
    ↓
Zustand restoreSession()
    ↓
检查 localStorage 是否有 accessToken
    ↓
有 → 设置 user, isAuthenticated=true
无 → 保持未登录状态
```

### 3.5 认证流程图

```
┌──────────────────────────┐
│  auth-api.ts (独立模块)   │
│  - 专门的 authFetch()    │
│  - login / register /    │
│    logout / refresh      │
│  - 手动管理 localStorage │
└──────────┬───────────────┘
           │
┌──────────▼───────────────┐
│  api-client.ts (统一模块) │
│  - request() 通用方法     │
│  - 自动附加 JWT Token    │
│  - 401 自动刷新          │
│  - publicApi / authApi   │
└──────────────────────────┘
```

---

## 4. 公开接口模块 (publicApi)

**文件**: `lib/api.ts` | **用途**: 无需认证的公开信息获取

### 4.1 获取公开模型列表

```typescript
// lib/api.ts
export async function getPublicModels(): Promise<Model[]>
```

**请求**: `GET /api/v1/models/public`

**用途**: 首页模型展示、定价页、模型详情页（详情页从列表中按模型名匹配）

**返回字段** (`Model`):

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 模型 ID |
| name | string | 模型名称 |
| vendor | string | 供应商 |
| input_price | number | null | 输入价格 |
| output_price | number | null | 输出价格 |
| cache_price | number | null | 缓存命中价格 |
| description | string | null | 描述 |
| tags | string[] | 标签（对话/工具/识图/绘画/视频/音乐）|
| type | string | 模型类型（text/image/audio/video）|
| billing_type | string | 计费类型（token/request）|
| context_window | number | null | 上下文窗口大小 |

### 4.2 获取单个模型详情

```typescript
export async function getModelDetail(name: string): Promise<ModelDetail>
```

**实现**: 后端当前只提供 `GET /api/v1/models/public` 列表接口，前端从公开模型列表中按 `id` 或 `name` 匹配详情，不调用不存在的单模型接口。

**返回** (`ModelDetail`): 继承 `Model`，并附加 OpenAI 兼容调用端点示例。

### 4.3 获取服务状态

```typescript
export async function getStatus(): Promise<ChannelStatus[]>
```

**请求**: `GET /api/v1/status`

**用途**: 服务状态页

**返回** (`ChannelStatus`):

| 字段 | 类型 | 说明 |
|------|------|------|
| name | string | 渠道名称 |
| healthy | boolean | 是否健康 |
| message | string | null | 状态消息 |
| last_checked | string | null | 最后检查时间 |

### 4.4 获取站点配置

**文件**: `providers/public-config-provider.tsx`

**请求**: `GET /api/v1/public-config`

**用途**: 应用启动时获取站点配置（站点名、SEO、验证码配置等）

**返回** (`PublicConfig`，共 47 个字段，部分关键字段):

| 字段 | 类型 | 说明 |
|------|------|------|
| site_name | string | 站点名称 |
| maintenance_mode | boolean | 维护模式 |
| allow_register | boolean | 是否开放注册 |
| invite_code_required | boolean | 是否需要邀请码 |
| captcha_enabled | boolean | 是否启用验证码 |
| captcha_identity | string | 阿里云验证码身份 |
| captcha_register_enabled | boolean | 注册页验证码开关 |
| captcha_login_enabled | boolean | 登录页验证码开关 |
| ... | | 另有 SEO、备案、验证码场景 ID 等字段 |

### 4.5 获取排行榜

**文件**: `lib/user-api.ts`（用户端，但实际是公开接口）

```typescript
export async function getLeaderboard(period?: string): Promise<LeaderboardResponse>
```

**请求**: `GET /api/v1/leaderboard?period={period}`

**返回** (`LeaderboardResponse`):

| 字段 | 类型 | 说明 |
|------|------|------|
| hotModels | LeaderboardModel[] | 热门模型排行 |
| leaderboard | LeaderboardModel[] | 排行榜 |
| marketShare | VendorMarketShare[] | 提供商市场份额 |
| rising | TrendingModel[] | 上升趋势 |
| falling | TrendingModel[] | 下降趋势 |

---

## 5. 用户端接口模块 (user-api)

**文件**: `lib/user-api.ts`

### 5.1 用户信息

| 函数 | 请求 | 说明 |
|------|------|------|
| `getUserProfile()` | `GET /api/v1/users/me` | 获取当前用户信息 |
| `updateUserProfile(data)` | `PATCH /api/v1/users/me` | 更新用户信息 |
| `changePassword(data)` | `POST /api/v1/auth/change-password` | 修改密码（发往 auth 路径）|

**`UserProfile` 类型**:

```typescript
interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: string;        // USER / VIP / ENTERPRISE / AGENT / ADMIN / SUPER_ADMIN
  createdAt: string;
}
```

### 5.2 API Key 管理

| 函数 | 请求 | 说明 |
|------|------|------|
| `getUserApiKeys()` | `GET /api/v1/api-keys` | 获取 Key 列表 |
| `createApiKey(params)` | `POST /api/v1/api-keys` | 创建 Key |
| `updateApiKey(id, data)` | `PATCH /api/v1/api-keys/:id` | 更新 Key |
| `enableApiKey(id)` | `PATCH /api/v1/api-keys/:id/enable` | 启用 |
| `disableApiKey(id)` | `PATCH /api/v1/api-keys/:id/disable` | 禁用 |
| `deleteApiKey(id)` | `DELETE /api/v1/api-keys/:id` | 删除 |
| `rotateApiKey(id)` | `POST /api/v1/api-keys/:id/rotate` | 轮换 |

**创建参数** (`CreateApiKeyResult`):

```typescript
createApiKey(params: {
  name?: string;
  count?: number;          // 批量数量
  unlimitedQuota?: boolean;
  rpmLimit?: number;
  tpmLimit?: number;
  expiresAt?: string;
  groupId?: string;
  ipWhitelist?: string;    // JSON 字符串
  modelLimit?: string;     // JSON 字符串
})
// 注意: 发送时使用 snake_case (unlimited_quota, rpm_limit 等)
```

**`UserApiKey` 类型**（增强版，比类型定义更丰富）:

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | ID |
| name | string | null | 名称 |
| keyPrefix | string | 前缀 |
| isActive | boolean | 是否激活 |
| expiresAt | string | null | 过期时间 |
| rateLimit | number | null | 速率限制 |
| tokenLimit | number | null | Token 限制 |
| modelLimit | string[] | 允许的模型 |
| ipWhitelist | string[] | IP 白名单 |
| lastUsedAt | string | null | 最后使用时间 |
| totalRequests | number | 总请求数 |
| createdAt | string | 创建时间 |
| usageToday | number | 今日消费（分）|
| usage30d | number | 近30天消费（分）|
| group | {id, name} | null | 所属分组 |
| rpmLimit | number | RPM 限制 |
| tpmLimit | number | TPM 限制 |

### 5.3 分析看板

| 函数 | 请求 | 说明 |
|------|------|------|
| `getAnalytics(period?)` | `GET /api/v1/balance/analytics?period=` | 综合分析 |
| `getCallTrend(period?)` | `GET /api/v1/balance/analytics/call-trend?period=` | 调用趋势 |
| `getModelRanking(period?)` | `GET /api/v1/balance/analytics/model-ranking?period=` | 模型排行 |

**`AnalyticsResponse`**:

```typescript
interface AnalyticsResponse {
  summary: {
    totalUsers: number;
    totalQuota: number;
    totalTokens: number;
    avgRpm: number;
    avgTpm: number;
  };
  costDistribution: CostDistributionItem[];   // [{model, cost, percentage}]
  modelCallAnalysis: ModelCallItem[];         // [{model, calls, tokens}]
  callTrend: CallTrendItem[];                 // [{date, calls, tokens}]
}
```

### 5.4 通知配置

| 函数 | 请求 | 说明 |
|------|------|------|
| `getNotificationConfig()` | `GET /api/v1/users/me/notifications` | 获取配置 |
| `updateNotificationConfig(config)` | `PUT /api/v1/users/me/notifications` | 更新配置 |
| `sendTestNotification(channel)` | `POST /api/v1/users/me/notifications/test` | 发送测试 |

**`NotificationConfig`**:

```typescript
interface NotificationConfig {
  email: string | null;
  subscriptions: {
    lowBalance: boolean;
    promotions: boolean;
    periodic: boolean;
    announcements: boolean;
    priceChanges: boolean;
  };
  lowBalanceThreshold: number;   // 余额不足阈值(分)
  channels: {
    email: NotificationChannel;
    webhook: NotificationChannel;
    wxpusher: NotificationChannel;
    wechatWork: NotificationChannel;
    dingtalk: NotificationChannel;
    feishu: NotificationChannel;
  };
}
```

---

## 6. 支付接口模块 (payment-api)

**文件**: `lib/payment-api.ts`

### 6.1 余额

| 函数 | 请求 | 说明 |
|------|------|------|
| `getBalance()` | `GET /api/v1/balance` | 获取余额 |
| `getBalanceStats()` | `GET /api/v1/balance/stats` | 获取余额+消费统计 |

**`BalanceInfo`**:

```typescript
interface BalanceInfo {
  amount: number;    // 总余额（元）
  frozen: number;    // 冻结金额（元）
  available: number; // 可用余额（元）
}
```

**`BalanceStats`**:

```typescript
interface BalanceStats {
  balance: BalanceInfo;
  monthlySpend: number;
  monthlyRecharge: number;
  monthlyRequests: number;
  monthlyPromptTokens: number;
  monthlyCompletionTokens: number;
  monthlyTotalTokens: number;
}
```

### 6.2 支付方式与活动

| 函数 | 请求 | 说明 |
|------|------|------|
| `getPaymentMethods()` | `GET /api/v1/payment/methods` | 可用支付方式 (公开) |
| `getActivePromotions(amount?)` | `GET /api/v1/payment/promotions` | 充值赠送活动 (公开) |

**`PaymentMethod`**:

```typescript
interface PaymentMethod {
  name: string;        // 如 "EPAY_ALIPAY"
  displayName: string; // 如 "支付宝"
}
```

**`ActivePromotion`**:

```typescript
interface ActivePromotion {
  id: string;
  name: string;
  description: string | null;
  minAmount: number;               // 最小充值金额
  bonusType: "FIXED" | "PERCENTAGE";
  bonusValue: number;              // 赠送金额或百分比
  maxBonus: number | null;         // 最大赠送金额
  startAt: string;
  endAt: string | null;
}
```

### 6.3 订单管理

| 函数 | 请求 | 说明 |
|------|------|------|
| `createOrder(amount, paymentMethod)` | `POST /api/v1/payment/orders` | 创建充值订单 |
| `getUserOrders(page, pageSize)` | `GET /api/v1/payment/orders` | 订单列表 |
| `getOrderStatus(orderNo)` | `GET /api/v1/payment/orders/:orderNo` | 订单详情 |

**`CreateOrderResult`**:

```typescript
interface CreateOrderResult {
  orderNo: string;
  amount: number;         // 分
  paymentMethod: string;
  status: string;
  payUrl: string | null;  // 支付链接或表单HTML
  createdAt: string;
}
```

### 6.4 消费明细与账单

| 函数 | 请求 | 说明 |
|------|------|------|
| `getBills(page, pageSize, startDate?, endDate?)` | `GET /api/v1/balance/bills` | 消费明细 |
| `getDailyBills(days?)` | `GET /api/v1/balance/bills/daily` | 按天聚合 |

**`BillItem`**:

```typescript
interface BillItem {
  id: string;
  createdAt: string;
  endpoint: string;
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
  reasoningTokens: number;
  totalTokens: number;
  cost: number;           // 元（balance/bills 后端已转换）
  statusCode: number;
  latencyMs: number;
  modelId: string;
  channelId: string;
}
```

### 6.5 兑换码与邀请

| 函数 | 请求 | 说明 |
|------|------|------|
| `redeemCode(code)` | `POST /api/v1/redeem` | 兑换码充值 |
| `getInviteStats()` | `GET /api/v1/invite/stats` | 邀请奖励统计 |

**`InviteStats`**:

```typescript
interface InviteStats {
  pendingReward: number;  // 待使用收益(分)
  totalReward: number;    // 总收益(分)
  inviteCount: number;    // 邀请人数
  rewardRatio: number;    // 奖励比例(%)
  inviteUrl: string;      // 邀请链接
}
```

---

## 7. 管理后台接口模块 (admin-api)

**文件**: `lib/admin-api.ts` | 全部接口都需要 JWT 认证

### 7.1 Dashboard

| 函数 | 请求 | 说明 |
|------|------|------|
| `getDashboard(startDate?, endDate?)` | `GET /api/v1/admin/dashboard` | 仪表盘数据 |

**`DashboardData`**:

```typescript
interface DashboardData {
  metrics: {
    totalUsers: number;           // 注册用户数
    totalUsersGrowth: number;     // 增长率(%)
    totalRecharge: number;        // 总充值(分)
    totalRechargeGrowth: number;
    totalConsumption: number;     // 总消费(分)
    totalConsumptionGrowth: number;
    totalRequests: number;        // 总调用次数
    totalRequestsGrowth: number;
    totalBalance: number;         // 总余额(分)
  };
  callStats: CallStatsPoint[];          // 调用趋势
  modelDistribution: ModelDistribution[]; // 模型分布
  recentOrders: RecentOrder[];           // 最近订单
  channelStatus: ChannelStatus[];        // 渠道状态
}
```

### 7.2 用户管理

| 函数 | 请求 | 说明 |
|------|------|------|
| `getUsers(params)` | `GET /api/v1/admin/users` | 用户列表 |
| `getUser(id)` | `GET /api/v1/admin/users/:id` | 用户详情 |
| `updateUserStatus(userId, status, reason?)` | `PATCH /api/v1/admin/users/:id/status` | 修改状态 |
| `updateUserRole(userId, role)` | `PATCH /api/v1/admin/users/:id/role` | 修改角色 |

**`UserDetailData` 包含**:
- 用户基本信息 + 联系方式
- `balance` 余额信息
- `stats` 使用统计（Key 数、请求数、月消费、月充值、总消费等）
- `recentOrders` 最近订单
- `recentTransactions` 最近交易流水
- `recentApiKeys` 最近 API Key

### 7.3 用户组管理

| 函数 | 请求 | 说明 |
|------|------|------|
| `getUserGroups(params)` | `GET /api/v1/admin/user-groups` | 列表 |
| `getUserGroup(id)` | `GET /api/v1/admin/user-groups/:id` | 详情 |
| `createUserGroup(payload)` | `POST /api/v1/admin/user-groups` | 创建 |
| `updateUserGroup(id, payload)` | `PATCH /api/v1/admin/user-groups/:id` | 更新 |
| `toggleUserGroup(id)` | `PATCH /api/v1/admin/user-groups/:id/toggle` | 切换状态 |
| `deleteUserGroup(id)` | `DELETE /api/v1/admin/user-groups/:id` | 删除 |

**`UserGroupData`**:

```typescript
interface UserGroupData {
  id: string;
  name: string;           // 英文唯一标识
  displayName: string;    // 显示名
  description: string | null;
  priceMultiplier: number; // 价格倍率 0.1-10.0
  rpmLimit: number;        // 请求/分钟
  tpmLimit: number;        // Token/分钟
  maxApiKeys: number;
  allowedModels: string[];
  allowedChannels: string[];
  allowProxy: boolean;
  allowShare: boolean;
  isActive: boolean;
  isBuiltin: boolean;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}
```

### 7.4 角色管理

| 函数 | 请求 | 说明 |
|------|------|------|
| `getRoles()` | `GET /api/v1/admin/roles` | 角色列表 |
| `getRole(id)` | `GET /api/v1/admin/roles/:id` | 角色详情（含权限）|
| `getPermissions()` | `GET /api/v1/admin/permissions` | 所有权限点 |

**`RoleData`**:

```typescript
interface RoleData {
  id: string;
  code: string;
  name: string;
  description: string | null;
  level: number;
  isSystem: boolean;
  isActive: boolean;
  dataScope: string;
  permissionCount: number;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}
```

### 7.5 Provider / Channel / Model 管理

**Provider**:

| 函数 | 请求 |
|------|------|
| `getProviders(params)` | `GET /api/v1/admin/providers` |
| `createProvider(payload)` | `POST /api/v1/admin/providers` |
| `updateProvider(id, payload)` | `PATCH /api/v1/admin/providers/:id` |
| `deleteProvider(id)` | `DELETE /api/v1/admin/providers/:id` |

**Channel**:

| 函数 | 请求 |
|------|------|
| `getChannels(params)` | `GET /api/v1/admin/channels` |
| `createChannel(payload)` | `POST /api/v1/admin/channels` |
| `updateChannel(id, payload)` | `PATCH /api/v1/admin/channels/:id` |
| `enableChannel(id)` | `PATCH /api/v1/admin/channels/:id/enable` |
| `disableChannel(id)` | `PATCH /api/v1/admin/channels/:id/disable` |
| `deleteChannel(id)` | `DELETE /api/v1/admin/channels/:id` |
| `testChannel(id)` | `POST /api/v1/admin/channels/:id/test` |

**Model**:

| 函数 | 请求 |
|------|------|
| `getModels(params)` | `GET /api/v1/admin/models` |
| `createModel(payload)` | `POST /api/v1/admin/models` |
| `updateModel(id, payload)` | `PATCH /api/v1/admin/models/:id` |
| `deleteModel(id)` | `DELETE /api/v1/admin/models/:id` |
| `upsertModelPricing(id, payload)` | `PUT /api/v1/admin/models/:id/pricing` |

### 7.6 订单 / 账单管理

| 函数 | 请求 | 说明 |
|------|------|------|
| `getOrders(params)` | `GET /api/v1/admin/orders` | 订单列表 |
| `getOrder(id)` | `GET /api/v1/admin/orders/:id` | 订单详情 |
| `verifyOrder(orderNo)` | `POST /api/v1/admin/orders/:orderNo/verify` | 验证并补单 |
| `getBills(params)` | `GET /api/v1/admin/bills` | 交易流水 |

### 7.7 系统配置

| 函数 | 请求 | 说明 |
|------|------|------|
| `getSystemSettings()` | `GET /api/v1/admin/system-settings` | 全部设置 |
| `getSystemSettingsByCategory(cat)` | `GET /api/v1/admin/system-settings/:category` | 分类设置 |
| `updateSystemSettings(cat, settings)` | `PUT /api/v1/admin/system-settings/:category` | 批量更新 |
| `updateSystemSetting(cat, key, value)` | `PATCH /api/v1/admin/system-settings/:category/:key` | 单个更新 |

### 7.8 SMTP / 短信配置

**SMTP**:

| 函数 | 请求 |
|------|------|
| `getSmtpConfig()` | `GET /api/v1/admin/smtp-config` |
| `updateSmtpConfig(payload)` | `PUT /api/v1/admin/smtp-config` |
| `toggleSmtpConfig()` | `PATCH /api/v1/admin/smtp-config/toggle` |
| `testSmtpConnection()` | `POST /api/v1/admin/smtp-config/test-connection` |
| `sendTestEmail(email)` | `POST /api/v1/admin/smtp-config/send-test` |

**短信**:

| 函数 | 请求 |
|------|------|
| `getSmsConfig()` | `GET /api/v1/admin/sms-config` |
| `updateSmsConfig(payload)` | `PUT /api/v1/admin/sms-config` |
| `toggleSmsConfig()` | `PATCH /api/v1/admin/sms-config/toggle` |
| `testSmsConnection()` | `POST /api/v1/admin/sms-config/test-connection` |
| `sendTestSms(phone, templateCode?, templateParam?)` | `POST /api/v1/admin/sms-config/send-test` |

### 7.9 支付配置 / 充值活动 / 发票

**支付配置**:

| 函数 | 请求 |
|------|------|
| `getPaymentConfigs()` | `GET /api/v1/admin/payment-configs` |
| `getPaymentConfig(name)` | `GET /api/v1/admin/payment-configs/:name` |
| `updatePaymentConfig(name, payload)` | `PUT /api/v1/admin/payment-configs/:name` |
| `togglePaymentConfig(name)` | `PATCH /api/v1/admin/payment-configs/:name/toggle` |

**充值活动**:

| 函数 | 请求 |
|------|------|
| `getPromotions(params)` | `GET /api/v1/admin/promotions` |
| `createPromotion(payload)` | `POST /api/v1/admin/promotions` |
| `updatePromotion(id, payload)` | `PATCH /api/v1/admin/promotions/:id` |
| `togglePromotion(id)` | `PATCH /api/v1/admin/promotions/:id/toggle` |
| `deletePromotion(id)` | `DELETE /api/v1/admin/promotions/:id` |

**发票**:

| 函数 | 请求 |
|------|------|
| `getInvoices(params)` | `GET /api/v1/admin/invoices` |
| `getInvoice(id)` | `GET /api/v1/admin/invoices/:id` |
| `createInvoice(payload)` | `POST /api/v1/admin/invoices` |
| `reviewInvoice(id, payload)` | `PATCH /api/v1/admin/invoices/:id/review` |
| `issueInvoice(id, payload)` | `PATCH /api/v1/admin/invoices/:id/issue` |
| `deleteInvoice(id)` | `DELETE /api/v1/admin/invoices/:id` |

---

## 8. 前端类型定义体系

### 8.1 类型文件结构

```
types/
├── api.ts          # 通用基础类型
├── auth.ts         # 认证相关类型
├── api-key.ts      # API Key 类型
├── billing.ts      # 账单/余额/订单类型
├── dashboard.ts    # Dashboard 统计类型
├── admin.ts        # 管理后台类型
├── public.ts       # 公开配置类型
└── index.ts        # 统一导出
```

### 8.2 `types/api.ts` — 通用基础类型

```typescript
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface PaginationParams {
  page?: number;
  pageSize?: number;
}

interface ApiErrorPayload {
  code?: string | number;
  message?: string;
  data?: unknown;
  errors?: unknown;
}

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue | QueryValue[]>;
```

### 8.3 前后端字段命名约定

| 后端 (NestJS) | 前端 (TypeScript) | 说明 |
|---------------|-------------------|------|
| `snake_case` | `camelCase` | 多数模块字段名不统一 |
| — | — | `payment-api.ts` 中 `getOrderStatus()` 手动做了 `snake_case` → `camelCase` 转换 |
| — | — | `user-api.ts` 创建 API Key 时手动将 `camelCase` 转为 `snake_case` 发送 |

> ⚠️ **命名风格不一致**: 部分 DTO 同时支持 camelCase 和 snake_case（后端 CreateApiKeyDto），前端 createApiKey() 发送时使用 snake_case；但多数前端类型定义使用 camelCase。

---

## 9. 状态管理

### 9.1 Zustand Auth Store

**文件**: `stores/auth-store.ts`

```typescript
interface AuthState {
  // 状态
  user: UserInfo | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;   // 初始为 true，恢复会话后设为 false
  error: string | null;

  // 操作
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  restoreSession: () => void;  // 从 localStorage 恢复
}
```

### 9.2 React Context Providers

| Provider | 文件 | 用途 |
|----------|------|------|
| `AuthProvider` | `providers/auth-provider.tsx` | 应用启动时恢复会话 |
| `PublicConfigProvider` | `providers/public-config-provider.tsx` | 获取站点配置 |

### 9.3 数据获取模式

```
SSR 页面 (首页/定价/模型)
  └─ api.ts → fetchJSON → 直接 fetch（无认证）

客户端页面 (Dashboard/用户端)
  └─ user-api.ts / payment-api.ts → authFetch → fetch + JWT + 自动刷新

管理后台 (Admin)
  └─ admin-api.ts → adminFetch → fetch + JWT + 自动刷新
```

---

## 10. 错误处理机制

### 10.1 错误处理层级

```
API 请求 → 网络错误 / HTTP 错误码
    ↓
解析后端 { code, message, data } 格式
    ↓
code ≠ 0 → 抛出 ApiError(message, status, code, payload)
    ↓
401 → 自动刷新 Token（3 个模块各自实现）
    ↓
刷新失败 → 清除认证数据 → 跳转 /login 或 /admin/login
```

### 10.2 各模块错误处理差异

| 模块 | 错误类 | 特点 |
|------|--------|------|
| `api-client.ts` | `ApiError` | 保留 `status`、`code`、`payload` |
| `auth-api.ts` | `Error` | 简单 `"API Error {status}: {text}"` |
| `user-api.ts` | `Error` | 简单错误信息 |
| `payment-api.ts` | `Error` | 简单错误信息 |
| `admin-api.ts` | `Error` | 简单错误信息 |

### 10.3 401 自动刷新差异

| 模块 | 实现方式 | 刷新失败处理 |
|------|----------|------------|
| `api-client.ts` | 并发安全（refreshPromise） | `clearTokens()` + `window.location.href = "/login"` |
| `user-api.ts` | 简单实现 | `clearAuthData()` + `window.location.href = "/login"` |
| `payment-api.ts` | 简单实现 | `clearAuthData()` + `window.location.href = "/login"` |
| `admin-api.ts` | 简单实现 | `clearAuthData()` + `window.location.href = "/admin/login"` |

---

## 11. 前后端对接注意事项

### 11.1 当前对接状态

| 模块 | 当前处理 |
|------|----------|
| 兑换码 | 前端已改为 `POST /api/v1/redeem`，与后端路由一致 |
| 实名认证 | 前端已移除无后端支持的接口封装，旧页面跳转到个人设置 |
| 模型详情 | 后端只提供公开模型列表，前端从 `/models/public` 列表派生详情 |
| 签到 | 前端已接入 `/checkin/config`、`/checkin/stats`、`/checkin/history` 和 `POST /checkin` |

### 11.2 字段命名兼容性

| 模块 | 前端发送格式 | 后端接收格式 | 说明 |
|------|-------------|-------------|------|
| `createApiKey()` | `snake_case` | 同时支持 | 前端主动使用 snake_case |
| `updateApiKey()` | `camelCase` | 同时支持 | |
| `getOrderStatus()` | 返回 `camelCase` | 返回 `snake_case` | 前端做了手动转换 |
| 通知配置 | `snake_case` 字段名 | `snake_case` | 一致 |
| Admin 模块 | `camelCase` | `camelCase` | 一致 |

### 11.3 金额单位

| 场景 | 后端单位 | 前端展示 | 转换 |
|------|---------|---------|------|
| 余额接口 | 元 | 元 | 直接使用 |
| 请求日志费用 | 分 (fen) | 元 | `yuan = fen / 100` |
| 消费明细/每日账单 | 元 | 元 | 后端已转换，直接使用 |
| 模型定价设置 | 元/百万 token | 元/百万 token | 直接使用 |
| 充值金额输入 | 元 | 元 | 后端 `amount` 以元为单位 |

### 11.4 Dashboard 前端类型 vs 后端响应

前端 `admin-api.ts` 定义的 `DashboardData` 与后端 `DashboardResponseDto` 基本一致，但需确认以下字段：
- `metrics.totalConsumption` 对应后端的 `totalConsumption`
- `channelStatus[].avgLatency` 可能需要确认来源字段名

### 11.5 认证接口特殊处理

**管理员登录限制**: 前端 `auth-api.ts` 中的 `login()` 函数在收到 `AuthResponse` 后额外检查角色：
```typescript
const adminRoles = ["admin", "super_admin"];
if (!adminRoles.includes(data.user.role.toLowerCase())) {
  throw new Error("权限不足：仅管理员可访问后台");
}
```

**普通用户登录**: 使用 `user-api.ts` / `api-client.ts` 中的 `authApi`，不对角色做限制。

### 11.6 分页响应格式

前端三种分页响应处理方式：

```typescript
// api-client.ts — 统一处理
// 返回 PaginatedData<T> { items, total, page, pageSize, totalPages }

// payment-api.ts — 手动转换
getUserOrders() 需要将后端的 data[] → items[]

// admin-api.ts — 直接使用泛型
PaginatedResponse<T> 直接声明
```

---

## 附录

### A. 前端 API 函数总表

| 模块 | 函数 | HTTP | 路径 | 认证 |
|------|------|------|------|------|
| public | `getPublicModels` | GET | `/models/public` | ❌ |
| public | `getModelDetail` | 派生 | `/models/public` 列表匹配 | ❌ |
| public | `getStatus` | GET | `/status` | ❌ |
| config | `usePublicConfig` | GET | `/public-config` | ❌ |
| auth | `login` | POST | `/auth/login` | ❌ |
| auth | `register` | POST | `/auth/register` | ❌ |
| auth | `logout` | POST | `/auth/logout` | JWT |
| auth | `refreshTokens` | POST | `/auth/refresh` | ❌ |
| user | `getUserProfile` | GET | `/users/me` | JWT |
| user | `updateUserProfile` | PATCH | `/users/me` | JWT |
| user | `changePassword` | POST | `/auth/change-password` | JWT |
| user | `getUserApiKeys` | GET | `/api-keys` | JWT |
| user | `createApiKey` | POST | `/api-keys` | JWT |
| user | `updateApiKey` | PATCH | `/api-keys/:id` | JWT |
| user | `enableApiKey` | PATCH | `/api-keys/:id/enable` | JWT |
| user | `disableApiKey` | PATCH | `/api-keys/:id/disable` | JWT |
| user | `deleteApiKey` | DELETE | `/api-keys/:id` | JWT |
| user | `rotateApiKey` | POST | `/api-keys/:id/rotate` | JWT |
| user | `getAnalytics` | GET | `/balance/analytics` | JWT |
| user | `getCallTrend` | GET | `/balance/analytics/call-trend` | JWT |
| user | `getModelRanking` | GET | `/balance/analytics/model-ranking` | JWT |
| user | `getLeaderboard` | GET | `/leaderboard` | ❌ |
| user | `getNotificationConfig` | GET | `/users/me/notifications` | JWT |
| user | `updateNotificationConfig` | PUT | `/users/me/notifications` | JWT |
| user | `sendTestNotification` | POST | `/users/me/notifications/test` | JWT |
| payment | `getBalance` | GET | `/balance` | JWT |
| payment | `getBalanceStats` | GET | `/balance/stats` | JWT |
| payment | `getPaymentMethods` | GET | `/payment/methods` | ❌ |
| payment | `getActivePromotions` | GET | `/payment/promotions` | ❌ |
| payment | `createOrder` | POST | `/payment/orders` | JWT |
| payment | `getUserOrders` | GET | `/payment/orders` | JWT |
| payment | `getOrderStatus` | GET | `/payment/orders/:orderNo` | JWT |
| payment | `getBills` | GET | `/balance/bills` | JWT |
| payment | `getDailyBills` | GET | `/balance/bills/daily` | JWT |
| payment | `redeemCode` | POST | `/redeem` | JWT |
| payment | `getInviteStats` | GET | `/invite/stats` | JWT |
| admin | `getDashboard` | GET | `/admin/dashboard` | JWT+admin |
| admin | `getUsers` | GET | `/admin/users` | JWT+admin |
| admin | `getUser` | GET | `/admin/users/:id` | JWT+admin |
| admin | `updateUserStatus` | PATCH | `/admin/users/:id/status` | JWT+admin |
| admin | `updateUserRole` | PATCH | `/admin/users/:id/role` | JWT+admin |
| admin | 用户组 CRUD | 多 | `/admin/user-groups/*` | JWT+admin |
| admin | 角色管理 | 多 | `/admin/roles/*` | JWT+admin |
| admin | API Key 管理 | 多 | `/admin/api-keys/*` | JWT+admin |
| admin | 订单管理 | 多 | `/admin/orders/*` | JWT+admin |
| admin | 账单管理 | GET | `/admin/bills` | JWT+admin |
| admin | Provider CRUD | 多 | `/admin/providers/*` | JWT+admin |
| admin | Channel CRUD | 多 | `/admin/channels/*` | JWT+admin |
| admin | Model CRUD | 多 | `/admin/models/*` | JWT+admin |
| admin | 支付配置 | 多 | `/admin/payment-configs/*` | JWT+admin |
| admin | SMTP 配置 | 多 | `/admin/smtp-config/*` | JWT+admin |
| admin | 短信配置 | 多 | `/admin/sms-config/*` | JWT+admin |
| admin | 充值活动 | 多 | `/admin/promotions/*` | JWT+admin |
| admin | 发票管理 | 多 | `/admin/invoices/*` | JWT+admin |
| admin | 系统设置 | 多 | `/admin/system-settings/*` | JWT+admin |

### B. 金额单位速查

```
100 分 = 1 元
余额接口返回元 → 前端直接展示
请求日志费用返回分 → 前端 display: fen / 100
消费明细和每日账单费用返回元 → 前端直接展示
充值接口 amount 参数以元为单位
模型定价以 "元/百万 token" 为单位
```

### C. 关键发现问题

1. **公开模型详情**: 后端只提供公开模型列表，前端详情页从列表按模型名派生。
2. **字段命名不一致**: 部分模块需要手动转换 `snake_case` ↔ `camelCase`。
3. **金额单位差异**: 余额和消费明细返回元，请求日志费用返回分。
