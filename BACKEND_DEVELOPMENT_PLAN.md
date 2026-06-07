# ToAIAPI 后端开发计划

> 基于 `docs/development/后端开发指南.md` 的 16 项需求分析与实施计划
>
> **技术栈**: NestJS + Fastify + TypeScript + Prisma ORM (SQLite/PostgreSQL)
>
> **执行原则**: 
> - 严格遵循项目架构：Controller → Service → Repository → Prisma
> - 所有敏感字段使用 AES-256-GCM 加密
> - 多表操作必须使用 `$transaction`
> - 全面使用 TypeScript 类型安全
> - 参数校验使用 `class-validator`

---

## 📊 项目现状分析

### 已有模块
```
apps/backend/src/modules/
├── admin/          # 后台管理（渠道、模型、用户组等）
├── api-key/        # API Key 管理
├── auth/           # 认证（登录、注册、JWT）
├── balance/        # 余额查询
├── billing/        # 计费扣款
├── gateway/        # 核心网关（模型调用、渠道选择）
├── payment/        # 支付（订单、回调）
├── request-log/    # 请求日志
└── user/           # 用户信息管理
```

### 需要新增的模块
```
apps/backend/src/modules/
├── analytics/         # 模块四：分析看板
├── leaderboard/       # 模块六：排行榜
├── verification/      # 模块十：实名认证
├── checkin/           # 模块八：签到功能
├── invite/            # 模块七：邀请奖励
├── notification/      # 模块九：通知配置与分发
└── uptime/            # 模块十五：Uptime Kuma 监控
```

---

## 🗂️ 阶段划分（共 5 个阶段）

### 阶段 0：数据库 Schema 准备（优先级：P0）
**目标**: 完成所有新增表和字段的数据库迁移

**任务清单**:
- [x] 分析现有 schema 与需求差异
- [ ] 编写新增表的 Prisma Schema
  - CheckInRecord, CheckInConfig
  - NotificationConfig
  - RealNameVerification
  - RedeemCode, RedeemRecord
  - InviteRecord
  - AccountBinding, TwoFactorAuth, Passkey
  - LeaderboardCache
  - ApiShortcut
  - UptimeGroup
  - ProviderSetting
  - ChannelAffinityRule, ChannelAffinityConfig
  - PaymentGatewayConfig
  - RechargeDiscount
- [ ] 增强现有表字段
  - User: language, inviteCode
  - ApiKey: groupId, rpmLimit, tpmLimit, expiresAt, unlimitedQuota
  - Channel: 新增 20+ 字段（参数覆盖、透传控制、多密钥等）
  - RequestLog: 确认字段完整性（prompt_tokens, completion_tokens 等）
- [ ] 生成 Prisma Client: `pnpm db:generate`
- [ ] 执行迁移: `pnpm db:migrate`
- [ ] 验证迁移成功

**预计时间**: 1-2 小时

---

### 阶段 1：核心功能增强（优先级：P0）
**目标**: 完成用户端最核心的功能增强

#### 模块一：Dashboard Overview 统计增强
**文件**:
- `apps/backend/src/modules/balance/balance.service.ts` (增强)
- `apps/backend/src/modules/request-log/request-log.repository.ts` (新增方法)

**新增 Repository 方法**:
```typescript
// request-log.repository.ts
- getPlatformBreakdown(userId, startDate, endDate)
- getModelDistribution(userId, startDate, endDate)
- getTokenTrend(userId, startDate, endDate, granularity)
- getPerformanceMetrics(userId) // RPM/TPM/平均延迟
- getBatchKeyUsage(keyIds) // 批量查询 API Key 用量
```

**增强端点**: `GET /api/v1/balance/stats`
- 返回值增强：新增 platformBreakdown, modelDistribution, tokenTrend, performance

#### 模块三：API Key 管理增强
**文件**:
- `apps/backend/src/modules/api-key/api-key.controller.ts` (增强)
- `apps/backend/src/modules/api-key/api-key.service.ts` (增强)
- `apps/backend/src/modules/api-key/dto/` (新增 DTO)

**新增功能**:
1. `GET /api/v1/api-keys` 返回增强（包含用量、分组信息）
2. `POST /api/v1/api-keys` 支持批量创建（count 参数 1-100）
3. `PATCH /api/v1/api-keys/:id` 支持编辑新增字段

