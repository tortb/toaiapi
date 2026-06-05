# Admin 后台企业级设计文档体系 Spec

## Why

ToAIAPI 的 Admin 后台目前缺少系统化的产品/技术设计文档，导致直接让 AI 生成代码时只能输出"用户管理/订单管理/系统设置/模型管理"这类空壳占位符页面（内容是 TODO / Coming Soon / Placeholder）。

根因不是"AI 不会写页面"，而是缺少**产品经理文档**作为输入：

* 不知道页面有哪些字段

* 不知道数据来源

* 不知道 CRUD 逻辑

* 不知道权限要求

* 不知道业务流程

更严重的是已发现一个安全漏洞：`/admin` 路由**无需登录即可访问**，必须修复。

本次 Spec 不写任何代码，目标是先把"AI 可消费的产品/技术设计文档"建立起来，作为后续实现阶段的唯一输入。

## What Changes

* **新增** 7 份 Admin 后台企业级设计文档（位于 `docs/03-admin/`）：

  1. `01-admin-prd.md` — Admin 后台产品需求文档
  2. `02-rbac-design.md` — 权限系统（RBAC + 菜单权限 + 数据权限）设计
  3. `03-database-schema.md` — Admin 涉及的数据库 Schema 设计与 Migration 计划
  4. `04-api-spec.md` — Admin 后端 API 规范（OpenAPI）
  5. `05-admin-ui-spec.md` — Admin 前端 UI 规范（页面、组件、表单、状态）
  6. `06-frontend-route-map.md` — Admin 前端路由与菜单映射
  7. `07-integration-plan.md` — 前后端对接与分阶段实施计划

* **新增** Admin 路由访问控制修复方案（不实施代码，只输出设计；实施在 Apply 阶段）

* **不修改** 任何业务代码、数据库、API、UI

* **不创建** 任何 `.md` 之外的产物（如不写 prisma migration、不写 controller）

## Impact

* **Affected specs（受影响的领域）**：

  * Auth（认证、RBAC、JWT、Middleware）

  * User（用户管理）

  * ApiKey（API Key 管理）

  * Billing（账单、订单、发票）

  * Channel/Provider/Model（模型中心）

  * Payment（支付、充值）

  * RequestLog（调用日志、操作日志）

  * System（系统设置、SMTP、Redis 监控）

* **Affected code（受影响的代码区域）**：

  * `apps/backend/src/modules/admin/**`（已有 admin 模块需要按新设计对齐）

  * `apps/frontend/src/app/admin/**`（已有占位 admin 页面）

  * `apps/backend/prisma/schema.prisma`（可能需要新增 RBAC 相关表）

  * `apps/frontend/middleware.ts`（新建：Admin 路由守卫）

  * `apps/backend/src/common/guards/**`（JwtAuthGuard、RolesGuard 复用与扩展）

* **Affected docs（受影响的文档）**：

  * `docs/README.md`（需新增 `03-admin/` 章节索引）

## ADDED Requirements

### Requirement: Admin 后台产品需求文档 (01-admin-prd.md)

系统 SHALL 输出 Admin 后台完整 PRD，覆盖：业务背景、用户角色、五大中心（用户中心 / 订单中心 / 模型中心 / 运营中心 / 安全中心 / 系统中心）的所有页面级需求。

#### Scenario: PRD 覆盖完整的页面树

* **WHEN** 阅读 01-admin-prd.md

* **THEN** 必须包含以下页面定义且每个页面都明确：

  * 字段（field name, type, required, validation, 来源）

  * 操作（action, 权限, 入口, 二次确认）

  * 业务规则（默认值、联动、约束）

  * **Dashboard 概览页**：今日请求数 / Token / 收入 / 支出 / 利润 / 活跃用户 / 在线 API Key / 系统状态

  * **Dashboard 模型统计页**：GPT-5、Claude、Gemini、DeepSeek、Qwen 占比图

  * **Dashboard 渠道状态页**：OpenAI、Anthropic、Google、Azure、阿里云、腾讯云 在线/异常/延迟/成功率

  * **用户列表**：ID、用户名、邮箱、手机号、注册时间、注册 IP、最后登录时间、最后登录 IP、余额、状态、角色、用户组、API Key 数量、今日消费、总消费、操作

  * **用户详情**：基础信息、消费记录、订单记录、API Key、调用日志、登录日志、权限信息、企业信息

  * **用户分组**：free / vip / enterprise / agent\_lv1 / agent\_lv2 / admin，字段含 RPM/TPM/允许模型/允许渠道/最大 Key 数/价格倍率/是否允许代理

  * **API Key 管理**：Key ID、用户、Key 名称、创建时间、到期时间、状态、允许模型、RPM、TPM、调用次数、消费金额；支持编辑/禁用/重置/查看日志/删除

  * **订单管理**：订单号、用户、订单类型、支付方式、金额、状态、创建时间、完成时间；类型含充值/订阅/套餐购买/人工充值；状态含待支付/已支付/已退款/失败

  * **充值记录**：用户、充值金额、赠送金额、支付方式、时间、状态

  * **账单管理**：账单号、用户、模型、输入 Token、输出 Token、成本、售价、利润、时间

  * **发票管理**：发票号、公司名称、税号、金额、状态、申请时间；状态含待审核/已开票/已驳回

  * **模型管理**：模型名称、模型 ID、供应商、状态、上下文长度、输入价格、输出价格、倍率、排序；操作含新增/编辑/上下架/测试/删除

  * **渠道管理**：名称、Base URL、Key 数量、权重、成功率、状态；子页面含 API Key 池/轮询策略/测速/健康检查/失败重试

  * **模型价格**：模型、成本价、销售价、倍率、用户组价格（普通/VIP/企业）

  * **系统设置**：基础设置（站点名称/Logo/SEO/公告）、用户设置（注册/邮箱验证/邀请注册/默认余额）、支付设置（支付宝/微信/Stripe/PayPal）、SMTP、Redis

  * **操作日志**：管理员、动作、对象、IP、时间

  * **调用日志**：Request ID、用户、Key、模型、渠道、Token、耗时、状态码、时间；点击查看完整 payload

  * **系统监控**：服务状态（Node/Redis/PostgreSQL/SQLite/SMTP）、资源监控（CPU/内存/磁盘/网络）、请求监控（QPS/RPM/TPM/成功率/错误率）

  * **登录/注册/重置密码**：邮箱+用户名+密码+确认密码+验证码，发送验证码 → 验证邮箱 → 创建账号 → 分配默认用户组；支持记住登录、邮箱验证码登录、密码登录

