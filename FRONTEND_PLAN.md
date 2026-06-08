# ToAIAPI 前端需求文档

> 基于后端代码反向推导生成
> 生效日期：2026-06-08
> 版本：v1.0

---

## 目录

1. [页面清单](#1-页面清单)
2. [页面详细需求](#2-页面详细需求)
3. [表单设计](#3-表单设计)
4. [导航结构](#4-导航结构)
5. [缺失页面分析](#5-缺失页面分析)

---

## 1. 页面清单

### 1.1 公开页面（无需登录）

| 页面名称 | 路由 | 访问权限 | 功能简介 |
|---------|------|---------|---------|
| 首页 | `/` | 公开 | 产品介绍、功能亮点、注册入口 |
| 模型广场 | `/models` | 公开 | 浏览所有可用模型及其能力信息 |
| 模型详情 | `/models/[name]` | 公开 | 查看单个模型的定价、能力、API 端点说明 |
| 价格方案 | `/pricing` | 公开 | 显示所有模型的定价表 |
| 排行榜 | `/leaderboard` | 公开 | 热门模型排行榜、提供商份额、趋势分析 |
| API 文档 | `/docs` | 公开 | API 接入文档、快速开始指南 |
| 服务状态 | `/status` | 公开 | 各渠道实时运行状态和延迟 |
| 登录 | `/login` | 公开 | 用户登录 |
| 注册 | `/register` | 公开 | 用户注册 |
| 忘记密码 | `/forgot-password` | 公开 | 发送密码重置邮件 |
| 重置密码 | `/reset-password` | 公开 | 使用 Token 重置密码 |

### 1.2 用户控制台页面（需登录）

| 页面名称 | 路由 | 访问权限 | 功能简介 |
|---------|------|---------|---------|
| 控制台概览 | `/dashboard/overview` | 登录用户 | 用量概览、余额、今日统计、模型分布 |
| API 密钥管理 | `/dashboard/apikeys` | 登录用户 | 创建、管理、轮换 API Key |
| 使用统计 | `/dashboard/usage` | 登录用户 | 调用趋势、模型排行、费用分布图表 |
| 分析看板 | `/dashboard/analytics` | 登录用户 | 综合分析数据、调用趋势、模型排行 |
| 账单中心 | `/dashboard/billing` | 登录用户 | 订单列表、消费明细、日消费趋势 |
| 消费明细 | `/dashboard/bills` | 登录用户 | 请求级别的详细消费账单 |
| 请求日志 | `/dashboard/logs` | 登录用户 | API 调用日志列表 |
| 充值中心 | `/dashboard/recharge` | 登录用户 | 选择金额和支付方式完成充值 |
| 邀请奖励 | `/dashboard/invite` | 登录用户 | 邀请码、邀请记录、奖励统计 |
| 每日签到 | `/dashboard/checkin` | 登录用户 | 每日签到获取随机奖励 |
| 个人设置 | `/dashboard/settings` | 登录用户 | 个人信息修改、密码修改、账户安全 |
| 通知设置 | `/dashboard/settings/notifications` | 登录用户 | 邮件、Webhook 等通知渠道配置 |
| 实名认证 | `/dashboard/settings/verification` | 登录用户 | 提交实名认证信息 |
| 发票申请 | `/dashboard/invoices` | 登录用户 | 申请开具发票、查看发票状态 |

### 1.3 管理后台页面（Admin 角色）

| 页面名称 | 路由 | 访问权限 | 功能简介 |
|---------|------|---------|---------|
| 管理员登录 | `/admin/login` | 公开 | 管理员登录入口 |
| 控制台 Dashboard | `/admin` | admin | 系统概览指标、调用统计、最近订单 |
| 用户管理 | `/admin/users` | admin | 用户列表、搜索、筛选 |
| 用户详情 | `/admin/users/[id]` | admin | 用户详情、余额、统计、订单 |
| 用户分组 | `/admin/users/groups` | admin | 管理用户组（价格倍率、限额） |
| API Key 管理 | `/admin/apikeys` | admin | 全局 API Key 查看和管理 |
| 角色权限 | `/admin/roles` | admin | RBAC 角色和权限管理 |
| 模型管理 | `/admin/models` | admin | 模型 CRUD 和管理 |
| 通道/渠道管理 | `/admin/channels` | admin | Provider 渠道 CRUD 和管理 |
| 服务商管理 | `/admin/providers` | admin | AI 服务商 CRUD |
| 价格策略 | `/admin/pricing` | admin | 模型定价管理 |
| 订单管理 | `/admin/orders` | admin | 订单列表、详情、补单 |
| 充值记录 | `/admin/recharges` | admin | 管理员为用户充值 |
| 交易流水 | `/admin/bills` | admin | 全局交易流水查看 |
| 充值活动 | `/admin/promotions` | admin | 充值赠送活动管理 |
| 发票审核 | `/admin/invoices` | admin | 发票审核和开具管理 |
| 支付配置 | `/admin/payment-configs` | admin | 支付渠道配置 |
| 兑换码管理 | `/admin/redeem` | admin | 生成和管理兑换码 |
| 签到配置 | `/admin/checkin` | admin | 签到奖励参数配置 |
| 实名认证审核 | `/admin/verifications` | admin | 用户实名认证审核 |
| 系统设置 - 基础 | `/admin/settings/basic` | admin | 站点名称、版权信息等 |
| 系统设置 - 网站 | `/admin/settings/website` | admin | SEO、公告、维护模式 |
| 系统设置 - 用户 | `/admin/settings/user` | admin | 用户注册、删除等开关 |
| 系统设置 - 注册 | `/admin/settings/register` | admin | 注册验证、白名单、默认余额 |
| 系统设置 - 邮箱 | `/admin/settings/email` | admin | SMTP 配置、测试 |
| 系统设置 - 通知 | `/admin/settings/notification` | admin | 系统级通知配置 |
| 系统设置 - 风控 | `/admin/settings/rate-limit` | admin | RPM/IP/Token 限流配置 |
| 系统设置 - 安全 | `/admin/settings/security` | admin | 登录锁定、密码策略、JWT 过期 |
| 系统设置 - API | `/admin/settings/api` | admin | 请求超时、并发限制、流式开关 |
| 系统设置 - 财务 | `/admin/settings/finance` | admin | 充值限额、退款、发票开关 |
| 系统设置 - 存储 | `/admin/settings/storage` | admin | 文件上传大小和类型限制 |
| 验证码配置 | `/admin/captcha` | admin | 阿里云 ESA AI 验证码配置 |
| 短信配置 | `/admin/sms` | admin | 阿里云短信配置和测试 |
| 订阅计划管理 | `/admin/subscription-plans` | admin | 订阅套餐 CRUD 管理 |
| 充值折扣管理 | `/admin/recharge-discounts` | admin | 阶梯折扣配置 |
| 渠道亲和性配置 | `/admin/affinity` | admin | 渠道亲和性规则管理 |
| 运行状态分组 | `/admin/uptime` | admin | Uptime Kuma 监控分组管理 |
| 快捷方式管理 | `/admin/shortcuts` | admin | API 快捷方式管理 |
| Provider 设置 | `/admin/provider-settings` | admin | Provider 专属设置 |

---

## 2. 页面详细需求

### 2.1 公开页面

#### 首页 `/`

**用途：** 产品落地页，向访客介绍 ToAIAPI 平台功能和优势，引导注册/登录。

**模块：**

- **导航栏** — 产品、模型、价格、排行榜、文档、服务状态链接
- **英雄区** — 平台名称、副标题、注册/登录按钮
- **功能特性区** — 支持的模型（OpenAI、Anthropic、Google 等）、高可用、价格优势
- **数据统计区** — 公开排行榜数据精选
- **定价摘要** — 显示主要模型定价快速预览
- **页脚** — 版权信息、ICP 备案号、公安备案号（从系统设置读取）

**调用接口：** `GET /api/v1/models/public`

---

#### 模型广场 `/models`

**用途：** 展示所有可用 AI 模型及其能力标签，帮助用户选择模型。

**模块：**

- **筛选栏** — 按提供商、能力（流式/工具/视觉）筛选
- **模型卡片网格** — 每个卡片显示模型名称、提供商、上下文窗口、定价、能力标签
- **模型详情抽屉** — 点击模型卡片后展示完整详情

**列表字段：**

- 模型 ID
- 显示名称
- 提供商
- 上下文窗口（maxContext）
- 能力标签：流式、工具、视觉
- 定价：输入价格、输出价格、缓存价格、推理价格
- 状态（上架/下架）

**按钮：**

- 点击模型卡片 → 打开详情抽屉 `/models/[name]`

**调用接口：** `GET /api/v1/models/public`

---

#### 模型详情 `/models/[name]`

**用途：** 查看单个模型的完整信息和定价详情。

**模块：**

- **基本信息** — 模型名称、提供商、上下文窗口
- **能力标签** — 流式/工具/视觉支持
- **定价表** — 输入/输出/缓存/推理价格
- **价格倍率** — 分组价格倍率说明
- **API 端点示例** — 调用该模型的代码示例

**调用接口：** `GET /api/v1/models/public`（在列表模型中包含详情）

---

#### 价格方案 `/pricing`

**用途：** 以表格形式展示所有模型的价格对比。

**模块：**

- **定价表格** — 按提供商分组，列出所有模型
- **列说明** — 输入价格、输出价格、缓存价格、推理价格（分/百万 Token）

**调用接口：** `GET /api/v1/models/public`

---

#### 排行榜 `/leaderboard`

**用途：** 公开查看热门模型排名、提供商市场份额、趋势分析。

**模块：**

- **时间范围选择器** — 今日/本周/本月/今年/全部
- **热门模型排行榜** — 按使用量和 Token 排序
- **提供商市场份额** — 各提供商调用占比
- **上升趋势** — 排名上升的模型
- **下降趋势** — 排名下降的模型

**排行榜字段：**

- 模型名称
- 提供商
- 请求数
- Token 使用量
- 排名变化

**调用接口：**

- `GET /api/v1/leaderboard?period=TODAY/WEEK/MONTH/YEAR/ALL`
- `GET /api/v1/leaderboard/models?period=WEEK&limit=10`
- `GET /api/v1/leaderboard/vendors?period=WEEK`
- `GET /api/v1/leaderboard/trending?period=WEEK&limit=10`

---

#### API 文档 `/docs`

**用途：** 提供 API 快速接入文档。

**模块：**

- 快速开始指南
- 认证方式说明（API Key / Bearer Token）
- 端点说明（Chat Completions / Models / Status）
- 代码示例（curl / Python / JavaScript）
- 错误码说明

---

#### 服务状态 `/status`

**用途：** 展示各渠道/提供商的实时运行状态。

**模块：**

- **状态列表** — 每个渠道一行
- **状态指示器** — 正常/限流/异常/禁用
- **指标** — 平均延迟、总请求、失败率

**列表字段：**

- 提供商名称
- 渠道名称
- 状态（正常/限流/异常/禁用）
- 平均延迟（ms）
- 总请求数
- 失败数
- 失败率

**调用接口：** `GET /api/v1/status`

---

#### 登录 `/login`

**用途：** 用户登录入口。

**模块：**

- 邮箱输入框
- 密码输入框
- 登录按钮
- 验证码（如果系统开启）
- 注册链接 → `/register`
- 忘记密码链接 → `/forgot-password`

**调用接口：** `POST /api/v1/auth/login`

---

#### 注册 `/register`

**用途：** 新用户注册。

**模块：**

- 邮箱输入框
- 密码输入框
- 确认密码输入框
- 显示名称（可选）
- 邀请码（可选，如果系统要求）
- 邮箱验证码（如果系统开启）
- 验证码（如果系统开启）
- 注册按钮

**调用接口：**

- `POST /api/v1/auth/send-verification-code`（如需验证码）
- `POST /api/v1/auth/register`

---

#### 忘记密码 `/forgot-password`

**用途：** 发送密码重置邮件。

**模块：**

- 邮箱输入框
- 发送重置链接按钮
- 验证码（如果系统开启）
- 返回登录链接

**调用接口：** `POST /api/v1/auth/forgot-password`

---

#### 重置密码 `/reset-password`

**用途：** 使用 Token 重置密码。

**模块：**

- 新密码输入框
- 确认密码输入框
- 重置按钮

**调用接口：** `POST /api/v1/auth/reset-password`

---

### 2.2 用户控制台页面

#### 控制台概览 `/dashboard/overview`

**用途：** 用户的仪表盘主页，展示账户状态和用量概览。

**模块：**

- **余额卡片** — 总余额、冻结金额、可用余额
- **今日用量卡片** — 今日请求数、实际消费、标准消费
- **Token 统计** — 今日输入/输出 Token、累计输入/输出 Token
- **性能指标** — RPM、TPM、平均延迟
- **Token 趋势图** — 按天/小时显示 Token 和费用趋势
- **模型分布表** — 各模型请求数、Token、费用
- **平台分布** — 各提供商费用、请求数、Token
- **最近使用列表** — 最近 API 调用的模型、时间、费用
- **快捷操作** — 创建 Key、充值、查看文档等
- **帮助卡片** — 遇到问题？查看文档

**时间范围选择：** 近7天 / 近30天 / 近90天
**粒度选择：** 按天 / 按小时
**刷新按钮**

**调用接口：** `GET /api/v1/balance/stats?period=7d&granularity=day`

---

#### API 密钥管理 `/dashboard/apikeys`

**用途：** 管理用户的 API Key。

**模块：**

- **API Key 列表**
- **创建 Key 按钮**
- **批量创建**（支持一次创建多个）

**列表字段：**

- Key 名称
- Key 前缀（前 16 位）
- 状态（启用/禁用）
- RPM 限制
- TPM 限制
- 无限配额标识
- 模型限制
- IP 白名单
- 过期时间
- 最后使用时间
- 总请求数
- 所属分组
- 创建时间

**按钮：**

- 创建 Key → 打开创建弹窗
- 编辑 → 打开编辑弹窗
- 启用/禁用 → 切换状态
- 轮换 → 确认后生成新 Key 值
- 删除 → 确认弹窗
- 用量统计 → 查看该 Key 的用量详情

**弹窗：创建 API Key**

- 名称（可选）
- 数量（可选，1-100）
- RPM 限制（可选）
- TPM 限制（可选）
- 无限配额（开关）
- 模型限制（可选，多选）
- IP 白名单（可选）
- 过期时间（可选）
- 分组（可选）

> 创建成功后立即展示完整 Key（仅此一次），要求用户复制保存。

**调用接口：**

- `GET /api/v1/api-keys` — 获取列表
- `POST /api/v1/api-keys` — 创建
- `PATCH /api/v1/api-keys/:id` — 更新
- `PATCH /api/v1/api-keys/:id/enable` — 启用
- `PATCH /api/v1/api-keys/:id/disable` — 禁用
- `POST /api/v1/api-keys/:id/rotate` — 轮换
- `DELETE /api/v1/api-keys/:id` — 删除
- `GET /api/v1/api-keys/:id/usage` — 用量统计
- `GET /api/v1/api-keys/:id/group` — 分组信息

---

#### 使用统计 `/dashboard/usage`

**用途：** 图表化展示 API 使用统计数据。

**模块：**

- **时间范围选择** — 7天/30天/90天
- **调用趋势图** — 按日期的请求数和 Token 曲线
- **模型费用排行** — 各模型费用柱状图
- **调用量排行** — 各模型请求数排名
- **费用分布饼图** — 各模型费用占比

**调用接口：**

- `GET /api/v1/balance/analytics?days=7`
- `GET /api/v1/balance/analytics/call-trend?days=7`
- `GET /api/v1/balance/analytics/model-ranking?days=7&limit=10`

---

#### 分析看板 `/dashboard/analytics`

**用途：** 更深入的综合分析数据。

**模块：**

- **概览卡片** — 总请求数、总 Token、总费用、每次请求平均 Token、成功率
- **调用趋势图** — 按日期统计
- **模型排行** — 按费用排序

**调用接口：**

- `GET /api/v1/balance/analytics?days=7`
- `GET /api/v1/balance/analytics/call-trend?days=7`
- `GET /api/v1/balance/analytics/model-ranking?days=7&limit=10`

---

#### 账单中心 `/dashboard/billing`

**用途：** 查看充值订单、消费明细、日消费趋势。

**模块：**

- **Tabs**：充值订单 / 消费明细 / 日消费趋势
- **充值订单列表**

  | 字段 | 说明 |
  |------|------|
  | 订单号 | 唯一编号 |
  | 金额 | 充值金额（元） |
  | 实付金额 | 实际支付金额 |
  | 支付方式 | 微信/支付宝/易支付 |
  | 状态 | 待支付/已支付/已取消/已退款 |
  | 支付时间 | |
  | 创建时间 | |

- **消费明细列表** — 请求级别的消费记录
- **日消费趋势图**

**按钮：**

- 去充值 → `/dashboard/recharge`

**调用接口：**

- `GET /api/v1/payment/orders?page=1&pageSize=20`
- `GET /api/v1/balance/bills?page=1&pageSize=20`
- `GET /api/v1/balance/bills/daily?days=30`

---

#### 消费明细 `/dashboard/bills`

**用途：** 详细的请求级消费账单，可筛选日期范围。

**模块：**

- **日期范围选择器**
- **分页的消费明细列表**

**列表字段：**

| 字段 | 说明 |
|------|------|
| 时间 | 请求时间 |
| 模型 | 使用的模型 |
| 渠道 | 使用的渠道 |
| 输入 Token | prompt_tokens |
| 输出 Token | completion_tokens |
| 缓存 Token | cached_tokens |
| 推理 Token | reasoning_tokens |
| 总 Token | 合计 |
| 费用 | 消费金额（分） |
| 状态码 | HTTP 状态码 |
| 延迟 | 响应时间（ms） |

**调用接口：** `GET /api/v1/balance/bills?page=1&pageSize=20&startDate=&endDate=`

---

#### 请求日志 `/dashboard/logs`

**用途：** 查看用户的 API 请求日志。

**模块：**

- **分页的请求日志列表**
- **搜索/筛选**

**列表字段：**

- 请求时间
- 模型
- 渠道
- Prompt Token
- Completion Token
- 总 Token
- 费用
- 状态码
- 延迟

**调用接口：** `GET /api/v1/balance/logs?page=1&pageSize=20`

---

#### 充值中心 `/dashboard/recharge`

**用途：** 选择充值金额和支付方式完成充值。

**模块：**

- **余额显示卡片** — 当前余额、可用余额
- **金额选择器** — 预设金额选项（10/50/100/200/500 元）+ 自定义输入
- **阶梯折扣信息** — 充值达到不同金额显示的折扣
- **充值活动展示** — 当前有效的充值赠送活动
- **支付方式选择** — 支付宝、微信支付、易支付-支付宝、易支付-微信
- **支付二维码/跳转** — 创建订单后跳转到支付页面或展示二维码
- **兑换码充值** — 输入兑换码快速充值
- **邀请奖励展示** — 邀请收益统计

**按钮：**

- 立即充值 → 创建订单 → 跳转支付
- 兑换 → 输入兑换码确认兑换

**调用接口：**

- `GET /api/v1/balance` — 获取余额
- `GET /api/v1/payment/methods` — 获取可用支付方式
- `GET /api/v1/payment/promotions?amount=100` — 获取充值活动
- `POST /api/v1/payment/orders` — 创建订单
- `GET /api/v1/payment/orders/:orderNo` — 查询订单状态
- `GET /api/v1/payment/discounts` — 获取阶梯折扣
- `POST /api/v1/redeem` — 兑换码充值

---

#### 邀请奖励 `/dashboard/invite`

**用途：** 查看邀请码、邀请记录和奖励。

**模块：**

- **邀请码展示** — 邀请码、邀请链接、复制按钮
- **邀请统计** — 总邀请数、总奖励、待确认奖励
- **邀请记录列表** — 被邀请人信息、奖励、充值次数

**列表字段：**

- 被邀请人邮箱
- 被邀请人显示名
- 注册时间
- 已获得奖励
- 待确认奖励
- 充值次数

**调用接口：**

- `GET /api/v1/invite/code`
- `GET /api/v1/invite/stats`
- `GET /api/v1/invite/records`

---

#### 每日签到 `/dashboard/checkin`

**用途：** 每日签到获取随机奖励。

**模块：**

- **签到日历/签到按钮** — 显示签到状态，今日是否已签到
- **签到历史** — 最近签到记录
- **签到统计** — 总签到天数、总奖励、连续签到天数
- **签到配置信息** — 奖励范围

**按钮：**

- 签到 → 触发签到并展示奖励

**调用接口：**

- `POST /api/v1/checkin` — 签到
- `GET /api/v1/checkin/history?limit=30` — 历史记录
- `GET /api/v1/checkin/stats` — 统计
- `GET /api/v1/checkin/config` — 配置

---

#### 个人设置 `/dashboard/settings`

**用途：** 个人信息编辑、账户安全设置。

**模块：**

- **个人资料** — 显示名称、头像
- **账户统计卡片** — 当前余额、本月消费、本月请求数
- **常规设置**
  - 邮箱绑定（展示，不可更改）
  - GitHub 绑定（绑定/解绑）
  - 语言选择
- **账户安全**
  - 更改密码 → 打开修改密码弹窗
  - 两步验证（2FA）→ 启用/关闭 TOTP
  - Passkey 管理 → WebAuthn 密钥列表
  - 删除账户 → 确认后删除
- **侧栏**
  - 签到日历小部件
  - 通知配置入口
  - 实名认证入口

**调用接口：**

- `GET /api/v1/users/me` — 获取用户信息
- `PATCH /api/v1/users/me` — 更新用户信息
- `POST /api/v1/auth/change-password` — 修改密码
- `DELETE /api/v1/users/me` — 删除账户
- `GET /api/v1/balance/stats` — 获取统计

---

#### 通知设置 `/dashboard/settings/notifications`

**用途：** 配置通知渠道和预警阈值。

**模块：**

- **通知邮箱** — 设置接收通知的邮箱（留空使用账号邮箱）
- **预警额度** — 余额低于此值时发送通知
- **通知渠道配置**
  - 邮件通知（启用/关闭）
  - Webhook 通知（启用 + URL）
  - WxPusher 通知（启用 + UID）
- **测试通知按钮** — 向所选渠道发送测试通知

**调用接口：**

- `GET /api/v1/users/me/notifications`
- `PUT /api/v1/users/me/notifications`
- `POST /api/v1/users/me/notifications/test`

---

#### 实名认证 `/dashboard/settings/verification`

**用途：** 用户提交实名认证。

**模块：**

- **认证状态展示** — 未提交/审核中/已通过/已驳回
- **认证表单** — 姓名、身份证号
- **证件上传** — 身份证正面、反面照片

**按钮：**

- 提交认证 → 提交审核

**调用接口：**

- `GET /api/v1/verification/status` — 查询状态
- `POST /api/v1/verification` — 提交认证
- `POST /api/v1/verification/upload` — 上传图片

---

#### 发票申请 `/dashboard/invoices`

**用途：** 用户提交开票申请。

**模块：**

- **我的发票列表** — 已提交的发票申请
- **申请新发票按钮**

**列表字段：**

- 发票号
- 金额
- 类型（企业/个人）
- 状态（待审核/已通过/已驳回/已开具/已取消）
- 申请时间
- 发票文件（已开具后可下载）

**按钮：**

- 申请发票 → 打开申请表单
- 下载发票 → 下载已开具的发票文件
- 取消 → 取消待审核的申请

**调用接口：**

- `GET /api/v1/payment/invoices` — 获取用户发票列表（需要用户端发票接口，当前可能仅有 admin 接口）
- `POST /api/v1/admin/invoices` — 提交发票申请（复用 admin 接口，带用户身份）

---

### 2.3 管理后台页面

#### 控制台 Dashboard `/admin`

**用途：** 系统管理员仪表盘，展示全局统计数据。

**模块：**

- **指标卡** — 注册用户数（含增长率）、总充值金额（含增长率）、总消费（含增长率）、总调用次数（含增长率）、总余额
- **调用趋势图** — 按日期的请求数和 Token 曲线
- **模型分布饼图** — 各模型调用占比
- **最近订单列表** — 最新 5 条订单
- **渠道状态面板** — 各渠道当前状态和指标

**调用接口：** `GET /api/v1/admin/dashboard`

---

#### 用户管理 `/admin/users`

**用途：** 管理员查看和管理所有用户。

**模块：**

- **用户列表**（分页）
- **搜索栏** — 按邮箱、名称搜索
- **筛选** — 按角色、状态筛选

**列表字段：**

| 字段 | 说明 |
|------|------|
| ID | 用户 ID |
| 邮箱 | 脱敏显示 |
| 显示名 | |
| 角色 | USER/VIP/ENTERPRISE/AGENT/ADMIN/SUPER_ADMIN |
| 状态 | 正常/已冻结/已封禁 |
| 注册时间 | |

**按钮：**

- 查看详情 → `/admin/users/[id]`
- 修改角色 → 下拉选择
- 冻结/解冻/封禁 → 状态切换
- 搜索 → 筛选结果

**调用接口：**

- `GET /api/v1/admin/users?page=1&pageSize=20&role=USER&status=ACTIVE&search=`
- `PATCH /api/v1/admin/users/:id/role`
- `PATCH /api/v1/admin/users/:id/status`

---

#### 用户详情 `/admin/users/[id]`

**用途：** 查看指定用户的完整信息和管理操作。

**模块：**

- **用户基本信息** — 邮箱、电话、角色、状态、注册时间、三方绑定信息
- **余额信息** — 总余额、冻结金额
- **统计数据** — API Key 数量、请求数、月消费、月充值、总消费、总充值
- **最近订单列表**
- **最近交易流水**
- **最近 API Key 列表**

**按钮：**

- 充值 → 弹出充值表单（输入金额和备注）
- 修改角色
- 修改状态
- 返回用户列表

**调用接口：**

- `GET /api/v1/admin/users/:id` — 用户详情
- `POST /api/v1/balance/recharge` — 管理员充值

---

#### 用户分组 `/admin/users/groups`

**用途：** 管理用户组策略（价格倍率、限额、权限）。

**模块：**

- **用户分组列表**
- **创建分组按钮**

**列表字段：**

| 字段 | 说明 |
|------|------|
| 组名 | name（英文标识） |
| 显示名 | |
| 价格倍率 | 如 1.0 = 原价 |
| RPM 限制 | 每分钟请求数 |
| TPM 限制 | 每分钟 Token 数 |
| 最大 Key 数 | |
| 成员数 | |
| 状态 | 启用/禁用 |
| 是否内置 | 系统内置不可删除 |

**按钮：**

- 创建 → 打开创建表单
- 编辑 → 打开编辑表单
- 启用/禁用 → 切换状态
- 删除（非内置组）→ 确认弹窗

**调用接口：**

- `GET /api/v1/admin/user-groups`
- `POST /api/v1/admin/user-groups`
- `GET /api/v1/admin/user-groups/:id`
- `PATCH /api/v1/admin/user-groups/:id`
- `PATCH /api/v1/admin/user-groups/:id/toggle`
- `DELETE /api/v1/admin/user-groups/:id`

---

#### API Key 管理（Admin） `/admin/apikeys`

**用途：** 管理员全局查看和管理所有用户的 API Key。

**模块：**

- **API Key 列表**（分页）
- **搜索和筛选**

**列表字段：**

- Key 前缀
- Key 名称
- 所属用户
- 状态
- 最后使用时间
- 总请求数
- 创建时间

**按钮：**

- 启用/禁用
- 删除
- 查看详情

**调用接口：**

- `GET /api/v1/admin/api-keys`
- `PATCH /api/v1/admin/api-keys/:id/toggle`
- `DELETE /api/v1/admin/api-keys/:id`
- `GET /api/v1/admin/api-keys/:id`

---

#### 角色权限管理 `/admin/roles`

**用途：** RBAC 角色和权限管理。

**模块：**

- **角色列表**
- **创建角色按钮**（仅 super_admin）

**列表字段：**

| 字段 | 说明 |
|------|------|
| 角色编码 | code |
| 显示名 | |
| 等级 | 数值 |
| 数据范围 | ALL/ORGANIZATION/SELF |
| 权限数 | |
| 用户数 | |
| 是否系统内置 | |
| 状态 | |

**按钮：**

- 创建（super_admin）→ 打开创建表单
- 编辑 → 打开编辑表单
- 分配权限 → 打开权限分配界面（权限树）
- 删除（非系统角色）

**权限分配界面：**

- 所有权限点列表（按资源域分组：user/order/model/system）
- 勾选要分配的权限
- 提交保存

**调用接口：**

- `GET /api/v1/admin/roles`
- `POST /api/v1/admin/roles`（super_admin）
- `GET /api/v1/admin/roles/:id`
- `PATCH /api/v1/admin/roles/:id`
- `DELETE /api/v1/admin/roles/:id`（super_admin）
- `PUT /api/v1/admin/roles/:id/permissions`（super_admin）
- `GET /api/v1/admin/permissions`

---

#### 模型管理 `/admin/models`

**用途：** 管理 AI 模型定义。

**模块：**

- **模型列表**（分页）

**列表字段：**

| 字段 | 说明 |
|------|------|
| 模型名 | name（唯一标识） |
| 显示名 | |
| 提供商 | provider_id |
| 上下文窗口 | max_context |
| 能力 | 流式/工具/视觉 |
| 定价 | 输入/输出价格 |
| 状态 | 上架/下架 |

**按钮：**

- 创建模型 → 打开创建表单
- 编辑 → 打开编辑表单
- 设置定价 → 打开定价弹窗
- 上架/下架 → 切换状态
- 删除

**调用接口：**

- `GET /api/v1/admin/models`
- `POST /api/v1/admin/models`
- `PATCH /api/v1/admin/models/:id`
- `DELETE /api/v1/admin/models/:id`
- `PUT /api/v1/admin/models/:id/pricing`

---

#### 通道/渠道管理 `/admin/channels`

**用途：** 管理 Provider 的 API 通道（渠道）。

**模块：**

- **渠道列表**（分页）
- **按提供商筛选**

**列表字段：**

| 字段 | 说明 |
|------|------|
| 渠道名 | |
| 所属提供商 | |
| Base URL | |
| Key 前缀 | 脱敏显示 |
| 权重 | 负载均衡权重 |
| 优先级 | 越高越优先 |
| 状态 | 正常/限流/异常/禁用 |
| 总请求数 | |
| 失败数 | |
| 平均延迟 | |
| 关联模型数 | |

**按钮：**

- 创建渠道 → 打开创建表单
- 编辑 → 打开编辑表单
- 启用/禁用
- 测试连通性 → 发送测试请求
- 删除

**创建/编辑表单字段：**

- 所属 Provider（必选）
- 渠道名称（必填）
- Base URL（必填）
- API Key（必填，创建后不显示明文）
- 权重（可选，1-100）
- 优先级（可选，0-100）
- 组织 ID（可选）
- 标签（可选）
- 内部备注（可选）
- 模型映射（高级，JSON）
- 状态码映射（高级，JSON）
- 参数覆盖（高级，JSON）
- 请求头覆盖（高级，JSON）
- 代理地址（可选）
- 系统提示词（可选）
- 失败时自动禁用（开关）

**调用接口：**

- `GET /api/v1/admin/channels`
- `POST /api/v1/admin/channels`
- `GET /api/v1/admin/channels/:id`
- `PATCH /api/v1/admin/channels/:id`
- `PATCH /api/v1/admin/channels/:id/enable`
- `PATCH /api/v1/admin/channels/:id/disable`
- `POST /api/v1/admin/channels/:id/test`
- `DELETE /api/v1/admin/channels/:id`

---

#### 服务商管理 `/admin/providers`

**用途：** 管理 AI 服务商定义。

**模块：**

- **服务商列表**（分页）

**列表字段：**

| 字段 | 说明 |
|------|------|
| 服务商名 | name（唯一标识） |
| 显示名 | |
| Base URL | |
| 状态 | 启用/禁用 |
| 渠道数 | |

**按钮：**

- 创建 → 打开创建表单
- 编辑 → 打开编辑表单
- 启用/禁用
- 删除（无关联渠道时）

**调用接口：**

- `GET /api/v1/admin/providers`
- `POST /api/v1/admin/providers`
- `GET /api/v1/admin/providers/:id`
- `PATCH /api/v1/admin/providers/:id`
- `DELETE /api/v1/admin/providers/:id`

---

#### 价格策略 `/admin/pricing`

**用途：** 管理和查看所有模型的定价。

**模块：**

- **模型定价列表**（分页）

**列表字段：**

| 字段 | 说明 |
|------|------|
| 模型名 | |
| 显示名 | |
| 提供商 | |
| 输入价格 | 分/百万 Token |
| 输出价格 | 分/百万 Token |
| 缓存价格 | 分/百万 Token |
| 推理价格 | 分/百万 Token |
| 价格倍率 | |

**按钮：**

- 设置/编辑定价 → 打开定价弹窗
  - 输入价格（分/百万 Token）
  - 输出价格（分/百万 Token）
  - 缓存价格（可选）
  - 推理价格（可选）
  - 价格倍率（默认 1.0）

**调用接口：**

- `GET /api/v1/admin/models`（已有定价数据）
- `PUT /api/v1/admin/models/:id/pricing`

---

#### 订单管理 `/admin/orders`

**用途：** 管理员查看和管理所有充值订单。

**模块：**

- **订单列表**（分页）
- **搜索/筛选** — 按订单号、用户搜索，按状态筛选

**列表字段：**

| 字段 | 说明 |
|------|------|
| 订单号 | |
| 用户 | 邮箱 |
| 金额 | |
| 实付 | |
| 支付方式 | |
| 状态 | 待支付/已支付/失败/已退款/已取消 |
| 商品类型 | |
| 创建时间 | |
| 支付时间 | |

**按钮：**

- 查看详情
- 验证补单 → 向支付平台查询状态并补单（处理掉单）

**调用接口：**

- `GET /api/v1/admin/orders`
- `GET /api/v1/admin/orders/:id`
- `POST /api/v1/admin/orders/:orderNo/verify`

---

#### 充值记录 `/admin/recharges`

**用途：** 管理员为用户充值。

**模块：**

- **充值表单** — 选择用户、输入金额、备注
- **充值记录列表** — 管理员充值历史

**调用接口：** `POST /api/v1/balance/recharge`

---

#### 交易流水 `/admin/bills`

**用途：** 查看所有用户的交易流水。

**模块：**

- **交易流水列表**（分页）
- **筛选** — 按类型、用户搜索

**列表字段：**

| 字段 | 说明 |
|------|------|
| ID | |
| 用户 | |
| 类型 | 充值/消费/赠送/退款/奖励 |
| 金额 | |
| 余额后 | |
| 备注 | |
| 时间 | |

**调用接口：** `GET /api/v1/admin/bills`

---

#### 充值活动管理 `/admin/promotions`

**用途：** 管理充值赠送活动。

**模块：**

- **活动列表**（分页）

**列表字段：**

| 字段 | 说明 |
|------|------|
| 活动名称 | |
| 最低充值金额 | |
| 赠送类型 | 固定金额/百分比 |
| 赠送值 | |
| 百分比上限 | |
| 生效时间 | |
| 结束时间 | |
| 状态 | 启用/禁用 |

**按钮：**

- 创建 → 打开创建表单
- 编辑 → 打开编辑表单
- 启用/禁用
- 删除

**创建表单字段：**

- 活动名称（必填）
- 活动描述（可选）
- 最低充值金额（分，必填）
- 赠送类型（必选：FIXED/PERCENTAGE）
- 赠送值（必填）
- 百分比模式上限（可选）
- 生效时间（必填）
- 结束时间（可选）
- 是否启用

**调用接口：**

- `GET /api/v1/admin/promotions`
- `POST /api/v1/admin/promotions`
- `PATCH /api/v1/admin/promotions/:id`
- `PATCH /api/v1/admin/promotions/:id/toggle`
- `DELETE /api/v1/admin/promotions/:id`

---

#### 发票审核 `/admin/invoices`

**用途：** 管理员审核和开具发票。

**模块：**

- **发票列表**（分页）
- **筛选** — 按状态、关键字

**列表字段：**

| 字段 | 说明 |
|------|------|
| 发票号 | |
| 用户 | |
| 类型 | 企业/个人 |
| 金额 | |
| 公司名称 | |
| 税号 | |
| 状态 | 待审核/已通过/已驳回/已开具/已取消 |
| 申请时间 | |

**按钮：**

- 查看详情 → 查看完整发票信息
- 审核 → 通过/驳回 + 填写审核备注
- 开具 → 上传发票文件后标记已开具
- 删除

**调用接口：**

- `GET /api/v1/admin/invoices`
- `GET /api/v1/admin/invoices/:id`
- `PATCH /api/v1/admin/invoices/:id/review`
- `PATCH /api/v1/admin/invoices/:id/issue`
- `DELETE /api/v1/admin/invoices/:id`

---

#### 支付配置 `/admin/payment-configs`

**用途：** 配置支付渠道信息。

**模块：**

- **支付渠道列表** — 各支付方式（epay/alipay/wechat_pay）
- **编辑配置表单**

**配置字段：**

- 显示名称
- 是否启用
- 商户 ID
- 商户密钥
- 商户秘钥/私钥
- API 网关地址
- 异步通知地址
- 同步跳转地址
- 额外配置（JSON）

**调用接口：**

- `GET /api/v1/admin/payment-configs`
- `PUT /api/v1/admin/payment-configs/:name`
- `PATCH /api/v1/admin/payment-configs/:name/toggle`

---

#### 兑换码管理 `/admin/redeem`

**用途：** 管理员生成和管理兑换码。

**模块：**

- **兑换码列表**（分页）

**列表字段：**

| 字段 | 说明 |
|------|------|
| 兑换码 | |
| 类型 | FIXED/PERCENTAGE |
| 价值 | 固定额度（分）或百分比 |
| 最大使用次数 | |
| 已使用次数 | |
| 过期时间 | |
| 状态 | 启用/禁用 |
| 创建者 | |
| 创建时间 | |

**按钮：**

- 生成 → 打开生成表单
  - 类型（必选）
  - 值（必填）
  - 数量（必填）
  - 最大使用次数（可选，默认1）
  - 过期时间（可选）
- 编辑 → 修改启用状态、过期时间、最大使用次数
- 删除

**调用接口：**

- `GET /api/v1/redeem/codes`
- `POST /api/v1/redeem/codes`
- `PUT /api/v1/redeem/codes/:id`
- `DELETE /api/v1/redeem/codes/:id`

---

#### 签到配置 `/admin/checkin`

**用途：** 配置每日签到功能。

**模块：**

- **签到开关** — 启用/关闭签到
- **奖励范围设置**
  - 最小奖励（分）
  - 最大奖励（分）
- **保存按钮**

**调用接口：**

- `GET /api/v1/checkin/config`
- `PUT /api/v1/checkin/config`

---

#### 实名认证审核 `/admin/verifications`

**用途：** 审核用户提交的实名认证。

**模块：**

- **认证申请列表**（分页，按状态筛选）
- **审核操作** — 查看证件照片，通过/驳回

**列表字段：**

- 用户
- 姓名
- 身份证号（脱敏）
- 证件照片（正反面）
- 状态（待审核/已通过/已驳回）
- 提交时间

**审核操作：**

- 通过 → 更新为 APPROVED
- 驳回 → 填写驳回原因 → 更新为 REJECTED

**调用接口：** （需要实名认证的 admin 审核接口，当前可能仅有用户提交接口）

---

#### 系统设置（各分类）

**用途：** 管理系统的各项参数配置。

**各设置分类页面：**

| 设置分类 | 路由 | 包含项 |
|---------|------|--------|
| 基础设置 | `/admin/settings/basic` | 站点名称、副标题、Logo、版权、ICP备案、联系方式、默认语言时区 |
| 网站设置 | `/admin/settings/website` | 维护模式、公告（首页/登录/注册）、SEO 标题/描述/关键词 |
| 用户设置 | `/admin/settings/user` | 注册/删号/改邮箱/改用户名/创建 Key/删除 Key/Webhook/组织 开关 |
| 注册设置 | `/admin/settings/register` | 邮箱验证/验证码/邀请码/白名单/默认余额/默认额度/默认分组/默认角色 |
| 邮箱设置 | `/admin/settings/email` | SMTP 服务器配置、测试连接、发送测试邮件 |
| 通知设置 | `/admin/settings/notification` | 邮件通知/Webhook/充值成功/余额不足/提供商错误/系统错误/发票请求 通知开关 |
| 风控设置 | `/admin/settings/rate-limit` | RPM/RPH/RPD、IP 限制、Key 限制、Token 限制、并发限制 |
| 安全设置 | `/admin/settings/security` | 登录锁定（尝试次数/锁定时间）、2FA 开关、密码策略、JWT 过期时间、IP 黑白名单 |
| API 设置 | `/admin/settings/api` | API 前缀/版本、请求超时、最大并发、最大 Token、缓存/流式开关 |
| 财务设置 | `/admin/settings/finance` | 最小/最大充值、赠送比例、退款开关、提现开关、发票开关 |
| 存储设置 | `/admin/settings/storage` | 上传开关、最大文件大小、允许文件类型 |
| 提供商设置 | `/admin/settings/provider` | 提供商相关参数 |
| 运行监控 | `/admin/settings/uptime` | Uptime Kuma 监控分组管理 |

**调用接口：**

- `GET /api/v1/admin/system-settings` — 获取全部
- `GET /api/v1/admin/system-settings/:category` — 获取分类
- `PUT /api/v1/admin/system-settings/:category` — 批量更新
- `PATCH /api/v1/admin/system-settings/:category/:key` — 更新单个

---

#### 验证码配置 `/admin/captcha`

**用途：** 配置阿里云 ESA AI 验证码。

**模块：**

- **全局配置** — Identity、Region、Mode
- **各场景独立配置** — 注册/登录/忘记密码/发送验证码
  - 启用开关
  - Scene ID

**调用接口：** 通过系统设置 API 管理（captcha 分类）

---

#### 短信配置 `/admin/sms`

**用途：** 配置阿里云短信服务。

**模块：**

- **配置表单**
  - 显示名称
  - Access Key ID
  - Access Key Secret
  - 短信签名
  - 模板 Code
  - 启用开关
- **测试连接按钮**
- **发送测试短信按钮** — 输入手机号

**调用接口：**

- `GET /api/v1/admin/sms-config`
- `PUT /api/v1/admin/sms-config`
- `PATCH /api/v1/admin/sms-config/toggle`
- `POST /api/v1/admin/sms-config/test-connection`
- `POST /api/v1/admin/sms-config/send-test`

---

## 3. 表单设计

### 3.1 用户端表单

#### 注册表单

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 邮箱 | email | 是 | 注册邮箱 |
| 密码 | password | 是 | 8-128位，含大小写字母和数字 |
| 确认密码 | password | 是 | 与密码一致 |
| 显示名称 | text | 否 | 最多50字符 |
| 邀请码 | text | 否 | 通过系统判断是否需要 |
| 邮箱验证码 | text | 否 | 系统开启邮箱验证时需要 |
| 验证码 Token | hidden | 否 | 阿里云 ESA 验证 |

#### 登录表单

| 字段 | 类型 | 必填 |
|------|------|------|
| 邮箱 | email | 是 |
| 密码 | password | 是 |
| 验证码 Token | hidden | 系统开启时需要 |

#### 修改密码表单

| 字段 | 类型 | 必填 |
|------|------|------|
| 当前密码 | password | 是 |
| 新密码 | password | 是 |
| 确认新密码 | password | 是 |

#### 忘记密码表单

| 字段 | 类型 | 必填 |
|------|------|------|
| 邮箱 | email | 是 |
| 验证码 Token | hidden | 系统开启时需要 |

#### 更新个人资料表单

| 字段 | 类型 | 必填 |
|------|------|------|
| 显示名称 | text | 否 |
| 头像 URL | url | 否 |
| 电话 | tel | 否 |

#### 创建 API Key 表单

| 字段 | 类型 | 必填 | 默认值 |
|------|------|------|--------|
| 名称 | text | 否 | - |
| 创建数量 | number | 否 | 1 |
| RPM 限制 | number | 否 | - |
| TPM 限制 | number | 否 | - |
| 无限配额 | switch | 否 | false |
| 模型限制 | multi-select | 否 | 全部 |
| IP 白名单 | textarea | 否 | - |
| 过期时间 | datetime | 否 | - |
| 分组 | select | 否 | 默认分组 |

#### 充值表单

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 金额 | number | 是 | 预设+自定义，最少0.01元 |
| 支付方式 | select | 是 | 支付宝/微信/易支付-支付宝/易支付-微信 |

#### 兑换码表单

| 字段 | 类型 | 必填 |
|------|------|------|
| 兑换码 | text | 是 |

#### 通知配置表单

| 字段 | 类型 | 必填 |
|------|------|------|
| 通知邮箱 | email | 否 |
| 余额预警阈值 | number | 否 |
| 邮件通知启用 | switch | 否 |
| Webhook 启用 | switch | 否 |
| Webhook URL | url | 否 |
| WxPusher 启用 | switch | 否 |
| WxPusher UID | text | 否 |

#### 实名认证表单

| 字段 | 类型 | 必填 |
|------|------|------|
| 姓名 | text | 是 |
| 身份证号 | text | 是 |
| 身份证正面照 | file | 是 |
| 身份证反面照 | file | 是 |

#### 发票申请表单

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 发票类型 | select | 是 | 企业/个人 |
| 公司名称 | text | 否 | 企业发票必填 |
| 税号 | text | 否 | 企业发票必填 |
| 公司地址 | text | 否 | |
| 公司电话 | text | 否 | |
| 开户银行 | text | 否 | |
| 银行账号 | text | 否 | |
| 发票金额 | number | 是 | |
| 发票内容 | text | 否 | 默认"技术服务费" |
| 申请人邮箱 | email | 是 | |
| 申请人电话 | tel | 否 | |
| 邮寄地址 | textarea | 否 | |

---

### 3.2 管理端表单

#### 创建 Provider 表单

| 字段 | 类型 | 必填 |
|------|------|------|
| 名称 | text | 是（唯一标识） |
| 显示名称 | text | 是 |
| Base URL | url | 是 |
| 是否启用 | switch | 否 |

#### 创建 Channel 表单（基础）

| 字段 | 类型 | 必填 |
|------|------|------|
| 所属 Provider | select | 是 |
| 渠道名称 | text | 是 |
| Base URL | url | 是 |
| API Key | password | 是 |
| 权重 | number | 否（1-100） |
| 优先级 | number | 否（0-100） |

#### 创建 Channel 表单（高级）

| 字段 | 类型 | 必填 |
|------|------|------|
| 组织 ID | text | 否 |
| 标签 | text | 否 |
| 内部备注 | textarea | 否 |
| 模型映射 | json | 否 |
| 状态码映射 | json | 否 |
| 参数覆盖 | json | 否 |
| 请求头覆盖 | json | 否 |
| 代理地址 | text | 否 |
| 系统提示词 | textarea | 否 |
| 失败时自动禁用 | switch | 否 |

#### 创建模型表单

| 字段 | 类型 | 必填 |
|------|------|------|
| 模型名称 | text | 是 |
| 显示名称 | text | 是 |
| 所属 Provider | select | 是 |
| 上下文窗口 | number | 是 |
| 支持流式 | switch | 否 |
| 支持工具 | switch | 否 |
| 支持视觉 | switch | 否 |

#### 设置模型定价表单

| 字段 | 类型 | 必填 |
|------|------|------|
| 输入价格 | number | 是（分/百万 Token） |
| 输出价格 | number | 是（分/百万 Token） |
| 缓存价格 | number | 否 |
| 推理价格 | number | 否 |
| 价格倍率 | number | 否（默认1.0） |

#### 创建用户分组表单

| 字段 | 类型 | 必填 | 默认值 |
|------|------|------|--------|
| 组名 | text | 是 | |
| 显示名 | text | 是 | |
| 描述 | text | 否 | |
| 价格倍率 | number | 是 | 1.0 |
| RPM 限制 | number | 是 | 60 |
| TPM 限制 | number | 是 | 60000 |
| 最大 API Key 数 | number | 是 | 10 |
| 允许的模型 | multi-select | 否 | 全部 |
| 允许的渠道 | multi-select | 否 | 全部 |
| 允许代理 | switch | 否 | true |
| 允许分享 | switch | 否 | false |

#### 创建角色表单

| 字段 | 类型 | 必填 |
|------|------|------|
| 角色编码 | text | 是 |
| 显示名 | text | 是 |
| 描述 | text | 否 |
| 角色等级 | number | 是 |
| 数据范围 | select | 否（SELF） |

#### 创建充值活动表单

| 字段 | 类型 | 必填 |
|------|------|------|
| 活动名称 | text | 是 |
| 活动描述 | text | 否 |
| 最低充值金额 | number | 是（分） |
| 赠送类型 | select | 是（固定金额/百分比） |
| 赠送值 | number | 是 |
| 百分比上限 | number | 否 |
| 生效时间 | datetime | 是 |
| 结束时间 | datetime | 否 |
| 是否启用 | switch | 否 |

#### 用户充值表单（管理员）

| 字段 | 类型 | 必填 |
|------|------|------|
| 目标用户 | hidden | 是 |
| 充值金额 | number | 是（元） |
| 备注 | text | 否 |

#### 生成兑换码表单

| 字段 | 类型 | 必填 |
|------|------|------|
| 类型 | select | 是（FIXED/PERCENTAGE） |
| 值 | number | 是 |
| 数量 | number | 是 |
| 最大使用次数 | number | 否（默认1） |
| 过期时间 | datetime | 否 |

#### 签到配置表单

| 字段 | 类型 | 必填 |
|------|------|------|
| 启用签到 | switch | 否 |
| 最小奖励 | number | 是（分） |
| 最大奖励 | number | 是（分） |

#### SMTP 配置表单

| 字段 | 类型 | 必填 |
|------|------|------|
| 是否启用 | switch | 否 |
| SMTP 服务器 | text | 否 |
| 端口 | number | 否（默认587） |
| 使用 TLS | switch | 否 |
| 用户名 | text | 否 |
| 密码 | password | 否 |
| 发件人名称 | text | 否 |
| 发件人邮箱 | email | 否 |

#### 短信配置表单

| 字段 | 类型 | 必填 |
|------|------|------|
| 显示名称 | text | 否 |
| 是否启用 | switch | 否 |
| Access Key ID | text | 否 |
| Access Key Secret | password | 否 |
| 短信签名 | text | 否 |
| 模板代码 | text | 否 |

#### 支付配置表单

| 字段 | 类型 | 必填 |
|------|------|------|
| 显示名称 | text | 否 |
| 是否启用 | switch | 否 |
| 商户 ID | text | 否 |
| 商户密钥 | password | 否 |
| 商户秘钥 | password | 否 |
| API 网关地址 | url | 否 |
| 异步通知地址 | url | 否 |
| 同步跳转地址 | url | 否 |
| 额外配置 | json | 否 |

---

## 4. 导航结构

### 4.1 公开导航（顶栏）

```
首页 / 公开导航
├── 产品 (下拉)
│   ├── 首页
│   └── 模型广场
├── 模型 → /models
├── 价格 → /pricing
├── 排行榜 → /leaderboard
├── 文档 → /docs
├── 服务状态 → /status
└── 右侧
    ├── [未登录]
    │   ├── 登录 → /login
    │   └── 注册 → /register
    └── [已登录]
        └── 控制台 → /dashboard
```

### 4.2 用户控制台导航

```
控制台侧边栏
├── 概览 → /dashboard/overview
├── API 密钥 → /dashboard/apikeys
├── 使用统计 → /dashboard/usage
├── 分析看板 → /dashboard/analytics
├── 账单中心 → /dashboard/billing
├── 消费明细 → /dashboard/bills
├── 请求日志 → /dashboard/logs
├── 充值中心 → /dashboard/recharge
├── 发票申请 → /dashboard/invoices
├── 邀请奖励 → /dashboard/invite
├── 每日签到 → /dashboard/checkin
└── 系统设置 → /dashboard/settings
    └── 通知设置 → /dashboard/settings/notifications
    └── 实名认证 → /dashboard/settings/verification
```

### 4.3 管理后台导航

```
管理后台侧边栏
├── 概览
│   └── 控制台 → /admin
├── 账户
│   ├── 用户列表 → /admin/users
│   │   └── 用户详情 → /admin/users/[id]
│   ├── 用户分组 → /admin/users/groups
│   ├── API Key → /admin/apikeys
│   └── 角色权限 → /admin/roles
├── 模型
│   ├── 模型管理 → /admin/models
│   ├── 通道管理 → /admin/channels
│   ├── 服务商 → /admin/providers
│   └── 价格策略 → /admin/pricing
├── 财务
│   ├── 订单 → /admin/orders
│   ├── 充值记录 → /admin/recharges
│   ├── 账单 → /admin/bills
│   ├── 充值活动 → /admin/promotions
│   ├── 发票 → /admin/invoices
│   ├── 支付配置 → /admin/payment-configs
│   ├── 兑换码 → /admin/redeem
│   ├── 充值折扣 → /admin/recharge-discounts
│   └── 订阅计划 → /admin/subscription-plans
├── 系统
│   ├── 系统设置
│   │   ├── 基础 → /admin/settings/basic
│   │   ├── 网站 → /admin/settings/website
│   │   ├── 用户 → /admin/settings/user
│   │   ├── 注册 → /admin/settings/register
│   │   ├── 邮箱 → /admin/settings/email
│   │   ├── 通知 → /admin/settings/notification
│   │   ├── 风控 → /admin/settings/rate-limit
│   │   ├── 安全 → /admin/settings/security
│   │   ├── API → /admin/settings/api
│   │   ├── 财务 → /admin/settings/finance
│   │   ├── 存储 → /admin/settings/storage
│   │   └── 提供商 → /admin/settings/provider
│   ├── 验证码 → /admin/captcha
│   ├── 短信 → /admin/sms
│   ├── 签到配置 → /admin/checkin
│   ├── 实名认证 → /admin/verifications
│   ├── 渠道亲和性 → /admin/affinity
│   ├── 快捷方式 → /admin/shortcuts
│   └── 运行状态 → /admin/uptime
```

---

## 5. 缺失页面分析

### 5.1 分析说明

以下列出后端已经完整支持、但前端尚未创建页面或缺少完整入口的功能。按优先级排序。

### P0 — 高优先级（核心功能缺失）

| # | 缺失功能 | 后端支持情况 | 说明 |
|---|---------|------------|------|
| 1 | **用户端发票申请** | 后端有 `Invoice` 模型和 `POST /admin/invoices` 接口，支持用户提交 | 用户控制台缺少"发票申请"页面，用户无法在线提交开票申请。需创建 `/dashboard/invoices` 页面 |
| 2 | **兑换码管理（Admin）** | 后端完整支持：`POST /redeem/codes`（生成）、`GET /redeem/codes`（列表）、`PUT /redeem/codes/:id`（更新）、`DELETE /redeem/codes/:id`（删除） | 管理后台缺少"兑换码管理"页面入口，只能在用户端充值时使用兑换码，管理员无法管理 |
| 3 | **实名认证审核（Admin）** | 后端有 `RealNameVerification` 模型，用户端已有提交页面；管理员审核接口需检查 | 管理后台缺少实名认证审核页面，管理员无法查看和审核用户提交的认证信息 |
| 4 | **两步验证 (2FA)** | 后端有 `TwoFactorAuth` 模型，用户端个人设置页面有启用按钮但功能未接入 | 需要完整的 2FA 设置流程：启用 → 扫描二维码 → 输入验证码确认 → 关闭 |
| 5 | **服务状态页增强** | 后端 `GET /v1/status` 返回实时渠道状态数据 | 前端 `/status` 页面已创建，但缺少实时数据对接和可视化展示（状态指示器、延迟图表等） |

### P1 — 中优先级（重要功能缺失）

| # | 缺失功能 | 后端支持情况 | 说明 |
|---|---------|------------|------|
| 1 | **订阅计划管理（Admin）** | 后端有 `SubscriptionPlan` 和 `UserSubscription` 模型 | 管理后台缺少订阅套餐 CRUD 页面，无法创建和管理订阅计划 |
| 2 | **用户端订阅管理** | 后端有 `UserSubscription` 模型，支持订阅类型和状态管理 | 用户控制台缺少"我的订阅"页面，用户无法查看和购买订阅套餐 |
| 3 | **渠道-模型关联管理** | 后端有 `ChannelModel` 关联表和完整的模型/渠道管理接口 | 渠道管理页面缺少"关联模型"功能，创建/编辑渠道时无法配置支持的模型 |
| 4 | **渠道高级配置** | `Channel` 表有大量高级字段：modelMapping、paramOverride、headerOverride、proxy、systemPrompt、auto_disable、force_openai_format 等 | 当前渠道表单只覆盖基础字段，缺少高级配置界面 |
| 5 | **充值折扣管理（Admin）** | 后端有 `RechargeDiscount` 模型和对应的种子数据 | 管理后台缺少阶梯折扣管理页面 |
| 6 | **企业组织管理** | 后端有 `Organization` 模型 | 缺少组织创建、成员管理、组织余额查看页面 |
| 7 | **用户端 Passkey 管理** | 后端有 `Passkey` 模型，支持 WebAuthn 设备管理 | 用户设置页面提到访问令牌但未实现 Passkey 管理功能 |
| 8 | **用户端账户绑定** | 后端有 `AccountBinding` 模型，支持 EMAIL/GITHUB/GOOGLE/WECHAT 绑定 | 用户设置页面显示 GitHub 绑定 UI 但未对接实际 API |

### P2 — 低优先级（补充功能缺失）

| # | 缺失功能 | 后端支持情况 | 说明 |
|---|---------|------------|------|
| 1 | **渠道亲和性管理（Admin）** | 后端有 `ChannelAffinityRule` 和 `ChannelAffinityConfig` 模型 | 缺少渠道亲和性规则配置界面 |
| 2 | **API 快捷方式管理（Admin）** | 后端有 `ApiShortcut` 模型 | 缺少快捷方式管理页面 |
| 3 | **Provider 专属设置（Admin）** | 后端有 `ProviderSetting` 模型，支持安全行为/版本覆盖等设置 | 缺少 Provider 级别的高级设置页面 |
| 4 | **Uptime 分组管理（Admin）** | 后端有 `UptimeGroup` 模型 | 设置页面有 placeholder 但未完成 Uptime 分组管理功能 |
| 5 | **签到配置（Admin）** | 后端有 `PUT /checkin/config` 接口和 `CheckInConfig` 模型 | 管理后台缺少签到参数配置页面，只能通过 API 直接调用配置 |
| 6 | **支付网关配置（Admin）** | 后端有 `PaymentGatewayConfig` 模型（STRIPE/CREEM/WAFFO） | 缺少替代支付网关的配置界面 |
| 7 | **用户端 OAuth 登录/绑定** | 后端 `User` 模型支持 github_id/google_id/wechat_id | 缺少第三方登录按钮和绑定流程接入 |
| 8 | **重置密码页面** | 后端有 `POST /auth/forgot-password` 和 `POST /auth/reset-password` | 缺少 `/forgot-password` 和 `/reset-password` 前端页面 |

### 5.2 优先级建议

**第一阶段（P0）：**

1. 用户端发票申请页面 — 完成用户充值的闭环
2. 兑换码管理（Admin）— 管理员运营工具
3. 实名认证审核（Admin）— 合规运营基础
4. 两步验证 (2FA) 设置 — 账户安全基础
5. 服务状态页数据对接 — 提升平台透明度

**第二阶段（P1）：**

1. 订阅计划管理 + 用户端订阅 — 商业变现核心
2. 渠道高级配置 — 运维精细化
3. 渠道-模型关联 — 配置灵活性
4. 充值折扣管理 — 运营工具
5. 企业组织管理 — 多租户支持

**第三阶段（P2）：**

1. 渠道亲和性、快捷方式、Provider 设置
2. Uptime 分组管理
3. OAuth 登录/绑定
4. 重置密码页面
5. 支付网关配置