**新增 DTO**:
- `CreateApiKeyDto` (增强)
- `UpdateApiKeyDto` (增强)

#### 模块七：充值增强（折扣 + 兑换码）
**文件**:
- `apps/backend/src/modules/payment/payment.controller.ts` (新增端点)
- `apps/backend/src/modules/payment/payment.service.ts` (新增方法)
- `apps/backend/src/modules/payment/dto/` (新增 DTO)

**新增端点**:
1. `GET /api/v1/payment/discounts` - 获取阶梯折扣
2. `POST /api/v1/payment/redeem` - 兑换码充值
3. `GET /api/v1/payment/orders` - 订单列表（确保字段完整）

**核心逻辑**:
- 兑换码校验（有效性、使用次数、过期时间）
- 事务处理：增加余额 + 记录兑换 + 增加使用次数

**预计时间**: 4-6 小时

---

### 阶段 2：用户功能完善（优先级：P1）

#### 模块八：用户资料增强（签到 + 绑定）
**新增模块**: `apps/backend/src/modules/checkin/`
**文件**:
- `checkin.module.ts`
- `checkin.controller.ts`
- `checkin.service.ts`
- `dto/check-in.dto.ts`

**端点**:
1. `GET /api/v1/checkin/status` - 获取签到状态
2. `POST /api/v1/checkin` - 执行签到

**核心逻辑**:
- 检查今日是否已签到（unique 约束）
- 随机奖励生成（minReward ~ maxReward）
- 事务：创建签到记录 + 增加余额

**账户绑定端点** (在 user 模块中新增):
1. `GET /api/v1/users/me/bindings` - 查询绑定状态
2. `POST /api/v1/users/me/bindings` - 绑定/解绑账户

**两步验证端点** (在 user 模块中新增):
1. `GET /api/v1/users/me/2fa` - 查询状态
2. `POST /api/v1/users/me/2fa/enable` - 启用（返回 TOTP secret）
3. `POST /api/v1/users/me/2fa/verify` - 验证并激活
4. `POST /api/v1/users/me/2fa/disable` - 禁用

**Passkey 端点** (在 user 模块中新增):
1. `GET /api/v1/users/me/passkeys` - 列表
2. `POST /api/v1/users/me/passkeys` - 注册
3. `DELETE /api/v1/users/me/passkeys/:id` - 删除

#### 模块七：邀请奖励
**新增模块**: `apps/backend/src/modules/invite/`
**文件**:
- `invite.module.ts`
- `invite.controller.ts`
- `invite.service.ts`

**端点**:
1. `GET /api/v1/invite/stats` - 邀请统计
2. `GET /api/v1/invite/url` - 获取邀请链接

**核心逻辑**:
- 注册时处理邀请码（写入 InviteRecord）
- 充值后触发邀请奖励（在 payment webhook 中调用）
- 奖励规则：前 3 次充值，邀请人获得 10% 返现

**预计时间**: 5-7 小时

---

### 阶段 3：分析与监控（优先级：P1）

#### 模块四：分析看板 Analytics
**新增模块**: `apps/backend/src/modules/analytics/`
**文件**:
- `analytics.module.ts`
- `analytics.controller.ts`
- `analytics.service.ts`

**端点**:
1. `GET /api/v1/balance/analytics` - 模型调用分析聚合
2. `GET /api/v1/balance/analytics/call-trend` - 调用趋势
3. `GET /api/v1/balance/analytics/model-ranking` - 模型排行

**核心逻辑**:
- 基于 RequestLog 聚合统计
- 支持时间范围筛选（7d / 30d / 90d）
- 计算 RPM/TPM/消耗分布/调用排行

#### 模块六：排行榜 Leaderboard
**新增模块**: `apps/backend/src/modules/leaderboard/`
**文件**:
- `leaderboard.module.ts`
- `leaderboard.controller.ts`
- `leaderboard.service.ts`

**端点**:
1. `GET /api/v1/leaderboard` - 排行榜聚合（公开）
2. `GET /api/v1/leaderboard/models` - 热门模型（公开）
3. `GET /api/v1/leaderboard/vendors` - 厂商份额（公开）
4. `GET /api/v1/leaderboard/trending` - 趋势（公开）

