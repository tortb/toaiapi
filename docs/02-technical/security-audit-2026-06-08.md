# 安全审计报告（2026-06-08）

本报告基于当前仓库源码的只读审计结果整理，未包含代码修改。审计重点包括 API Key 泄露风险、Prompt Injection、SSRF/RCE、未授权访问、Rate Limit、输入校验和敏感日志。

## 总体结论

整体风险等级：**高**

主要风险集中在：

1. API Key 验证缓存失效，禁用/删除/轮换后旧 Key 仍可能短时间可用。
2. API Key 限流字段存在但未实际执行，AI 网关缺少 RPM/TPM/并发限制。
3. AI 调用先请求上游、后扣费，余额不足或扣费失败时可能造成上游额度消耗但本地未成功扣费。
4. 管理员可配置服务端请求 URL，存在 SSRF 风险。
5. 前端存在可配置 HTML + `dangerouslySetInnerHTML` + localStorage token 的组合风险，XSS 后可窃取 JWT/API Key。
6. 支付回调和上游错误日志存在敏感信息泄露风险。

## 高风险

| 类别 | 代码位置 | 问题 | 修复建议 |
|---|---|---|---|
| API Key 缓存失效 | `apps/backend/src/common/guards/api-key-auth.guard.ts:51`, `apps/backend/src/common/guards/api-key-auth.guard.ts:154`, `apps/backend/src/modules/api-key/api-key.service.ts:496` | 鉴权缓存使用 `apikey:verified:<sha256(fullKey)>`，但禁用/删除/轮换时删除的是 `apikey:prefix:<prefix>`，旧 Key 在 5 分钟缓存期内仍可能可用。 | 统一缓存键；或按 keyId/version 做缓存版本校验；禁用/删除/轮换时清理 verified cache；缓存命中时也校验状态版本。 |
| API Key IP 白名单绕过 | `apps/backend/src/common/guards/api-key-auth.guard.ts:195`, `apps/backend/src/common/guards/api-key-auth.guard.ts:200`, `apps/backend/src/main.ts:18` | IP 白名单无条件信任 `X-Forwarded-For` / `X-Real-IP`，客户端可伪造请求头绕过白名单。 | 只信任受控反向代理；配置 trusted proxy；直连请求优先使用 `request.ip`；按可信代理链解析真实 IP。 |
| Rate Limit 缺失 | `apps/backend/src/modules/api-key/api-key.service.ts:104`, `apps/backend/src/common/guards/api-key-auth.guard.ts:169`, `apps/backend/src/modules/gateway/gateway.service.ts:390`, `apps/backend/package.json:32` | 保存了 `rpmLimit/tpmLimit/rateLimit/tokenLimit`，但网关没有实际执行；`@nestjs/throttler` 已安装但未启用。 | 启用全局 Throttler；AI 网关用 Redis token bucket 按 API key 做 RPM/TPM/并发限制；认证接口按 IP+邮箱限流。 |
| AI 后置扣费 | `apps/backend/src/modules/gateway/gateway.service.ts:87`, `apps/backend/src/modules/gateway/gateway.service.ts:100`, `apps/backend/src/modules/gateway/gateway.service.ts:132` | 网关先调用上游模型，后执行 `billingService.processUsage` 扣余额；余额不足或扣费失败时，上游已消耗但本地可能未成功扣费，还可能触发重试或误标渠道异常。 | 调用前做余额预检查/预冻结；流式请求按 `max_tokens` 预授权，结束后结算退差额；本地计费错误不要触发 provider failover。 |
| 前端 XSS 窃取 token/API Key | `apps/backend/src/main.ts:27`, `apps/backend/src/app.service.ts:84`, `apps/frontend/src/components/HomeWrapper.tsx:35`, `apps/frontend/src/app/login/page.tsx:143`, `apps/frontend/src/lib/auth-api.ts:79` | CSP 被关闭，后台可配置 HTML 公告被 `dangerouslySetInnerHTML` 渲染，JWT/Refresh Token 存在 localStorage。XSS 后可直接窃取 token 并创建/轮换 API Key。 | 公告改纯文本/Markdown 或 DOMPurify 白名单净化；启用 CSP nonce/hash；Refresh Token 改 HttpOnly Secure SameSite Cookie，Access Token 放内存；敏感操作二次验证。 |
| SSRF | `apps/backend/src/modules/admin/dto/create-channel.dto.ts:18`, `apps/backend/src/modules/admin/dto/update-channel.dto.ts:16`, `apps/backend/src/modules/admin/admin.service.ts:952`, `apps/backend/src/modules/admin/dto/payment-config.dto.ts:38`, `apps/backend/src/modules/payment/epay.service.ts:247` | 管理员可配置任意 `baseUrl/api_endpoint`，服务端会请求该 URL，并携带上游 API Key 或支付商户信息。 | 只允许 HTTPS；配置域名白名单；DNS 解析后阻断 localhost/private/link-local/metadata IP；禁用或复核重定向；支付 endpoint 固定为可信域名。 |

## 中风险

