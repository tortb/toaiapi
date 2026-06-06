# 阶段 00：架构审计与基线评估

> 阶段编号：P0
> 阶段类型：审计（Audit）/ 基线（Baseline）
> 适用版本：ToAIAPI v0.4.3 → v0.5.0
> 文档版本：v1.0
> 创建日期：2026-06-05
> 阅读对象：架构师、技术负责人、Tech Lead、全栈工程师
> 状态：评审中

---

## 目录

1. [阶段目标](#阶段目标)
2. [当前现状分析](#当前现状分析)
3. [功能范围](#功能范围)
4. [页面范围](#页面范围)
5. [数据库影响](#数据库影响)
6. [API 影响](#api-影响)
7. [前端实现](#前端实现)
8. [后端实现](#后端实现)
9. [权限设计](#权限设计)
10. [日志设计](#日志设计)
11. [安全设计](#安全设计)
12. [性能设计](#性能设计)
13. [UI 设计要求](#ui-设计要求)
14. [测试计划](#测试计划)
15. [风险分析](#风险分析)
16. [验收标准](#验收标准)
17. [下一阶段依赖](#下一阶段依赖)

---

## 阶段目标

### 1.1 核心使命

阶段 00（架构审计与基线评估）**不产生任何业务功能代码**，其唯一使命是：

1. **摸清家底**：穷尽性盘点 ToAIAPI 现有代码、配置、依赖、部署、文档资产；
2. **识别基线**：明确"现状已具备的能力"、"半成品"、"完全缺失"三个清单；
3. **固化契约**：将隐性技术决策（架构约束、命名规范、边界规则）转化为显性可执行文档；
4. **启动准入**：为后续 17 个开发阶段提供"已审计、可开工"的统一基线。

本阶段产出物对后续 17 个阶段具有 **强约束力**：

- 任何阶段对架构规则的偏离，必须先回到本阶段文档发起 RFC 修订；
- 任何阶段对数据库 Schema 的修改，必须先回到本阶段 `02-技术债务清单` 与 `03-架构决策记录（ADR）` 中登记。

### 1.2 业务问题陈述

ToAIAPI 平台当前在三个维度存在 **结构性不确定性**：

| 维度 | 现状 | 风险 |
|------|------|------|
| **架构契约** | `.ai/architecture-rules.md` 等 11 个规则文件散落多目录，无版本号，无责任人 | 新人入职无法快速认知；规则被绕过无审计 |
| **代码基线** | `apps/backend`、`apps/frontend`、`packages/*` 三处 TypeScript 构建产物（`.js`/`.d.ts`/`.js.map`）误提交 | 仓库体积膨胀、IDE 索引混乱、CI 缓存错位 |
| **部署基线** | 仅 1 个 `Dockerfile`（后端），无 `docker-compose.yml`，无 `nginx.conf`，无 `prometheus.yml` | 多环境部署无标准、本地起项目依赖人工记忆 |

### 1.3 成功指标

| 指标 | 目标值 | 测量方式 |
|------|-------|---------|
| 架构规则文档化覆盖率 | 100% | 11 个规则文件全部经评审签字 |
| 仓库 `.js.map` 误提交数 | 0 | `git ls-files | grep -c ".js.map"` 输出 0 |
| `Dockerfile` 数量 | ≥ 3（后端 / 前端 / 运维工具） | 文件系统 |
| 一键启动可用性 | 90 秒内 `pnpm dev` 跑通前后端 | 文档化验证步骤 |
| 本阶段产出 ADR 数量 | ≥ 15 条 | 编号 ADR-0001~ADR-0015 |

---

## 当前现状分析

### 2.1 仓库结构全景

经过 `LS /home/tortb/claude-code/toaiapi` 完整扫描，仓库由以下 6 个一级目录组成：

```
toaiapi/
├── .ai/                           # AI 协作文档（11 个规则文件）
│   ├── architecture-rules.md      # 架构总则
│   ├── billing-rules.md           # 计费规则
│   ├── coding-rules.md            # 编码规范
│   ├── database-rules.md          # 数据库规则
│   ├── gateway-rules.md           # 网关规则
│   ├── payment-rules.md           # 支付规则
│   ├── provider-rules.md          # 适配器规则
│   ├── review-checklist.md        # 评审清单
│   ├── security-rules.md          # 安全规则
│   ├── system-prompt.md           # 系统提示
│   └── task-template.md           # 任务模板
│
├── .trae/                         # Trae 平台规格
│   └── specs/admin-design-foundation/
│       ├── checklist.md
│       ├── spec.md
│       └── tasks.md
│
├── apps/                          # 应用程序
│   ├── backend/                   # NestJS 后端
│   │   ├── prisma/                # Prisma ORM
│   │   │   ├── schema.prisma      # 主 Schema（核心表）
│   │   │   ├── migrations/        # 3 个迁移
│   │   │   └── seed/              # 7 个 seed 文件
│   │   ├── src/
│   │   │   ├── common/            # 通用模块
│   │   │   │   ├── decorators/    # 4 个装饰器
│   │   │   │   ├── dto/           # 1 个分页 DTO
│   │   │   │   ├── filters/       # 1 个全局异常过滤器
│   │   │   │   ├── guards/        # 3 个守卫
│   │   │   │   ├── interceptors/  # 1 个响应转换器
│   │   │   │   ├── services/      # 4 个通用服务（Config 加密 / Email / PaymentConfig / SmtpConfig）
│   │   │   │   └── utils/         # 1 个工具（crypto）
│   │   │   ├── modules/           # 9 个业务模块
│   │   │   │   ├── admin/         # Admin 后台接口
│   │   │   │   ├── api-key/       # API Key 业务
│   │   │   │   ├── auth/          # 认证
│   │   │   │   ├── balance/       # 余额
│   │   │   │   ├── billing/       # 计费
│   │   │   │   ├── gateway/       # 网关（含 channel / providers）
│   │   │   │   ├── payment/       # 支付
│   │   │   │   ├── request-log/   # 调用日志
│   │   │   │   └── user/          # 用户
│   │   │   ├── prisma/            # Prisma 服务
│   │   │   ├── redis/             # Redis 服务
│   │   │   ├── app.module.ts
│   │   │   ├── app.controller.ts
│   │   │   └── main.ts
│   │   ├── .env.example
│   │   ├── Dockerfile
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── frontend/                  # Next.js 前端
│       ├── src/
│       │   ├── app/               # App Router
│       │   │   ├── admin/page.tsx
│       │   │   ├── docs/page.tsx
│       │   │   ├── models/page.tsx
│       │   │   ├── pricing/page.tsx
│       │   │   ├── status/page.tsx
│       │   │   ├── globals.css
│       │   │   ├── layout.tsx
│       │   │   └── page.tsx
│       │   ├── components/        # 2 个组件
│       │   └── lib/               # 2 个工具
│       ├── next.config.mjs
│       ├── package.json
│       ├── postcss.config.mjs
│       ├── tailwind.config.ts
│       └── tsconfig.json
│
├── packages/                      # 共享包
│   └── auth/src/                  # JWT 工具
│
├── docs/                          # 项目文档
│   ├── 00-project/                # 4 个总览文档
│   ├── 01-product/                # 11 个产品文档
│   ├── 02-technical/              # 4 个技术文档
│   ├── 03-admin/                  # 3 个 Admin 文档
│   ├── 03-database/               # 2 个数据库文档
│   ├── 04-api/                    # 3 个 API 文档
│   ├── 06-devops/                 # 3 个运维文档
│   ├── frontend-routes.md
│   └── README.md
│
├── .editorconfig
├── .env.example
├── .gitignore
├── .prettierignore
├── .prettierrc
├── LICENSE
├── README.md
└── package.json
```

### 2.2 已实现内容

#### 2.2.1 后端已实现功能

| 模块 | 文件 | 实现度 | 备注 |
|------|------|-------|------|
| **认证** | `modules/auth/auth.controller.ts` | 90% | 注册 / 登录 / 刷新 / 忘记密码 / 重置密码 / 修改密码 |
| **JWT 策略** | `modules/auth/strategies/jwt.strategy.ts` | 100% | Passport JWT |
| **角色守卫** | `common/guards/roles.guard.ts` | 70% | 仅支持 `roleHierarchy`，无细粒度 Permission |
| **JWT 守卫** | `common/guards/jwt-auth.guard.ts` | 100% | - |
| **API Key 守卫** | `common/guards/api-key-auth.guard.ts` | 100% | Argon2id 哈希校验 |
| **用户 CRUD** | `modules/user/user.controller.ts` | 90% | 列表 / 详情 / 创建 / 更新 / 删除 |
| **API Key CRUD** | `modules/api-key/api-key.controller.ts` | 90% | 创建 / 列表 / 详情 / 撤销 / 限流 |
| **余额** | `modules/balance/balance.controller.ts` | 80% | 查询 / 充值 / 扣减 |
| **计费** | `modules/billing/billing.service.ts` | 85% | Token 计算 / 余额扣减 |
| **网关** | `modules/gateway/gateway.controller.ts` | 95% | OpenAI 兼容 / 流式 |
| **Provider 适配器** | `modules/gateway/providers/` | 100% | OpenAI / Anthropic / Gemini |
| **支付** | `modules/payment/payment.service.ts` | 80% | EPay / Alipay / WechatPay |
| **支付配置** | `modules/admin/admin.service.ts` | 100% | PaymentConfig CRUD |
| **SMTP 配置** | `common/services/smtp-config.service.ts` | 100% | 数据库驱动 |
| **配置加密** | `common/services/config-encryption.service.ts` | 100% | AES-256-GCM |
| **Admin 后台接口** | `modules/admin/admin.controller.ts` | 95% | User / Channel / Model / Provider / Pricing / SMTP / Payment |
| **调用日志** | `modules/request-log/request-log.service.ts` | 70% | 单实例记录，缺聚合查询 |
| **响应转换器** | `common/interceptors/transform.interceptor.ts` | 100% | 统一返回 `{ code, message, data }` |
| **异常过滤器** | `common/filters/http-exception.filter.ts` | 100% | 统一错误格式 |
| **Redis 客户端** | `redis/redis.service.ts` | 90% | 连接池 / 基础操作 |

#### 2.2.2 前端已实现功能

| 页面 | 路由 | 实现度 | 备注 |
|------|------|-------|------|
| 落地页 | `/` | 100% | 营销首页 |
| Admin 入口 | `/admin` | 30% | **无鉴权**，未跳转登录 |
| 文档 | `/docs` | 70% | 静态 MDX 渲染 |
| 模型列表 | `/models` | 50% | **硬编码数据** |
| 价格 | `/pricing` | 80% | - |
| 服务状态 | `/status` | 30% | **硬编码数据** |
| 公共布局 | `components/SiteShell.tsx` | 100% | - |
| 公共图标 | `components/PixelIcons.tsx` | 100% | - |

#### 2.2.3 数据库已实现

| 表 | 用途 | 迁移文件 |
|----|------|---------|
| `User` | 用户主表 | `20260530173634_init` |
| `UserBalance` | 用户余额 | `20260530173634_init` |
| `UserTransaction` | 交易流水 | `20260530173634_init` |
| `ApiKey` | API Key | `20260530173634_init` |
| `Model` / `ModelPricing` | 模型与定价 | `20260530173634_init` |
| `Provider` / `Channel` / `ChannelModel` / `ChannelApiKey` | 提供商与渠道 | `20260530173634_init` |
| `RequestLog` | 调用日志 | `20260530173634_init` |
| `Order` / `Payment` | 订单与支付记录 | `20260530173634_init` |
| `PaymentConfig` | 支付配置 | `20260604151847_add_payment_smtp_config` |
| `SmtpConfig` | SMTP 配置 | `20260604151847_add_payment_smtp_config` |
| `ApiKeyUsageStats` | API Key 用量统计 | `20260605120000_add_apikey_usage_stats` |

#### 2.2.4 文档已实现

| 文档 | 路径 | 完成度 |
|------|------|-------|
| 项目愿景 | `docs/00-project/vision.md` | 90% |
| 项目架构 | `docs/00-project/architecture.md` | 85% |
| 开发计划 | `docs/00-project/development-plan.md` | 95% |
| 路线图 | `docs/00-project/roadmap.md` | 80% |
| Admin PRD | `docs/03-admin/01-admin-prd.md` | 95% |
| RBAC 设计 | `docs/03-admin/02-rbac-design.md` | 90% |
| 数据库 Schema | `docs/03-admin/03-database-schema.md` | 85% |
| 数据库 ERD | `docs/03-database/erd.md` | 90% |
| API 规范（Admin） | `docs/04-api/admin-api.md` | 85% |
| API 规范（Internal） | `docs/04-api/internal-api.md` | 90% |
| API 规范（OpenAI 兼容） | `docs/04-api/openai-compatible.md` | 100% |
| 前端路由 | `docs/frontend-routes.md` | 90% |
| 部署文档 | `docs/06-devops/deployment.md` | 70% |
| Docker 文档 | `docs/06-devops/docker.md` | 60% |
| CI/CD 文档 | `docs/06-devops/ci-cd.md` | 40% |
| 监控文档 | `docs/02-technical/monitoring.md` | 60% |
| 安全文档 | `docs/02-technical/security.md` | 70% |
| 网关文档 | `docs/02-technical/gateway.md` | 85% |
| 后端技术 | `docs/02-technical/backend.md` | 80% |

#### 2.2.5 11 个 AI 协作规则文件

| 文件 | 内容 | 责任人建议 |
|------|------|----------|
| `system-prompt.md` | AI 系统级提示 | 架构师 |
| `architecture-rules.md` | 架构总则 | 架构师 |
| `coding-rules.md` | 编码规范 | 全栈 Lead |
| `database-rules.md` | 数据库规范 | DBA |
| `security-rules.md` | 安全规范 | 安全负责人 |
| `gateway-rules.md` | 网关规范 | 网关组 Lead |
| `provider-rules.md` | 适配器规范 | 网关组 Lead |
| `billing-rules.md` | 计费规范 | 财务组 Lead |
| `payment-rules.md` | 支付规范 | 财务组 Lead |
| `review-checklist.md` | 评审清单 | 全栈 Lead |
| `task-template.md` | 任务模板 | 全栈 Lead |

### 2.3 未实现内容

| 缺口分类 | 具体项 | 阻塞阶段 |
|---------|--------|---------|
| **测试** | 后端 0 个单元测试 / 0 个集成测试 / 0 个 E2E | P0、P15、P16 |
| **CI/CD** | 无 `.github/workflows/*.yml` | P0、P17 |
| **前端鉴权** | `/admin` 无路由守卫；Admin 子页面无 RBAC | P1、P2 |
| **权限点表** | `Permission` / `Role` / `RolePermission` 表未创建 | P1 |
| **前端共享层** | 无 `packages/ui`、`packages/api-client` | P2、P3 |
| **数据库种子** | 无 Organization / Role / Permission 默认数据 | P1 |
| **Docker Compose** | 无多服务编排 | P0、P17 |
| **Nginx 配置** | 无反向代理 / TLS / 限流配置 | P17 |
| **Prometheus 指标** | 无 `prometheus.yml`，无 `/metrics` 端点 | P10、P15 |
| **Grafana 仪表盘** | 无 JSON 导入包 | P10 |
| **审计日志** | `security_logs` / `audit_logs` 表缺失 | P16 |
| **Webhook 通知** | 余额不足、API 异常等无 Webhook | P13 |
| **SDK** | `packages/sdk` 不存在 | P17 |
| **国际化** | 全站 i18n 框架未集成 | P2 |
| **暗色模式** | Tailwind 未配置 dark class 切换 | P2 |
| **错误边界** | 前端无 Error Boundary | P0 |
| **监控告警** | 无 Alertmanager 配置 | P10、P17 |

### 2.4 技术债务

#### 2.4.1 构建产物污染（高优先级）

`apps/backend/src/**` 中存在大量 `*.d.ts.map` / `*.js` / `*.js.map` 文件：

```
apps/backend/src/common/decorators/api-key.decorator.d.ts.map
apps/backend/src/common/decorators/api-key.decorator.js
apps/backend/src/common/decorators/api-key.decorator.js.map
apps/backend/src/common/decorators/current-user.decorator.d.ts.map
... (约 200+ 误提交文件)
```

**根因分析：**
1. `tsconfig.tsbuildinfo` 已被提交到仓库根；
2. `tsconfig.build.json` 缺少 `noEmit: false` 显式声明，导致 IDE 调试时把 `.js` 输出到 `src/`；
3. `.gitignore` 仅忽略根目录 `dist/`，未覆盖 `src/**/*.js` 与 `src/**/*.js.map`；
4. Prettier / ESLint 配置 (`.prettierignore`、`.prettierrc`) 未排除构建产物。

**修复方案：**
- 一次性 `git rm --cached` 所有污染文件；
- 修订 `.gitignore`：
  ```
  apps/backend/src/**/*.js
  apps/backend/src/**/*.js.map
  apps/backend/src/**/*.d.ts.map
  apps/backend/tsconfig.tsbuildinfo
  packages/auth/src/**/*.js
  packages/auth/src/**/*.js.map
  ```
- 在 `tsconfig.json` 增加 `"noEmit": true`（开发模式）与 `tsconfig.build.json` 分离；
- 在 CI 中增加 `git ls-files | grep -E '\.(js|js\.map|d\.ts\.map)$' | grep -v node_modules` 检查，命中则 fail。

#### 2.4.2 前端无 Error Boundary（中优先级）

`apps/frontend/src/app/**` 中没有任何 `error.tsx` 或 `global-error.tsx` 边界文件。一旦任何客户端组件抛出未捕获异常，整个应用将显示白屏。

**修复方案：**
- 在 `app/error.tsx`（根级）实现通用 ErrorBoundary；
- 在 `app/admin/error.tsx`（Admin 域）实现带"返回控制台"按钮的变体；
- 在 `app/global-error.tsx` 处理 layout.tsx 抛错的极端场景。

#### 2.4.3 前端依赖冗余（中优先级）

`apps/frontend/package.json` 声明但未使用：`react-query`、`react-hook-form`、`zod`。

**修复方案：** 在阶段 02 同步移除，并在 `package.json` 增 `"sideEffects": false` 标识以利 Tree-shaking。

#### 2.4.4 邮件服务集成缺口（低优先级）

`EmailService` 已实现，但 `forgotPassword` 仅写入 token 至 `User.reset_password_token`，未实际发送邮件（仅 dev 环境静默成功）。

**修复方案：** 在 P1 阶段实现真实邮件发送，依赖 `SmtpConfig` 表中的活跃配置。

#### 2.4.5 默认渠道缺失（中优先级）

`prisma/seed.ts` 不会创建任何默认 `Channel` / `ChannelApiKey`，导致新部署后用户调用任意模型均报"无可用渠道"。

**修复方案：** 在 P0 阶段增加 `default-channels.seed.ts`，提供 3 个示例渠道（OpenAI / Anthropic / Gemini 各 1 个），状态 `DISABLED`，等待管理员配置 API Key 后启用。

#### 2.4.6 OpenRouter 适配器缺失（高优先级）

`modules/gateway/providers/provider-adapter.factory.ts` 缺少 `OpenRouterAdapter` 注册，但 `providers.seed.ts` 包含 `openrouter` provider。会导致该 provider 下的渠道全部 500。

**修复方案：** P0 阶段实现 `OpenRouterAdapter` 并完成注册。

#### 2.4.7 数据库迁移时间戳顺序（低优先级）

迁移目录存在两个未来时间戳（`20260604151847`、`20260605120000`），触发 `prisma migrate status` 警告。

**修复方案：** 重命名为当前时间，但需 `prisma migrate resolve` 重新标记。

### 2.5 风险点

| 风险 | 等级 | 触发条件 | 影响 |
|------|------|---------|------|
| `OPENAI_API_KEY` 等环境变量硬编码在 `seed.ts` 占位 | 高 | CI 跑 seed | 占位符可能被提交到生产 |
| `JWT_SECRET` 默认值（若代码中硬编码） | 高 | 误部署 | 全平台 JWT 可被伪造 |
| `config-encryption.service` 的 `AES_KEY` 默认值 | 高 | 误部署 | 支付密钥可被解密 |
| `.env.example` 中残留真实密钥痕迹 | 中 | 历史 commit | 需 `git log -p` 排查 |
| `Dockerfile` 使用 `node:24-alpine` 基础镜像 | 低 | Alpine 兼容性 | bcrypt 等 C++ 扩展可能失败 |
| 后端无 `helmet` / `compression` / `cookie-parser` 中间件 | 中 | 安全审计 | 安全头缺失 |
| 前端无 CSP Header | 中 | XSS 攻击 | 缺少最后一道防线 |
| `app.module.ts` 缺少全局 `ThrottlerModule` | 中 | 暴力破解 | 登录接口可被爆破 |
| Prisma Client 启动期同步生成 | 低 | 启动慢 | 容器冷启动 5-8s |
| 调用日志写入未异步化 | 中 | 高 QPS | DB 写入瓶颈 |

---

## 功能范围

### 3.1 本阶段必须交付的功能

> **本阶段不交付任何业务功能**；本节列出的是"对架构的具象化产出"。

| 编号 | 功能项 | 优先级 | 验收 |
|------|-------|-------|------|
| F00-01 | 仓库清洗（删除误提交的构建产物） | P0 | `git status` 无新增 |
| F00-02 | `.gitignore` 修订与 CI 检查 | P0 | CI fail-fast |
| F00-03 | `Dockerfile.frontend` | P0 | 多阶段构建，体积 < 200MB |
| F00-04 | `docker-compose.yml`（dev / staging） | P0 | `docker compose up` 一键起 |
| F00-05 | 11 个 `.ai/*.md` 文件签字评审 | P0 | 评审会议纪要 |
| F00-06 | ADR-0001 ~ ADR-0015 决策记录 | P0 | `docs/architecture/decisions/` |
| F00-07 | 技术债务清单 | P0 | `docs/architecture/tech-debt.md` |
| F00-08 | 编码规范落地检查脚本 | P1 | `pnpm lint` 100% 通过 |
| F00-09 | Git hooks（pre-commit / commit-msg） | P1 | Husky 配置 |
| F00-10 | OpenRouter 适配器实现 | P0 | 单测 + 集成测试 |
| F00-11 | 默认渠道 Seed | P0 | 迁移后数据库存在 3 个 DISABLED 渠道 |
| F00-12 | 启动健康检查端点 | P0 | `GET /healthz`、`GET /readyz` |
| F00-13 | 全局异常处理（统一格式） | P0 | 已有 `http-exception.filter` 验证 |
| F00-14 | Prometheus `/metrics` 端点 | P1 | 返回 prom 格式 |
| F00-15 | 基础 Grafana 仪表盘 JSON | P2 | P10 阶段使用 |

### 3.2 本阶段禁止触碰

- 不实现任何 Admin UI 页面
- 不修改任何业务逻辑
- 不调整任何 API 契约
- 不新增业务数据库表
- 不引入新的大版本依赖（如 NestJS 12）
- 不实施 RBAC 细粒度权限（属于 P1 阶段）

### 3.3 跨阶段边界声明

| 上游输入 | 本阶段消费 | 下游输出 |
|---------|-----------|---------|
| 既有代码与文档 | 是 | 清洗后的仓库基线 + 决策记录 |
| PRD（v1.0） | 是 | 架构边界确认 |
| RBAC 设计（v1.0） | 是 | 边界确认（实现在 P1） |
| 数据库 Schema | 是 | 不变更 |
| API 规范 | 是 | 不变更 |

---

## 页面范围

### 4.1 页面清单

本阶段不新增 Admin 或用户端页面。仅维护现有页面的**健壮性**：

| 页面 | 路由 | 菜单位置 | 权限要求 | 本阶段动作 |
|------|------|---------|---------|-----------|
| 落地页 | `/` | - | 公开 | 添加 ErrorBoundary |
| Admin 入口 | `/admin` | - | 公开（临时） | 添加 ErrorBoundary，**不修复鉴权**（属于 P1） |
| 文档 | `/docs` | - | 公开 | 添加 ErrorBoundary |
| 模型列表 | `/models` | - | 公开 | 添加 ErrorBoundary |
| 价格 | `/pricing` | - | 公开 | 添加 ErrorBoundary |
| 服务状态 | `/status` | - | 公开 | 添加 ErrorBoundary |
| 全局错误 | `/error`（新增） | - | 公开 | 实现 `app/error.tsx` |
| 全局兜底 | `/_global-error`（新增） | - | 公开 | 实现 `app/global-error.tsx` |

### 4.2 路由表

| 路径 | 文件 | 类型 |
|------|------|------|
| `/error` | `apps/frontend/src/app/error.tsx` | Client Component |
| `/_global-error` | `apps/frontend/src/app/global-error.tsx` | Client Component |

### 4.3 菜单影响

无（无新增菜单项）。

### 4.4 权限要求

无（公开页面）。

---

## 数据库影响

### 5.1 新增表

**无。** 本阶段不新增任何业务表。

### 5.2 修改表

**无。** 不修改现有 Schema。

### 5.3 新增字段

**无。**

### 5.4 索引

**无。**

### 5.5 约束

**无。**

### 5.6 迁移计划

| 迁移 | 时间 | 负责人 | 备注 |
|------|------|-------|------|
| M0-Cleanup-001 | 2026-06-05 | 后端 Lead | 删除 200+ 误提交 `.js/.js.map/.d.ts.map` 文件 |
| M0-Cleanup-002 | 2026-06-05 | 后端 Lead | 修订 `.gitignore` 与 `tsconfig.json` |
| M0-Seed-001 | 2026-06-05 | 后端 Lead | 新增 `default-channels.seed.ts` |

> **重要**：本阶段不创建任何 Prisma Migration（`prisma migrate dev`），因为 Schema 未变。仅通过 `git rm` 清理文件。

### 5.7 数据影响

- **现有数据**：0 影响
- **新数据**：0 影响
- **回滚成本**：低（仅 git revert）

---

## API 影响

### 6.1 新增接口

| 方法 | 路径 | 用途 | 权限 |
|------|------|------|------|
| GET | `/healthz` | 存活探针 | 公开 |
| GET | `/readyz` | 就绪探针（含 DB / Redis 检查） | 公开 |
| GET | `/metrics` | Prometheus 指标 | 公开（生产建议 IP 白名单） |

### 6.2 修改接口

**无。**

### 6.3 废弃接口

**无。**

### 6.4 权限要求

- `/healthz` / `/readyz`：无需鉴权，由 K8s livenessProbe / readinessProbe 调用
- `/metrics`：无需鉴权，但生产应通过 NetworkPolicy 或 Nginx 限制内网访问

### 6.5 请求结构

```http
GET /healthz HTTP/1.1
Host: api.toaiapi.com
```

### 6.6 响应结构

**`/healthz` 成功响应（200）：**
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "status": "up",
    "uptime": 12345,
    "timestamp": "2026-06-05T10:00:00.000Z"
  }
}
```

**`/readyz` 成功响应（200）：**
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "status": "ready",
    "checks": {
      "database": { "status": "up", "latencyMs": 5 },
      "redis": { "status": "up", "latencyMs": 2 }
    }
  }
}
```

**`/readyz` 失败响应（503）：**
```json
{
  "code": 50301,
  "message": "Database not ready",
  "data": {
    "status": "not_ready",
    "checks": {
      "database": { "status": "down", "error": "Connection refused" }
    }
  }
}
```

**`/metrics` 响应（200，text/plain）：**
```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",path="/healthz",status="200"} 1234

# HELP process_cpu_seconds_total Total user and system CPU time
# TYPE process_cpu_seconds_total counter
process_cpu_seconds_total 12.345
```

### 6.7 错误码

| 错误码 | HTTP | 含义 |
|--------|------|------|
| 50301 | 503 | 数据库不可达 |
| 50302 | 503 | Redis 不可达 |
| 50303 | 503 | 关键配置缺失（如 JWT_SECRET） |

---

## 前端实现

### 7.1 页面

| 文件 | 用途 |
|------|------|
| `app/error.tsx` | 根级 Error Boundary（捕获 layout 之下所有错误） |
| `app/global-error.tsx` | 兜底 Error Boundary（捕获 layout 自身错误） |
| `app/admin/error.tsx` | Admin 域 Error Boundary |
| `app/error.module.css` | 错误页样式（中性色，无品牌装饰） |

### 7.2 组件

| 组件 | 文件 | 用途 |
|------|------|------|
| `<RootError />` | `app/error.tsx` | 显示错误摘要 + 重试按钮 + 返回首页 |
| `<GlobalError />` | `app/global-error.tsx` | 显示全屏错误 + 复制错误码 |
| `<AdminError />` | `app/admin/error.tsx` | 显示错误 + 返回控制台按钮 |

### 7.3 状态管理

不引入新的状态管理库（Zustand 已存在但 P0 不使用）。

### 7.4 表单

无。

### 7.5 表格

无。

### 7.6 搜索

无。

### 7.7 分页

无。

### 7.8 筛选

无。

### 7.9 加载状态

无新增。现有 Skeleton 保持。

### 7.10 异常状态

| 场景 | 组件 | 文案 |
|------|------|------|
| 全局未捕获错误 | `<GlobalError />` | 「应用程序出现异常，请稍后重试」+ 错误码（`ERR-{hash8}`） |
| 路由层未捕获错误 | `<RootError />` | 「页面加载失败」+ 重试 + 返回首页 |
| Admin 域错误 | `<AdminError />` | 「控制台错误」+ 返回控制台 |

### 7.11 空状态

无新增。

---

## 后端实现

### 8.1 Controller

| Controller | 路径前缀 | 方法 |
|-----------|---------|------|
| `HealthController` | `/` | `GET /healthz`、`GET /readyz` |
| `MetricsController` | `/` | `GET /metrics` |

### 8.2 Service

| Service | 职责 |
|---------|------|
| `HealthService` | 检查 DB / Redis / 配置完整性，返回结构化状态 |
| `MetricsService` | 收集 prom 指标，输出 prom 文本格式 |

### 8.3 Repository

无新增。

### 8.4 Middleware / Guard / Interceptor / Filter

| 类型 | 文件 | 用途 |
|------|------|------|
| Filter | `common/filters/http-exception.filter.ts` | 已有，验证通过 |
| Interceptor | `common/interceptors/transform.interceptor.ts` | 已有，验证通过 |
| Interceptor | `common/interceptors/metrics.interceptor.ts` | 新增：统计每个请求的 HTTP 指标 |

### 8.5 Validator

无新增。

### 8.6 Permission

无新增（属于 P1）。

### 8.7 Cache

| 用途 | Key | TTL | 失效策略 |
|------|-----|-----|---------|
| 健康检查结果缓存 | `health:db:status` | 5s | 主动 setex |
| 健康检查结果缓存 | `health:redis:status` | 5s | 主动 setex |

### 8.8 Queue

无新增。

### 8.9 其他依赖

- `@nestjs/terminus` —— 健康检查
- `prom-client` —— Prometheus 指标

---

## 权限设计

### 9.1 允许访问角色

| 资源 | 公开 | USER/VIP/ENTERPRISE/AGENT | ADMIN/OPERATOR/FINANCE/AUDITOR | SUPER_ADMIN |
|------|------|--------------------------|------------------------------|-------------|
| `/healthz` | ✅ | ✅ | ✅ | ✅ |
| `/readyz` | ✅ | ✅ | ✅ | ✅ |
| `/metrics` | ✅（生产 IP 限制） | ✅ | ✅ | ✅ |

### 9.2 权限节点

本阶段不引入 `Permission` 实体（属于 P1）。

### 9.3 资源控制

| 资源 | 限制 |
|------|------|
| `/metrics` 端点 | 生产环境通过 NetworkPolicy 限制 10.0.0.0/8 内网访问 |
| `/healthz` 高频调用 | 建议 K8s livenessProbe 间隔 10s |

### 9.4 数据隔离

无（本阶段不涉及业务数据）。

---

## 日志设计

### 10.1 操作日志

本阶段不实现（属于 P16）。

### 10.2 调用日志

无业务调用日志（仅 HTTP 指标）。

### 10.3 审计日志

无。

### 10.4 异常日志

| 场景 | 级别 | 字段 |
|------|------|------|
| 健康检查 DB 失败 | `error` | timestamp, error_code, error_message, stack |
| 健康检查 Redis 失败 | `error` | timestamp, error_code, error_message |
| 配置缺失 | `fatal` | missing_keys[] |
| 启动失败 | `fatal` | error_message, stack |

### 10.5 日志格式

所有日志统一 JSON 格式：

```json
{
  "timestamp": "2026-06-05T10:00:00.000Z",
  "level": "error",
  "service": "toaiapi-backend",
  "trace_id": "abc123",
  "context": "HealthService",
  "message": "Database health check failed",
  "error": {
    "code": "DB_CONNECTION_REFUSED",
    "stack": "..."
  }
}
```

---

## 安全设计

### 11.1 认证

`/healthz` / `/readyz` / `/metrics` 公开，无需认证。

### 11.2 鉴权

无。

### 11.3 XSS

错误页面使用 React JSX 自动转义。

### 11.4 CSRF

不适用（GET-only）。

### 11.5 SQL 注入

`HealthService` 仅用 `SELECT 1` 健康检查，使用 Prisma 参数化查询。

### 11.6 暴力破解

不适用（无写操作）。

### 11.7 限流

| 端点 | 限制 |
|------|------|
| `/healthz` / `/readyz` | 60 req/min/IP（Nginx limit_req） |
| `/metrics` | 30 req/min/IP（生产） |

### 11.8 敏感数据保护

- `/metrics` 输出**不包含**任何密钥、密码、Token；
- 健康检查错误信息对外仅返回 `error_code`，不返回 `stack`；
- 全局异常过滤器对 5xx 错误脱敏。

---

## 性能设计

### 12.1 缓存

| 项 | TTL | 命中场景 |
|----|-----|---------|
| DB 健康状态 | 5s | K8s readinessProbe 间隔 10s 命中 1 次/10s |
| Redis 健康状态 | 5s | 同上 |

### 12.2 索引

无新增。

### 12.3 分页

不适用。

### 12.4 批量查询

不适用。

### 12.5 异步任务

| 任务 | 频率 | 用途 |
|------|------|------|
| 指标聚合 | 5s | 在内存中聚合 HTTP 指标后输出 |

### 12.6 启动性能

- Prisma Client 启用 lazy load：`new PrismaClient({ log: ['warn', 'error'] })`
- 健康检查服务懒加载（首次请求时连接）
- 目标冷启动：< 3s

---

## UI 设计要求

### 13.1 设计语言

本阶段不新增任何业务 UI 页面，仅产出 ErrorBoundary 组件。遵循 60% Linear + 20% Stripe + 20% Vercel 的设计语言：

- **极简**：单色背景 + 极简文字 + 1 个 CTA 按钮
- **高级感**：使用等宽字体展示错误码
- **企业级**：避免插画、避免 emoji

### 13.2 视觉规范

| 项 | 规范 |
|----|------|
| 主色 | `--foreground: #FAFAFA` |
| 背景 | `--background: #09090B`（暗色模式默认） |
| 错误码字体 | `font-mono` |
| 错误码颜色 | `text-zinc-500` |
| 标题字号 | `text-2xl` |
| 副标题字号 | `text-sm` |
| 按钮 | 圆角 `rounded-md`、背景 `bg-zinc-900`、hover `bg-zinc-800` |

### 13.3 响应式

| 断点 | 行为 |
|------|------|
| < 640px | 单列、按钮全宽、字号略小 |
| ≥ 640px | 居中卡片、宽度 480px |

### 13.4 暗色模式

- 强制暗色（与现有 Tailwind 配置一致）
- 文字对比度 ≥ 4.5:1
- 不使用图片或插画

### 13.5 禁止项

- ❌ 占位符
- ❌ Mock 数据
- ❌ TODO
- ❌ Coming Soon

---

## 测试计划

### 14.1 单元测试

| 文件 | 覆盖点 |
|------|-------|
| `health.service.spec.ts` | DB 正常 / DB 异常 / Redis 正常 / Redis 异常 / 配置缺失 |
| `metrics.interceptor.spec.ts` | 计数准确 / 标签正确 / 异常时仍记录 |
| `openrouter.adapter.spec.ts` | 成功 / 401 / 429 / 500 / 流式解析 |

### 14.2 集成测试

| 场景 | 步骤 |
|------|------|
| `/healthz` 全链路 | 启动后端 → 等待 1s → GET /healthz → 期望 200 |
| `/readyz` DB 失败 | 关闭 DB → GET /readyz → 期望 503 |
| `/metrics` Prometheus 解析 | GET /metrics → 用 `prom-client` 解析 → 期望无格式错误 |

### 14.3 权限测试

不适用（公开端点）。

### 14.4 E2E 测试

| 场景 | 步骤 |
|------|------|
| 仓库冷启动 | `git clone` → `pnpm i` → `pnpm dev` → 期望 90s 内前端可访问 |

### 14.5 异常测试

| 场景 | 步骤 |
|------|------|
| 前端白屏 | 故意 throw → 期望 ErrorBoundary 兜底 |
| 后端崩溃 | kill -9 → 期望 K8s 重启 |

### 14.6 边界测试

| 场景 | 期望 |
|------|------|
| `/healthz` 10000 QPS | 响应时间 < 50ms p99 |
| `/metrics` 10000 QPS | 响应时间 < 100ms p99 |
| 健康检查 DB 抖动 | 缓存命中期间不重复连接 |

### 14.7 测试覆盖率

| 文件 | 目标 |
|------|------|
| `HealthService` | ≥ 90% |
| `MetricsService` | ≥ 80% |
| `OpenRouterAdapter` | ≥ 85% |

---

## 风险分析

### 15.1 技术风险

| 风险 | 等级 | 触发条件 | 解决方案 |
|------|------|---------|---------|
| `git rm` 误删源码 | 高 | 操作失误 | 用 `git filter-branch` 替代可逆；执行前备份 |
| `tsconfig.json` 改动影响构建 | 中 | 配置错误 | 保留原配置作为 fallback；CI 跑完整构建 |
| Dockerfile 多阶段缓存失效 | 中 | 依赖更新 | 利用 BuildKit 缓存挂载 |
| Prisma Client 启动慢 | 低 | 容器首次启动 | 启用 lazy load；预生成 client |

### 15.2 业务风险

| 风险 | 等级 | 影响 | 解决方案 |
|------|------|------|---------|
| 启动后 5xx 错误 | 高 | 用户不可用 | `/readyz` 失败时 K8s 不接流量 |
| 健康检查自身崩溃 | 中 | 探针误报 | 单次探针超时 3s；连续 3 次失败才标记 down |

### 15.3 数据风险

| 风险 | 等级 | 解决方案 |
|------|------|---------|
| 误删 seed 文件 | 中 | `git mv` 保留历史；运行 `prisma db seed --preview-feature` 验证 |
| 误删 `.env.example` 中的关键配置 | 中 | PR Review；CI 校验文件存在 |

### 15.4 安全风险

| 风险 | 等级 | 解决方案 |
|------|------|---------|
| `/metrics` 暴露内部信息 | 中 | NetworkPolicy 限制；不输出 ENV |
| 健康检查错误信息泄露 | 低 | 仅返回错误码，不返回 stack |
| 错误页 XSS | 低 | React 自动转义 |

### 15.5 性能风险

| 风险 | 等级 | 解决方案 |
|------|------|---------|
| `/healthz` 压垮 DB | 高 | 健康检查走独立连接池 / 缓存 5s |
| `/metrics` 内存泄漏 | 中 | prom-client 默认 10s 重置 |
| 启动期长 | 中 | lazy load；预编译 |

---

## 验收标准

### 16.1 文档验收

| 项 | 验收条件 |
|----|---------|
| 11 个 `.ai/*.md` 文件 | 全部经评审签字，附日期与签字人 |
| 15 条 ADR | 全部完成，编号 ADR-0001 ~ ADR-0015 |
| 技术债务清单 | `docs/architecture/tech-debt.md` 存在，行数 ≥ 200 |
| 阶段产出 | `docs/development/phase-00-architecture-audit.md` |

### 16.2 代码验收

| 项 | 验收条件 |
|----|---------|
| 仓库 `.js`/`.js.map`/`.d.ts.map` 提交数 | = 0 |
| `apps/backend/Dockerfile` | 存在且通过 `docker build` |
| `apps/frontend/Dockerfile` | 存在且通过 `docker build` |
| `docker-compose.yml` | 存在且 `docker compose config` 通过 |
| OpenRouter 适配器 | 实现 + 单测通过 |
| 默认渠道 Seed | 运行后数据库存在 3 个 DISABLED 渠道 |
| `/healthz` | 返回 200 + JSON |
| `/readyz` | DB 正常时 200；DB down 时 503 |
| `/metrics` | 返回 prom 文本格式 |
| ErrorBoundary | 故意 throw 后显示兜底页 |

### 16.3 CI 验收

| 项 | 验收条件 |
|----|---------|
| Husky pre-commit | 提交时自动 lint + typecheck |
| CI 文件污染检查 | `git ls-files | grep .js.map` 命中时 fail |
| CI 后端构建 | `pnpm build` 通过 |
| CI 前端构建 | `pnpm next build` 通过 |

### 16.4 性能验收

| 指标 | 目标 |
|------|------|
| 后端冷启动 | < 3s |
| 前端冷启动 | < 5s |
| `/healthz` p99 延迟 | < 50ms |
| `/metrics` p99 延迟 | < 100ms |

### 16.5 评审签字

| 角色 | 签字 | 日期 |
|------|------|------|
| 架构师 | _________ | _________ |
| 后端 Lead | _________ | _________ |
| 前端 Lead | _________ | _________ |
| SRE | _________ | _________ |
| DBA | _________ | _________ |

---

## 下一阶段依赖

### 17.1 阶段 01（认证与 RBAC）可开工条件

| 条件 | 来源 |
|------|------|
| 仓库已清洗，无构建产物 | P0-F00-01 |
| `.gitignore` 已修订 | P0-F00-02 |
| Dockerfile 可构建 | P0-F00-03 |
| OpenRouter 适配器已实现 | P0-F00-10 |
| 默认渠道 Seed 已完成 | P0-F00-11 |
| `/healthz` / `/readyz` 端点已上线 | P0-F00-12 |
| 11 个 `.ai/*.md` 已签字 | P0-F00-05 |
| 15 条 ADR 已完成 | P0-F00-06 |

### 17.2 后续阶段衔接图

```
P0 架构审计 ─┬─→ P1 认证与 RBAC ─┬─→ P2 Admin 基础 ─┬─→ P3 Dashboard
             │                    │                    │
             │                    │                    ├─→ P4 用户管理
             │                    │                    │
             │                    │                    ├─→ P5 角色权限
             │                    │                    │
             │                    │                    ├─→ P6 API Key 管理
             │                    │                    │
             │                    │                    ├─→ P7 计费系统
             │                    │                    │
             │                    │                    ├─→ P8 模型管理
             │                    │                    │
             │                    │                    ├─→ P9 渠道管理
             │                    │                    │
             │                    │                    ├─→ P10 日志监控
             │                    │                    │
             │                    │                    └─→ P11 企业组织
             │                    │
             │                    ├─→ P12 代理体系
             │                    │
             │                    ├─→ P13 风控
             │                    │
             │                    ├─→ P14 系统设置
             │                    │
             │                    ├─→ P15 性能优化
             │                    │
             │                    ├─→ P16 安全审计
             │                    │
             │                    └─→ P17 生产发布
             │
             └─→（持续）P0 维护：CI 流水线 + 监控告警
```

### 17.3 阶段 00 维护窗口

阶段 00 并非"一次性"，而是 **持续维护**：

| 维护项 | 频率 | 责任人 |
|--------|------|-------|
| ADR 增量 | 每次重大决策 | 架构师 |
| `.ai/*.md` 增量 | 每次规则变化 | 各域 Lead |
| 技术债务清单更新 | 每周 | 全栈 Lead |
| 依赖安全扫描 | 每周 | 安全负责人 |
| 构建产物扫描 | 每次 commit | CI 自动 |

### 17.4 跨阶段契约

| 契约 | 内容 | 影响阶段 |
|------|------|---------|
| 错误码体系 | 5 位数字：1=成功、2=客户端错误、4=服务端错误、5=网关错误、9=未知 | 全部 |
| 响应结构 | `{ code, message, data, traceId }` | 全部 |
| 时间格式 | 后端 ISO 8601 UTC，UI 按 Asia/Shanghai 渲染 | 全部 |
| 金额单位 | 后端 `Int` 分，UI `/100` 元 | 全部 |
| API 命名 | `/api/v1/admin/{resource}/{action}` | 全部 |
| 数据库 | PostgreSQL 16+；所有表带 `id`（cuid）、`created_at`、`updated_at` | 全部 |
| 类型安全 | 后端禁止 `any`；前端禁止 `@ts-ignore` | 全部 |

---

## 附录 A：ADR 清单

| 编号 | 标题 | 状态 |
|------|------|------|
| ADR-0001 | 选用 NestJS + Fastify 作为后端框架 | 已通过 |
| ADR-0002 | 选用 Next.js 16 App Router 作为前端框架 | 已通过 |
| ADR-0003 | 选用 Prisma + PostgreSQL 作为数据层 | 已通过 |
| ADR-0004 | 选用 Redis 7 作为缓存层 | 已通过 |
| ADR-0005 | JWT 选用 HS256 + 15min accessToken | 已通过 |
| ADR-0006 | 密码哈希选用 Argon2id | 已通过 |
| ADR-0007 | 敏感配置加密选用 AES-256-GCM | 已通过 |
| ADR-0008 | 鉴权后端为信任根，前端 Middleware 仅 UX | 已通过 |
| ADR-0009 | 错误码 5 位数字体系 | 已通过 |
| ADR-0010 | 所有金额以"分"为单位存储 | 已通过 |
| ADR-0011 | API 路径统一 `/api/v1/{domain}/{resource}` | 已通过 |
| ADR-0012 | 数据库迁移使用 Prisma Migrate | 已通过 |
| ADR-0013 | 监控使用 Prometheus + Grafana | 已通过 |
| ADR-0014 | 日志统一 JSON 格式，包含 trace_id | 已通过 |
| ADR-0015 | 仓库使用 pnpm workspaces 单仓多包 | 已通过 |

## 附录 B：技术债务清单（节选）

| 编号 | 描述 | 优先级 | 阶段 |
|------|------|-------|------|
| TD-001 | 仓库存在 200+ 误提交构建产物 | P0 | P0 |
| TD-002 | 前端无 ErrorBoundary | P0 | P0 |
| TD-003 | OpenRouter 适配器缺失 | P0 | P0 |
| TD-004 | 默认渠道 Seed 缺失 | P0 | P0 |
| TD-005 | 无 CI/CD | P0 | P0 |
| TD-006 | 无单元测试 | P0 | P3 |
| TD-007 | 前端无路由守卫 | P0 | P1 |
| TD-008 | Admin 无细粒度权限 | P0 | P1 |
| TD-009 | 调用日志未异步化 | P1 | P10 |
| TD-010 | Prometheus 指标未接入 | P1 | P0/P10 |
| TD-011 | 邮件服务未真实发送 | P1 | P1 |
| TD-012 | 无 Webhook 通知 | P2 | P13 |
| TD-013 | 国际化未集成 | P2 | P2 |
| TD-014 | 暗色模式未配置 | P2 | P2 |
| TD-015 | 无 GraphQL / tRPC 等替代 API 风格 | P3 | 未来 |

## 附录 C：仓库清洗执行清单

执行人：_________ 执行日期：_________

- [ ] `git rm --cached apps/backend/src/**/*.js`
- [ ] `git rm --cached apps/backend/src/**/*.js.map`
- [ ] `git rm --cached apps/backend/src/**/*.d.ts.map`
- [ ] `git rm --cached apps/backend/tsconfig.tsbuildinfo`
- [ ] `git rm --cached packages/auth/src/**/*.js`
- [ ] `git rm --cached packages/auth/src/**/*.js.map`
- [ ] 修订 `.gitignore`
- [ ] 修订 `tsconfig.json`（`"noEmit": true`）
- [ ] 修订 `tsconfig.build.json`
- [ ] CI 流水线增加 `git ls-files | grep .js.map` 检查
- [ ] Pre-commit hook 验证

---

**文档结束。**
