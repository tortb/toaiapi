# ToAIAPI — 开发路线图

## 版本规划

### V1.0 MVP ✅ 已完成

**目标：** 跑通核心链路

- [x] 用户注册/登录（邮箱+密码）
- [x] JWT 认证（Access Token + Refresh Token）
- [x] API Key 管理（创建/删除/启用/禁用）
- [x] Gateway 核心（OpenAI 兼容 /v1/chat/completions）
- [x] Provider 适配器（OpenAI / Anthropic / Gemini）
- [x] Channel 管理（渠道选择、故障转移）
- [x] Token 计费系统（余额扣减）
- [x] 前端页面（Landing / Dashboard / API Keys / Usage / Settings）
- [x] Prisma Schema + PostgreSQL + Redis

### V2.0 多模型 + 管理后台 🔄 进行中

**目标：** 完善管理能力和多模型支持

- [x] Admin 后台 API（Provider/Channel/Model/User CRUD）
- [x] 更多 Provider 适配器（DeepSeek / Qwen / GLM / Moonshot / Grok）
- [x] Channel 健康监控（成功率、延迟、状态追踪）
- [x] Seed 系统（自动初始化 Provider/Model/Channel/Admin）
- [ ] Admin 前端 — Channel 管理页面
- [ ] Admin 前端 — Model 管理页面
- [ ] Model 别名支持
- [ ] Channel 批量导入/导出

### V2.1 安全加固 + 代码质量 ✅ 已完成 (v0.4.1)

**目标：** 达到商业 SaaS 级别的安全和代码质量标准

**安全修复（P0 严重漏洞）：**
- [x] JWT 密钥强制配置（移除硬编码默认值，缺失时终止进程）
- [x] JWT 算法限制（显式 HS256，防止算法混淆攻击）
- [x] Token 类型区分（access/refresh payload 字段）
- [x] Refresh Token 指纹改用 SHA-256 哈希
- [x] 密码重置 Token 不再写入日志
- [x] 计费系统：无定价模型拒绝服务（防止免费使用）
- [x] 计费系统：Token 数校验（拒绝负数/异常值）
- [x] 流式计费兜底：Provider 未返回 usage 时用字符数估算
- [x] Channel API Key 使用 AES-256-GCM 加密存储
- [x] Gateway SSE 流式输出错误处理

**高危修复（P1）：**
- [x] JWT Strategy 空指针防护（已删除用户 Token 处理）
- [x] `as never` 类型断言全部移除（使用 Prisma 枚举）
- [x] 订单号生成改用 `crypto.randomBytes`
- [x] `findByEmail` 添加软删除过滤
- [x] 计费运算符 `||` → `??`（nullish coalescing）
- [x] `findByEmail` 返回脱敏实体（不暴露 password_hash）
- [x] 错误码修正（密码强度 400 而非 409）
- [x] 日志邮箱脱敏（maskEmail）

**中危修复（P2）：**
- [x] 前端 API 重试限制（防止无限递归）
- [x] 分页参数校验（page ≥ 1, 1 ≤ pageSize ≤ 100）
- [x] 流式失败也记录 RequestLog（审计不可缺失）
- [x] 未使用导入清理
- [x] Admin 查询参数使用 Prisma 枚举类型

**代码注释（P3）：**
- [x] 所有修改文件添加完整中文 JSDoc
- [x] Prisma Schema 添加 model 级文档注释
- [x] SECURITY 标记所有安全相关代码
- [ ] 用户邀请系统

### V3.0 支付与订阅 📋 计划中

**目标：** 完成商业化闭环

- [ ] 支付系统（微信支付 / 支付宝）
- [ ] Stripe 集成（海外用户）
- [ ] 订阅计划管理
- [ ] 优惠券/折扣系统
- [ ] 发票系统
- [ ] 财务报表

### V4.0 安全与合规 📋 计划中

**目标：** 达到企业安全标准

- [ ] 2FA（TOTP）
- [ ] Passkey (WebAuthn)
- [ ] IP 风控
- [ ] 异常检测
- [ ] 审计日志
- [ ] 数据加密（AES-256-GCM）
- [ ] 合规报告

### V5.0 企业版 📋 计划中

**目标：** 支持企业多租户

- [ ] 组织管理（Organization）
- [ ] 团队管理（Team / Workspace）
- [ ] RBAC 权限系统
- [ ] 成员邀请与管理
- [ ] 企业配额管理
- [ ] SSO 集成

### V6.0 高级功能 📋 计划中

**目标：** 差异化竞争力

- [ ] 智能路由（成本/延迟/成功率混合评分）
- [ ] 代理商系统（多级分销）
- [ ] Prompt 模板市场
- [ ] 使用分析仪表盘
- [ ] API 限流精细化
- [ ] Webhook 通知
- [ ] SDK（Python / Node.js / Go）

---

## 开发优先级原则

1. **核心链路优先** — Gateway → 计费 → 认证
2. **商业化优先** — 支付 → 订阅 → 报表
3. **安全合规** — 不可跳过，但可以渐进式完善
4. **文档驱动** — 每个模块先写文档再写代码