| 类别 | 代码位置 | 问题 | 修复建议 |
|---|---|---|---|
| 普通用户可提交管理属性 | `apps/backend/src/modules/api-key/dto/create-api-key.dto.ts:170`, `apps/backend/src/modules/api-key/api-key.service.ts:87`, `apps/backend/src/modules/api-key/api-key.service.ts:108` | 用户侧创建/更新 API Key 可提交 `unlimitedQuota/groupId/rpm/tpm/modelLimit` 等管理属性，权限边界不清。 | 用户接口只允许 `name/expiresAt/ipWhitelist/modelLimit` 等低风险字段；分组、无限额度、限流上限只允许 admin 设置。 |
| 管理员权限过粗 | `apps/backend/src/modules/admin/admin.controller.ts:60`, `apps/backend/src/modules/admin/admin.controller.ts:501`, `apps/backend/src/modules/admin/admin.controller.ts:529`, `apps/backend/src/modules/admin/admin.controller.ts:734` | 普通 admin 可修改支付、SMTP、系统 HTML、模型渠道等高敏配置。 | 高敏配置改为 `super_admin` 或 RBAC permission guard；敏感变更加二次认证和审计日志。 |
| 用户输入校验不足 | `apps/backend/src/modules/gateway/dto/chat-completion.dto.ts:29`, `apps/backend/src/modules/gateway/dto/chat-completion.dto.ts:110`, `apps/backend/src/modules/gateway/dto/anthropic-message.dto.ts:45`, `apps/backend/src/main.ts:17` | AI 请求的消息长度、数组长度、tools/schema 大小、OpenAI `max_tokens` 上限不完整；body 默认 10MB。 | 增加 `MaxLength/ArrayMaxSize`；按模型限制上下文和 `max_tokens`；限制 tools 数量、JSON schema 深度和总请求大小。 |
| 日志泄露支付/上游错误 | `apps/backend/src/modules/payment/payment.controller.ts:142`, `apps/backend/src/modules/payment/payment.controller.ts:171`, `apps/backend/src/modules/gateway/providers/openai.adapter.ts:67`, `apps/backend/src/modules/gateway/gateway.service.ts:167` | 支付回调完整 `JSON.stringify(params)` 入日志；上游 `errorText` 被记录并透传，可能包含 prompt、签名、交易号或敏感错误体。 | 日志只记录白名单字段；脱敏 `sign/trade_no/buyer_id/email/token/key`；上游错误对客户端返回统一错误码和 requestId，内部日志截断脱敏。 |
| RolesGuard 兜底过宽 | `apps/backend/src/common/guards/roles.guard.ts:67` | 未知 required role 默认等级为 0，装饰器角色拼写错误可能被普通用户通过。 | 未知角色直接拒绝或启动时报错。 |
| 支付回调失败仍返回 success | `apps/backend/src/modules/payment/payment.controller.ts:153`, `apps/backend/src/modules/payment/payment.controller.ts:180`, `apps/backend/src/modules/payment/payment.controller.ts:208` | 异常也确认成功，支付平台不会重试，可能造成掉单。 | 无效签名返回失败；临时内部错误按支付平台规范返回可重试结果；保留幂等处理。 |

## 低风险 / 当前未发现直接高危

| 类别 | 代码位置 | 结论与建议 |
|---|---|---|
| API Key 后端存储 | `apps/backend/src/modules/api-key/api-key.service.ts:92`, `apps/backend/src/modules/api-key/api-key.service.ts:94`, `apps/backend/src/modules/admin/admin.service.ts:846` | 用户 API Key 使用 Argon2 hash，渠道上游 key 使用 AES-256-GCM 加密，未发现数据库明文存储。建议创建/轮换响应加 `Cache-Control: no-store`，前端只展示一次。 |
| Prompt Injection | `apps/backend/src/modules/gateway/gateway.controller.ts:95`, `apps/backend/src/modules/gateway/providers/openai.adapter.ts:40` | 当前后端主要透传 prompt/tools，不执行模型输出，服务端 Prompt Injection 风险较低。若未来接入 agent/tool 执行，需要工具白名单、参数校验、沙箱和人工确认。 |
| RCE | `apps/backend/src/redis/redis.service.ts:194` | 未发现用户输入可达的 `child_process/eval/new Function/vm`。Redis Lua 是内部固定脚本，不构成直接 RCE。 |
| 信息暴露 | `apps/backend/src/main.ts:74`, `apps/backend/src/app.service.ts:25` | Swagger 非生产默认开启，health 返回 DB/Redis 状态和版本。生产环境建议强制关闭 Swagger，对公网 health 只返回粗粒度状态。 |
| 维护模式绕过 | `apps/backend/src/common/middleware/maintenance.middleware.ts:82`, `apps/backend/src/common/middleware/maintenance.middleware.ts:102` | 维护模式中间件只解码 JWT payload，不验签。正式接口仍由后续 Guard 保护，因此风险较低。建议复用 JWT 验签或不要信任未验签 token。 |

## 优先修复顺序

1. 修复 API Key 缓存失效、IP 白名单伪造、AI 网关限流。
2. 修复 AI 调用前余额预授权/预冻结，避免上游已消耗但扣费失败。
3. 处理 XSS：去掉不可信 HTML 直出、启用 CSP、迁移 localStorage token。
4. 对所有服务端发起请求的 URL 做 SSRF 防护。
5. 梳理日志脱敏和 Admin 权限细分。