### Requirement: RBAC 权限系统设计 (02-rbac-design.md)

系统 SHALL 输出 RBAC 完整设计，覆盖：用户、角色、权限、菜单、API 资源、数据范围。

#### Scenario: 权限设计可被代码直接消费

* **WHEN** 阅读 02-rbac-design.md

* **THEN** 必须明确：

  * 实体模型：User / Role / Permission / Menu / RolePermission / UserRole

  * 权限类型：菜单权限（可见哪些菜单）、按钮权限（可执行哪些操作）、API 权限（可调用哪些接口）、数据权限（看自己/部门/全部）

  * 角色矩阵：内置 super\_admin / admin / operator / finance / auditor / user 六类角色及默认权限

  * 鉴权流程：Middleware(JWT) → Guard(Role) → Guard(Permission) → Handler

  * Admin 路由保护规则：`/admin/:path*` 未登录 → `/login`；非管理员 → `/403`；管理员 → 放行

  * 前端按钮级权限：组件 `<Can permission="user:create">` 包裹

  * 权限缓存策略：Redis 缓存 user → permissions 映射，TTL + 主动失效

### Requirement: Admin 数据库 Schema 设计 (03-database-schema.md)

系统 SHALL 输出 Admin 涉及的数据库 Schema 设计，包括新增表、字段、索引、约束，以及与现有 schema.prisma 的关系。

#### Scenario: Schema 设计可直接生成 Prisma Migration

* **WHEN** 阅读 03-database-schema.md

* **THEN** 必须包含：

  * RBAC 新增表：`roles`、`permissions`、`role_permissions`、`user_roles`、`menus` 的完整字段定义

  * 现有表扩展：`users` 字段补全（手机号、注册 IP、最后登录 IP、企业 ID 等）、`api_keys` 字段补全（allowed\_models、RPM、TPM、budget、ip\_whitelist、到期时间）、`orders` 字段补全、`invoices` 新表、`announcements` 新表、`tickets` 新表

  * 索引策略：高频查询字段（email、username、user\_id、created\_at、status）建索引

  * 外键与级联策略

  * 迁移顺序：分多个 migration 文件，避免一次性大迁移

  * 与现有 `prisma/schema.prisma` 的差异分析（diff 列表）

### Requirement: Admin API 规范 (04-api-spec.md)

系统 SHALL 输出 Admin 后端 API 规范，覆盖所有页面的 CRUD、统计、批量操作接口。

#### Scenario: API 规范符合 OpenAPI 3.0 并可被前端直接调用

* **WHEN** 阅读 04-api-spec.md

* **THEN** 必须包含：

  * 全部接口的 RESTful 路径、Method、Auth 注解（`@Roles`、`@Permissions`）

  * 请求/响应 DTO（基于 class-validator 校验规则）

  * 分页参数统一规范（`page` / `pageSize` / `keyword` / `sort` / `order`）

  * 统一响应格式 `{ code, message, data }` 与错误码

  * 接口按中心分组：用户中心、订单中心、模型中心、运营中心、安全中心、系统中心、Dashboard

  * 全部接口路径前缀：`/api/v1/admin/...`

  * 限流策略：登录/重置密码等敏感接口的限流规则

  * Swagger Tag 与 Summary 命名规范

### Requirement: Admin UI 规范 (05-admin-ui-spec.md)

系统 SHALL 输出 Admin 前端 UI 规范，明确所有页面的视觉、交互、组件、表单、状态。

#### Scenario: UI 规范可被组件库直接实现

* **WHEN** 阅读 05-admin-ui-spec.md