**核心逻辑**:
- 支持多周期（TODAY / WEEK / MONTH / YEAR / ALL）
- 使用 LeaderboardCache 缓存（5 分钟 TTL）
- 热门模型按 Token 用量排名
- 厂商份额通过 model → provider 关联查询
- 趋势分析对比上一周期排名变化

#### 模块十五：Uptime Kuma 监控集成
**新增模块**: `apps/backend/src/modules/uptime/`
**文件**:
- `uptime.module.ts`
- `uptime.controller.ts`
- `uptime.service.ts`

**端点**:
1. `GET /api/v1/uptime/status` - 获取 Uptime 状态（公开）
2. `GET /api/v1/admin/uptime-groups` - 管理分组配置
3. `POST /api/v1/admin/uptime-groups` - 创建分组
4. `PATCH /api/v1/admin/uptime-groups/:id` - 编辑分组
5. `DELETE /api/v1/admin/uptime-groups/:id` - 删除分组

**核心逻辑**:
- 并行获取多个 Uptime Kuma 分组状态
- 5 秒超时控制
- 解析 Uptime Kuma API 返回的监控状态

**预计时间**: 6-8 小时

---

### 阶段 4：高级功能（优先级：P2）

#### 模块九：通知配置与分发
**新增模块**: `apps/backend/src/modules/notification/`
**文件**:
- `notification.module.ts`
- `notification.controller.ts`
- `notification.service.ts`
- `notification-dispatcher.service.ts`
- `dto/notification-config.dto.ts`

**端点**:
1. `GET /api/v1/users/me/notifications` - 获取配置
2. `PUT /api/v1/users/me/notifications` - 更新配置
3. `POST /api/v1/users/me/notifications/test` - 发送测试通知

**支持的通知渠道**:
- Email (SMTP)
- Webhook (HTTP POST)
- WxPusher
- 企业微信
- 钉钉
- 飞书

**核心逻辑**:
- 通知配置存储（JSON 字段）
- 余额不足检查（在 billing.service.ts 中集成）
- 通知分发器（并行发送到多个渠道）
- 防刷机制（30 分钟内最多 1 次）

#### 模块十：实名认证
**新增模块**: `apps/backend/src/modules/verification/`
**文件**:
- `verification.module.ts`
- `verification.controller.ts`
- `verification.service.ts`
- `dto/verification.dto.ts`

**端点**:
1. `GET /api/v1/verification/status` - 查询状态
2. `POST /api/v1/verification` - 提交认证
3. `POST /api/v1/verification/upload` - 上传证件照片

**核心逻辑**:
- 调用阿里云/腾讯云实人认证 API（参考 docs/sdk/ 文档）
- 身份证号 AES-256-GCM 加密存储
- 文件上传（本地存储或 OSS）
- 状态机：PENDING → APPROVED / REJECTED

#### 模块五：模型广场详情 + 分组价格
**文件**: `apps/backend/src/modules/gateway/gateway.controller.ts` (新增方法)

**新增端点**:
1. `GET /api/v1/models/public/:name` - 获取单个模型详情（公开）

**核心逻辑**:
- 查找模型（包含 provider, pricing, channelModels）
- 收集 API 端点（去重）
- 获取分组定价（基础价格 × 分组倍率）

**预计时间**: 7-9 小时

---

### 阶段 5：后台管理增强（优先级：P2）

#### 模块十一：后台渠道设置完善
**文件**: `apps/backend/src/modules/admin/admin.controller.ts` (增强)

**增强端点**:
1. `POST /api/v1/admin/channels` - Payload 扩展（20+ 新字段）
2. `PATCH /api/v1/admin/channels/:id` - 支持编辑新增字段
3. `POST /api/v1/admin/channels/:id/detect-upstream` - 上游模型检测

**新增字段分类**:
- API 访问：baseUrl, keyMode, apiKeys
- 模型与分组：customModels, modelMapping, groupId
- 覆盖规则：statusMapping, paramOverride, headerOverride
- 字段透传：8 个布尔开关（passthroughServiceTier 等）
- 代理：proxy
- 系统提示：systemPrompt, concatPrompt
- 上游检测：detectUpstream, autoSyncModels, excludeModelRegex

