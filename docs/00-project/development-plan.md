# ToAIAPI — 下一步开发计划

> 基于 v0.4.2 全面代码审计，按优先级排列

---

## 当前状态总览

| 维度 | 完成度 | 说明 |
|------|--------|------|
| 核心网关 | ✅ 95% | /v1/chat/completions、流式输出、故障转移 |
| 用户系统 | ✅ 90% | 注册/登录/JWT/密码管理，缺邮件发送 |
| API Key | ✅ 90% | CRUD + 限流，缺前端高级配置 UI |
| 计费系统 | ✅ 85% | Token 计算 + 余额扣减，缺充值入口 |
| Admin 后端 | ✅ 90% | Provider/Channel/Model/User CRUD |
| Admin 前端 | 🔄 70% | 基础 CRUD 完成，缺编辑对话框和详情页 |
| 用户前端 | 🔄 75% | 核心页面完成，部分页面为静态数据 |
| 支付系统 | ❌ 0% | Schema 已定义，无模块实现 |
| 测试 | ❌ 0% | 无任何测试文件 |
| CI/CD | ❌ 0% | 无 GitHub Actions |

---

## Phase 1: 修补与完善（1-2 周）

> 目标：修复已知问题，补全 V2.0 遗留项

### 1.1 后端 Bug 修复

| # | 任务 | 文件 | 优先级 |
|---|------|------|--------|
| 1 | OpenRouter provider 适配器映射缺失 | `providers/provider-adapter.factory.ts` | P0 |
| 2 | forgotPassword 邮件发送未实现（TODO） | `auth/auth.service.ts:238` | P1 |
| 3 | .env.example 补充 `ADMIN_EMAIL`/`ADMIN_PASSWORD` | `backend/.env.example` | P1 |
| 4 | Seed 脚本添加默认 Channel（开箱即用） | `prisma/seed.ts` | P1 |
| 5 | 清理 api-key/entities/ 下残留编译产物 | `modules/api-key/entities/` | P2 |
| 6 | 清理 auth/guards/ 空目录 | `modules/auth/guards/` | P2 |
| 7 | gateway/sdk 包补充 `dist/` 构建输出 | `packages/gateway/`, `packages/sdk/` | P2 |

### 1.2 Admin 前端补全

| # | 任务 | 说明 |
|---|------|------|
| 1 | Channel 编辑对话框 | API 已有 `update()`，UI 需补充编辑弹窗 |
| 2 | Model 编辑对话框 | 支持修改 displayName、maxContext、capabilities |
| 3 | User 详情页 | 点击用户行展示余额、用量统计 |
| 4 | User 角色修改 | 下拉选择角色（仅 SUPER_ADMIN 可用） |
| 5 | Dashboard 今日统计接真实 API | `todayRequests`/`todayTokens` 当前硬编码为 0 |
| 6 | Admin 充值 UI | 调用 `POST /balance/recharge` 为用户充值 |
| 7 | Request Log 查看器 | Admin 全局查看所有用户的请求日志 |

### 1.3 用户前端补全

| # | 任务 | 说明 |
|---|------|------|
| 1 | 模型列表页改接真实 API | `/models` 当前使用硬编码数据 |
| 2 | 服务状态页改接真实 API | `/status` 当前使用硬编码数据 |
| 3 | 交易记录独立页面 | `/transactions` — 已有 API 但无页面 |
| 4 | API Key 高级配置 UI | rate_limit、token_limit、model_limit、ip_whitelist |
| 5 | 头像上传功能 | Settings 页面补充 avatar 上传 |

### 1.4 架构改进

| # | 任务 | 说明 |
|---|------|------|
| 1 | Next.js Middleware 路由守卫 | 替代客户端 useEffect 重定向，消除未认证内容闪烁 |
| 2 | 前端补充 React Error Boundary | 全局错误降级展示 |
| 3 | 移除未使用的依赖 | admin: react-query, react-hook-form, zod |
| 4 | .gitignore 完善 | 确保 dist/、.next/、*.js.map 不再误提交 |

---

## Phase 2: 支付系统（2-3 周）

> 目标：完成 V3.0 核心——用户自助充值

### 2.1 后端模块开发

| # | 任务 | 说明 |
|---|------|------|
| 1 | Order 模块 | `modules/order/` — 创建/查询/取消订单 |
| 2 | Payment 模块 | `modules/payment/` — 支付渠道集成 |
| 3 | 易支付（epay）适配器 | 首个支付渠道，门槛最低 |
| 4 | 微信支付适配器 | Native 扫码支付 |
| 5 | 支付宝适配器 | 当面付 / 手机网站支付 |
| 6 | Webhook 回调处理 | 验签 + 幂等 + 状态机流转 |
| 7 | 退款流程 | 管理员审批 + 余额扣减 + 事务保证 |

### 2.2 支付流程

```
用户选择充值金额 → 创建 Order(PENDING)
    → 调用支付渠道获取凭证 → 展示二维码/跳转
    → 用户完成支付 → Webhook 回调
    → 验签 → 更新 Order(PAID) → 充值余额 → 写入流水
```

