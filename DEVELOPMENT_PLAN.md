# ToAIAPI 下一步开发计划

> 日期：2026-06-07
> 范围：基于代码现状 + `.ai/` 规则文档 + 产品文档的差异分析

---

## 第一阶段：计费与安全核心（P0 — 必须优先修复）

### 1.1 集成 Tokenizer 重新校验 Token 数

| 项目 | 说明 |
|------|------|
| **现状** | `BillingService.processUsage()` 直接信任 provider 返回的 token 数，代码注释明确写着"当前直接使用，未来需集成 Tokenizer"。流式回退仅使用 CJK 字符启发式估算（`GatewayService.estimateTokens`） |
| **规则依据** | `.ai/billing-rules.md` — "NEVER trust the provider's token count — re-verify with a tokenizer" |
| **工作量** | 3-5天 |
| **实现** | ① 安装 `tiktoken`（OpenAI）、`@anthropic-ai/tokenizer`（Claude）、`gpt-tokenizer`（通用回退） ② 在 `packages/billing/src/validator.ts` 增加 `recountTokens(messages, response)` 函数 ③ 在 `BillingService.processUsage()` 中调用 recount 并与 provider 值比对，超过容差（10%）时使用本地计数值 ④ 流式场景在 `GatewayService.streamCleanup()` 中同样调用 |

### 1.2 订阅/混合计费模式

| 项目 | 说明 |
|------|------|
| **现状** | `SubscriptionPlan` 和 `UserSubscription` 模型已定义在 Prisma schema 中，但没有任何服务代码读取它们。所有计费直接走 `UserBalance` 扣减。`frozen` 字段始终为 0 |
| **规则依据** | `.ai/billing-rules.md` — Subscription 和 Hybrid 计费模式 |
| **工作量** | 5-7天 |
| **实现** | ① 创建 `SubscriptionService` module（service + repository） ② 实现 `checkAndDeductQuota(userId, modelId, tokens)` — 检查订阅配额，配额内免费用，超配额走余额 ③ 在 `BillingService.processUsage()` 中集成配额检查 ④ 实现每月配额重置（定时任务/cron） ⑤ `SubscriptionController` 订阅下单、续费、升级 API |

### 1.3 退款功能

| 项目 | 说明 |
|------|------|
| **现状** | `Payment` 模型中有 `refunded_at`、`refund_amount` 字段，`TransactionType` 有 `REFUND` 枚举，但没有任何退款代码。支付模块中无 `refundOrder` 方法 |
| **规则依据** | `.ai/payment-rules.md` — "退款流程：调用微信/支付宝退款 API → 更新订单 → 退还余额 → 记录流水" |
| **工作量** | 3-4天 |
| **实现** | ① `WechatPayService.refund()` — 调用微信退款 API v3 ② `AlipayService.refund()` — 调用支付宝退款接口 ③ `EPayService.refund()` — 调用易支付退款 ④ `PaymentService.refundOrder(orderNo)` — 统一入口，事务中更新订单状态 → 退还余额 → 记录 `REFUND` 流水 ⑤ 管理后台退款审批 API + 前端页面 |

---

## 第二阶段：安全加固（P0-P1）

### 2.1 黑名单系统

| 项目 | 说明 |
|------|------|
| **现状** | 完全未实现 |
| **规则依据** | `.ai/security-rules.md` — "BlacklistGuard、黑名单 IP/email/phone/domain 拦截" |
| **工作量** | 2-3天 |
| **实现** | ① 创建 `BlacklistModule`（service + guard） ② `BlacklistService` 支持增删查，数据存 Redis（快速） + DB（持久） ③ `BlacklistGuard` — NestJS `CanActivate` 守卫，检查请求 IP/邮箱/域名 ④ 在 `ApiKeyAuthGuard` 和 `JwtAuthGuard` 之前注册 |

### 2.2 完整限流（Rate Limiting）

