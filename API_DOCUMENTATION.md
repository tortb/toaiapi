# ToAIAPI 后端接口文档

> 版本: 1.0 | 更新日期: 2026-06-08

---

## 目录

1. [基础信息](#1-基础信息)
2. [认证模块 Auth](#2-认证模块-auth)
3. [用户模块 Users](#3-用户模块-users)
4. [API Key 管理](#4-api-key-管理)
5. [余额与账单 Balance](#5-余额与账单-balance)
6. [支付 Payment](#6-支付-payment)
7. [Gateway 核心网关](#7-gateway-核心网关)
8. [签到 Checkin](#8-签到-checkin)
9. [邀请奖励 Invite](#9-邀请奖励-invite)
10. [排行榜 Leaderboard](#10-排行榜-leaderboard)
11. [通知配置 Notification](#11-通知配置-notification)
12. [兑换码 Redeem](#12-兑换码-redeem)
13. [分析看板 Analytics](#13-分析看板-analytics)
14. [管理后台 Admin](#14-管理后台-admin)

---

## 1. 基础信息

### 1.1 基础 URL

```
http://localhost:3001/api/v1
```

**全局路由前缀**: `api/v1`

### 1.2 统一响应格式

所有成功响应均经过 `TransformInterceptor` 包装：

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

> 注意：`data` 字段在列表类型时为数组，单对象时为对象。前端统一按 `json.data` 取值。

**分页响应格式**（后端 `PaginatedResult` 接口）：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

**错误响应格式**：

```json
{
  "code": 40001,
  "message": "错误描述信息",
  "data": null
}
```

### 1.3 HTTP 方法

| 方法 | 用途 |
|------|------|
| GET | 查询/获取资源 |
| POST | 创建资源/触发操作 |
| PATCH | 部分更新资源 |
| PUT | 全量更新/替换资源 |
| DELETE | 删除资源 |

### 1.4 认证方式

| 方式 | 适用范围 | 说明 |
|------|----------|------|
| JWT Bearer Token | 用户端 API | Header: `Authorization: Bearer <token>`，15min 过期 |
| JWT + Refresh Token | 用户端 API | 自动刷新，refreshToken 7 天有效 |
| X-API-Key | Gateway 外部调用 | Header: `X-API-Key: sk-toai-xxx` 或 `Authorization: Bearer sk-toai-xxx` |

### 1.5 通用查询参数

所有分页接口统一使用以下查询参数：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | number | 1 | 页码，最小值 1 |
| pageSize | number | 20 | 每页数量，最小值 1，最大值 100 |

---

## 2. 认证模块 Auth

**Controller**: `AuthController` | **路由前缀**: `/auth` | **Swagger Tag**: `Auth`

### 2.1 POST `/auth/register` — 用户注册

**认证**: 无

**请求体** (`RegisterDto`):

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码 8-128 位，需含大小写字母和数字 |
| displayName | string | 否 | 显示名称，最长 50 字符 |
| inviteCode | string | 否 | 邀请码，最长 50 字符 |
| captchaToken | string | 否 | 阿里云验证码 Token |
| emailCode | string | 否 | 邮箱验证码，最长 10 字符 |

**请求头**:

| 头 | 必填 | 说明 |
|----|------|------|
| captcha-verify-param | 否 | 阿里云 ESA AI 验证码参数 |

**响应** `AuthResponseDto`:

```json
{
  "user": {
    "id": "clxxxxx",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "USER"
  },
  "tokens": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "tokenType": "Bearer",
    "expiresIn": 900
  }
}
```

### 2.2 POST `/auth/login` — 用户登录

**认证**: 无

**请求体** (`LoginDto`):

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码 |

**请求头**:

| 头 | 必填 | 说明 |
|----|------|------|
| captcha-verify-param | 否 | 阿里云 ESA AI 验证码参数 |

**响应**: 同 `AuthResponseDto`

### 2.3 POST `/auth/refresh` — 刷新 Token

**认证**: 无

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| refreshToken | string | 是 | Refresh Token |

**响应** `TokenResponseDto`:

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

### 2.4 POST `/auth/logout` — 登出

**认证**: JWT Bearer

**请求体**: 无

**响应**: `204 No Content`

### 2.5 POST `/auth/change-password` — 修改密码

**认证**: JWT Bearer

**请求体** (`ChangePasswordDto`):

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| currentPassword | string | 是 | 当前密码 |
| newPassword | string | 是 | 新密码 8-128 位 |

**响应**: `204 No Content`

### 2.6 POST `/auth/send-verification-code` — 发送邮箱验证码

**认证**: 无

**请求体** (`SendVerificationCodeDto`):

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 邮箱地址 |
| purpose | string | 否 | 用途，默认 "注册"，最长 20 字符 |

**响应**:

```json
{ "message": "验证码已发送" }
```

> 限制：验证码 5 分钟内有效，同一邮箱 60 秒内只能发送一次。

### 2.7 POST `/auth/forgot-password` — 忘记密码

**认证**: 无

**请求体** (`ForgotPasswordDto`):

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 注册邮箱 |

**响应**:

```json
{ "message": "If the email exists, a reset link has been sent" }
```

### 2.8 POST `/auth/reset-password` — 重置密码

**认证**: 无

**请求体** (`ResetPasswordDto`):

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| token | string | 是 | 密码重置 Token |
| newPassword | string | 是 | 新密码 8-128 位 |

**响应**:

```json
{ "message": "Password has been reset successfully" }
```

---

## 3. 用户模块 Users

**Controller**: `UserController` | **路由前缀**: `/users` | **Swagger Tag**: `Users`

### 3.1 GET `/users/me` — 获取当前用户信息

**认证**: JWT Bearer

**响应** `UserResponseDto`:

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 用户 ID |
| email | string | 邮箱地址 |
| phone | string | null | 手机号 |
| displayName | string | null | 显示名称 |
| avatarUrl | string | null | 头像 URL |
| role | string | 角色，枚举: `USER`, `VIP`, `ENTERPRISE`, `AGENT`, `ADMIN`, `SUPER_ADMIN` |
| status | string | 状态，枚举: `ACTIVE`, `SUSPENDED`, `BANNED` |
| createdAt | Date | 创建时间 |

### 3.2 PATCH `/users/me` — 更新当前用户信息

**认证**: JWT Bearer

**请求体** (`UpdateUserDto`):

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| displayName | string | 否 | 显示名称，最长 50 字符 |
| avatarUrl | string | 否 | 头像 URL，最长 500 字符 |

### 3.3 DELETE `/users/me` — 删除当前用户（软删除）

**认证**: JWT Bearer

**响应**: `204 No Content`

---

## 4. API Key 管理

**Controller**: `ApiKeyController` | **路由前缀**: `/api-keys` | **Swagger Tag**: `API Keys`

### 4.1 POST `/api-keys` — 创建 API Key

**认证**: JWT Bearer

**请求体** (`CreateApiKeyDto`):

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 否 | 名称，最长 100 字符 |
| count | number | 否 | 批量创建数量，1-100，默认 1 |
| expiresAt | string(ISO) | 否 | 过期时间 |
| rateLimit / rate_limit | number | 否 | 速率限制（请求/分钟）1-10000 |
| rpmLimit / rpm_limit | number | 否 | RPM 限制 0-10000 |
| tokenLimit / token_limit | number | 否 | Token 限制（/分钟）|
| tpmLimit / tpm_limit | number | 否 | TPM 限制 |
| unlimitedQuota / unlimited_quota | boolean | 否 | 无限配额 |
| groupId / group_id | string | 否 | 用户组 ID 或名称 |
| modelLimit / model_limit | string[] | string | 否 | 允许的模型列表 |
| ipWhitelist / ip_whitelist | string[] | string | 否 | IP 白名单 |

> 兼容说明：支持 camelCase 和 snake_case 两种字段名。

**响应** `ApiKeyResponseDto`（创建/轮换时含完整 key）：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | API Key ID |
| name | string | null | 名称 |
| keyPrefix | string | Key 前缀，如 `sk-toai-xxxxxx` |
| keySuffix | string | Key 后缀 |
| key | string | 完整 Key（仅创建/轮换时返回） |
| status | `ACTIVE` | `DISABLED` | 状态 |
| isActive | boolean | 是否激活 |
| groupId | string | null | 用户组 ID |
| groupName | string | null | 用户组名称 |
| group | object | null | 用户组对象 `{id, name}` |
| usageToday | number | 今日消费（分）|
| usage30d | number | 近 30 天消费（分）|
| rpmLimit | number | null | RPM 限制 |
| tpmLimit | number | null | TPM 限制 |
| unlimitedQuota | boolean | 无限配额 |
| expiresAt | Date | null | 过期时间 |
| rateLimit | number | null | 速率限制 |
| tokenLimit | number | null | Token 限制 |
| modelLimit | string[] | 允许的模型列表 |
| ipWhitelist | string[] | IP 白名单 |
| lastUsedAt | Date | null | 最后使用时间 |
| totalRequests | number | 累计请求数 |
| createdAt | Date | 创建时间 |
| keys | CreatedApiKeyDto[] | 批量创建结果（仅创建时） |

### 4.2 GET `/api-keys` — 获取 API Key 列表

**认证**: JWT Bearer

**响应**: `ApiKeyResponseDto[]`

### 4.3 PATCH `/api-keys/:id` — 更新 API Key

**认证**: JWT Bearer

**请求体**: 同 `CreateApiKeyDto`

### 4.4 PATCH `/api-keys/:id/disable` — 禁用 API Key

**认证**: JWT Bearer

**响应**: `ApiKeyResponseDto`

### 4.5 PATCH `/api-keys/:id/enable` — 启用 API Key

**认证**: JWT Bearer

**响应**: `ApiKeyResponseDto`

### 4.6 DELETE `/api-keys/:id` — 删除 API Key

**认证**: JWT Bearer

**响应**: `204 No Content`

### 4.7 POST `/api-keys/:id/rotate` — 轮换 API Key

**认证**: JWT Bearer

**说明**: 生成新 key 值，保留原有配置，旧 key 立即失效。完整 key 只在此次返回。

**响应**: `ApiKeyResponseDto`（含完整 key）

### 4.8 GET `/api-keys/:id/usage` — 获取 API Key 用量统计

**认证**: JWT Bearer

**响应**:

```json
{
  "keyId": "clxxxxx",
  "totalRequests": 1250,
  "totalTokens": 450000,
  "totalCost": 125.50,
  "last7Days": [
    { "date": "2026-06-01", "requests": 150, "tokens": 50000, "cost": 12.30 }
  ]
}
```

### 4.9 GET `/api-keys/:id/group` — 获取 API Key 分组信息

**认证**: JWT Bearer

**响应**:

```json
{
  "keyId": "clxxxxx",
  "group": {
    "id": "clxxxxx",
    "name": "default",
    "display_name": "默认组",
    "price_multiplier": 1.0,
    "rpm_limit": 60,
    "tpm_limit": 60000,
    "max_api_keys": 10
  }
}
```

---

## 5. 余额与账单 Balance

**Controller**: `BalanceController` | **路由前缀**: `/balance` | **Swagger Tag**: `Balance`

### 5.1 GET `/balance` — 查询当前用户余额

**认证**: JWT Bearer

**响应**:

```json
{
  "amount": 100000,
  "frozen": 0,
  "available": 100000
}
```

> 所有金额单位为 **分**（100 分 = 1 元）

### 5.2 POST `/balance/recharge` — 充值余额（管理员）

**认证**: JWT Bearer + `admin` 角色

**请求体**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| targetUserId | string | 是 | 目标用户 ID |
| amount | number | 是 | 充值金额（元），0.01-1000000，最多2位小数 |
| remark | string | 否 | 备注 |

### 5.3 GET `/balance/transactions` — 获取交易流水

**认证**: JWT Bearer

**查询参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 默认 1 |
| pageSize | number | 否 | 默认 20，最大 100 |
| type | string | 否 | 交易类型枚举 |
| startDate | string(ISO) | 否 | 开始日期 |
| endDate | string(ISO) | 否 | 结束日期 |

### 5.4 GET `/balance/logs` — 获取请求日志

**认证**: JWT Bearer

**查询参数**: 分页标准参数

### 5.5 GET `/balance/stats` — 获取余额和消费统计

**认证**: JWT Bearer

**查询参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| period | string | 否 | 统计周期: `24h` / `7d` (默认) / `30d` / `90d` |
| granularity | string | 否 | 聚合粒度: `hour` / `day` (默认) |

### 5.6 GET `/balance/bills` — 获取消费明细

**认证**: JWT Bearer

**查询参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 默认 1 |
| pageSize | number | 否 | 默认 20 |
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 结束日期 |

### 5.7 GET `/balance/bills/daily` — 获取按天聚合的消费统计

**认证**: JWT Bearer

**查询参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| days | number | 否 | 最近天数，默认 30 |

---

## 6. 支付 Payment

**Controller**: `PaymentController` | **路由前缀**: `/payment` | **Swagger Tag**: `Payment`

### 6.1 POST `/payment/orders` — 创建充值订单

**认证**: JWT Bearer

**请求体** (`CreateOrderDto`):

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| amount | number | 是 | 充值金额（元），0.01-1000000，最多2位小数 |
| paymentMethod | string | 是 | 支付方式枚举 |
| productName | string | 否 | 商品名称，最长 100 字符 |

**支付方式枚举**:

| 值 | 说明 |
|----|------|
| EPAY_ALIPAY | 易支付-支付宝 |
| EPAY_WECHAT | 易支付-微信 |
| ALIPAY | 支付宝 |
| WECHAT_PAY | 微信支付 |

**响应** `OrderResponseDto`:

| 字段 | 类型 | 说明 |
|------|------|------|
| orderNo | string | 订单号 |
| amount | number | 金额（分）|
| paymentMethod | string | 支付方式 |
| status | string | 订单状态 |
| payUrl | string | 支付链接或表单 HTML |
| createdAt | Date | 创建时间 |

### 6.2 GET `/payment/orders` — 获取用户订单列表

**认证**: JWT Bearer

**查询参数**: 分页标准参数

### 6.3 GET `/payment/orders/:orderNo` — 获取订单详情

**认证**: JWT Bearer

**响应** `OrderDetailDto`:

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 订单 ID |
| orderNo | string | 订单号 |
| amount | number | 金额（分）|
| paidAmount | number | null | 实付金额（分）|
| paymentMethod | string | null | 支付方式 |
| status | string | 订单状态 |
| productType | string | 商品类型 |
| productName | string | 商品名称 |
| paidAt | Date | null | 支付时间 |
| createdAt | Date | 创建时间 |

### 6.4 POST `/payment/orders/:orderNo/cancel` — 取消订单

**认证**: JWT Bearer

**响应**: `{ "message": "订单已取消" }`

### 6.5 GET `/payment/methods` — 获取可用支付方式

**认证**: 无

### 6.6 GET `/payment/promotions` — 获取当前有效的充值赠送活动

**认证**: 无

**查询参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| amount | number | 否 | 充值金额，用于计算赠送金额 |

### 6.7 GET/POST `/payment/notify/epay` — 易支付异步通知

**认证**: 无（支付平台回调）

**说明**: 同时支持 GET 和 POST，始终返回 `"success"`

### 6.8 GET/POST `/payment/notify/alipay` — 支付宝异步通知

**认证**: 无（支付平台回调）

**说明**: 同时支持 GET 和 POST，始终返回 `"success"`

### 6.9 POST `/payment/notify/wechatpay` — 微信支付异步通知

**认证**: 无（支付平台回调）

**说明**: 验证 `wechatpay-timestamp`、`wechatpay-nonce`、`wechatpay-signature`、`wechatpay-serial` 请求头

### 6.10 GET `/payment/return/epay` — 易支付同步跳转

**认证**: 无

**说明**: 302 重定向到前端 `/recharge?success=true&orderNo=xxx` 或 `/recharge?success=false`

---

## 7. Gateway 核心网关

**Controller**: `GatewayController` | **路由前缀**: 无（直接挂载） | **Swagger Tag**: `Gateway`

### 7.1 POST `/v1/chat/completions` — 聊天补全

**认证**: X-API-Key 或 Authorization: Bearer

**认证方式**:
- Header: `X-API-Key: sk-toai-xxx`
- Header: `Authorization: Bearer sk-toai-xxx`

**请求体** (`ChatCompletionDto`):

> 完全兼容 OpenAI Chat Completion 格式

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| model | string | 是 | 模型名称，如 `gpt-4o` |
| messages | ChatMessageDto[] | 是 | 消息列表，至少 1 条 |
| temperature | number | 否 | 采样温度 0~2，默认由模型决定 |
| max_tokens | number | 否 | 最大生成 token 数 |
| top_p | number | 否 | 核采样参数 0~1 |
| stream | boolean | 否 | 是否流式输出，默认 false |
| tools | ToolDto[] | 否 | 工具定义列表 |
| tool_choice | string/object | 否 | 工具选择策略: `auto` / `none` / `{type, function}` |
| stop | string[] | 否 | 停止序列 |
| frequency_penalty | number | 否 | 频率惩罚 -2~2 |
| presence_penalty | number | 否 | 存在惩罚 -2~2 |
| seed | number | 否 | 随机种子 |
| user | string | 否 | 用户标识 |

**ChatMessageDto**:

| 字段 | 类型 | 说明 |
|------|------|------|
| role | enum | `system` / `user` / `assistant` / `tool` |
| content | string | null | 消息内容 |
| tool_call_id | string | tool 消息时必填 |

**同步响应** `ChatCompletionResponseDto`（标准 OpenAI 格式）：

```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "Hello!" },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

**流式响应**: SSE (Server-Sent Events)，格式 `data: {chunk}\n\n`，结束时发送 `data: [DONE]\n\n`

### 7.2 GET `/v1/models` — 获取可用模型列表

**认证**: X-API-Key

**响应** `ModelListResponseDto`（OpenAI 兼容格式）：

```json
{
  "object": "list",
  "data": [
    {
      "id": "gpt-4o",
      "object": "model",
      "created": 1716019200,
      "owned_by": "openai"
    }
  ]
}
```

> 缓存 30 秒

### 7.3 GET `/v1/models/public` — 公开模型列表

**认证**: 无

**说明**: 含定价和能力信息的模型列表，用于营销页面

**响应**：

```json
{
  "data": [
    {
      "id": "gpt-4o",
      "displayName": "GPT-4o",
      "providerId": "openai",
      "maxContext": 128000,
      "supportsStreaming": true,
      "supportsTools": true,
      "supportsVision": true,
      "pricing": {
        "inputPrice": 2.5,
        "outputPrice": 10,
        "cachedPrice": 1.25,
        "reasoningPrice": null,
        "multiplier": 1
      }
    }
  ]
}
```

> 缓存 60 秒

### 7.4 GET `/v1/status` — 服务状态

**认证**: 无

**响应**：

```json
{
  "data": [
    {
      "provider": "DeepSeek",
      "channel": "DeepSeek Main",
      "status": "ACTIVE",
      "avgLatencyMs": 1200,
      "totalRequests": 5000,
      "failedRequests": 23,
      "failureRate": 0.46
    }
  ]
}
```

### 7.5 POST `/v1/anthropic` — Anthropic Messages API

**认证**: X-API-Key

**说明**: 兼容 Anthropic SDK / Claude Code 原生格式

**请求头**:

| 头 | 必填 | 说明 |
|----|------|------|
| x-api-key | 是 | API Key |
| anthropic-version | 否 | API 版本，默认 `2023-06-01` |

**请求体**: Anthropic Messages 格式

**流式响应**: Anthropic SSE 格式 (`event: xxx\ndata: {...}\n\n`)

---

## 8. 签到 Checkin

**Controller**: `CheckinController` | **路由前缀**: `/checkin` | **Swagger Tag**: `Checkin`

### 8.1 POST `/checkin` — 用户签到

**认证**: JWT Bearer

**响应**：

```json
{
  "reward": 2500,
  "consecutiveDays": 5,
  "totalDays": 15,
  "totalReward": 35000
}
```

> 奖励单位为 **分**

### 8.2 GET `/checkin/history` — 获取签到历史

**认证**: JWT Bearer

**查询参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | number | 否 | 返回条数，默认 30 |

**响应**：

```json
[
  {
    "id": "clxxxxx",
    "user_id": "clxxxxx",
    "check_date": "2026-06-08T00:00:00.000Z",
    "reward": 2500,
    "created_at": "2026-06-08T08:30:00.000Z"
  }
]
```

### 8.3 GET `/checkin/stats` — 获取签到统计

**认证**: JWT Bearer

**响应**：

```json
{
  "totalDays": 15,
  "totalReward": 35000,
  "consecutiveDays": 5
}
```

### 8.4 GET `/checkin/config` — 获取签到配置

**认证**: JWT Bearer

**响应**：

```json
{
  "id": "clxxxxx",
  "is_enabled": true,
  "min_reward": 1000,
  "max_reward": 5000,
  "updated_at": "2026-06-08T00:00:00.000Z",
  "created_at": "2026-06-08T00:00:00.000Z"
}
```

### 8.5 PUT `/checkin/config` — 更新签到配置

**认证**: JWT Bearer + `ADMIN` / `SUPER_ADMIN` 角色

**请求体** (`UpdateCheckinConfigDto`):

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| is_enabled | boolean | 否 | 是否启用 |
| min_reward | number | 否 | 最小奖励（分）|
| max_reward | number | 否 | 最大奖励（分）|

---

## 9. 邀请奖励 Invite

**Controller**: `InviteController` | **路由前缀**: `/invite` | **Swagger Tag**: `Invite`

### 9.1 GET `/invite/code` — 获取邀请码

**认证**: JWT Bearer

**响应**：

```json
{
  "inviteCode": "ABC123",
  "inviteLink": "http://localhost:3000/register?invite=ABC123"
}
```

### 9.2 GET `/invite/records` — 获取邀请记录

**认证**: JWT Bearer

**响应**：

```json
[
  {
    "id": "clxxxxx",
    "inviter_id": "clxxxxx",
    "invitee_id": "clxxxxx",
    "reward": 10000,
    "pending_reward": 0,
    "recharge_count": 2,
    "created_at": "2026-06-08T00:00:00.000Z",
    "invitee": {
      "id": "clxxxxx",
      "email": "user@example.com",
      "display_name": "用户",
      "created_at": "2026-06-08T00:00:00.000Z"
    }
  }
]
```

### 9.3 GET `/invite/stats` — 获取邀请统计

**认证**: JWT Bearer

**响应**：

```json
{
  "totalInvites": 10,
  "totalReward": 50000,
  "pendingReward": 0
}
```

---

## 10. 排行榜 Leaderboard

**Controller**: `LeaderboardController` | **路由前缀**: `/leaderboard` | **Swagger Tag**: `Leaderboard`

> 所有排行榜接口均为 **公开**，无需认证。

### 10.1 GET `/leaderboard` — 获取排行榜综合数据

**查询参数** (`LeaderboardQueryDto`):

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| period | string | WEEK | 周期: `TODAY` / `WEEK` / `MONTH` / `YEAR` / `ALL` |
| limit | number | 10 | 返回数量 1-50 |

**响应**：

```json
{
  "period": "WEEK",
  "hot_models": [
    { "model": "gpt-4", "requests": 5000, "tokens": 2000000 }
  ],
  "vendor_share": [
    { "vendor": "openai", "requests": 8000, "tokens": 3000000 }
  ]
}
```

### 10.2 GET `/leaderboard/models` — 获取热门模型

**参数**: 同上

### 10.3 GET `/leaderboard/vendors` — 获取提供商份额

**参数**: 同上

### 10.4 GET `/leaderboard/trending` — 获取趋势分析

**参数**: 同上，对比上一周期排名变化

---

## 11. 通知配置 Notification

**Controller**: `NotificationController` | **路由前缀**: `/users/me/notifications` | **Swagger Tag**: `Notification`

### 11.1 GET `/users/me/notifications` — 获取通知配置

**认证**: JWT Bearer

**响应**：

```json
{
  "email_enabled": true,
  "webhook_enabled": false,
  "webhook_url": null,
  "wxpusher_enabled": false,
  "wxpusher_uid": null,
  "low_balance_threshold": 1000
}
```

### 11.2 PUT `/users/me/notifications` — 更新通知配置

**认证**: JWT Bearer

**请求体** (`UpdateNotificationConfigDto`):

| 字段 | 类型 | 说明 |
|------|------|------|
| email_enabled | boolean | 是否启用邮件通知 |
| webhook_enabled | boolean | 是否启用 Webhook |
| webhook_url | string | Webhook URL |
| wxpusher_enabled | boolean | 是否启用 WxPusher |
| wxpusher_uid | string | WxPusher UID |
| low_balance_threshold | number | 余额不足阈值（分）|

### 11.3 POST `/users/me/notifications/test` — 发送测试通知

**认证**: JWT Bearer

**请求体** (`TestNotificationDto`):

| 字段 | 类型 | 说明 |
|------|------|------|
| channel | string | 渠道: `email` / `webhook` / `wxpusher` |

**响应**：

```json
{ "success": true, "message": "测试通知发送成功" }
```

---

## 12. 兑换码 Redeem

**Controller**: `RedeemController` | **路由前缀**: `/redeem` | **Swagger Tag**: `Redeem`

### 12.1 POST `/redeem` — 用户兑换

**认证**: JWT Bearer

**请求体** (`RedeemCodeDto`):

| 字段 | 类型 | 说明 |
|------|------|------|
| code | string | 兑换码 |

**响应**：

```json
{
  "code": "ABCD1234",
  "reward": 10000,
  "rewardYuan": 100.0
}
```

### 12.2 POST `/redeem/codes` — 批量生成兑换码（管理员）

**认证**: JWT Bearer + `ADMIN` / `SUPER_ADMIN` 角色

**请求体** (`GenerateCodesDto`):

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | 类型: `FIXED` / `PERCENTAGE` |
| value | number | 是 | 金额（分）或百分比 |
| count | number | 是 | 生成数量，1-1000 |
| max_uses | number | 是 | 每个码最大使用次数 |
| expires_at | string(ISO) | 否 | 过期时间 |

### 12.3 GET `/redeem/codes` — 获取兑换码列表（管理员）

**认证**: JWT Bearer + `ADMIN` / `SUPER_ADMIN` 角色

### 12.4 DELETE `/redeem/codes/:id` — 删除兑换码（管理员）

**认证**: JWT Bearer + `ADMIN` / `SUPER_ADMIN` 角色

**响应**: `204 No Content`

### 12.5 PUT `/redeem/codes/:id` — 更新兑换码（管理员）

**认证**: JWT Bearer + `ADMIN` / `SUPER_ADMIN` 角色

**请求体** (`UpdateCodeDto`):

| 字段 | 类型 | 说明 |
|------|------|------|
| is_active | boolean | 是否启用 |
| expires_at | string(ISO) | 过期时间 |
| max_uses | number | 最大使用次数 |

---

## 13. 分析看板 Analytics

**Controller**: `AnalyticsController` | **路由前缀**: `/balance/analytics` | **Swagger Tag**: `Analytics`

### 13.1 GET `/balance/analytics` — 获取综合分析数据

**认证**: JWT Bearer

**查询参数** (`AnalyticsQueryDto`):

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| days | number | 7 | 时间范围，1-365 |
| limit | number | 10 | 返回数量限制，1-100 |

**响应**：

```json
{
  "overview": {
    "total_requests": 1250,
    "total_tokens": 450000,
    "total_cost": 15000,
    "avg_tokens_per_request": 360,
    "success_rate": 98.5
  },
  "call_trend": [
    { "date": "2026-06-01", "requests": 150, "tokens": 54000, "cost": 1800 }
  ],
  "model_ranking": [
    { "model": "gpt-4", "requests": 500, "tokens": 200000, "cost": 8000 }
  ]
}
```

### 13.2 GET `/balance/analytics/call-trend` — 获取调用趋势

**认证**: JWT Bearer

**参数**: 同上

### 13.3 GET `/balance/analytics/model-ranking` — 获取模型排行

**认证**: JWT Bearer

**参数**: 同上

---

## 14. 管理后台 Admin

**Controller**: `AdminController` | **路由前缀**: `/admin` | **Swagger Tag**: `Admin`

> **所有 Admin 接口需要**: JWT Bearer + `admin` 角色（部分需要 `super_admin`）

### 14.1 Dashboard

#### GET `/admin/dashboard` — 获取 Dashboard 数据

**查询参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| startDate | string | 开始日期 |
| endDate | string | 结束日期 |

**响应** (`DashboardResponseDto`):

```json
{
  "metrics": {
    "totalUsers": 1250,
    "totalUsersGrowth": 12.5,
    "totalRecharge": 5000000,
    "totalRechargeGrowth": 8.3,
    "totalConsumption": 3500000,
    "totalConsumptionGrowth": 15.2,
    "totalRequests": 150000,
    "totalRequestsGrowth": 22.1,
    "totalBalance": 20000000
  },
  "callStats": [
    { "label": "06-01", "requests": 5000, "tokens": 2000000, "cost": 150000 }
  ],
  "modelDistribution": [
    { "name": "gpt-4o", "count": 50000, "percentage": 33.3 }
  ],
  "recentOrders": [
    { "id": "clxxx", "orderNo": "20260608123456", "userEmail": "u***@example.com", "amount": 10000, "paymentMethod": "ALIPAY", "status": "SUCCESS", "createdAt": "2026-06-08T10:00:00Z" }
  ],
  "channelStatus": [
    { "id": "clxxx", "name": "DeepSeek Main", "status": "ACTIVE", "avgLatency": 1200, "todayRequests": 5000 }
  ]
}
```

### 14.2 用户组管理

#### GET `/admin/user-groups` — 获取用户组列表

**查询参数**: 分页 + `search` + `isActive`

#### POST `/admin/user-groups` — 创建用户组

**请求体** (`CreateUserGroupDto`):

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 组名（英文唯一）最长 50 |
| displayName | string | 是 | 显示名最长 50 |
| description | string | 否 | 描述 |
| priceMultiplier | number | 是 | 价格倍率 0.1-10.0 |
| rpmLimit | number | 是 | 请求/分钟 ≥1 |
| tpmLimit | number | 是 | Token/分钟 ≥1 |
| maxApiKeys | number | 是 | 最大 API Key 数 ≥1 |
| allowedModels | string[] | 否 | 允许的模型 |
| allowedChannels | string[] | 否 | 允许的渠道 |
| allowProxy | boolean | 否 | 是否允许代理 |
| allowShare | boolean | 否 | 是否允许分享 |

#### GET `/admin/user-groups/:id` — 获取用户组详情

#### PATCH `/admin/user-groups/:id` — 更新用户组

#### PATCH `/admin/user-groups/:id/toggle` — 切换用户组状态

#### DELETE `/admin/user-groups/:id` — 删除用户组（有关联用户时拒绝）

### 14.3 角色管理

#### GET `/admin/roles` — 获取角色列表

#### POST `/admin/roles` — 创建角色（super_admin）

#### GET `/admin/roles/:id` — 获取角色详情（含权限）

#### PATCH `/admin/roles/:id` — 更新角色（super_admin）

#### DELETE `/admin/roles/:id` — 删除角色（系统角色不可删除，super_admin）

#### PUT `/admin/roles/:id/permissions` — 设置角色权限（super_admin）

### 14.4 权限管理

#### GET `/admin/permissions` — 获取所有权限点

### 14.5 API Key 管理（Admin）

#### GET `/admin/api-keys` — 获取 API Key 列表

**查询参数**: 分页 + `search` + `isActive` + `userId`

#### GET `/admin/api-keys/:id` — 获取 API Key 详情

#### PATCH `/admin/api-keys/:id/toggle` — 切换 API Key 状态

#### DELETE `/admin/api-keys/:id` — 删除 API Key

### 14.6 订单管理

#### GET `/admin/orders` — 获取订单列表

**查询参数**: 分页 + `search` + `status` + `userId`

#### GET `/admin/orders/:id` — 获取订单详情

#### POST `/admin/orders/:orderNo/verify` — 验证并补单

**说明**: 向支付平台查询订单状态，如果已支付则补单（防掉单）

### 14.7 账单/交易管理

#### GET `/admin/bills` — 获取账单列表

**查询参数**: 分页 + `search` + `type` + `userId`

### 14.8 Provider 管理

#### GET `/admin/providers` — 获取 Provider 列表

**查询参数**: 分页

**响应**:

```json
{
  "items": [{
    "id": "clxxx",
    "name": "deepseek",
    "displayName": "DeepSeek",
    "baseUrl": "https://api.deepseek.com",
    "isActive": true,
    "channelCount": 3,
    "createdAt": "...",
    "updatedAt": "..."
  }]
}
```

#### POST `/admin/providers` — 创建 Provider

**请求体** (`CreateProviderDto`):

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 名称（唯一）最长 50 |
| displayName | string | 是 | 显示名最长 100 |
| baseUrl | string | 是 | API 基础 URL |
| isActive | boolean | 否 | 是否启用 |

#### GET `/admin/providers/:id` — 获取 Provider 详情

#### PATCH `/admin/providers/:id` — 更新 Provider

#### DELETE `/admin/providers/:id` — 删除 Provider（有关联渠道时拒绝）

### 14.9 渠道管理

#### GET `/admin/channels` — 获取渠道列表

**查询参数**: 分页 + `providerId`

**响应**:

```json
{
  "items": [{
    "id": "clxxx",
    "providerId": "clxxx",
    "provider": { "id": "clxxx", "name": "deepseek", "displayName": "DeepSeek" },
    "name": "DeepSeek Main",
    "baseUrl": "https://api.deepseek.com",
    "keyPrefix": "sk-***",
    "weight": 1,
    "priority": 0,
    "isActive": true,
    "status": "ACTIVE",
    "totalRequests": 5000,
    "failedRequests": 23,
    "avgLatencyMs": 1200,
    "modelCount": 5,
    "createdAt": "...",
    "updatedAt": "..."
  }]
}
```

#### POST `/admin/channels` — 创建渠道

**请求体** (`CreateChannelDto`):

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| providerId | string | 是 | 所属 Provider ID |
| name | string | 是 | 渠道名称最长 100 |
| baseUrl | string | 是 | API 基础 URL |
| apiKey | string | 是 | 上游 API Key（加密存储）|
| weight | number | 否 | 权重 1-100 |
| priority | number | 否 | 优先级 0-100 |
| groupId | string | 否 | 组织 ID |
| tags | string | 否 | 标签（逗号分隔）|
| notes | string | 否 | 内部备注 |
| modelMapping | string | 否 | 模型映射（JSON）|
| statusCodeMapping | string | 否 | 状态码映射（JSON）|
| paramOverrides | string | 否 | 参数覆盖（JSON）|
| headerOverrides | string | 否 | 请求头覆盖（JSON）|
| proxy | string | 否 | 代理地址 |
| systemPrompt | string | 否 | 系统提示词 |
| autoDisableOnFailure | boolean | 否 | 失败时自动禁用 |

#### GET `/admin/channels/:id` — 获取渠道详情

#### PATCH `/admin/channels/:id` — 更新渠道

#### PATCH `/admin/channels/:id/enable` — 启用渠道

#### PATCH `/admin/channels/:id/disable` — 禁用渠道

#### DELETE `/admin/channels/:id` — 删除渠道

#### POST `/admin/channels/:id/test` — 测试渠道连通性

**说明**: 发送测试请求验证 API Key 和 Base URL 是否有效

### 14.10 模型管理

#### GET `/admin/models` — 获取模型列表

**查询参数**: 分页

**响应**:

```json
{
  "items": [{
    "id": "clxxx",
    "name": "deepseek-chat",
    "displayName": "DeepSeek Chat",
    "providerId": "clxxx",
    "maxContext": 128000,
    "supportsStreaming": true,
    "supportsTools": true,
    "supportsVision": false,
    "isActive": true,
    "pricing": {
      "id": "clxxx",
      "inputPrice": 2.5,
      "outputPrice": 10,
      "cachedPrice": null,
      "reasoningPrice": null,
      "multiplier": 1
    },
    "createdAt": "...",
    "updatedAt": "..."
  }]
}
```

#### POST `/admin/models` — 创建模型

**请求体** (`CreateModelDto`):

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 模型名称（唯一）最长 100 |
| displayName | string | 是 | 显示名最长 200 |
| providerId | string | 是 | 所属 Provider 名称 |
| maxContext | number | 是 | 最大上下文长度 |
| supportsStreaming | boolean | 否 | 是否支持流式 |
| supportsTools | boolean | 否 | 是否支持工具调用 |
| supportsVision | boolean | 否 | 是否支持视觉 |

#### GET `/admin/models/:id` — 获取模型详情

#### PATCH `/admin/models/:id` — 更新模型

#### DELETE `/admin/models/:id` — 删除模型

#### PUT `/admin/models/:id/pricing` — 设置/更新模型定价

**请求体** (`UpsertPricingDto`):

> 价格单位为 **元/百万 token**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| inputPrice | number | 是 | 输入价格，最多4位小数 |
| outputPrice | number | 是 | 输出价格，最多4位小数 |
| cachedPrice | number | 否 | 缓存输入价格 |
| reasoningPrice | number | 否 | 推理 token 价格 |
| multiplier | number | 否 | 价格倍率，默认 1.0 |

### 14.11 用户管理

#### GET `/admin/users` — 获取用户列表

**查询参数**: 分页 + `role` + `status` + `search`

#### GET `/admin/users/:id` — 获取用户详情

**说明**: 含余额、使用统计、最近订单、交易记录、API Key 等

#### PATCH `/admin/users/:id/role` — 修改用户角色（super_admin）

**请求体** (`UpdateUserRoleDto`):

| 字段 | 类型 | 说明 |
|------|------|------|
| role | string | 新角色 |

#### PATCH `/admin/users/:id/status` — 修改用户状态

**请求体** (`UpdateUserStatusDto`):

| 字段 | 类型 | 说明 |
|------|------|------|
| status | string | 状态: `ACTIVE` / `SUSPENDED` / `BANNED` |

### 14.12 支付配置管理

#### GET `/admin/payment-configs` — 获取所有支付配置（脱敏）

#### GET `/admin/payment-configs/:name` — 获取单个支付配置

#### PUT `/admin/payment-configs/:name` — 更新支付配置

#### PATCH `/admin/payment-configs/:name/toggle` — 切换启用状态

### 14.13 SMTP 配置管理

#### GET `/admin/smtp-config` — 获取 SMTP 配置

#### PUT `/admin/smtp-config` — 更新 SMTP 配置

#### PATCH `/admin/smtp-config/toggle` — 切换启用状态

#### POST `/admin/smtp-config/test-connection` — 测试 SMTP 连接

#### POST `/admin/smtp-config/send-test` — 发送测试邮件

### 14.14 短信配置管理

#### GET `/admin/sms-config` — 获取短信配置

#### PUT `/admin/sms-config` — 更新短信配置

#### PATCH `/admin/sms-config/toggle` — 切换启用状态

#### POST `/admin/sms-config/test-connection` — 测试短信配置连接

#### POST `/admin/sms-config/send-test` — 发送测试短信

### 14.15 充值赠送活动管理

#### GET `/admin/promotions` — 获取充值赠送活动列表

**查询参数**: 分页 + `isActive`

#### POST `/admin/promotions` — 创建充值赠送活动

#### GET `/admin/promotions/:id` — 获取活动详情

#### PATCH `/admin/promotions/:id` — 更新活动

#### PATCH `/admin/promotions/:id/toggle` — 切换活动状态

#### DELETE `/admin/promotions/:id` — 删除活动

### 14.16 发票管理

#### GET `/admin/invoices` — 获取发票列表

**查询参数**: 分页 + `status` + `search`

#### POST `/admin/invoices` — 创建发票

#### GET `/admin/invoices/:id` — 获取发票详情

#### PATCH `/admin/invoices/:id/review` — 审核发票

#### PATCH `/admin/invoices/:id/issue` — 开具发票

#### DELETE `/admin/invoices/:id` — 删除发票

### 14.17 系统设置管理

#### GET `/admin/system-settings` — 获取所有系统设置（按分类分组）

#### GET `/admin/system-settings/:category` — 获取指定分类设置

#### PUT `/admin/system-settings/:category` — 批量更新分类设置

#### PATCH `/admin/system-settings/:category/:key` — 更新单个设置

---

## 附录

### A. 后端路由路径总结

> 注：所有路径前均需添加 `/api/v1` 前缀

| 模块 | 路径前缀 | 认证 |
|------|----------|------|
| Auth | `/auth` | 混合 |
| Users | `/users` | JWT |
| API Keys | `/api-keys` | JWT |
| Balance | `/balance` | JWT |
| Payment (用户端) | `/payment` | 混合 |
| Gateway | 无前缀（`chat/completions`, `models`, `status`, `anthropic`）| API-Key |
| Checkin | `/checkin` | JWT |
| Invite | `/invite` | JWT |
| Leaderboard | `/leaderboard` | 无 |
| Notification | `/users/me/notifications` | JWT |
| Redeem | `/redeem` | 混合 |
| Analytics | `/balance/analytics` | JWT |
| Admin | `/admin` | JWT + admin |

### B. 标准响应包装格式

```
成功: { code: 0,    message: "success", data: <实际数据> }
错误: { code: ≠0,   message: "错误描述", data: null }
```

> 注：`POST /auth/register` 和 `POST /auth/login` 等接口也经过包装，前端通过 `data.user` 和 `data.tokens` 获取

### C. Token 存储与刷新

- **accessToken**: 15 分钟有效期
- **refreshToken**: 7 天有效期
- 前端存储: `localStorage` (key: `toaiapi_access_token`, `toaiapi_refresh_token`)
- 自动刷新: 后端返回 401 时，前端通过 `POST /auth/refresh` 自动刷新

### D. 金额单位说明

- **所有金额以分为单位**（元/百万 token）
- 价格设置（模型定价）以 **元/百万 token** 为单位
- 充值接口中 `amount` 以 **元** 为单位