**核心逻辑**:
- 多密钥支持（JSON 数组，全部 AES 加密）
- 上游模型检测（调用 /v1/models 端点）
- 自动同步模型到 ChannelModel
- 排除模型正则过滤

#### 模块十二：计费与支付配置重构
**文件**: `apps/backend/src/modules/admin/admin.controller.ts` (新增端点)

**新增端点**:
1. `GET /api/v1/admin/quota-config` - 获取额度设置
2. `PUT /api/v1/admin/quota-config` - 更新额度设置
3. `GET /api/v1/admin/checkin-config` - 获取签到配置
4. `PUT /api/v1/admin/checkin-config` - 更新签到配置
5. `GET /api/v1/admin/payment-gateway/:gateway` - 获取支付网关配置
6. `PUT /api/v1/admin/payment-gateway/:gateway` - 更新支付网关配置

**支持的支付网关**:
- Stripe
- Creem
- Waffo Pancake
- Waffo Aggregate

**核心逻辑**:
- 敏感字段加密（apiKey, apiSecret, webhookSecret）
- 读取时脱敏（显示 ******** ）
- 编辑时完整解密

#### 模块十三：Provider 专属设置 + 渠道亲和性
**新增模块**: `apps/backend/src/modules/provider-settings/`
**文件**:
- `provider-settings.module.ts`
- `provider-settings.controller.ts`
- `provider-settings.service.ts`

**端点**:
1. `GET /api/v1/admin/provider-settings` - 获取所有 Provider 设置
2. `GET /api/v1/admin/provider-settings/:provider` - 获取特定 Provider 设置
3. `PUT /api/v1/admin/provider-settings/:provider` - 更新 Provider 设置

**Provider 专属配置**:
- Gemini: safetySettings, versionOverrides, imagineModels, thinkingAdapter
- Claude: headerOverrides, maxTokens, thinkingAdapter

**渠道亲和性端点** (在 admin 模块中新增):
1. `GET /api/v1/admin/channel-affinity` - 获取配置和规则
2. `PUT /api/v1/admin/channel-affinity/config` - 更新全局配置
3. `POST /api/v1/admin/channel-affinity/rules` - 创建规则
4. `PUT /api/v1/admin/channel-affinity/rules/:id` - 编辑规则
5. `DELETE /api/v1/admin/channel-affinity/rules/:id` - 删除规则

**核心逻辑**:
- 在 ChannelService.selectChannelsWithFallback() 中集成亲和性检查
- 支持 gjson 和 header 提取 Key
- 亲和记录缓存（TTL 可配置）
- 失败时可选更新亲和

#### 模块十四：API 地址快捷方式
**文件**: `apps/backend/src/modules/admin/admin.controller.ts` (新增端点)

**新增端点**:
1. `GET /api/v1/admin/api-shortcuts` - 列表
2. `POST /api/v1/admin/api-shortcuts` - 创建
3. `PATCH /api/v1/admin/api-shortcuts/:id` - 编辑
4. `DELETE /api/v1/admin/api-shortcuts/:id` - 删除

**核心逻辑**:
- URL 格式校验
- 颜色值校验（8 种预设颜色）
- 排序字段支持

**预计时间**: 8-10 小时

---

## 🔐 全局规范

### 1. 错误响应格式
```typescript
// 成功
{ statusCode: 200, data: {...}, message: "操作成功", timestamp: "..." }

// 分页
{ statusCode: 200, data: { items: [...], total, page, pageSize, totalPages }, ... }

// 错误
{ statusCode: 400, message: "参数校验失败", errors: [{field, message}], timestamp: "..." }
```

### 2. HTTP 状态码
- `200` - 查询/更新成功
- `201` - 创建成功
- `400` - 参数错误
- `401` - 未认证
- `403` - 权限不足
- `404` - 资源不存在
- `409` - 资源冲突（重复签到等）
- `429` - 频率限制
- `500/502/503` - 服务器错误

### 3. 加密规范
```typescript
// AES-256-GCM 加密
encrypt(plaintext: string): string  // 返回 iv:authTag:ciphertext (base64)
decrypt(ciphertext: string): string

// 需要加密的字段
- Channel.api_key / Channel.apiKeys
- RealNameVerification.idCard
- AccountBinding.accessToken / refreshToken
- TwoFactorAuth.secret
- PaymentGatewayConfig.config 中的敏感字段
```