| 项目 | 说明 |
|------|------|
| **现状** | 仅 API Key 级别的 `rate_limit` 字段在 `ApiKeyAuthGuard` 中检查。无用户级或 IP 级限流 |
| **规则依据** | `.ai/security-rules.md` — "用户级 100/min、IP 级 1000/min、API Key 级限流" + `@Throttle()` 装饰器 |
| **工作量** | 2-3天 |
| **实现** | ① 安装 `@nestjs/throttler` ② 全局配置 ThrottlerModule（IP 级兜底） ③ 自定义 `ApiKeyThrottlerGuard` — 读取 `ApiKey.rate_limit` 做 API Key 级别限流 ④ 用户级限流 guard |

### 2.3 OAuth 登录

| 项目 | 说明 |
|------|------|
| **现状** | `User` 模型有 `github_id`、`google_id`、`wechat_id` 字段，但无任何 OAuth 端点或策略 |
| **工作量** | 3-5天 |
| **实现** | ① 安装 `@nestjs/passport` + `passport-oauth2`/`passport-github2`/`passport-google-oauth20` ② 创建 OAuth 模块（controller + service + strategies） ③ 实现 GitHub/Google/微信登录流程 ④ 首次 OAuth 登录自动创建用户 ⑤ `AuthController` 增加 `GET /auth/github`、`GET /auth/google`、`GET /auth/wechat`、`GET /auth/oauth/callback` |

### 2.4 HTTPS 重定向 + CSRF

| 项目 | 说明 |
|------|------|
| **现状** | 未实现 |
| **规则依据** | `.ai/security-rules.md` |
| **工作量** | 1天 |
| **实现** | ① Fastify 中间件强制 HTTPS 重定向（生产环境） ② `@fastify/csrf-protection` 注册 |

---

## 第三阶段：网关扩展（P1）

### 3.1 ClaudeCode 适配器

| 项目 | 说明 |
|------|------|
| **现状** | 未实现 |
| **规则依据** | `.ai/provider-rules.md` — "ClaudeCodeAdapter extends AnthropicAdapter" |
| **工作量** | 1-2天 |
| **实现** | ① 创建 `ClaudeCodeAdapter extends AnthropicAdapter` ② 覆盖 `chatStream()`，添加 `anthropic-beta: max-tokens-3-5-sonnet-2024-07-15` header ③ 在 `ProviderAdapterFactory` 中注册 `claude-code` → `ClaudeCodeAdapter` |

### 3.2 Codex / Responses API 适配器

| 项目 | 说明 |
|------|------|
| **现状** | 未实现 |
| **规则依据** | `.ai/provider-rules.md` — "CodexAdapter extends OpenAIAdapter" |
| **工作量** | 2-3天 |
| **实现** | ① 创建 `CodexAdapter extends OpenAIAdapter` ② 增加 `responses()` 方法 — `POST /v1/responses` ③ 在 Factory 中注册 ④ 可选：Whisper 音频转写 + TTS 端点 |

### 3.3 Embeddings / Image Generation / Audio 端点

| 项目 | 说明 |
|------|------|
| **现状** | `ProviderAdapter` 接口只有 `chat()` 和 `chatStream()` |
| **规则依据** | `.ai/provider-rules.md` — "embeddings, generateImage, audio 可选方法" |
| **工作量** | 3-5天 |
| **实现** | ① 扩展 `ProviderAdapter` 接口增加可选方法 ② 实现 `OpenAIAdapter.embeddings()` — `POST /v1/embeddings` ③ 实现 `OpenAIAdapter.generateImage()` — `POST /v1/images/generations` ④ 实现 `OpenAIAdapter.audio()` — TTS 和 Whisper 转写 ⑤ GatewayController 增加对应路由 |

### 3.4 packages/gateway 集成

| 项目 | 说明 |
|------|------|
| **现状** | `packages/gateway/src/channel-selector.ts` 定义了三种选择策略，但 backend 的 `ChannelService` 自己重写了相同逻辑，未引用此 package |
| **工作量** | 1-2天 |
| **实现** | ① 统一 `packages/gateway` 和 `backend` 的类型定义（目前两套略有差异） ② backend `ChannelService` 改为依赖 `packages/gateway` 的 `selectChannel()` 函数 ③ backend `ProviderAdapterFactory` 改用 `packages/gateway` 的版本 |