* **THEN** 必须包含：

  * 整体布局：左侧菜单（多级折叠）+ 顶部栏（用户/通知/全屏）+ 内容区

  * 菜单结构：与 PRD 五（六）大中心一一对应

  * 列表页通用规范：筛选区（左侧或顶部）、表格列、操作列、分页、批量操作

  * 表单页通用规范：标签左对齐、必填星号、错误提示、提交/取消按钮

  * 详情页通用规范：Tabs 分组（基础/消费/订单/API Key/日志/权限/企业）

  * Dashboard 卡片规范：数字 + 趋势 + 同比/环比 + 图表

  * 图表组件选型：ECharts 或 Recharts，明确数据接口

  * 状态标识：颜色映射（成功/警告/错误/信息）

  * 加载/空/错误状态：骨架屏、空态插画、错误重试

  * 响应式：桌面端为主，最低 1280×800

### Requirement: 前端路由与菜单映射 (06-frontend-route-map.md)

系统 SHALL 输出 Next.js App Router 下 Admin 的完整路由表、菜单树、权限点映射。

#### Scenario: 路由表与菜单树、权限点一一对应

* **WHEN** 阅读 06-frontend-route-map.md

* **THEN** 必须包含：

  * 路由表：路径、文件位置、对应页面、所需权限、是否在菜单显示

  * 菜单树：层级结构、图标、排序、折叠/展开

  * 路由组（Route Group）划分：`(admin)` 路由组

  * 动态路由：`/admin/users/[id]` `/admin/apikeys/[id]` 等

  * 中间件：根 `middleware.ts` 匹配 `/admin/:path*` 的鉴权逻辑

  * 面包屑：基于路由自动生成

  * 403/404 页面：未授权与未找到

### Requirement: 前后端对接与实施计划 (07-integration-plan.md)

系统 SHALL 输出分阶段实施计划，明确依赖、风险、回滚方案、验收标准。

#### Scenario: 实施计划可被项目排期直接采用

* **WHEN** 阅读 07-integration-plan.md

* **THEN** 必须包含：

  * 阶段划分（建议）：

    1. 权限系统（RBAC + Middleware）— **优先**，顺带修复 `/admin` 无鉴权漏洞
    2. 用户中心 + API Key 管理
    3. 订单中心 + 账单 + 充值 + 发票
    4. 模型中心 + 渠道管理 + 模型价格
    5. 运营中心 + 安全中心
    6. 系统中心 + Dashboard + 系统监控

  * 每阶段交付物（文档/代码/测试）

  * 依赖关系：阶段 1 必须先于其他阶段

  * 风险与缓解：RBAC 误配置锁死管理员（必须保留 super\_admin 内置账号 + 启动时自动修复脚本）

  * 回滚方案：每个阶段都可通过 migration 回滚

  * 验收标准：每个页面均有字段级 e2e 测试

### Requirement: Admin 安全修复设计

系统 SHALL 输出 `/admin` 无鉴权访问漏洞的修复设计（不实施代码）。

#### Scenario: 修复设计可被 Middleware 直接实现

* **WHEN** 阅读 02-rbac-design.md 与 06-frontend-route-map.md

* **THEN** 必须包含：

  * Next.js `apps/frontend/middleware.ts` 匹配 `/admin/:path*`

  * 读取 `toaiapi_token` Cookie / Authorization Header

  * 校验 JWT 有效性（可调 `/api/v1/auth/me` 验证）

  * 未登录 → 302 `/login?redirect=/admin`

  * 已登录但非 admin → 302 `/403`

  * 已登录且是 admin → 放行

  * 双保险：前端 Middleware + 后端 Guard（任何前端绕过都不可能直接访问 Admin API）

## MODIFIED Requirements

无（本次 Spec 阶段不修改任何现有设计/代码，仅新增设计文档）。

## REMOVED Requirements

无。

## 非目标（Out of Scope）

为避免范围蔓延，本次 Spec **不包含**：

* 实际的代码实现（Apply 阶段再做）

* 实际的 Prisma Migration（Apply 阶段再做）

* 实际的页面开发

* 2FA、SSO、OAuth 第三方登录

* 国际化（i18n）

* 移动端 Admin

* 任何对现有业务逻辑的修改

## 产出物清单

Spec 阶段（本次）完成后，必须在仓库中存在：

```
docs/03-admin/
├── 01-admin-prd.md
├── 02-rbac-design.md
├── 03-database-schema.md
├── 04-api-spec.md
├── 05-admin-ui-spec.md
├── 06-frontend-route-map.md
└── 07-integration-plan.md
```

并在 `docs/README.md` 的文档结构中加入 `03-admin/` 索引。

## 验收原则

* 7 份文档均使用中文，与项目 `.ai/coding-rules.md` 文风一致

* 每份文档内部结构清晰、可被 AI 直接消费（无歧义字段、无占位符）

* 与现有 `docs/00-project` \~ `docs/06-devops` 体系衔接，引用既有约束（如严格分层、Swagger、RBAC）

* 不与 `.ai/system-prompt.md` 的"禁止事项"冲突（如不允许"Controller 直接访问数据库"）