### 4. 事务规范
```typescript
// 所有涉及多表写入的操作必须使用 $transaction
await this.prisma.$transaction(async (tx) => {
  // 操作 1
  // 操作 2
});

// Repository 方法支持可选的 tx 参数
async deductBalance(userId: string, amount: number, tx?: Prisma.TransactionClient) {
  const client = tx || this.prisma;
  return client.userBalance.update({ ... });
}
```

### 5. 参数校验
```typescript
// 所有 DTO 使用 class-validator
import { IsString, IsInt, Min, Max, IsBoolean, IsOptional } from 'class-validator';

export class CreateApiKeyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  count?: number;
}
```

### 6. 角色守卫
```typescript
@Roles('admin')          // 管理员
@Roles('super_admin')    // 超级管理员
@UseGuards(JwtAuthGuard) // 用户自身
// 无守卫 = 公开端点
```

### 7. 日志规范
```typescript
// 关键操作日志
this.logger.log(`[Balance] User ${userId} deducted ${cost} cents for model ${modelName}`);

// 错误日志
this.logger.error(`[Verification] Failed to verify user ${userId}: ${error.message}`, error.stack);

// 禁止记录：API Key 完整值、密码、身份证号明文、支付密钥
```

---

## 📝 开发检查清单

### 开发前
- [ ] 确保已执行数据库迁移
- [ ] 确认 ENCRYPTION_KEY 环境变量已配置
- [ ] 确认 REDIS_URL 已配置（用于缓存）

### 开发中
- [ ] 所有 Service 方法有完整的 TypeScript 类型注解
- [ ] 所有 DTO 使用 class-validator 装饰器
- [ ] 敏感字段使用 CryptoService 加密
- [ ] 多表操作使用 $transaction
- [ ] 关键操作记录日志
- [ ] 错误处理返回标准格式

### 开发后
- [ ] 使用 Postman/Insomnia 测试所有端点
- [ ] 验证参数校验是否生效
- [ ] 验证权限守卫是否正确
- [ ] 验证事务是否正确回滚
- [ ] 验证加密解密是否正常
- [ ] 检查是否有敏感信息泄露到日志

---

## 📦 交付物清单

### 代码文件
- [ ] 新增 7 个模块目录（analytics, leaderboard, verification, checkin, invite, notification, uptime）
- [ ] 增强 4 个现有模块（balance, api-key, payment, admin）
- [ ] 新增 50+ DTO 文件
- [ ] 新增 30+ Service 方法
- [ ] 新增 60+ API 端点

### 数据库
- [ ] 新增 15 张表
- [ ] 增强 4 张表（User, ApiKey, Channel, RequestLog）
- [ ] 新增 20+ 索引
- [ ] 生成迁移文件

### 文档
- [ ] API 文档（Swagger 自动生成）
- [ ] 更新 CLAUDE.md（如有架构变更）
- [ ] 更新 .ai/ 规则（如有新增规则）

---

## ⏱️ 总体时间估算

| 阶段 | 内容 | 预计时间 |
|------|------|---------|
| 阶段 0 | 数据库 Schema 准备 | 1-2 小时 |
| 阶段 1 | 核心功能增强 | 4-6 小时 |
| 阶段 2 | 用户功能完善 | 5-7 小时 |
| 阶段 3 | 分析与监控 | 6-8 小时 |
| 阶段 4 | 高级功能 | 7-9 小时 |
| 阶段 5 | 后台管理增强 | 8-10 小时 |
| **总计** | | **31-42 小时** |

**建议分配**:
- 如果有 1 人独立开发：6-8 个工作日
- 如果有 2 人并行开发：3-4 个工作日
- 如果有 3+ 人并行开发：2-3 个工作日

---

## 🚀 开始开发

准备好了吗？让我们从**阶段 0：数据库 Schema 准备**开始！

请确认以下信息：
1. 你希望我直接开始编写 Prisma Schema，还是先审查现有 schema？
2. 你是否希望一次性完成所有表的迁移，还是分阶段进行？
3. 开发过程中是否需要我提供详细的测试用例？

---

> **文档版本**: 1.0  
> **创建日期**: 2026-06-07  
> **最后更新**: 2026-06-07  
> **状态**: 待开始