### 2.3 前端页面

| # | 任务 | 说明 |
|---|------|------|
| 1 | 充值页面 `/recharge` | 金额选择、支付方式、二维码展示 |
| 2 | 订单列表 `/orders` | 用户查看历史充值订单 |
| 3 | Admin 订单管理 | 查看/退款/筛选订单 |
| 4 | Dashboard 充值入口 | 余额卡片旁增加"充值"按钮 |

---

## Phase 3: 测试与质量（2 周）

> 目标：建立测试基线，保障核心链路

### 3.1 单元测试

| 模块 | 覆盖范围 |
|------|---------|
| `@toai/billing` | calculateCost、validateTokenUsage、边界值 |
| `@toai/auth` | JWT 生成/验证、密码哈希/校验 |
| `@toai/gateway` | channel-selector 策略、provider-adapter factory |
| `billing.service` | 余额扣减事务、并发安全 |
| `auth.service` | 注册/登录/刷新/登出完整流程 |

### 3.2 集成测试

| 场景 | 说明 |
|------|------|
| Gateway E2E | API Key 认证 → 模型选择 → 渠道转发 → 计费 → 日志 |
| 支付回调 E2E | Webhook → 验签 → 订单状态 → 余额变更 |
| 并发扣费 | 同一用户同时发起多个请求，余额不出现负数 |

### 3.3 CI/CD

| # | 任务 | 说明 |
|---|------|------|
| 1 | GitHub Actions workflow | lint → typecheck → test → build |
| 2 | PR 检查 | 自动运行测试，阻止合并失败 PR |
| 3 | Docker 构建 | 多阶段构建，优化镜像体积 |

---

## Phase 4: 安全与合规（2 周）

> 目标：达到 V4.0 安全标准

### 4.1 认证增强

| # | 任务 | 说明 |
|---|------|------|
| 1 | 邮箱验证 | 注册后发送验证邮件，未验证限制功能 |
| 2 | 2FA (TOTP) | 登录二次验证，使用 speakeasy 库 |
| 3 | OAuth 登录 | GitHub / Google OAuth（V3.0 用户系统 PRD） |

### 4.2 安全加固

| # | 任务 | 说明 |
|---|------|------|
| 1 | 审计日志模块 | 记录关键操作（登录/角色变更/充值/退款） |
| 2 | IP 风控 | 异常 IP 登录告警、API Key IP 白名单强化 |
| 3 | CSP Header | 前端安全头配置 |
| 4 | 登录限流 | 5 次/分钟/IP，Redis 计数器 |

---

## Phase 5: 高级功能（持续迭代）

> 目标：V5.0-V6.0 差异化竞争力

### 5.1 企业功能（V5.0）

- Organization 多租户
- Team / Workspace 管理
- RBAC 权限系统（Owner/Admin/Developer/Billing/Viewer）
- 成员邀请系统
- SSO 集成（SAML 2.0 / OIDC）

### 5.2 智能路由（V6.0）

- 基于成本/延迟/成功率的混合评分路由
- 渠道健康度实时监控 UI
- 自动降级策略

### 5.3 代理商系统（V6.0）

- 多级分销树
- 代理商自定义定价
- 利润报表

### 5.4 其他

- Webhook 通知（余额不足、API 异常）
- SDK 发布（Python / Node.js / Go）
- Prompt 模板市场
- 使用分析仪表盘（图表化）

---

## 开发优先级矩阵

```
紧急度 ↑
       │
  P0   │  ① OpenRouter适配    ② 支付系统
       │
  P1   │  ③ Admin补全         ④ 测试体系
       │
  P2   │  ⑤ 安全加固          ⑥ 企业功能
       │
  P3   │  ⑦ 智能路由          ⑧ 代理商
       │
       └──────────────────────────────────→ 重要度
            短期(1-2周)  中期(1月)  长期(季度)
```

---

## 技术债务清单

| # | 问题 | 影响 | 建议 |
|---|------|------|------|
| 1 | 无测试 | 回归风险高 | Phase 3 集中补齐 |
| 2 | 无 CI/CD | 合并无保障 | Phase 3 建立 |
| 3 | 前端路由守卫客户端实现 | 内容闪烁 | Phase 1 改 middleware |
| 4 | 静态模型/状态页 | 数据不一致 | Phase 1 改接 API |
| 5 | 未使用依赖 | 包体积冗余 | Phase 1 清理 |
| 6 | 无共享前端包 | 代码重复 | 考虑 packages/ui |
| 7 | 邮件服务未集成 | 忘记密码不可用 | Phase 1 接入 |

---

## 里程碑规划

| 版本 | 内容 | 预计时间 |
|------|------|---------|
| **v0.5.0** | Phase 1 完成 — 补全 + Bug 修复 | 2 周 |
| **v0.6.0** | Phase 2 完成 — 支付系统 | +3 周 |
| **v0.7.0** | Phase 3 完成 — 测试 + CI/CD | +2 周 |
| **v0.8.0** | Phase 4 完成 — 安全加固 | +2 周 |
| **v1.0.0** | Phase 5 部分 — 企业版基础 | +4 周 |
