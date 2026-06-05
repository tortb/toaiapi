# 前端页面路由规划

> 基于后端 53 个 API 端点反推的前端页面需求，覆盖用户端、管理端、公开页面三大区域。

---

## 目录

- [一、公开页面（Marketing）](#一公开页面marketing)
- [二、认证页面（Auth）](#二认证页面auth)
- [三、用户端（Dashboard）](#三用户端dashboard)
- [四、管理端（Admin）](#四管理端admin)
- [五、页面与 API 端点映射表](#五页面与-api-端点映射表)

---

## 一、公开页面（Marketing）

无需登录即可访问。

| 路由 | 页面名称 | 用途 | 关联 API |
|------|---------|------|----------|
| `/` | 首页 | 产品介绍、功能展示、CTA | — |
| `/models` | 模型列表 | 展示所有可用模型及定价（公开） | `GET /v1/models/public` |
| `/status` | 服务状态 | 展示各渠道实时状态 | `GET /v1/status` |
| `/docs` | 接入文档 | API 接入指南、SDK 说明 | — |
| `/pricing` | 定价页 | 模型定价对比（可复用 models 数据） | `GET /v1/models/public` |

---

## 二、认证页面（Auth）

未登录用户访问，已登录自动跳转 Dashboard。

| 路由 | 页面名称 | 用途 | 关联 API |
|------|---------|------|----------|
| `/login` | 登录 | 邮箱 + 密码登录 | `POST /auth/login` |
| `/register` | 注册 | 邮箱注册新账号 | `POST /auth/register` |
| `/forgot-password` | 忘记密码 | 发送重置链接到邮箱 | `POST /auth/forgot-password` |
| `/reset-password` | 重置密码 | 通过邮件链接设置新密码 | `POST /auth/reset-password` |

---

## 三、用户端（Dashboard）

需要 JWT 登录。使用统一的 Sidebar 布局。

| 路由 | 页面名称 | 用途 | 关联 API |
|------|---------|------|----------|
| `/dashboard` | 仪表盘概览 | 余额、今日用量、近期请求趋势、快捷入口 | `GET /balance`, `GET /balance/logs`, `GET /balance/transactions` |
| `/api-keys` | API Key 管理 | 创建、查看、编辑、启用/禁用、删除 API Key | `POST /api-keys`, `GET /api-keys`, `PATCH /api-keys/:id`, `PATCH /api-keys/:id/enable`, `PATCH /api-keys/:id/disable`, `DELETE /api-keys/:id` |
| `/usage` | 使用记录 | 请求日志分页查询，按模型/时间筛选 | `GET /balance/logs` |
| `/recharge` | 充值中心 | 选择金额 → 选择支付方式 → 创建订单 → 跳转支付 | `GET /payment/methods`, `POST /payment/orders` |
| `/orders` | 订单中心 | 订单列表、状态筛选、订单详情、取消待支付订单 | `GET /payment/orders`, `GET /payment/orders/:orderNo`, `POST /payment/orders/:orderNo/cancel` |
| `/billing` | 财务中心 | 余额变动记录、消费明细、费用趋势图表 | `GET /balance/transactions`, `GET /balance/logs` |
| `/settings` | 账户设置 | 查看/修改个人信息、修改密码、注销账号 | `GET /users/me`, `PATCH /users/me`, `POST /auth/change-password`, `DELETE /users/me` |

### 页面详细说明

#### `/dashboard` — 仪表盘概览

```
┌─────────────────────────────────────────────────┐
│ 欢迎回来，{username}                            │
├──────────┬──────────┬──────────┬────────────────┤
│ 当前余额 │ 今日消费 │ 本月消费 │ 今日请求数     │
│ ¥125.52  │ ¥3.20    │ ¥45.80   │ 1,234          │
├──────────┴──────────┴──────────┴────────────────┤
│ 最近 7 天消费趋势（折线图）                      │
├─────────────────────────────────────────────────┤
│ 最近请求（表格，取前 10 条）                     │
│ 模型 | Token | 费用 | 状态 | 时间               │
├─────────────────────────────────────────────────┤
│ 快捷操作                                        │
│ [创建 API Key] [充值] [查看文档]                │
└─────────────────────────────────────────────────┘
```

#### `/api-keys` — API Key 管理

```
┌─────────────────────────────────────────────────┐
│ API Key 管理                       [+ 创建 Key] │
├─────────────────────────────────────────────────┤
│ Key 列表                                        │
│ 名称 | Key (sk-toai-****) | 状态 | 创建时间     │
│       | [复制] [编辑] [禁用] [删除]             │
└─────────────────────────────────────────────────┘
```

- 创建时弹出完整 Key（仅显示一次）
- 支持配置：名称、速率限制、Token 限制、模型限制、IP 白名单、过期时间

#### `/recharge` — 充值中心

```
┌─────────────────────────────────────────────────┐
│ 当前余额: ¥125.52                               │
├─────────────────────────────────────────────────┤
│ 选择充值金额                                    │
│ [¥10] [¥20] [¥50] [¥100] [¥200] [¥500]        │
│ [自定义金额: ____]                              │
├─────────────────────────────────────────────────┤
│ 选择支付方式                                    │
│ [支付宝] [微信支付] [易支付]                    │
├─────────────────────────────────────────────────┤
│ 订单确认                                        │
│ 充值金额: ¥100 │ 支付方式: 支付宝               │
│ [确认支付 →]                                    │
├─────────────────────────────────────────────────┤
│ 最近充值记录（表格）                            │
│ 订单号 | 金额 | 方式 | 状态 | 时间              │
└─────────────────────────────────────────────────┘
```

#### `/orders` — 订单中心

```
┌─────────────────────────────────────────────────┐
│ 筛选: [全部状态▼] [支付方式▼] [日期范围] [搜索] │
├─────────────────────────────────────────────────┤
│ 订单列表（分页表格）                            │
│ 订单号 | 金额 | 支付方式 | 状态 | 创建时间      │
│ [查看详情] [取消]（仅 pending 状态显示）        │
└─────────────────────────────────────────────────┘
```

订单状态 Badge：`success`=成功 · `pending`=待支付 · `failed`=失败 · `cancelled`=已取消

#### `/billing` — 财务中心

```
┌─────────────────────────────────────────────────┐
│ 总消费 | 本月消费 | 当前余额 | 日均消费         │
├─────────────────────────────────────────────────┤
│ 最近 30 天消费趋势图（柱状图）                  │
├─────────────────────────────────────────────────┤
│ 余额变动记录                                    │
│ 类型 | 金额 | 余额 | 说明 | 时间                │
├─────────────────────────────────────────────────┤
│ 消费明细                                        │
│ 模型 | 输入Token | 输出Token | 费用 | 时间      │
└─────────────────────────────────────────────────┘
```

#### `/settings` — 账户设置

```
┌─────────────────────────────────────────────────┐
│ 个人信息                                        │
│ 邮箱（只读）| 昵称 [修改]                       │
├─────────────────────────────────────────────────┤
│ 修改密码                                        │
│ 当前密码 | 新密码 | 确认新密码 | [保存]         │
├─────────────────────────────────────────────────┤
│ 账号注销                                        │
│ [注销账号]（危险操作，需二次确认）              │
└─────────────────────────────────────────────────┘
```

---

## 四、管理端（Admin）

需要 admin 角色登录。独立的 Admin 布局（Sidebar + 顶部栏）。

| 路由 | 页面名称 | 用途 | 关联 API |
|------|---------|------|----------|
| `/admin` | 管理仪表盘 | 平台总览：用户数、收入、请求量、渠道状态 | 综合统计（需新增或聚合） |
| `/admin/users` | 用户管理 | 用户列表、搜索、角色变更、状态管理 | `GET /admin/users`, `GET /admin/users/:id`, `PATCH /admin/users/:id/role`, `PATCH /admin/users/:id/status` |
| `/admin/providers` | 供应商管理 | 供应商 CRUD | `GET /admin/providers`, `POST /admin/providers`, `GET /admin/providers/:id`, `PATCH /admin/providers/:id`, `DELETE /admin/providers/:id` |
| `/admin/channels` | 渠道管理 | 渠道 CRUD、启用/禁用、按供应商筛选 | `GET /admin/channels`, `POST /admin/channels`, `GET /admin/channels/:id`, `PATCH /admin/channels/:id`, `PATCH /admin/channels/:id/enable`, `PATCH /admin/channels/:id/disable`, `DELETE /admin/channels/:id` |
| `/admin/models` | 模型管理 | 模型 CRUD、定价配置 | `GET /admin/models`, `POST /admin/models`, `GET /admin/models/:id`, `PATCH /admin/models/:id`, `DELETE /admin/models/:id`, `PUT /admin/models/:id/pricing` |
| `/admin/orders` | 订单管理 | 所有用户订单查看（只读） | `GET /payment/orders`（admin 视角） |
| `/admin/payments` | 支付配置 | 支付方式启用/禁用、参数配置 | `GET /admin/payment-configs`, `GET /admin/payment-configs/:name`, `PUT /admin/payment-configs/:name`, `PATCH /admin/payment-configs/:name/toggle` |
| `/admin/smtp` | 邮件配置 | SMTP 配置、测试连接、发送测试邮件 | `GET /admin/smtp-config`, `PUT /admin/smtp-config`, `PATCH /admin/smtp-config/toggle`, `POST /admin/smtp-config/test-connection`, `POST /admin/smtp-config/send-test` |

### 页面详细说明

#### `/admin` — 管理仪表盘

```
┌─────────────────────────────────────────────────┐
│ 平台概览                                        │
├──────────┬──────────┬──────────┬────────────────┤
│ 总用户数 │ 今日注册 │ 总收入   │ 今日请求量     │
│ 1,234    │ 12       │ ¥45,678  │ 123,456        │
├──────────┴──────────┴──────────┴────────────────┤
│ 渠道状态概览                                    │
│ OpenAI ████████░░ 80% 正常                      │
│ Claude ██████████ 100% 正常                     │
│ DeepSeek ██████░░░░ 60% 部分异常                │
├─────────────────────────────────────────────────┤
│ 最近 7 天收入趋势（折线图）                     │
├─────────────────────────────────────────────────┤
│ 最近订单（表格，前 10 条）                      │
└─────────────────────────────────────────────────┘
```

#### `/admin/channels` — 渠道管理

```
┌─────────────────────────────────────────────────┐
│ 渠道管理                          [+ 创建渠道]  │
│ 筛选: [供应商▼] [状态▼] [搜索]                 │
├─────────────────────────────────────────────────┤
│ 渠道列表（分页表格）                            │
│ 名称 | 供应商 | 模型 | 状态 | 优先级 | 操作     │
│ [编辑] [启用/禁用] [删除]                       │
└─────────────────────────────────────────────────┘
```

#### `/admin/models` — 模型管理

```
┌─────────────────────────────────────────────────┐
│ 模型管理                           [+ 创建模型] │
├─────────────────────────────────────────────────┤
│ 模型列表（分页表格）                            │
│ 名称 | 标识 | 输入价格 | 输出价格 | 状态 | 操作 │
├─────────────────────────────────────────────────┤
│ 编辑定价（Drawer）                              │
│ 输入价格（/M tokens）| 输出价格（/M tokens）    │
│ [保存]                                          │
└─────────────────────────────────────────────────┘
```

#### `/admin/payments` — 支付配置

```
┌─────────────────────────────────────────────────┐
│ 支付方式配置                                    │
├──────────┬──────────┬──────────┬────────────────┤
│ 易支付   │ 支付宝   │ 微信支付 │                │
│ 已启用   │ 已禁用   │ 已启用   │                │
│ [编辑]   │ [编辑]   │ [编辑]   │                │
│ [禁用]   │ [启用]   │ [禁用]   │                │
├──────────┴──────────┴──────────┴────────────────┤
│ 编辑配置（Drawer）                              │
│ 商户ID | 密钥 | 回调地址 | 其他参数             │
│ [测试连接] [保存]                               │
└─────────────────────────────────────────────────┘
```

#### `/admin/smtp` — 邮件配置

```
┌─────────────────────────────────────────────────┐
│ SMTP 邮件配置                                   │
├─────────────────────────────────────────────────┤
│ 状态: 已启用                        [禁用]      │
├─────────────────────────────────────────────────┤
│ SMTP 主机 | 端口 | 加密方式                    │
│ 用户名    | 密码                                │
│ 发件人名称 | 发件人邮箱                         │
├─────────────────────────────────────────────────┤
│ [测试连接] [发送测试邮件] [保存]                │
└─────────────────────────────────────────────────┘
```

---

## 五、页面与 API 端点映射表

### 公开页面

| 页面 | API 端点 | 方法 |
|------|---------|------|
| `/models` | `/v1/models/public` | GET |
| `/status` | `/v1/status` | GET |

### 认证页面

| 页面 | API 端点 | 方法 |
|------|---------|------|
| `/login` | `/auth/login` | POST |
| `/register` | `/auth/register` | POST |
| `/forgot-password` | `/auth/forgot-password` | POST |
| `/reset-password` | `/auth/reset-password` | POST |

### 用户端

| 页面 | API 端点 | 方法 |
|------|---------|------|
| `/dashboard` | `/balance` | GET |
| | `/balance/logs` | GET |
| | `/balance/transactions` | GET |
| `/api-keys` | `/api-keys` | GET, POST |
| | `/api-keys/:id` | PATCH, DELETE |
| | `/api-keys/:id/enable` | PATCH |
| | `/api-keys/:id/disable` | PATCH |
| `/usage` | `/balance/logs` | GET |
| `/recharge` | `/payment/methods` | GET |
| | `/payment/orders` | POST |
| `/orders` | `/payment/orders` | GET |
| | `/payment/orders/:orderNo` | GET |
| | `/payment/orders/:orderNo/cancel` | POST |
| `/billing` | `/balance/transactions` | GET |
| | `/balance/logs` | GET |
| `/settings` | `/users/me` | GET, PATCH, DELETE |
| | `/auth/change-password` | POST |

### 管理端

| 页面 | API 端点 | 方法 |
|------|---------|------|
| `/admin` | 聚合多个端点 | — |
| `/admin/users` | `/admin/users` | GET |
| | `/admin/users/:id` | GET |
| | `/admin/users/:id/role` | PATCH |
| | `/admin/users/:id/status` | PATCH |
| `/admin/providers` | `/admin/providers` | GET, POST |
| | `/admin/providers/:id` | GET, PATCH, DELETE |
| `/admin/channels` | `/admin/channels` | GET, POST |
| | `/admin/channels/:id` | GET, PATCH, DELETE |
| | `/admin/channels/:id/enable` | PATCH |
| | `/admin/channels/:id/disable` | PATCH |
| `/admin/models` | `/admin/models` | GET, POST |
| | `/admin/models/:id` | GET, PATCH, DELETE |
| | `/admin/models/:id/pricing` | PUT |
| `/admin/orders` | `/payment/orders` | GET |
| `/admin/payments` | `/admin/payment-configs` | GET |
| | `/admin/payment-configs/:name` | GET, PUT |
| | `/admin/payment-configs/:name/toggle` | PATCH |
| `/admin/smtp` | `/admin/smtp-config` | GET, PUT |
| | `/admin/smtp-config/toggle` | PATCH |
| | `/admin/smtp-config/test-connection` | POST |
| | `/admin/smtp-config/send-test` | POST |

---

## 六、路由结构汇总

```
/                          # 首页（Marketing）
/models                    # 模型列表（公开）
/status                    # 服务状态（公开）
/docs                      # 接入文档
/pricing                   # 定价页

/login                     # 登录
/register                  # 注册
/forgot-password           # 忘记密码
/reset-password            # 重置密码

/dashboard                 # 仪表盘
/api-keys                  # API Key 管理
/usage                     # 使用记录
/recharge                  # 充值中心
/orders                    # 订单中心
/billing                   # 财务中心
/settings                  # 账户设置

/admin                     # 管理仪表盘
/admin/users               # 用户管理
/admin/providers           # 供应商管理
/admin/channels            # 渠道管理
/admin/models              # 模型管理
/admin/orders              # 订单管理
/admin/payments            # 支付配置
/admin/smtp                # 邮件配置
```

**共计：27 个页面**（5 公开 + 4 认证 + 7 用户端 + 8 管理端 + 3 可选）

---

## 七、开发优先级建议

| 优先级 | 页面 | 理由 |
|--------|------|------|
| P0 | `/login`, `/register` | 基础功能，无登录无法使用 |
| P0 | `/dashboard` | 用户首页，展示核心数据 |
| P0 | `/api-keys` | 核心功能，用户需要 Key 才能调用 API |
| P1 | `/recharge`, `/orders` | 营收闭环，用户需要充值才能使用 |
| P1 | `/settings` | 用户基础需求 |
| P1 | `/admin`, `/admin/channels`, `/admin/models` | 管理端核心，平台运营必需 |
| P2 | `/usage`, `/billing` | 数据分析，提升用户体验 |
| P2 | `/admin/users`, `/admin/providers` | 管理端扩展 |
| P2 | `/admin/payments`, `/admin/smtp` | 配置管理，初期可手动改数据库 |
| P3 | `/models`, `/status`, `/docs`, `/pricing` | 公开页面，非核心功能 |
| P3 | `/forgot-password`, `/reset-password` | 认证补充，初期可邮件联系重置 |
| P3 | `/admin/orders` | 订单管理，初期可在用户端查看 |