### 3.5 渠道自动恢复机制

| 项目 | 说明 |
|------|------|
| **现状** | 渠道被标记为 `RATE_LIMITED` 后永不自动恢复（`channel.service.ts:140`）。`restoreChannel` 方法定义了但被调用次数为 0 |
| **工作量** | 1-2天 |
| **实现** | ① `PaymentService.onModuleInit` — 类似现有模式，加一个定时任务 ② 每 5 分钟检测 RATE_LIMITED/ERROR 渠道，尝试发送轻量请求（如 model list），成功则恢复 ③ 退避策略：首次失败后 1min → 5min → 15min → 30min |

---

## 第四阶段：内容安全与合规（P1-P2）

### 4.1 内容安全/审核模块

| 项目 | 说明 |
|------|------|
| **现状** | 未实现 |
| **规则依据** | `.ai/architecture-rules.md` — "ContentSafety 内容安全审核模块" |
| **工作量** | 3-5天 |
| **实现** | ① 创建 `ContentSafetyModule` ② `ContentSafetyService` — 集成阿里云内容安全 API / OpenAI Moderation API ③ `ContentSafetyGuard` — 请求/响应的 CanActivate guard ④ 支持关键词过滤 + AI 审核两种模式 ⑤ 可选：自动审核结果缓存 |

### 4.2 实名认证模块

| 项目 | 说明 |
|------|------|
| **现状** | 未实现（`docs/sdk/` 下有阿里云实人认证文档但无代码） |
| **工作量** | 2-3天 |
| **实现** | ① 创建 `VerificationModule` ② 集成阿里云实人认证 SDK ③ 实名认证记录表 + 认证状态字段 ④ 管理后台认证审核 ⑤ 可配置：充值/创建 API Key 前强制认证 |

---

## 第五阶段：企业版与组织管理（P2）

### 5.1 组织/团队模块

| 项目 | 说明 |
|------|------|
| **现状** | Prisma schema 已有 `Organization` 模型（含 `name`、`slug`、`balance`）。`User` 有 `organization_id`。但无独立 module。产品文档 `docs/01-product/enterprise.md` 明确标注"待实现" |
| **工作量** | 5-7天 |
| **实现** | ① 创建 `OrganizationModule`（controller + service + repository） ② 组织 CRUD API ③ 组织余额（与个人余额分离） ④ 组织级别 API Key ⑤ 成员邀请 → 接受 → 移除流程 ⑥ 团队（Team）子层级（schema 尚未有 Team 模型——需迁移） |

### 5.2 代理商/分销系统

| 项目 | 说明 |
|------|------|
| **现状** | 产品文档 `docs/01-product/reseller.md` 标注"V6.0 计划中"。数据库模型 PRD 中已设计但 Prisma schema 中没有 |
| **工作量** | 7-10天 |
| **实现** | ① 新增 `Reseller` 和 `ResellerCustomer` 模型（按 PRD 设计） ② Prisma migrate ③ 代理商申请 → 审核 → 等级管理 ④ 代理商客户管理（创建子账户、分配配额） ⑤ 阶梯加价体系（一级/二级/三级） ⑥ 利润报表 |

---

## 第六阶段：前端仪表盘完善（P2）

### 6.1 用户仪表盘页面组件

| 项目 | 说明 |
|------|------|
| **现状** | `apps/frontend/src/components/dashboard/pages/` 下有 6 个空目录（`api-keys/`、`billing/`、`logs/`、`overview/`、`settings/`、`usage/`），**零个文件** |
| **工作量** | 10-15天 |
| **实现** | 以下每个子目录需要创建实际页面组件： |

| 子目录 | 页面内容 |
|--------|---------|
| **overview/** | 余额概览、本月消费、请求统计、最近 7 天趋势图 |
| **api-keys/** | API Key 列表、创建、删除、轮换、编辑限制、模型白名单 |
| **usage/** | 模型使用排行、时段分布、按日/月聚合统计 |
| **billing/** | 交易流水列表、充值（调用支付）、发票申请 |
| **logs/** | 请求日志列表、详情展开、按时间/模型/状态筛选 |
| **settings/** | 个人资料编辑、密码修改、通知设置 |

### 6.2 管理后台前端页面

| 项目 | 说明 |
|------|------|
| **现状** | `apps/frontend/src/app/admin/` 下路由已定义但部分页面是基础结构，需要完善 CRUD 表格/表单组件（已有 `AdminShell` 框架） |
| **工作量** | 10-15天 |
| **实现** | ① 统一样式组件：DataTable（分页+排序+筛选）、FormDrawer、ConfirmDialog ② 各模块 CRUD 页面对接真实 API |

---

## 第七阶段：基础设施与 DevOps（P2-P3）

### 7.1 支付分布式锁

| 项目 | 说明 |
|------|------|
| **现状** | `PaymentService.handlePaymentNotify()` 仅靠 `order.status !== 'PENDING'` 幂等检查，无 Redis 分布式锁 |
| **规则依据** | `.ai/payment-rules.md` — "分布式锁防重复支付" |
| **工作量** | 1天 |
| **实现** | 支付回调入口加 Redis 锁（`RedisService.acquireLock`），防止并发回调导致余额重复增加 |

### 7.2 数据库迁移到 PostgreSQL（生产准备）

| 项目 | 说明 |
|------|------|
| **现状** | 开发用 SQLite（`prisma/schema.prisma` 中 `provider = "sqlite"`），部分 SQLite 特有代码（如 in-memory 日期聚合） |
| **工作量** | 3-5天 |
| **实现** | ① 创建 PostgreSQL 专用的 schema 文件或 migration ② 替换 SQLite 特有代码（如日期聚合改为 SQL `DATE_TRUNC`） ③ 更新 CI 测试环境 ④ 验证所有查询兼容性 |

### 7.3 日志与监控

| 项目 | 说明 |
|------|------|
| **现状** | 错误日志仅 NestJS Logger，无结构化日志、无告警 |
| **工作量** | 2-3天 |
| **实现** | ① 集成结构化日志（pino 已内置于 Fastify） ② 关键业务指标埋点（请求量、延迟、错误率、余额、充值） ③ 健康检查增加详细组件状态 |

---

## 第八阶段：管理后台缺失功能（P2）

### 8.1 Admin API Key 创建端点

| 项目 | 说明 |
|------|------|
| **现状** | `AdminCreateApiKeyDto` 已定义但无对应的 controller POST 端点和 service 方法。管理后台只能查看/删除 API Key，无法创建 |
| **工作量** | 1天 |
| **实现** | ① `AdminController` 增加 `POST /admin/api-keys` ② `AdminService` 增加 `createApiKey()` ③ 支持管理员为任意用户创建 API Key（指定 user_id） |

### 8.2 Admin 响应类型安全

| 项目 | 说明 |
|------|------|
| **现状** | `AdminService` 中 UserGroup、Role、ApiKey、Order、Bill、User 相关方法返回 `Record<string, unknown>` 而非类型安全的 DTO 类。Swagger 文档因此缺失响应 schema |
| **工作量** | 2-3天 |
| **实现** | ① 将返回类型从 `Record<string, unknown>` 改为对应的 DTO 类 ② 为 PaginatedResult 增加泛型 Swagger 装饰器支持 |

---

## 第九阶段：优化与重构（P3）

### 9.1 计费 + 日志一致性事务

| 项目 | 说明 |
|------|------|
| **现状** | `GatewayService.handleChatCompletion()` 中余额扣减在事务中，但 request_log 写入在事务外且是 fire-and-forget |
| **工作量** | 2-3天 |
| **实现** | ① `BillingService.processUsage()` 改为返回 cost 和事务内的日志参数 ② `GatewayService` 在同一个事务中写入 request_log + 扣减余额 |

### 9.2 缓存层完善

| 项目 | 说明 |
|------|------|
| **现状** | 模型列表缓存 30s 和 60s，API Key 验证结果缓存 5min。无缓存失效/更新机制 |
| **工作量** | 2-3天 |
| **实现** | ① 管理后台修改渠道/模型/定价时主动清除相关缓存 ② API Key 禁用/更新时清除缓存 ③ 统一缓存管理服务 |

### 9.3 `f.md` 文件清理

| 项目 | 说明 |
|------|------|
| **现状** | 根目录存在 `/home/tortb/claude-code/toaiapi/f.md` 文件（可能是测试/临时文件） |
| **工作量** | 0.1天 |
| **实现** | 确认用途后删除或归档 |

---

## 优先级与时间线汇总

| 阶段 | 模块 | 工作量 | 优先级 | 建议时间线 |
|------|------|--------|--------|-----------|
| **Phase 1** | Tokenizer 集成 | 3-5天 | P0 | 第 1 周 |
| **Phase 1** | 订阅/混合计费 | 5-7天 | P0 | 第 1-2 周 |
| **Phase 1** | 退款功能 | 3-4天 | P0 | 第 2 周 |
| **Phase 2** | 黑名单系统 | 2-3天 | P0 | 第 2 周 |
| **Phase 2** | 完整限流 | 2-3天 | P0 | 第 2-3 周 |
| **Phase 2** | OAuth 登录 | 3-5天 | P1 | 第 3 周 |
| **Phase 2** | HTTPS + CSRF | 1天 | P1 | 第 3 周 |
| **Phase 3** | ClaudeCode 适配器 | 1-2天 | P1 | 第 3 周 |
| **Phase 3** | Codex 适配器 | 2-3天 | P1 | 第 4 周 |
| **Phase 3** | Embeddings/Images/Audio | 3-5天 | P1 | 第 4 周 |
| **Phase 3** | packages/gateway 集成 | 1-2天 | P2 | 第 4 周 |
| **Phase 3** | 渠道自动恢复 | 1-2天 | P2 | 第 4 周 |
| **Phase 4** | 内容安全模块 | 3-5天 | P1 | 第 5 周 |
| **Phase 4** | 实名认证模块 | 2-3天 | P2 | 第 5 周 |
| **Phase 5** | 组织/团队模块 | 5-7天 | P2 | 第 6 周 |
| **Phase 5** | 代理商系统 | 7-10天 | P2 | 第 7 周 |
| **Phase 6** | 用户仪表盘页面 | 10-15天 | P2 | 第 7-8 周 |
| **Phase 6** | 管理后台页面完善 | 10-15天 | P2 | 第 8-9 周 |
| **Phase 7** | 支付分布式锁 | 1天 | P2 | 第 9 周 |
| **Phase 7** | PostgreSQL 迁移 | 3-5天 | P2 | 第 9-10 周 |
| **Phase 7** | 日志与监控 | 2-3天 | P2 | 第 10 周 |
| **Phase 8** | Admin API Key 创建 | 1天 | P2 | 第 10 周 |
| **Phase 8** | Admin 响应类型安全 | 2-3天 | P3 | 第 10 周 |
| **Phase 9** | 计费日志一致性 | 2-3天 | P3 | 第 11 周 |
| **Phase 9** | 缓存层完善 | 2-3天 | P3 | 第 11 周 |
| **Phase 9** | f.md 清理 | 0.1天 | P3 | 随时 |

**总计工作量**: 约 80-120 人天（约 3-4 个月，4 人团队）

---

## 关键依赖项

| 依赖 | 用途 | 安装位置 |
|------|------|---------|
| `tiktoken` | OpenAI tokenizer | packages/billing |
| `@anthropic-ai/tokenizer` | Claude tokenizer | packages/billing |
| `gpt-tokenizer` | 通用回退 tokenizer | packages/billing |
| `@nestjs/throttler` | 限流框架 | apps/backend |
| `@nestjs/passport` + `passport-github2` | GitHub OAuth | apps/backend |
| `@nestjs/passport` + `passport-google-oauth20` | Google OAuth | apps/backend |
| `@fastify/csrf-protection` | CSRF 保护 | apps/backend |
| `chart.js` / `recharts` | 前端图表 | apps/frontend |
| `@tanstack/react-table` | 数据表格 | apps/frontend |
| `react-hook-form` | 表单 | apps/frontend（可选） |
