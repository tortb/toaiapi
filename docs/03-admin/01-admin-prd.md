# 01 Admin 后台产品需求文档 (PRD)

> 适用范围：ToAIAPI 平台 Admin 后台（`apps/frontend/src/app/admin/**`、`apps/backend/src/modules/admin/**`）。
>
> 文档版本：V1.0
> 状态：已评审
> 阅读对象：产品经理、前端工程师、后端工程师、UI/UX 设计师、QA、SRE
> 输入文档：`.ai/system-prompt.md`、`.ai/architecture-rules.md`、`apps/backend/prisma/schema.prisma`、`.trae/specs/admin-design-foundation/spec.md`
> 输出文档：本 PRD 为后续《02 RBAC 设计》《03 数据库 Schema》《04 API 规范》《05 UI 规范》《06 路由与菜单》《07 集成计划》的唯一产品输入。

---

## 1. 文档信息

| 字段 | 值 |
|------|----|
| 文档编号 | DOC-03-ADMIN-01 |
| 文档名称 | Admin 后台产品需求文档 (PRD) |
| 版本 | V1.0 |
| 修订人 | 产品经理 · Admin 域 Owner |
| 状态 | 已评审 |
| 创建日期 | 2026-06-05 |
| 最后更新 | 2026-06-05 |
| 关联 Spec | `.trae/specs/admin-design-foundation/spec.md` |
| 关联 Schema | `apps/backend/prisma/schema.prisma` |
| 关联架构 | `.ai/architecture-rules.md` |
| 写作目标 | 后续 UI / DB / API / RBAC 设计的唯一产品输入，禁止出现 TODO / Coming Soon / Placeholder |

---

## 2. 业务背景

### 2.1 ToAIAPI 平台定位

ToAIAPI 是企业级 AI Gateway 平台，定位为下一代 AI Infrastructure。核心能力：

1. 统一管理所有大模型 API（OpenAI、Anthropic、Gemini、DeepSeek、Grok、Qwen、GLM、Azure OpenAI、阿里云、腾讯云、月之暗面等）
2. 兼容 Claude Code、Codex CLI、Cursor、Roo Code、Cline、Windsurf 等 AI 编程工具
3. 完整的用户管理、API Key 管理、Token 计费、余额系统、套餐系统
4. 企业管理、支付系统、风控系统、实名认证、内容安全
5. 高可用 API Gateway（多渠道负载均衡、健康检查、故障转移、自动重试、协议转换）

技术栈：

- 前端：Next.js 16、React 20、TypeScript、TailwindCSS 4、Shadcn/ui、TanStack Query、Zustand
- 后端：Node.js 24 LTS、NestJS、Fastify、Prisma ORM、OpenAPI/Swagger
- 数据库：PostgreSQL（主库）、Redis（缓存）、SQLite（本地模式）

### 2.2 Admin 后台的使命

Admin 后台是 ToAIAPI 平台的运营与控制中心，服务于以下五类目标：

1. **运营管控**：管理员对全平台用户、订单、API Key、模型、渠道进行日常运营操作
2. **风险控制**：识别异常调用、异常用户、异常渠道，自动或人工干预
3. **财务对账**：订单、充值、账单、发票、退款、税务的全链路管理
4. **系统观测**：实时监控平台健康度、资源利用率、调用统计、异常告警
5. **产品配置**：模型上下架、价格调整、套餐配置、支付渠道配置、SMTP 配置

Admin 后台**不对外开放**（不暴露公网注册），仅限具备 `ADMIN` 或 `SUPER_ADMIN` 角色的内部人员访问。

### 2.3 用户角色

Admin 后台共 6 类角色，对应 `UserRole` 枚举（见 schema.prisma），其中 USER / VIP / ENTERPRISE / AGENT 为终端用户角色，不具备 Admin 访问权限，仅为业务一致性保留。

| 角色代码 | 中文名称 | 角色范围 | Admin 访问 | 典型职责 |
|---------|---------|---------|-----------|---------|
| SUPER_ADMIN | 超级管理员 | 平台最高 | 是 | 系统配置、权限分配、紧急干预 |
| ADMIN | 管理员 | 平台运营 | 是 | 用户/订单/模型日常管理 |
| OPERATOR | 运营专员 | 平台运营 | 是 | 公告、工单、用户引导 |
| FINANCE | 财务 | 财务对账 | 是 | 订单、充值、发票、退款 |
| AUDITOR | 审计 | 只读审计 | 是 | 日志查询、数据导出、审计追踪 |
| USER | 普通用户 | 终端 | 否 | 自身 API Key、余额、调用 |
| VIP | VIP 用户 | 终端 | 否 | 同上 + 更高限额 |
| ENTERPRISE | 企业用户 | 终端 | 否 | 组织管理、共享余额 |
| AGENT | 代理商 | 终端 | 否 | 分销、佣金、下级用户 |

> 角色权限点详见附录 C 权限矩阵；六类管理员角色的具体权限点见《02 RBAC 设计》文档。

### 2.4 数据作用域

Admin 后台支持 4 种数据作用域（data scope），由 SUPER_ADMIN 在角色配置中设定：

| 作用域代码 | 含义 | 典型场景 |
|----------|------|---------|
| ALL | 全部数据 | 超级管理员 |
| ORGANIZATION | 仅本企业数据 | 企业管理员 |
| DEPARTMENT | 仅本部门数据 | 大型企业子部门 |
| SELF | 仅自己创建/负责的数据 | 一线运营 |

> 文档中每个页面均会显式标注其默认 data scope。

---

## 3. 术语表

| 术语 | 英文 | 释义 |
|------|------|------|
| API Key | API Key | 形如 `sk-toai-xxxxxx` 的访问凭证；明文仅在创建时返回一次，存储使用 Argon2id 哈希；列表展示前 16 位前缀 |
| Token | Token | 模型输入/输出的计量单位，分 prompt_tokens / completion_tokens / cached_tokens / reasoning_tokens |
| 模型 | Model | 平台支持的 AI 模型，如 `gpt-4o`、`claude-sonnet-4-5`、`gemini-2.5-pro`，在 `Model` 表中定义 |
| 提供商 | Provider | 上游 AI 服务商，如 OpenAI、Anthropic、Google、DeepSeek、阿里云，在 `Provider` 表中定义 |
| 渠道 | Channel | 一个 Provider 的一个具体 API 端点 + 一组 API Key + 负载均衡参数；同一模型可挂载多个渠道 |
| API Key 池 | API Key Pool | 渠道下的一组可轮询的 API Key；用于分摊配额与容灾 |
| 轮询策略 | Rotation Policy | 多 Key / 多渠道间的请求分发规则（权重轮询、优先级、随机、最少连接） |
| 计费 | Billing | 按模型 Token 用量 × 单价计算费用；单位为「分」；Token 数由 Tokenizer 重新计算，不信任模型返回值 |
| 余额 | Balance | 用户预付费金额，单位「分」；所有扣减在数据库事务中完成 |
| 配额 | Quota | 用户组/订阅计划下的硬性上限（按月/按日/按分钟） |
| 用户组 | User Group | 价格倍率、限额、可访问模型的策略组，如 free / vip / enterprise / agent_lv1 / agent_lv2 / admin |
| 套餐 | Plan / Subscription | 周期性订阅计划，按月或按年，含月配额、Rate Limit、Token Limit |
| 套餐订阅 | Subscription | 用户与套餐的关联实例，含起止时间、已用配额、续费状态 |
| 订单 | Order | 充值订单或订阅订单，含金额、支付方式、状态、关联支付记录 |
| 充值 | Recharge | 用户向平台充值的金额流水 |
| 赠送 | Gift | 平台活动/管理员手动赠送的余额，不扣用户款项 |
| 退款 | Refund | 已支付订单的逆向操作 |
| 发票 | Invoice | 用户申请开具的增值税普通发票/专用发票 |
| 调用日志 | Request Log | 每次 API 调用的完整记录，含输入输出 Token、成本、渠道、延迟、状态码 |
| 操作日志 | Operation Log | 管理员在 Admin 后台所有 CRUD 操作的审计记录 |
| 风控 | Risk Control | 对用户/请求/金额的异常检测与拦截规则 |
| 黑名单 | Blacklist | 被永久封禁的 IP / 邮箱 / 手机号 / 设备指纹 |
| IP 白名单 | IP Whitelist | API Key 允许访问的 IP 段；非白名单请求被拒绝 |
| 公告 | Announcement | 平台发布的通知，含系统公告、活动公告、价格公告 |
| 工单 | Ticket | 用户提交的问题反馈与客服处理记录 |
| 邀请码 | Invite Code | 用于邀请注册和推广分佣的短码 |
| 渠道状态 | Channel Status | `ACTIVE` / `RATE_LIMITED` / `ERROR` / `DISABLED`，由健康检查动态更新 |
| 二次确认 | Re-confirm | 对删除、冻结、重置、清空等不可逆操作的二次弹窗确认 |

> 金额单位：本文档所有金额单位为「分」（1 元 = 100 分），UI 展示时除以 100 显示为「元」，保留 2 位小数。
> 时间格式：后端存储 ISO 8601（UTC），UI 展示按用户时区（默认 Asia/Shanghai）显示为 `YYYY-MM-DD HH:mm:ss`。
> 脱敏规则：邮箱 / 手机号 / 身份证 / 银行卡 / API Key 明文在列表展示时脱敏；示例：`u***@gmail.com`、`138****5678`、`sk-toai-AB****`。

---

## 4. 全局页面树

Admin 后台采用「6 大中心 + 1 套认证」结构。所有路径以 `/admin` 为前缀（登录页除外）。

```
/admin
├── 控制台 (Dashboard)
│   ├── /dashboard                 # 系统概览
│   ├── /dashboard/models          # 模型统计
│   └── /dashboard/channels        # 渠道状态
│
├── 用户中心 (User Center)
│   ├── /users                     # 用户列表
│   ├── /users/[id]                # 用户详情
│   ├── /users/[id]/apikeys        # 用户 API Key
│   ├── /users/[id]/orders         # 用户订单
│   ├── /users/[id]/bills          # 用户账单
│   ├── /users/[id]/request-logs   # 用户调用日志
│   ├── /users/[id]/login-logs     # 用户登录日志
│   ├── /users/groups              # 用户分组
│   ├── /users/groups/[id]         # 用户分组详情
│   ├── /apikeys                   # API Key 管理（跨用户）
│   ├── /apikeys/[id]              # API Key 详情
│   └── /organizations             # 企业组织（V5.0）
│
├── 订单中心 (Order Center)
│   ├── /orders                    # 订单管理
│   ├── /orders/[id]               # 订单详情
│   ├── /recharges                 # 充值记录
│   ├── /bills                     # 账单管理
│   └── /invoices                  # 发票管理
│
├── 模型中心 (Model Center)
│   ├── /models                    # 模型管理
│   ├── /models/[id]               # 模型详情
│   ├── /models/[id]/pricing       # 模型价格编辑
│   ├── /channels                  # 渠道管理
│   ├── /channels/[id]             # 渠道详情
│   │   ├── /channels/[id]/keys          # API Key 池
│   │   ├── /channels/[id]/rotation      # 轮询策略
│   │   ├── /channels/[id]/speedtest     # 测速
│   │   ├── /channels/[id]/health        # 健康检查
│   │   └── /channels/[id]/retry         # 失败重试
│   ├── /pricing                   # 模型价格（跨模型）
│   └── /providers                 # 服务商管理
│
├── 运营中心 (Operations)
│   ├── /announcements             # 公告管理
│   ├── /tickets                   # 工单系统
│   └── /invites                   # 邀请推广
│
├── 安全中心 (Security)
│   ├── /risk                      # 风控中心
│   ├── /risk/rules                # 风控规则
│   ├── /risk/events               # 风控事件
│   ├── /blacklist                 # 黑名单
│   └── /ip-rules                  # IP 限制
│
├── 系统中心 (System)
│   ├── /settings                  # 系统设置（Tabs：基础/用户/支付/SMTP/Redis）
│   ├── /logs/operations           # 操作日志
│   ├── /logs/requests             # 调用日志
│   ├── /logs/requests/[id]        # 调用日志详情
│   └── /monitor                   # 系统监控
│
└── 个人中心
    ├── /profile                   # 我的资料
    └── /profile/security          # 安全设置
```

**菜单层级**（侧边栏 2 级树）：

- 一级菜单：6 大中心 + 个人中心
- 二级菜单：每个中心下的功能模块（见各章节）
- 收起/展开：一级菜单之间互斥收起，二级菜单可独立折叠；当前激活项高亮父级

---

## 5. Dashboard 控制台

### 5.1 系统概览页

**路径：** `/admin/dashboard`
**权限点：** `dashboard:view`
**菜单层级：** 控制台 / 系统概览
**默认 data scope：** ALL（SUPER_ADMIN）/ ORGANIZATION（企业管理员）
**刷新策略：** 进入页面自动加载一次；点击「刷新」按钮手动刷新；每 60 秒可选自动刷新

**页面布局：**

- 顶部：日期范围选择器（默认「最近 7 天」，可选「今日 / 7 天 / 30 天 / 自定义」）+ 全局「刷新」按钮
- 第 1 行（5 张指标卡，5 列等宽）：注册用户、总充值金额、总消费金额、总调用次数、剩余 Token
- 第 2 行（12 列栅格）：
  - 左 6 列：调用统计折线图（Tab：小时 / 天 / 月）
  - 中 3 列：模型调用分布圆环图
  - 右 3 列：系统公告（前 5 条）
- 第 3 行（12 列栅格）：
  - 左 6 列：最近订单（前 10 条）
  - 中 3 列：渠道状态（前 5 个）
  - 右 3 列：操作日志（前 5 条）

**指标卡字段（每张卡 4 个字段）：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 标签 | string | 是 | 4-8 字符 | 静态配置 | 例：注册用户 |
| 当前值 | string | 是 | 数字 + 千分位 | 见下方计算 | 保留 2 位小数（金额） |
| 增长率 | string | 是 | 百分比 | (本期 - 上期) / 上期 | 颜色映射：正绿、负红 |
| 对比文本 | string | 是 | 6-12 字符 | 静态配置 | 例：较上月增长 |

**5 张指标卡的计算口径：**

| 卡片 | 计算公式 | 数据来源 |
|------|---------|---------|
| 注册用户 | `count(User where created_at in [start, end])` | `User` 表 |
| 总充值金额 | `sum(Order.amount where product_type='RECHARGE' AND status='PAID' AND paid_at in [start, end])` | `Order` 表 |
| 总消费金额 | `sum(UserTransaction.amount where type='DEDUCT' AND created_at in [start, end])` | `UserTransaction` 表 |
| 总调用次数 | `count(RequestLog where created_at in [start, end])` | `RequestLog` 表 |
| 剩余 Token | `sum(UserBalance.amount) - sum(RequestLog.total_tokens) where created_at in [start, end]` | `UserBalance` + `RequestLog` |

**调用统计折线图：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 指标切换 | enum | 是 | `requests` / `tokens` / `cost` / `errors` | 前端控制 | 默认 `requests` |
| 时间粒度 | enum | 是 | `hour` / `day` / `month` | 静态 Tab | 默认 `day` |
| X 轴 | string[] | 是 | 1-31 个刻度 | 服务端按粒度聚合 | 格式 `MM-DD` |
| Y 轴 | number[] | 是 | 整数 | 服务端聚合 | 千分位显示 |
| 高亮日 | number | 否 | - | 点击交互 | 弹 tooltip |

**模型调用分布圆环图：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 模型名 | string | 是 | 1-50 字符 | `Model.display_name` | 取 Top 5 + 其他 |
| 占比 | float | 是 | 0-100 | `count(RequestLog group by model_id)` | 保留 1 位小数 |
| 颜色 | string | 是 | HEX | 静态色板 | 蓝/橙/绿/紫/青 |

**系统公告小卡：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 类型 | enum | 是 | `SYSTEM` / `NEW` / `PRICE` / `ACTIVITY` | `Announcement.type` | 颜色映射 |
| 标题 | string | 是 | 1-100 字符 | `Announcement.title` | 截断 1 行 |
| 摘要 | string | 否 | 1-200 字符 | `Announcement.content` | 截断 2 行 |
| 发布时间 | datetime | 是 | ISO 8601 | `Announcement.published_at` | `YYYY-MM-DD HH:mm` |

**最近订单小表（5 行）：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 订单号 | string | 是 | `Order.order_no` | `Order` | 字体等宽 |
| 用户 | string | 是 | 脱敏 | `User.email` | `u***@gmail.com` |
| 金额 | int | 是 | 分 | `Order.amount` | UI 显示 `/100` 元 |
| 支付方式 | string | 是 | - | `Payment.method` | 例：支付宝 |
| 状态 | enum | 是 | 5 种 | `Order.status` | 颜色徽标 |
| 时间 | datetime | 是 | ISO 8601 | `Order.created_at` | `MM-DD HH:mm` |

**渠道状态小表（5 行）：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 渠道名称 | string | 是 | - | `Channel.name` | - |
| 状态 | enum | 是 | 4 种 | `Channel.status` | 圆点 + 文字 |
| 响应时间 | int | 是 | 毫秒 | `Channel.avg_latency_ms` | 字体等宽 |
| 今日调用 | int | 是 | 整数 | `count(RequestLog where channel_id=… and created_at >= today_start)` | 千分位 |

**操作日志小卡（5 行）：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 操作员 | string | 是 | - | `OperationLog.operator_name` | 脱敏邮箱前缀 |
| 动作 | string | 是 | - | `OperationLog.action` | 例：删除了用户 |
| 对象 | string | 是 | - | `OperationLog.target` | 例：`user_abc123` |
| 时间 | datetime | 是 | ISO 8601 | `OperationLog.created_at` | 字体等宽 |
| IP | string | 是 | - | `OperationLog.ip` | 字体等宽 |

**操作列（仅「更多」入口）：**
- 「更多」链接 → 跳转对应完整页

**加载态：** 5 张指标卡 + 3 个图表 + 3 张表均使用骨架屏（skeleton），loading 200ms 后显示数据；空态：每张图/表独立空态文案「暂无数据」；错误态：右上角 toast + 重试按钮。

---

### 5.2 模型统计页

**路径：** `/admin/dashboard/models`
**权限点：** `dashboard:view`
**菜单层级：** 控制台 / 模型统计
**默认 data scope：** ALL
**刷新策略：** 进入页面加载 + 手动刷新

**页面布局：**

- 顶部：日期范围 + 指标切换（调用次数 / Token / 成本）
- 第 1 行（4 张占比卡）：GPT-5、Claude 4.5、Gemini 2.5、DeepSeek 占比
- 第 2 行（左侧 6 列柱状图 + 右侧 6 列表格）：
  - 柱状图：所有模型按调用次数 Top 20 横向柱状
  - 表格：每个模型一行，列含 模型名 / 提供商 / 调用次数 / 输入 Token / 输出 Token / 总成本 / 平均延迟 / 成功率
- 第 3 行（折线图，12 列）：所有模型调用次数随时间变化（堆叠面积图）

**占比卡字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 模型名 | string | 是 | - | `Model.display_name` | - |
| 占比 | float | 是 | 0-100 | `count(RequestLog group by model_id) / total` | 保留 1 位小数 |
| 环比 | float | 是 | - | 同上公式 | 颜色：正绿负红 |
| 趋势 | string | 是 | `up` / `down` / `flat` | 派生 | 箭头图标 |

**模型明细表（20 行/页）：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 模型名 | string | 是 | - | `Model.display_name` | 链接到 `/admin/models/[id]` |
| 提供商 | string | 是 | - | `Provider.display_name` | - |
| 调用次数 | int | 是 | 整数 | `count(RequestLog)` | 千分位 |
| 输入 Token | int | 是 | 整数 | `sum(prompt_tokens)` | 千分位 |
| 输出 Token | int | 是 | 整数 | `sum(completion_tokens)` | 千分位 |
| 缓存 Token | int | 是 | 整数 | `sum(cached_tokens)` | 千分位 |
| 推理 Token | int | 是 | 整数 | `sum(reasoning_tokens)` | 千分位 |
| 总成本 | int | 是 | 分 | `sum(cost)` | 元/万元 |
| 平均延迟 | int | 是 | 毫秒 | `avg(latency_ms)` | 字体等宽 |
| 成功率 | float | 是 | 0-100 | `count(status_code<400) / count(*)` | 百分比 |
| 错误率 | float | 是 | 0-100 | 1 - 成功率 | 红色高亮 >5% |

**筛选区：**
- 时间范围
- 指标维度（调用次数 / Token / 成本 / 延迟）
- 提供商多选
- 模型多选

**操作列：**
- 查看模型 → `/admin/models/[id]`
- 调整价格 → `/admin/models/[id]/pricing`（SUPER_ADMIN）
- 上下架 → 弹确认 → 调 `PATCH /admin/models/[id]/status`

**分页：** 20/50/100
**排序：** 调用次数 / 成本 / 延迟 倒序

---

### 5.3 渠道状态页

**路径：** `/admin/dashboard/channels`
**权限点：** `dashboard:view`
**菜单层级：** 控制台 / 渠道状态
**默认 data scope：** ALL
**刷新策略：** 自动每 10 秒刷新一次（健康检查驱动）

**页面布局：**

- 顶部：状态筛选（全部 / 正常 / 限流 / 异常 / 禁用）+ 关键字搜索
- 第 1 行（4 张大卡）：在线渠道数、异常渠道数、平均延迟、整体成功率
- 第 2 行（12 列，渠道列表卡片网格）：每个渠道一张卡，卡内含
  - 标题栏：渠道名 + 状态徽标（圆点 + 文字）
  - 4 个 mini 指标：响应时间 / 成功率 / 今日调用 / 错误率
  - 底部按钮行：详情 / 启用 / 禁用 / 测速

**顶部 4 张大卡：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 标签 | string | 是 | - | 静态 | 例：在线渠道数 |
| 数值 | int | 是 | - | `count(Channel where status='ACTIVE')` | 千分位 |
| 副标题 | string | 是 | - | 派生 | 例：共 12 个渠道 |
| 颜色 | enum | 是 | `success` / `warning` / `danger` | 派生 | 状态映射 |

**渠道卡片字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 渠道 ID | string | 是 | - | `Channel.id` | 链接到 `/admin/channels/[id]` |
| 渠道名称 | string | 是 | 1-50 字符 | `Channel.name` | - |
| 提供商 | string | 是 | - | `Provider.display_name` | - |
| 状态 | enum | 是 | `ACTIVE` / `RATE_LIMITED` / `ERROR` / `DISABLED` | `Channel.status` | 圆点 + 文字 + 颜色 |
| 响应时间 | int | 是 | 毫秒 | `Channel.avg_latency_ms` | 字体等宽 |
| 成功率 | float | 是 | 0-100 | 派生 | 百分比 |
| 今日调用 | int | 是 | 整数 | `count(RequestLog)` | 千分位 |
| 错误率 | float | 是 | 0-100 | 派生 | >5% 红色 |
| 权重 | int | 是 | 1-100 | `Channel.weight` | - |
| 优先级 | int | 是 | 0-100 | `Channel.priority` | - |
| Key 数量 | int | 是 | 整数 | `count(Channel.apiKey)` | 链接到子页 |
| 最后检查时间 | datetime | 是 | ISO 8601 | `Channel.last_health_check_at` | `HH:mm:ss` |

**筛选区：**
- 关键字（名称 / 提供商）
- 状态多选
- 提供商多选
- 错误率范围

**操作列（每张卡底部）：**
- 详情 → `/admin/channels/[id]`
- 启用 → 二次确认 → 调 `PATCH /admin/channels/[id]/enable`
- 禁用 → 二次确认 → 调 `PATCH /admin/channels/[id]/disable`
- 测速 → 弹 Modal 显示结果（延迟 / 成功率 / Token 速度）
- 健康检查 → 后台异步触发 → toast 提示

**批量操作：**
- 批量启用（仅 ADMIN+）
- 批量禁用（仅 ADMIN+）
- 批量测速

**分页：** 12 张卡 / 页（3×4 网格），20/50
**排序：** 状态 / 响应时间 / 今日调用 倒序

---

## 6. 用户中心

### 6.1 用户列表

**路径：** `/admin/users`
**权限点：** `user:list`
**菜单层级：** 用户中心 / 用户列表
**默认 data scope：** ALL（SUPER_ADMIN）/ ORGANIZATION（企业管理员）

**页面布局：**

- 顶部：左侧筛选区（4 列），右侧操作栏（批量操作下拉、新建用户按钮）
- 中部：表格（虚拟滚动 ≥1000 行）
- 底部：分页器

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| ID | string | 是 | - | `User.id` | 链接到详情 |
| 用户名 | string | 是 | 3-32 字符 | `User.display_name` | - |
| 邮箱 | string | 是 | RFC 5322 | `User.email` | 脱敏 `u***@gmail.com` |
| 手机号 | string | 否 | 11 位数字 | `User.phone` | 脱敏 `138****5678` |
| 头像 | string | 否 | URL | `User.avatar_url` | 24×24 圆角 |
| 角色 | enum | 是 | 6 种 | `User.role` | 颜色徽标 |
| 用户组 | string | 是 | - | `UserGroup.name` | 链接到分组详情 |
| 余额 | int | 是 | 分 | `UserBalance.amount` | 元/万元 |
| 状态 | enum | 是 | 3 种 | `User.status` | 圆点 + 文字 |
| API Key 数 | int | 是 | 整数 | `count(ApiKey where user_id=…)` | 链接到子页 |
| 订阅 | string | 否 | - | `SubscriptionPlan.display_name` | 过期标红 |
| 今日消费 | int | 是 | 分 | `sum(UserTransaction.amount where type='DEDUCT' and created_at>=today)` | 元/万元 |
| 总消费 | int | 是 | 分 | `sum(UserTransaction.amount where type='DEDUCT')` | 元/万元 |
| 注册时间 | datetime | 是 | ISO 8601 | `User.created_at` | `YYYY-MM-DD HH:mm` |
| 注册 IP | string | 是 | - | `User.register_ip` | 字体等宽 |
| 最后登录时间 | datetime | 否 | ISO 8601 | `User.last_login_at` | `YYYY-MM-DD HH:mm` |
| 最后登录 IP | string | 否 | - | `User.last_login_ip` | 字体等宽 |
| 邀请人 | string | 否 | - | `User.inviter_id` → `User.display_name` | 链接 |

**筛选区：**

- 关键字（搜索 ID / 用户名 / 邮箱 / 手机号，模糊匹配）
- 状态（多选：`active` / `suspended` / `banned`）
- 角色（多选：6 种）
- 用户组（多选：6 种）
- 订阅（多选：套餐列表）
- 余额范围（最小值 - 最大值，分）
- 注册时间范围（开始日期 - 结束日期）
- 最后登录时间范围
- 邀请人（下拉搜索）
- 标签（多选，见附录 A）

**操作列（每行末尾）：**

| 操作 | 权限点 | 二次确认 | 触发接口 |
|------|-------|---------|---------|
| 查看详情 | `user:view` | 否 | 跳 `/admin/users/[id]` |
| 编辑 | `user:update` | 否（表单 Modal） | `PATCH /admin/users/[id]` |
| 充值 | `user:recharge` | 是（输入金额 + 备注） | `POST /admin/users/[id]/recharge` |
| 赠送余额 | `user:gift` | 是（输入金额 + 原因） | `POST /admin/users/[id]/gift` |
| 冻结 | `user:update` | 是（输入原因） | `PATCH /admin/users/[id]/status` body `{status: 'SUSPENDED'}` |
| 解冻 | `user:update` | 是 | 同上 `{status: 'ACTIVE'}` |
| 封禁 | `user:ban` | 是（输入原因） | `PATCH /admin/users/[id]/status` body `{status: 'BANNED'}` |
| 解封 | `user:ban` | 是 | 同上 `{status: 'ACTIVE'}` |
| 重置密码 | `user:reset-password` | 是（生成 16 位随机密码） | `POST /admin/users/[id]/reset-password` |
| 重置 2FA | `user:reset-2fa` | 是 | `POST /admin/users/[id]/reset-2fa` |
| 强制下线 | `user:kick` | 是 | `POST /admin/users/[id]/kick` 撤销 Refresh Token |
| 转移用户组 | `user:update` | 是 | `POST /admin/users/[id]/change-group` |
| 修改角色 | `user:update` | 是（仅 SUPER_ADMIN） | `PATCH /admin/users/[id]/role` |
| API Key 管理 | `apikey:list` | 否 | 跳 `/admin/users/[id]/apikeys` |
| 调用日志 | `log:view` | 否 | 跳 `/admin/users/[id]/request-logs` |
| 登录日志 | `log:view` | 否 | 跳 `/admin/users/[id]/login-logs` |
| 删除 | `user:delete` | 是（必须无未结订单） | `DELETE /admin/users/[id]` 软删 |

**分页：** 默认 20 / 页，可选 50/100
**排序：** 默认按注册时间倒序，可选：余额 / 今日消费 / 总消费 / 最后登录时间 倒序或正序
**批量操作：** 批量冻结、批量发送通知（站内信/邮件）、批量导出 CSV、批量转移用户组、批量删除（仅 AUDITOR 不可）

**导出：** CSV / Excel；导出字段可配置（默认全部字段）；异步生成 → 通知中心下载

---

### 6.2 用户详情

**路径：** `/admin/users/[id]`
**权限点：** `user:view`
**菜单层级：** 用户中心 / 用户列表 / [id]
**默认 data scope：** ALL / ORGANIZATION

**页面布局：**

- 顶部 Page Header：返回按钮 + 用户名 + 状态徽标 + 操作按钮组（编辑/充值/冻结/重置密码/删除）
- 第 1 行：用户信息卡（左侧 8 列）+ 关键指标卡（右侧 4 列：余额、今日消费、总消费、API Key 数）
- 第 2 行起：Tabs 分组

**Tabs 分组：**

| Tab 键 | 标题 | 权限点 | 内容 |
|--------|------|-------|------|
| `overview` | 概览 | `user:view` | 8 行信息卡 + 消费趋势小图 |
| `apikeys` | API Key | `apikey:list` | 嵌入式 API Key 列表 |
| `orders` | 订单 | `order:list` | 该用户订单列表 |
| `bills` | 账单 | `order:list` | 该用户账单列表 |
| `transactions` | 交易流水 | `order:list` | 余额变动流水 |
| `request-logs` | 调用日志 | `log:view` | 该用户调用日志 |
| `login-logs` | 登录日志 | `log:view` | 该用户登录日志 |
| `subscriptions` | 订阅 | `order:list` | 当前订阅 + 历史订阅 |
| `permissions` | 权限 | `user:view` | 角色、用户组、数据权限、特权开关 |
| `organization` | 企业 | `org:view` | 所属企业、成员、共享余额（若为 V5.0 企业用户） |

**概览 Tab 字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 用户名 | string | 是 | - | `User.display_name` | - |
| 邮箱 | string | 是 | - | `User.email` | 脱敏；鼠标悬停看明文 |
| 手机号 | string | 否 | - | `User.phone` | 脱敏 |
| 头像 | string | 否 | - | `User.avatar_url` | 64×64 圆角 |
| 角色 | enum | 是 | 6 种 | `User.role` | - |
| 用户组 | string | 是 | - | `UserGroup.name` | - |
| 状态 | enum | 是 | 3 种 | `User.status` | - |
| 注册时间 | datetime | 是 | - | `User.created_at` | - |
| 注册 IP | string | 是 | - | `User.register_ip` | - |
| 最后登录时间 | datetime | 否 | - | `User.last_login_at` | - |
| 最后登录 IP | string | 否 | - | `User.last_login_ip` | - |
| 实名状态 | enum | 否 | `UNVERIFIED` / `PENDING` / `VERIFIED` / `REJECTED` | `Verification.status` | - |
| GitHub | string | 否 | - | `User.github_id` | 已绑定 / 未绑定 |
| Google | string | 否 | - | `User.google_id` | 已绑定 / 未绑定 |
| 微信 | string | 否 | - | `User.wechat_id` | 已绑定 / 未绑定 |
| 邀请人 | string | 否 | - | `User.inviter_id` → `User.display_name` | 链接 |
| 邀请码 | string | 否 | - | `User.invite_code` | - |
| 标签 | string[] | 否 | - | `User.tags` | 多选 |
| 备注 | string | 否 | - | `User.remark` | 管理员备注，最多 500 字 |
| 余额 | int | 是 | 分 | `UserBalance.amount` | - |
| 冻结金额 | int | 是 | 分 | `UserBalance.frozen` | - |
| 今日消费 | int | 是 | 分 | 聚合 | - |
| 总消费 | int | 是 | 分 | 聚合 | - |
| API Key 数 | int | 是 | 整数 | `count(ApiKey)` | - |
| 订阅 | string | 否 | - | `SubscriptionPlan.display_name` | - |

**消费趋势小图：** 折线图，X 轴日期（近 30 天），Y 轴每日消费金额（分）

**操作列（同 6.1）：**
- 编辑资料、充值、赠送、冻结/解冻、封禁/解封、重置密码、重置 2FA、强制下线、转移用户组、修改角色、删除

---

### 6.3 用户分组

**路径：** `/admin/users/groups`
**权限点：** `user-group:list`
**菜单层级：** 用户中心 / 用户分组
**默认 data scope：** ALL

**页面布局：**

- 顶部操作栏：「新建分组」按钮（仅 SUPER_ADMIN）
- 中部表格：6 条预置分组 + 自定义分组
- 底部：分页器

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| ID | string | 是 | - | `UserGroup.id` | 链接到详情 |
| 名称 | string | 是 | 1-50 字符 | `UserGroup.name` | `free` / `vip` / `enterprise` / `agent_lv1` / `agent_lv2` / `admin` |
| 显示名 | string | 是 | 1-50 字符 | `UserGroup.display_name` | 例：免费用户 |
| 价格倍率 | decimal | 是 | 0.1-10.0 | `UserGroup.price_multiplier` | 2 位小数 |
| RPM | int | 是 | 整数 | `UserGroup.rpm_limit` | 请求/分钟 |
| TPM | int | 是 | 整数 | `UserGroup.tpm_limit` | Token/分钟 |
| 允许模型 | string[] | 是 | - | `UserGroup.allowed_models` | 多选，留空 = 全部 |
| 允许渠道 | string[] | 是 | - | `UserGroup.allowed_channels` | 多选，留空 = 全部 |
| 最大 Key 数 | int | 是 | 整数 | `UserGroup.max_api_keys` | - |
| 是否允许代理 | bool | 是 | - | `UserGroup.allow_proxy` | - |
| 是否允许分享 | bool | 是 | - | `UserGroup.allow_share` | - |
| 用户数 | int | 是 | 整数 | `count(User where group_id=…)` | 链接到筛选后的用户列表 |
| 描述 | string | 否 | 0-200 字符 | `UserGroup.description` | - |
| 状态 | bool | 是 | - | `UserGroup.is_active` | 启用 / 禁用 |
| 创建时间 | datetime | 是 | - | `UserGroup.created_at` | - |
| 更新时间 | datetime | 是 | - | `UserGroup.updated_at` | - |

**筛选区：**
- 关键字（名称 / 显示名）
- 状态（启用 / 禁用）
- 是否允许代理

**操作列：**
- 查看详情 → `/admin/users/groups/[id]`
- 编辑 → 弹编辑 Modal（仅 SUPER_ADMIN）
- 复制 → 创建新分组并预填
- 启用 / 禁用 → 二次确认
- 删除 → 二次确认（必须无用户引用）

**分页：** 20/50
**排序：** 按 `price_multiplier` 升序（free 在前，admin 在后）
**批量操作：** 批量启用、批量禁用、批量导出

**用户分组详情：** `/admin/users/groups/[id]`，展示该分组全部字段 + 用户列表（嵌入）+ 价格倍率历史（最近 10 次修改）+ 操作日志

**用户分组新建 Modal 字段：**

| 字段 | 类型 | 必填 | 校验 | 默认值 |
|------|------|------|------|-------|
| 名称 | string | 是 | 1-50 字符，唯一 | - |
| 显示名 | string | 是 | 1-50 字符 | - |
| 价格倍率 | decimal | 是 | 0.1-10.0 | 1.00 |
| RPM | int | 是 | 1-100000 | 60 |
| TPM | int | 是 | 1-100000000 | 60000 |
| 允许模型 | string[] | 否 | - | []（全部） |
| 允许渠道 | string[] | 否 | - | []（全部） |
| 最大 Key 数 | int | 是 | 0-100 | 3 |
| 是否允许代理 | bool | 是 | - | false |
| 是否允许分享 | bool | 是 | - | false |
| 描述 | string | 否 | 0-200 字符 | - |

---

### 6.4 API Key 管理

**路径：** `/admin/apikeys`（跨用户列表） + `/admin/users/[id]/apikeys`（单用户列表）
**权限点：** `apikey:list`
**菜单层级：** 用户中心 / API Key 管理
**默认 data scope：** ALL / ORGANIZATION

**页面布局：**

- 顶部筛选区 + 「新建 API Key」按钮
- 中部表格：所有 API Key 列表
- 底部：分页器

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| Key ID | string | 是 | - | `ApiKey.id` | 链接到详情 |
| 用户 | string | 是 | - | `User.display_name` | 链接到用户详情 |
| Key 名称 | string | 否 | 1-50 字符 | `ApiKey.name` | - |
| Key 前缀 | string | 是 | - | `ApiKey.key_prefix` | `sk-toai-AB****` |
| 状态 | enum | 是 | 3 种 | `ApiKey.is_active` | 启用 / 禁用 / 过期 |
| 允许模型 | string[] | 是 | - | `ApiKey.model_limit` | 留空 = 全部 |
| RPM | int | 否 | - | `ApiKey.rate_limit` | - |
| TPM | int | 否 | - | `ApiKey.token_limit` | - |
| IP 白名单 | string[] | 否 | - | `ApiKey.ip_whitelist` | 多 IP / CIDR |
| 预算 | int | 否 | 分 | `ApiKey.budget` | 元；null=无限制 |
| 已用预算 | int | 否 | 分 | 聚合 | 元 |
| 调用次数 | int | 是 | 整数 | `ApiKey.total_requests` | - |
| 消费金额 | int | 是 | 分 | 聚合 | 元/万元 |
| 创建时间 | datetime | 是 | - | `ApiKey.created_at` | - |
| 到期时间 | datetime | 否 | - | `ApiKey.expires_at` | 过期红色 |
| 最后使用 | datetime | 否 | - | `ApiKey.last_used_at` | - |

**筛选区：**
- 关键字（用户 / Key 名称 / Key 前缀）
- 用户（下拉搜索）
- 状态（启用 / 禁用 / 过期）
- 模型（多选）
- 创建时间范围
- 到期时间范围

**操作列：**
- 查看详情 → `/admin/apikeys/[id]`
- 编辑 → 弹编辑 Modal
- 启用 / 禁用 → 二次确认
- 重置 → 二次确认（生成新 Key，旧 Key 立即失效）
- 查看日志 → `/admin/users/[id]/request-logs?apikey_id=…`
- 删除 → 二次确认（无未完成请求）

**新建 API Key Modal 字段：**

| 字段 | 类型 | 必填 | 校验 | 默认值 |
|------|------|------|------|-------|
| 用户 | string | 是 | - | 预填（从单用户页进入时） |
| 名称 | string | 是 | 1-50 字符 | - |
| 允许模型 | string[] | 否 | - | [] |
| RPM | int | 否 | 1-100000 | 父用户组 RPM |
| TPM | int | 否 | 1-100000000 | 父用户组 TPM |
| IP 白名单 | string[] | 否 | CIDR / IP | [] |
| 预算 | int | 否 | 分 | null |
| 到期时间 | datetime | 否 | - | null |
| 备注 | string | 否 | 0-200 字符 | - |

**新建成功弹窗：** 一次性展示完整 Key（带「复制」按钮 + 「我已保存」确认勾选；勾选后关闭弹窗，明文不可再查）

**API Key 详情页 `/admin/apikeys/[id]`：**
- 顶部 Page Header：用户 + Key 名称 + 状态徽标
- 第 1 行：4 张指标卡（总调用、总消费、今日调用、最后使用）
- Tabs：概览 / 调用日志 / 消费统计 / 修改历史

**分页：** 20/50/100
**排序：** 创建时间 / 最后使用 / 消费金额 倒序
**批量操作：** 批量启用、批量禁用、批量删除

---

### 6.5 企业组织（V5.0，可选）

**路径：** `/admin/organizations`
**权限点：** `org:list`
**菜单层级：** 用户中心 / 企业组织
**默认 data scope：** ALL / ORGANIZATION
**状态：** 已在 schema 定义 `Organization` 表，本期输出完整页面但仅在 V5.0 启用

**页面布局：**

- 顶部操作栏：「新建企业」按钮（仅 SUPER_ADMIN）
- 中部表格：企业列表
- 底部：分页器

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| ID | string | 是 | - | `Organization.id` | - |
| 名称 | string | 是 | 1-100 字符 | `Organization.name` | - |
| Slug | string | 是 | 唯一，小写 | `Organization.slug` | URL 友好 |
| 企业余额 | int | 是 | 分 | `Organization.balance` | 元/万元 |
| 成员数 | int | 是 | 整数 | `count(User where org_id=…)` | - |
| 状态 | enum | 是 | `ACTIVE` / `SUSPENDED` | `Organization.status` | - |
| 创建时间 | datetime | 是 | - | `Organization.created_at` | - |

**操作列：**
- 查看详情 → `/admin/organizations/[id]`
- 编辑 → 弹编辑 Modal
- 充值 → 弹充值 Modal
- 成员管理 → 跳转到子页
- 启停 / 删除

**企业详情页 `/admin/organizations/[id]`，Tabs：**
- 概览：基本信息 + 共享余额
- 成员：成员列表（含角色：owner / admin / member）
- 财务：企业充值、消费、订单汇总
- API Key：企业级共享 Key

---

## 7. 订单中心

### 7.1 订单管理

**路径：** `/admin/orders`
**权限点：** `order:list`
**菜单层级：** 订单中心 / 订单管理
**默认 data scope：** ALL / ORGANIZATION

**页面布局：**

- 顶部：状态 Tab（全部 / 待支付 / 已支付 / 已退款 / 失败 / 已取消）+ 筛选区
- 中部表格
- 底部：分页器

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 订单号 | string | 是 | 唯一 | `Order.order_no` | 等宽字体；链接到详情 |
| 用户 | string | 是 | - | `User.display_name` | 链接到用户详情 |
| 订单类型 | enum | 是 | `RECHARGE` / `SUBSCRIPTION` / `PLAN_PURCHASE` / `MANUAL_RECHARGE` / `GIFT` | `Order.product_type` | - |
| 商品 | string | 是 | - | `Order.product_name` | 例：「100 元充值」 |
| 数量 | int | 是 | - | `Order.quantity` | 默认 1 |
| 金额 | int | 是 | 分 | `Order.amount` | 元 |
| 实付金额 | int | 否 | 分 | `Order.paid_amount` | 元 |
| 支付方式 | enum | 否 | - | `Order.payment_method` | 5 种 |
| 状态 | enum | 是 | 5 种 | `Order.status` | 颜色徽标 |
| 创建时间 | datetime | 是 | - | `Order.created_at` | - |
| 完成时间 | datetime | 否 | - | `Order.paid_at` / `Order.refunded_at` | - |
| 到期时间 | datetime | 否 | - | `Order.expired_at` | - |
| 备注 | string | 否 | 0-500 字符 | `Order.remark` | - |

**筛选区：**
- 关键字（订单号 / 用户 / 商品）
- 订单类型（多选）
- 支付方式（多选）
- 状态（多选）
- 金额范围（分）
- 时间范围（创建 / 完成）

**操作列：**
- 查看详情 → `/admin/orders/[id]`
- 标记为已支付（仅人工补单） → 二次确认（仅 FINANCE / SUPER_ADMIN）
- 退款 → 弹退款 Modal（输入金额、原因）→ 二次确认（仅 FINANCE / SUPER_ADMIN）
- 取消 → 二次确认（仅 PENDING 状态）
- 导出 → CSV

**订单详情页 `/admin/orders/[id]`，字段：**
- 顶部 Page Header：订单号 + 状态徽标
- 订单信息卡：所有订单字段
- 支付信息：关联 `Payment` 记录（trade_no / buyer_id / paid_at）
- 操作历史：状态机时间线
- 操作按钮：标记支付 / 退款 / 取消

**分页：** 20/50/100
**排序：** 创建时间 / 完成时间 / 金额 倒序
**批量操作：** 批量导出、批量退款（仅 FINANCE+）

---

### 7.2 充值记录

**路径：** `/admin/recharges`
**权限点：** `order:list`
**菜单层级：** 订单中心 / 充值记录
**默认 data scope：** ALL / ORGANIZATION

**说明：** 充值记录是 `Order` 中 `product_type='RECHARGE'` 与 `Order` 中 `product_type='MANUAL_RECHARGE'` 的合集（含管理员手动充值）。

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 订单号 | string | 是 | - | `Order.order_no` | 链接 |
| 用户 | string | 是 | - | `User.display_name` | 链接 |
| 充值金额 | int | 是 | 分 | `Order.amount` | 元 |
| 赠送金额 | int | 否 | 分 | `Order.gift_amount` | 元 |
| 实际到账 | int | 是 | 分 | amount + gift_amount | 元 |
| 支付方式 | enum | 是 | 5 种 | `Order.payment_method` | - |
| 状态 | enum | 是 | 5 种 | `Order.status` | - |
| 操作员 | string | 否 | - | `Order.operator_id` → `User.display_name` | 仅 MANUAL_RECHARGE 有值 |
| 时间 | datetime | 是 | - | `Order.created_at` | - |

**筛选区：**
- 关键字（订单号 / 用户）
- 支付方式（多选）
- 状态（多选）
- 充值类型（用户自助 / 管理员手动）
- 金额范围
- 时间范围
- 操作员（仅手动充值筛选）

**操作列：**
- 查看详情 → 跳订单详情
- 退款 → 二次确认

**分页：** 20/50/100
**排序：** 时间 / 金额 倒序
**批量操作：** 批量导出

---

### 7.3 账单管理

**路径：** `/admin/bills`
**权限点：** `bill:list`
**菜单层级：** 订单中心 / 账单管理
**默认 data scope：** ALL / ORGANIZATION

**说明：** 账单 = 每次 API 调用的计费明细，对应 `RequestLog` + `Bill`（按日/月汇总）。本期账单按每次调用计费。

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 账单号 | string | 是 | 唯一 | `Bill.bill_no` | 等宽；链接到详情 |
| 用户 | string | 是 | - | `User.display_name` | 链接 |
| 模型 | string | 是 | - | `Model.display_name` | 链接 |
| 输入 Token | int | 是 | 整数 | `RequestLog.prompt_tokens` | - |
| 输出 Token | int | 是 | 整数 | `RequestLog.completion_tokens` | - |
| 缓存 Token | int | 否 | 整数 | `RequestLog.cached_tokens` | - |
| 推理 Token | int | 否 | 整数 | `RequestLog.reasoning_tokens` | - |
| 总 Token | int | 是 | 整数 | `RequestLog.total_tokens` | - |
| 成本价 | int | 是 | 分 | `RequestLog.cost` × 成本倍率 | 元 |
| 销售价 | int | 是 | 分 | `RequestLog.cost` × 用户组倍率 | 元 |
| 利润 | int | 是 | 分 | 销售价 - 成本价 | 元；可负 |
| 渠道 | string | 是 | - | `Channel.name` | - |
| 请求 ID | string | 是 | - | `RequestLog.id` | 链接到调用日志详情 |
| 时间 | datetime | 是 | - | `RequestLog.created_at` | - |

**筛选区：**
- 关键字（账单号 / 用户 / 模型）
- 模型（多选）
- 渠道（多选）
- 用户组（多选）
- 时间范围
- 金额范围

**操作列：**
- 查看详情 → 弹详情 Modal（含完整 Request/Response payload）
- 重新计费 → 二次确认（仅 SUPER_ADMIN，用于计费纠错）

**汇总区（表格上方 4 张指标卡）：**
- 总成本、总销售、总利润、毛利率（当前筛选条件下）

**分页：** 20/50/100
**排序：** 时间 / 金额 / 利润 倒序
**批量操作：** 批量导出

---

### 7.4 发票管理

**路径：** `/admin/invoices`
**权限点：** `invoice:list`
**菜单层级：** 订单中心 / 发票管理
**默认 data scope：** ALL / ORGANIZATION

**页面布局：**

- 顶部：状态 Tab（全部 / 待审核 / 已开票 / 已驳回 / 已寄出）
- 中部表格
- 底部：分页器

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 发票号 | string | 是 | 唯一 | `Invoice.invoice_no` | - |
| 申请用户 | string | 是 | - | `User.display_name` | 链接 |
| 发票类型 | enum | 是 | `NORMAL` / `SPECIAL` / `ELECTRONIC` | `Invoice.type` | - |
| 公司名称 | string | 是 | 1-100 字符 | `Invoice.company_name` | - |
| 税号 | string | 是 | 15-20 位 | `Invoice.tax_id` | - |
| 注册地址 | string | 否 | 0-200 字符 | `Invoice.register_address` | - |
| 注册电话 | string | 否 | - | `Invoice.register_phone` | - |
| 开户银行 | string | 否 | - | `Invoice.bank_name` | - |
| 银行账户 | string | 否 | - | `Invoice.bank_account` | 脱敏 |
| 金额 | int | 是 | 分 | `Invoice.amount` | 元 |
| 税额 | int | 是 | 分 | `Invoice.tax_amount` | 元 |
| 价税合计 | int | 是 | 分 | `Invoice.total` | 元 |
| 状态 | enum | 是 | `PENDING` / `APPROVED` / `REJECTED` / `SENT` | `Invoice.status` | - |
| 申请时间 | datetime | 是 | - | `Invoice.created_at` | - |
| 审核时间 | datetime | 否 | - | `Invoice.reviewed_at` | - |
| 审核人 | string | 否 | - | `Invoice.reviewer_id` → `User.display_name` | - |
| 驳回原因 | string | 否 | 0-200 字符 | `Invoice.reject_reason` | - |
| 寄送方式 | enum | 否 | `EMAIL` / `EXPRESS` | `Invoice.delivery_method` | - |
| 快递单号 | string | 否 | - | `Invoice.tracking_no` | - |
| 关联订单 | string | 否 | - | `Invoice.order_ids`（多选） | 多对多 |

**筛选区：**
- 关键字（发票号 / 公司 / 税号 / 用户）
- 发票类型
- 状态
- 金额范围
- 申请时间范围
- 审核人

**操作列：**
- 查看详情 → 弹详情 Modal（含全部字段 + 审核历史）
- 审核通过 → 二次确认（仅 FINANCE / SUPER_ADMIN）→ 调 `POST /admin/invoices/[id]/approve`
- 审核驳回 → 弹驳回 Modal（输入原因）→ 调 `POST /admin/invoices/[id]/reject`
- 标记已寄出 → 弹 Modal（输入快递单号）→ 调 `POST /admin/invoices/[id]/ship`
- 导出开票明细 → PDF / Excel
- 下载发票 → 文件下载（已开票后）

**分页：** 20/50/100
**排序：** 申请时间 / 金额 倒序
**批量操作：** 批量审核通过、批量驳回、批量导出

---

## 8. 模型中心

### 8.1 模型管理

**路径：** `/admin/models`
**权限点：** `model:list`
**菜单层级：** 模型中心 / 模型管理
**默认 data scope：** ALL

**页面布局：**

- 顶部：状态 Tab（全部 / 上架中 / 已下架 / 测试中）+ 「新建模型」按钮
- 中部表格
- 底部：分页器

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 模型 ID | string | 是 | - | `Model.id` | 链接到详情 |
| 模型名 | string | 是 | 唯一 | `Model.name` | 例：`gpt-4o` |
| 显示名 | string | 是 | - | `Model.display_name` | 例：GPT-4o |
| 提供商 | string | 是 | - | `Provider.display_name` | 链接 |
| 上下文长度 | int | 是 | - | `Model.max_context` | tokens |
| 流式输出 | bool | 是 | - | `Model.supports_streaming` | ✓/✗ |
| 工具调用 | bool | 是 | - | `Model.supports_tools` | ✓/✗ |
| 视觉 | bool | 是 | - | `Model.supports_vision` | ✓/✗ |
| 输入价格 | int | 是 | 分/百万 token | `ModelPricing.input_price` | 元 |
| 输出价格 | int | 是 | 分/百万 token | `ModelPricing.output_price` | 元 |
| 倍率 | decimal | 是 | - | `ModelPricing.multiplier` | 2 位小数 |
| 关联渠道数 | int | 是 | 整数 | `count(ChannelModel where model_id=…)` | 链接 |
| 排序 | int | 是 | - | `Model.sort_order` | 数字小在前 |
| 状态 | enum | 是 | `ONLINE` / `OFFLINE` / `BETA` | `Model.status` | 颜色徽标 |
| 创建时间 | datetime | 是 | - | `Model.created_at` | - |
| 更新时间 | datetime | 是 | - | `Model.updated_at` | - |

**筛选区：**
- 关键字（模型名 / 显示名）
- 提供商（多选）
- 能力（流式 / 工具 / 视觉 多选）
- 状态（多选）
- 价格范围

**操作列：**
- 查看详情 → `/admin/models/[id]`
- 编辑 → 弹编辑 Modal
- 编辑价格 → 跳 `/admin/models/[id]/pricing`
- 上下架 → 二次确认 → 调 `PATCH /admin/models/[id]/status` body `{status: 'ONLINE'/'OFFLINE'}`
- 测试 → 调 `POST /admin/models/[id]/test` 异步执行 → toast 通知
- 排序调整 → 上下移动（仅 SUPER_ADMIN）
- 删除 → 二次确认（必须无关联渠道/价格/调用日志）

**新建模型 Modal 字段：**

| 字段 | 类型 | 必填 | 校验 | 默认值 |
|------|------|------|------|-------|
| 模型名 | string | 是 | 1-100 字符，唯一，小写字母+数字+连字符 | - |
| 显示名 | string | 是 | 1-200 字符 | - |
| 提供商 | enum | 是 | - | - |
| 上下文长度 | int | 是 | 1-10000000 | 128000 |
| 流式输出 | bool | 是 | - | true |
| 工具调用 | bool | 是 | - | false |
| 视觉 | bool | 是 | - | false |
| 排序 | int | 是 | 0-1000 | 0 |
| 状态 | enum | 是 | - | `BETA` |

**模型详情页 `/admin/models/[id]`，Tabs：**
- 概览：基本信息
- 定价：当前定价 + 历史
- 渠道：关联渠道列表
- 调用统计：图表 + 明细（嵌入统计页）
- 用户组价格：每个用户组的独立价格倍率

**分页：** 20/50
**排序：** 排序字段 / 价格 / 创建时间
**批量操作：** 批量上架、批量下架、批量导出

---

### 8.2 渠道管理

**路径：** `/admin/channels`
**权限点：** `channel:list`
**菜单层级：** 模型中心 / 渠道管理
**默认 data scope：** ALL

**页面布局：**

- 顶部：状态 Tab（全部 / 正常 / 限流 / 异常 / 禁用）+ 「新建渠道」按钮
- 中部表格
- 底部：分页器

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 渠道 ID | string | 是 | - | `Channel.id` | 链接到详情 |
| 渠道名称 | string | 是 | 1-50 字符 | `Channel.name` | - |
| 提供商 | string | 是 | - | `Provider.display_name` | 链接 |
| Base URL | string | 是 | URL | `Channel.base_url` | 截断显示 |
| Key 数量 | int | 是 | 整数 | `count(Channel.api_key)` | 链接到子页 |
| 权重 | int | 是 | 1-100 | `Channel.weight` | - |
| 优先级 | int | 是 | 0-100 | `Channel.priority` | 数字小优先 |
| 状态 | enum | 是 | 4 种 | `Channel.status` | 圆点+文字 |
| 是否启用 | bool | 是 | - | `Channel.is_active` | 开关 |
| 总请求 | int | 是 | 整数 | `Channel.total_requests` | - |
| 失败请求 | int | 是 | 整数 | `Channel.failed_requests` | - |
| 成功率 | float | 是 | 0-100 | 派生 | 百分比 |
| 平均延迟 | int | 是 | 毫秒 | `Channel.avg_latency_ms` | - |
| 错误率 | float | 是 | 0-100 | 派生 | >5% 红色 |
| RPM 限制 | int | 否 | - | `Channel.rate_limit` | - |
| TPM 限制 | int | 否 | - | `Channel.token_limit` | - |
| 关联模型 | int | 是 | - | `count(ChannelModel)` | 链接 |
| 最后健康检查 | datetime | 否 | - | `Channel.last_health_check_at` | - |
| 创建时间 | datetime | 是 | - | `Channel.created_at` | - |

**筛选区：**
- 关键字（名称 / Base URL）
- 提供商（多选）
- 状态（多选）
- 成功率范围
- 延迟范围

**操作列：**
- 查看详情 → `/admin/channels/[id]`
- 编辑 → 弹编辑 Modal
- 启用 / 禁用 → 二次确认
- 测速 → 调 `POST /admin/channels/[id]/test` → 弹结果 Modal
- 健康检查 → 调 `POST /admin/channels/[id]/health-check` → toast
- API Key 池 → 跳 `/admin/channels/[id]/keys`
- 轮询策略 → 跳 `/admin/channels/[id]/rotation`
- 删除 → 二次确认（必须无关联模型/调用日志）

**新建渠道 Modal 字段：**

| 字段 | 类型 | 必填 | 校验 | 默认值 |
|------|------|------|------|-------|
| 渠道名称 | string | 是 | 1-50 字符，唯一 | - |
| 提供商 | enum | 是 | - | - |
| Base URL | string | 是 | URL | - |
| API Key | string | 是 | 1-500 字符 | - |
| 权重 | int | 是 | 1-100 | 1 |
| 优先级 | int | 是 | 0-100 | 0 |
| RPM 限制 | int | 否 | 1-100000 | null |
| TPM 限制 | int | 否 | 1-100000000 | null |
| 关联模型 | string[] | 是 | 至少 1 个 | [] |
| 备注 | string | 否 | 0-200 字符 | - |

**分页：** 20/50
**排序：** 状态 / 优先级 / 平均延迟 / 总请求 倒序
**批量操作：** 批量启用、批量禁用、批量测速、批量删除

#### 8.2.1 渠道详情页 `/admin/channels/[id]`

**Tabs：**

| Tab 键 | 标题 | 内容 |
|--------|------|------|
| `overview` | 概览 | 渠道信息 + 4 张指标卡（总请求 / 成功率 / 平均延迟 / 错误率）+ 延迟趋势图 |
| `keys` | API Key 池 | 见 8.2.2 |
| `models` | 关联模型 | 该渠道支持的模型列表，含别名 |
| `rotation` | 轮询策略 | 见 8.2.3 |
| `speedtest` | 测速 | 见 8.2.4 |
| `health` | 健康检查 | 见 8.2.5 |
| `retry` | 失败重试 | 见 8.2.6 |
| `logs` | 调用日志 | 该渠道的调用日志列表 |

#### 8.2.2 API Key 池 `/admin/channels/[id]/keys`

**页面布局：**

- 顶部操作栏：「添加 Key」按钮（粘贴多个 Key 一行一个）
- 中部表格：该渠道下所有 API Key
- 底部：分页器

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| Key ID | string | 是 | - | `ChannelApiKey.id` | - |
| Key 前缀 | string | 是 | - | `ChannelApiKey.key_prefix` | 脱敏 |
| 状态 | enum | 是 | `ACTIVE` / `RATE_LIMITED` / `ERROR` / `DISABLED` | `ChannelApiKey.status` | - |
| 权重 | int | 是 | 1-100 | `ChannelApiKey.weight` | - |
| 优先级 | int | 是 | 0-100 | `ChannelApiKey.priority` | - |
| 总请求 | int | 是 | 整数 | `ChannelApiKey.total_requests` | - |
| 失败请求 | int | 是 | 整数 | `ChannelApiKey.failed_requests` | - |
| 平均延迟 | int | 是 | 毫秒 | `ChannelApiKey.avg_latency_ms` | - |
| 最后错误 | string | 否 | - | `ChannelApiKey.last_error` | - |
| 最后错误时间 | datetime | 否 | - | `ChannelApiKey.last_error_at` | - |
| 创建时间 | datetime | 是 | - | `ChannelApiKey.created_at` | - |

**操作列：**
- 编辑权重 / 优先级
- 启用 / 禁用
- 删除 → 二次确认

**批量操作：** 批量启用、批量禁用、批量删除

#### 8.2.3 轮询策略 `/admin/channels/[id]/rotation`

**说明：** 配置该渠道下多 Key / 多渠道间的请求分发规则。

**字段：**

| 字段 | 类型 | 必填 | 校验 | 默认值 | 说明 |
|------|------|------|------|-------|------|
| 策略类型 | enum | 是 | `WEIGHTED_ROUND_ROBIN` / `PRIORITY` / `RANDOM` / `LEAST_USED` / `FAILOVER` | `WEIGHTED_ROUND_ROBIN` | - |
| 失败转移 | bool | 是 | - | true | 当前 Key 失败时自动切换其他 Key |
| 健康检查间隔 | int | 是 | 10-3600 秒 | 60 | - |
| 单 Key 失败阈值 | int | 是 | 1-100 | 5 | 连续失败 N 次后自动禁用 |
| 冷却时间 | int | 是 | 60-3600 秒 | 300 | 限流后的冷却时长 |
| 熔断恢复时间 | int | 是 | 60-3600 秒 | 600 | 触发熔断后多久尝试半开 |

#### 8.2.4 测速 `/admin/channels/[id]/speedtest`

**页面布局：**

- 顶部表单：选择模型 + 测试消息（默认 `Hello, please respond with OK`）+ 测试次数（1-10）
- 提交按钮：「开始测速」
- 结果表格：每次测试一行，列含 时间 / 延迟 / Token 数 / 速度 (tokens/s) / 状态 / 错误信息
- 汇总指标：平均延迟 / 平均速度 / 成功率

**字段：**

| 字段 | 类型 | 必填 | 校验 | 默认值 |
|------|------|------|------|-------|
| 模型 | enum | 是 | 该渠道下已关联模型 | - |
| 测试消息 | string | 是 | 1-1000 字符 | `Hello, please respond with OK` |
| 测试次数 | int | 是 | 1-10 | 3 |
| 流式 | bool | 是 | - | true |
| 最大 Token | int | 是 | 1-4096 | 100 |

#### 8.2.5 健康检查 `/admin/channels/[id]/health`

**页面布局：**

- 顶部：当前状态卡 + 「立即检查」按钮 + 自动检查开关
- 中部：检查历史时间线（最近 50 条）
- 底部：失败原因分析

**字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 |
|------|------|------|------|------|
| 检查时间 | datetime | 是 | - | `HealthCheck.checked_at` |
| 状态 | enum | 是 | `HEALTHY` / `DEGRADED` / `UNHEALTHY` | 派生 |
| 延迟 | int | 是 | 毫秒 | 实测 |
| 状态码 | int | 是 | - | HTTP 状态码 |
| 错误信息 | string | 否 | - | - |

**自动检查配置：**

| 字段 | 类型 | 必填 | 校验 | 默认值 |
|------|------|------|------|-------|
| 启用 | bool | 是 | - | true |
| 检查间隔 | int | 是 | 10-3600 秒 | 60 |
| 超时 | int | 是 | 1-60 秒 | 10 |
| 失败阈值 | int | 是 | 1-10 | 3 |

#### 8.2.6 失败重试 `/admin/channels/[id]/retry`

**字段：**

| 字段 | 类型 | 必填 | 校验 | 默认值 |
|------|------|------|------|-------|
| 启用 | bool | 是 | - | true |
| 最大重试次数 | int | 是 | 0-5 | 3 |
| 重试间隔 | int | 是 | 100-10000 毫秒 | 1000 |
| 退避策略 | enum | 是 | `FIXED` / `LINEAR` / `EXPONENTIAL` | `EXPONENTIAL` |
| 重试状态码 | int[] | 是 | 1-3 个 | [429, 500, 502, 503, 504] |
| 不可重试状态码 | int[] | 是 | 1-3 个 | [400, 401, 403, 404] |
| 切换渠道 | bool | 是 | - | true | 重试时是否切换到其他渠道 |

---

### 8.3 模型价格

**路径：** `/admin/pricing`（跨模型价格总览） + `/admin/models/[id]/pricing`（单模型价格编辑）
**权限点：** `pricing:list`
**菜单层级：** 模型中心 / 模型价格
**默认 data scope：** ALL

**模型价格总览页：**

**页面布局：**

- 顶部筛选区
- 中部表格：每个模型一行 + 展开显示各用户组价格
- 底部：分页器

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 模型名 | string | 是 | - | `Model.display_name` | 链接到详情 |
| 提供商 | string | 是 | - | `Provider.display_name` | - |
| 基础输入价 | int | 是 | 分/百万 token | `ModelPricing.input_price` | 元 |
| 基础输出价 | int | 是 | 分/百万 token | `ModelPricing.output_price` | 元 |
| 缓存价 | int | 否 | 分/百万 token | `ModelPricing.cached_price` | 元 |
| 推理价 | int | 否 | 分/百万 token | `ModelPricing.reasoning_price` | 元 |
| 默认倍率 | decimal | 是 | - | `ModelPricing.multiplier` | - |
| free 组价 | int | 是 | 分/百万 token | 派生：基础价 × free 倍率 | 元 |
| vip 组价 | int | 是 | 分/百万 token | 派生 | 元 |
| enterprise 组价 | int | 是 | 分/百万 token | 派生 | 元 |
| 利润空间 | float | 是 | 0-100 | 派生 | 百分比 |
| 生效时间 | datetime | 是 | - | `ModelPricing.updated_at` | - |

**筛选区：**
- 关键字（模型名）
- 提供商
- 价格范围

**操作列：**
- 编辑基础价 → 弹编辑 Modal
- 编辑各用户组倍率 → 弹编辑 Modal
- 历史价格 → 弹历史 Modal
- 复制到其他模型 → 弹选择 Modal

**单模型价格编辑 Modal 字段：**

| 字段 | 类型 | 必填 | 校验 | 默认值 |
|------|------|------|------|-------|
| 输入价 | int | 是 | 0-1000000 分/百万 | 当前值 |
| 输出价 | int | 是 | 0-1000000 分/百万 | 当前值 |
| 缓存价 | int | 否 | 0-1000000 分/百万 | 当前值 |
| 推理价 | int | 否 | 0-1000000 分/百万 | 当前值 |
| 默认倍率 | decimal | 是 | 0.1-10.0 | 1.0 |
| free 倍率 | decimal | 是 | 0.1-10.0 | 1.0 |
| vip 倍率 | decimal | 是 | 0.1-10.0 | 0.8 |
| enterprise 倍率 | decimal | 是 | 0.1-10.0 | 0.6 |
| agent_lv1 倍率 | decimal | 是 | 0.1-10.0 | 0.7 |
| agent_lv2 倍率 | decimal | 是 | 0.1-10.0 | 0.5 |
| admin 倍率 | decimal | 是 | 0.1-10.0 | 0.0 |
| 生效时间 | enum | 是 | `IMMEDIATELY` / `NEXT_HOUR` / `NEXT_DAY` | `IMMEDIATELY` |
| 备注 | string | 否 | 0-200 字符 | - |

**价格历史 Modal：** 时间倒序，每行显示变更时间、字段、变更前值、变更后值、操作人、备注

**分页：** 20/50
**排序：** 模型名 / 价格 / 更新时间
**批量操作：** 批量调价（按百分比 ±）

---

## 9. 运营中心

### 9.1 公告管理

**路径：** `/admin/announcements`
**权限点：** `announcement:list`
**菜单层级：** 运营中心 / 公告管理
**默认 data scope：** ALL

**页面布局：**
- 顶部操作区：新建公告按钮
- 中部 Tab：全部 / 进行中 / 未开始 / 已结束
- 中部表格
- 底部：分页器

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 公告 ID | string | 是 | - | `Announcement.id` | 链接到详情 |
| 标题 | string | 是 | 1-100 字符 | `Announcement.title` | - |
| 类型 | enum | 是 | `NOTICE` / `ACTIVITY` / `MAINTENANCE` / `SECURITY` | `Announcement.type` | 颜色徽标 |
| 优先级 | enum | 是 | `LOW` / `NORMAL` / `HIGH` / `URGENT` | `Announcement.priority` | 颜色徽标 |
| 展示位置 | enum[] | 是 | `LOGIN` / `DASHBOARD` / `BILLING` / `MODEL_LIST` / `API_DOC` | `Announcement.placements` | 多选 |
| 展示渠道 | enum[] | 是 | `WEB` / `MOBILE` / `EMAIL` / `IN_APP` / `WEBHOOK` | `Announcement.channels` | 多选 |
| 状态 | enum | 是 | `DRAFT` / `SCHEDULED` / `ACTIVE` / `EXPIRED` / `ARCHIVED` | `Announcement.status` | 自动计算 |
| 生效时间 | datetime | 是 | - | `Announcement.start_at` | - |
| 失效时间 | datetime | 是 | - | `Announcement.end_at` | 必须 > 生效时间 |
| 已读用户数 | int | 是 | - | `count(AnnouncementRead)` | 链接 |
| 关联跳转 | string | 否 | URL 格式 | `Announcement.action_url` | 按钮 |
| 创建人 | string | 是 | - | `User.username` | - |
| 创建时间 | datetime | 是 | - | `Announcement.created_at` | - |

**筛选区：**
- 关键字（标题）
- 类型
- 优先级
- 状态
- 时间范围

**操作列：**
- 查看详情
- 编辑
- 复制
- 立即发布（草稿状态）
- 撤回（进行中状态）
- 归档（已结束状态）
- 删除（草稿 / 已归档状态，二次确认）

**新建 / 编辑公告 Modal 字段：**

| 字段 | 类型 | 必填 | 校验 | 默认值 |
|------|------|------|------|-------|
| 标题 | string | 是 | 1-100 字符 | - |
| 副标题 | string | 否 | 0-200 字符 | - |
| 类型 | enum | 是 | - | `NOTICE` |
| 优先级 | enum | 是 | - | `NORMAL` |
| 内容（富文本） | string | 是 | 1-5000 字符 | - |
| 展示位置 | enum[] | 是 | 至少 1 个 | `[DASHBOARD]` |
| 展示渠道 | enum[] | 是 | 至少 1 个 | `[IN_APP]` |
| 生效时间 | datetime | 是 | 未来时间 | 当前 +1 小时 |
| 失效时间 | datetime | 是 | > 生效时间 | 当前 +7 天 |
| 是否弹窗 | bool | 是 | - | false |
| 弹窗强制停留秒数 | int | 否 | 1-30 | 3 |
| 关联跳转 URL | string | 否 | URL 格式 | - |
| 关联跳转文案 | string | 否 | 0-20 字符 | - |
| 目标用户组 | enum[] | 是 | `ALL` / `FREE` / `VIP` / `ENTERPRISE` | `[ALL]` |
| 发送邮件 | bool | 是 | - | false |
| 邮件主题 | string | 否 | 1-100 字符 | - |
| 定时发布 | bool | 是 | - | false |
| 备注 | string | 否 | 0-500 字符 | - |

**公告详情页 `/admin/announcements/[id]`:**

**信息 Tab：**
- 基础信息（同上）
- 富文本预览

**统计 Tab：**
- 总展示数
- 总点击数
- 点击率（点击 / 展示）
- 已读用户数 / 总用户数
- 按用户组分布
- 按时间分布（24h 折线图）
- 按渠道分布

**操作日志 Tab：**
- 创建 / 编辑 / 发布 / 撤回 / 归档事件时间线

**状态机：**
```
DRAFT → SCHEDULED → ACTIVE → EXPIRED → ARCHIVED
                ↘ ACTIVE (立即发布)
任何状态 → DRAFT (撤回)
```

**分页：** 20/50
**排序：** 创建时间 / 生效时间 / 优先级
**批量操作：** 批量发布 / 批量撤回 / 批量删除（二次确认）

---

### 9.2 工单系统

**路径：** `/admin/tickets`
**权限点：** `ticket:list`
**菜单层级：** 运营中心 / 工单系统
**默认 data scope：** SELF（仅本人创建的）+ ALL（管理员）

**页面布局：**
- 顶部 Tab：我的工单 / 待我处理 / 全部工单
- 顶部筛选区
- 中部表格
- 底部：分页器

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 工单 ID | string | 是 | - | `Ticket.id` | 链接到详情 |
| 工单编号 | string | 是 | 自动生成 | `Ticket.ticket_no` | T-20260605-0001 |
| 标题 | string | 是 | - | `Ticket.subject` | 截断显示 |
| 类型 | enum | 是 | `BUG` / `ACCOUNT` / `BILLING` / `TECHNICAL` / `COMPLAINT` / `OTHER` | `Ticket.type` | 颜色徽标 |
| 优先级 | enum | 是 | `LOW` / `NORMAL` / `HIGH` / `URGENT` | `Ticket.priority` | 颜色徽标 |
| 状态 | enum | 是 | `OPEN` / `PENDING` / `PROCESSING` / `RESOLVED` / `CLOSED` / `CANCELLED` | `Ticket.status` | 颜色徽标 |
| 提交人 | string | 是 | - | `User.username` | 链接 |
| 受理人 | string | 否 | - | `Assignee.username` | 链接 |
| 关联订单 | string | 否 | - | `Ticket.order_id` | 链接 |
| 关联用户 | string | 否 | - | `Ticket.user_id` | 链接 |
| 回复数 | int | 是 | - | `count(TicketReply)` | - |
| SLA 剩余 | string | 否 | - | 派生 | 颜色（红/黄/绿） |
| 最后回复时间 | datetime | 是 | - | `Ticket.last_reply_at` | - |
| 创建时间 | datetime | 是 | - | `Ticket.created_at` | - |

**筛选区：**
- 关键字（标题 / 工单编号 / 描述）
- 类型
- 优先级
- 状态
- 受理人
- 提交人
- 时间范围
- 是否超时

**操作列：**
- 查看详情
- 受理（未受理）
- 转交（已受理）
- 关闭（处理中，二次确认）
- 重开（已关闭 / 已解决，二次确认）
- 删除（已取消，二次确认）

**新建工单 Modal 字段：**

| 字段 | 类型 | 必填 | 校验 | 默认值 |
|------|------|------|------|-------|
| 标题 | string | 是 | 1-100 字符 | - |
| 类型 | enum | 是 | - | `OTHER` |
| 优先级 | enum | 是 | - | `NORMAL` |
| 描述（富文本） | string | 是 | 1-2000 字符 | - |
| 关联用户 | string | 否 | 用户名 | - |
| 关联订单 | string | 否 | 订单号 | - |
| 关联 API Key | string | 否 | Key 前缀 | - |
| 附件 | file[] | 否 | 单文件 ≤ 10MB，最多 5 个，jpg/png/pdf/zip | - |
| 内部备注 | string | 否 | 0-500 字符 | - |

**工单详情页 `/admin/tickets/[id]`:**

**左侧主区：**
- 工单基本信息卡片
- 会话时间线：用户消息和客服回复交错显示
- 富文本编辑器（回复输入）
- 附件上传
- 内部备注（仅管理员可见）
- 操作按钮：回复 / 关闭 / 重开 / 转交

**右侧信息栏：**
- 状态卡片
- 优先级 / SLA
- 提交人信息（用户名 / 邮箱 / 手机 / 用户组 / 余额 / 创建时间）
- 受理人
- 关联实体（订单 / API Key / 模型）
- 工单历史（创建 / 受理 / 转交 / 关闭等事件）
- 内部备注区

**回复编辑器字段：**

| 字段 | 类型 | 必填 | 校验 | 默认值 |
|------|------|------|------|-------|
| 回复内容（富文本） | string | 是 | 1-5000 字符 | - |
| 附件 | file[] | 否 | 同上 | - |
| 是否内部备注 | bool | 是 | - | false |
| 是否抄送用户邮箱 | bool | 是 | - | true |
| 模板 | enum | 否 | 预设回复模板 | - |
| 转交至 | string | 否 | 客服用户名 | - |

**预设回复模板管理 `/admin/tickets/templates`：**

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 模板 ID | string | 是 | - | `TicketTemplate.id` | - |
| 模板名 | string | 是 | 1-50 字符 | `TicketTemplate.name` | - |
| 类型 | enum | 是 | `BUG` / `BILLING` / ... | `TicketTemplate.type` | - |
| 内容 | string | 是 | 1-2000 字符 | `TicketTemplate.content` | 支持变量 |
| 使用次数 | int | 是 | - | 计数 | - |
| 创建人 | string | 是 | - | `User.username` | - |
| 更新时间 | datetime | 是 | - | `TicketTemplate.updated_at` | - |

**操作列：** 编辑 / 删除（二次确认）

**新建 / 编辑模板 Modal：** 模板名 / 类型 / 内容（支持变量：`{{username}}` / `{{balance}}` / `{{date}}` / `{{ticket_no}}`）/ 快捷键

**SLA 规则：**
| 优先级 | 首次响应 SLA | 解决 SLA |
|--------|-------------|---------|
| URGENT | 30 分钟 | 4 小时 |
| HIGH | 2 小时 | 24 小时 |
| NORMAL | 8 小时 | 72 小时 |
| LOW | 24 小时 | 7 天 |

**状态机：**
```
OPEN → PROCESSING → RESOLVED → CLOSED
  ↓         ↓            ↓
CANCELLED PENDING   (用户回复)→ PROCESSING
任何状态 → CANCELLED (管理员)
CLOSED → OPEN (重开)
```

**分页：** 20/50
**排序：** 创建时间 / 最后回复 / 优先级 / SLA 剩余
**批量操作：** 批量受理 / 批量转交 / 批量关闭（二次确认）

---

### 9.3 邀请推广

**路径：** `/admin/promotion`
**权限点：** `promotion:list`
**菜单层级：** 运营中心 / 邀请推广
**默认 data scope：** ALL

**页面布局：**
- 顶部 KPI 卡片区：累计邀请数 / 已注册邀请数 / 已付费邀请数 / 累计返佣金额
- 中部 Tab：邀请码列表 / 返佣规则 / 推广活动
- 底部：分页器（邀请码 Tab）

**9.3.1 邀请码列表**

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 邀请码 ID | string | 是 | - | `InviteCode.id` | - |
| 邀请码 | string | 是 | 唯一 8-16 位 | `InviteCode.code` | 大写字母+数字 |
| 生成人 | string | 是 | - | `User.username` | 链接 |
| 渠道 | enum | 是 | `PERSONAL` / `CHANNEL` / `PARTNER` / `ACTIVITY` | `InviteCode.channel` | - |
| 已使用次数 | int | 是 | - | `count(InviteCodeUsage)` | 链接 |
| 上限 | int | 是 | 1-999999 | `InviteCode.max_uses` | 0=无限 |
| 关联活动 | string | 否 | - | `InviteCode.campaign_id` | 链接 |
| 状态 | enum | 是 | `ACTIVE` / `EXPIRED` / `DISABLED` | `InviteCode.status` | - |
| 过期时间 | datetime | 是 | - | `InviteCode.expires_at` | - |
| 创建时间 | datetime | 是 | - | `InviteCode.created_at` | - |

**筛选区：**
- 关键字（邀请码 / 生成人）
- 渠道
- 状态
- 时间范围

**操作列：**
- 查看详情
- 复制链接
- 禁用
- 删除（二次确认）

**新建邀请码 Modal 字段：**

| 字段 | 类型 | 必填 | 校验 | 默认值 |
|------|------|------|------|-------|
| 渠道 | enum | 是 | - | `PERSONAL` |
| 上限 | int | 是 | 1-999999 | 100 |
| 关联活动 | string | 否 | 活动 ID | - |
| 过期时间 | datetime | 是 | 未来时间 | 当前 +30 天 |
| 备注 | string | 否 | 0-200 字符 | - |
| 批量生成数量 | int | 否 | 1-1000 | 1 |

**邀请码详情页 `/admin/promotion/invite-codes/[id]`:**
- 基础信息
- 使用记录列表：使用人 / 注册时间 / 是否已付费 / 返佣金额
- 返佣记录列表

**9.3.2 返佣规则**

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 规则 ID | string | 是 | - | `CommissionRule.id` | - |
| 规则名 | string | 是 | 1-50 字符 | `CommissionRule.name` | - |
| 适用渠道 | enum[] | 是 | - | `CommissionRule.channels` | 多选 |
| 触发事件 | enum | 是 | `REGISTER` / `FIRST_PAYMENT` / `EACH_PAYMENT` / `SUBSCRIPTION` | `CommissionRule.trigger` | - |
| 返佣类型 | enum | 是 | `PERCENTAGE` / `FIXED` | `CommissionRule.type` | - |
| 返佣值 | decimal | 是 | 0.01-100 | `CommissionRule.value` | 百分比或元 |
| 上限 | decimal | 否 | - | `CommissionRule.max_amount` | 元 |
| 最低提现 | decimal | 是 | 0-10000 | `CommissionRule.min_withdraw` | 元 |
| 优先级 | int | 是 | 1-100 | `CommissionRule.priority` | 数字小优先 |
| 状态 | enum | 是 | `ACTIVE` / `DISABLED` | `CommissionRule.status` | - |
| 生效时间 | datetime | 是 | - | `CommissionRule.start_at` | - |
| 失效时间 | datetime | 否 | - | `CommissionRule.end_at` | - |

**操作列：** 编辑 / 启用 / 禁用 / 删除（二次确认）

**9.3.3 推广活动**

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 活动 ID | string | 是 | - | `Campaign.id` | - |
| 活动名 | string | 是 | 1-50 字符 | `Campaign.name` | - |
| 类型 | enum | 是 | `INVITE_BONUS` / `FIRST_PAYMENT_DISCOUNT` / `GROUP_BUY` / `TIME_LIMITED` | `Campaign.type` | - |
| 奖励类型 | enum | 是 | `BALANCE` / `COUPON` / `SUBSCRIPTION` / `POINTS` | `Campaign.reward_type` | - |
| 奖励值 | decimal | 是 | - | `Campaign.reward_value` | 元 / 折扣 |
| 参与人数 | int | 是 | - | `count(CampaignParticipation)` | 链接 |
| 状态 | enum | 是 | `DRAFT` / `ACTIVE` / `PAUSED` / `EXPIRED` | `Campaign.status` | - |
| 生效时间 | datetime | 是 | - | `Campaign.start_at` | - |
| 失效时间 | datetime | 是 | - | `Campaign.end_at` | - |

**操作列：** 查看详情 / 编辑 / 启用 / 暂停 / 复制 / 删除（二次确认）

**9.3.4 返佣提现审核**

**路径：** `/admin/promotion/withdrawals`
**权限点：** `promotion:withdraw`

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 提现 ID | string | 是 | - | `Withdrawal.id` | - |
| 申请人 | string | 是 | - | `User.username` | 链接 |
| 金额 | decimal | 是 | - | `Withdrawal.amount` | 元 |
| 手续费 | decimal | 是 | - | `Withdrawal.fee` | 元 |
| 实际到账 | decimal | 是 | - | 派生 | 元 |
| 提现方式 | enum | 是 | `WECHAT` / `ALIPAY` / `BANK` | `Withdrawal.method` | - |
| 账户信息 | string | 是 | - | `Withdrawal.account_info` | 脱敏 |
| 状态 | enum | 是 | `PENDING` / `APPROVED` / `REJECTED` / `PAID` / `FAILED` | `Withdrawal.status` | - |
| 申请时间 | datetime | 是 | - | `Withdrawal.created_at` | - |
| 处理时间 | datetime | 否 | - | `Withdrawal.processed_at` | - |

**操作列：**
- 审核（通过 / 拒绝 + 原因）
- 标记已打款
- 查看详情

**状态机：**
```
PENDING → APPROVED → PAID
       ↘ REJECTED (二次确认 + 原因)
       ↘ FAILED (打款失败)
```

**KPI 卡片字段：**

| 卡片 | 字段 | 来源 |
|------|------|------|
| 累计邀请数 | int | `count(InviteCodeUsage)` |
| 已注册邀请数 | int | `count(InviteCodeUsage where user registered)` |
| 已付费邀请数 | int | `count(InviteCodeUsage where user paid)` |
| 累计返佣金额 | decimal | `sum(Commission.amount)` |

**分页：** 20/50/100
**排序：** 创建时间 / 邀请数 / 转化率

---

## 10. 安全中心

### 10.1 风控中心

**路径：** `/admin/risk`
**权限点：** `risk:list`
**菜单层级：** 安全中心 / 风控中心
**默认 data scope：** ALL

**页面布局：**
- 顶部 KPI 卡片：今日拦截 / 今日告警 / 待审核事件 / 高危用户数
- 中部 Tab：实时事件 / 规则配置 / 事件审核
- 底部：分页器

**10.1.1 实时事件**

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 事件 ID | string | 是 | - | `RiskEvent.id` | 链接到详情 |
| 事件类型 | enum | 是 | `LOGIN_ABNORMAL` / `PAYMENT_ABNORMAL` / `API_ABUSE` / `KEY_LEAK` / `BRUTE_FORCE` / `IP_FREQUENT` | `RiskEvent.type` | 颜色徽标 |
| 风险等级 | enum | 是 | `LOW` / `MEDIUM` / `HIGH` / `CRITICAL` | `RiskEvent.level` | 颜色徽标 |
| 触发用户 | string | 是 | - | `User.username` | 链接 |
| 触发 IP | string | 是 | - | `RiskEvent.ip` | 链接 |
| 触发位置 | string | 否 | - | 派生 | 国 / 省 / 市 |
| 关联实体 | string | 否 | - | `RiskEvent.entity` | API Key / 订单号 |
| 触发规则 | string | 是 | - | `RiskEvent.rule_name` | 链接 |
| 状态 | enum | 是 | `PENDING` / `CONFIRMED` / `IGNORED` / `AUTO_HANDLED` | `RiskEvent.status` | - |
| 处理人 | string | 否 | - | `User.username` | - |
| 发生时间 | datetime | 是 | - | `RiskEvent.created_at` | - |

**筛选区：**
- 关键字（用户 / IP / 事件 ID）
- 事件类型
- 风险等级
- 状态
- 时间范围

**操作列：**
- 查看详情
- 标记已确认
- 标记忽略
- 立即处置（拉黑 IP / 禁用 Key / 锁定用户）

**事件详情 Modal 字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 事件 ID | string | 是 | - | `RiskEvent.id` | - |
| 事件类型 | enum | 是 | - | - | - |
| 风险等级 | enum | 是 | - | - | - |
| 触发用户 | object | 是 | - | 关联 User | 完整信息 |
| 触发 IP | string | 是 | - | - | - |
| 触发位置 | string | 否 | - | 派生 | - |
| User-Agent | string | 是 | - | - | - |
| 设备指纹 | string | 否 | - | - | - |
| 关联实体 | object | 否 | - | - | 完整信息 |
| 触发规则 | object | 是 | - | 关联 RiskRule | - |
| 命中条件 | json | 是 | - | - | 详细 |
| 处置动作 | string[] | 是 | - | - | 数组 |
| 处理人 | string | 否 | - | - | - |
| 处理时间 | datetime | 否 | - | - | - |
| 处理备注 | string | 否 | - | - | - |
| 原始 Payload | json | 是 | - | - | 折叠展示 |

**10.1.2 规则配置**

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 规则 ID | string | 是 | - | `RiskRule.id` | - |
| 规则名 | string | 是 | 1-50 字符 | `RiskRule.name` | - |
| 事件类型 | enum | 是 | - | `RiskRule.event_type` | - |
| 风险等级 | enum | 是 | - | `RiskRule.level` | - |
| 触发条件 | json | 是 | - | `RiskRule.conditions` | 表达式 |
| 处置动作 | enum[] | 是 | `BLOCK` / `CHALLENGE` / `WARN` / `LOG` / `NOTIFY` | `RiskRule.actions` | 多选 |
| 状态 | enum | 是 | `ACTIVE` / `DISABLED` | `RiskRule.status` | 开关 |
| 触发次数 | int | 是 | - | 计数 | - |
| 最后触发 | datetime | 否 | - | - | - |
| 创建人 | string | 是 | - | `User.username` | - |
| 更新时间 | datetime | 是 | - | `RiskRule.updated_at` | - |

**筛选区：** 关键字 / 事件类型 / 风险等级 / 状态

**操作列：** 启用 / 禁用 / 编辑 / 复制 / 删除（二次确认）

**新建 / 编辑规则 Modal 字段：**

| 字段 | 类型 | 必填 | 校验 | 默认值 |
|------|------|------|------|-------|
| 规则名 | string | 是 | 1-50 字符 | - |
| 事件类型 | enum | 是 | - | - |
| 风险等级 | enum | 是 | - | `MEDIUM` |
| 触发条件构建器 | json | 是 | AND/OR 组合 | - |
| 条件字段 | string | 是 | - | - |
| 比较符 | enum | 是 | `EQ` / `NEQ` / `GT` / `GTE` / `LT` / `LTE` / `IN` / `CONTAINS` / `REGEX` | - |
| 阈值 | string | 是 | - | - |
| 处置动作 | enum[] | 是 | 至少 1 个 | `[LOG]` |
| 冷却时间 | int | 是 | 0-3600 秒 | 60 |
| 通知模板 | string | 否 | 模板 ID | - |
| 备注 | string | 否 | 0-200 字符 | - |

**10.1.3 事件审核**

待处理事件列表（status = PENDING），支持批量审核。

**批量处置动作：**
- 全部标记已确认
- 全部标记忽略
- 批量拉黑 IP
- 批量禁用 API Key
- 批量锁定用户

**KPI 卡片字段：**

| 卡片 | 字段 | 来源 |
|------|------|------|
| 今日拦截 | int | `count(RiskEvent where action=BLOCK and date=today)` |
| 今日告警 | int | `count(RiskEvent where date=today)` |
| 待审核事件 | int | `count(RiskEvent where status=PENDING)` |
| 高危用户数 | int | `count(User where risk_score>=80)` |

**分页：** 50/100
**排序：** 时间 / 风险等级

---

### 10.2 黑名单

**路径：** `/admin/blacklist`
**权限点：** `blacklist:list`
**菜单层级：** 安全中心 / 黑名单
**默认 data scope：** ALL

**页面布局：**
- 顶部操作区：新增黑名单按钮
- 中部 Tab：用户黑名单 / IP 黑名单 / 设备黑名单 / 邮箱域名黑名单
- 中部表格
- 底部：分页器

**10.2.1 用户黑名单**

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 黑名单 ID | string | 是 | - | `UserBlacklist.id` | - |
| 用户 | string | 是 | - | `User.username` | 链接 |
| 用户邮箱 | string | 是 | - | `User.email` | 脱敏 |
| 原因类型 | enum | 是 | `FRAUD` / `VIOLATION` / `COMPLAINT` / `ABUSE` / `OTHER` | `UserBlacklist.reason_type` | - |
| 原因描述 | string | 是 | 1-500 字符 | `UserBlacklist.reason` | - |
| 限制范围 | enum[] | 是 | `LOGIN` / `REGISTER` / `PAYMENT` / `API_CALL` / `ALL` | `UserBlacklist.scopes` | 多选 |
| 状态 | enum | 是 | `ACTIVE` / `EXPIRED` / `LIFTED` | `UserBlacklist.status` | - |
| 操作人 | string | 是 | - | `User.username` | - |
| 生效时间 | datetime | 是 | - | `UserBlacklist.start_at` | - |
| 失效时间 | datetime | 否 | - | `UserBlacklist.end_at` | 永久=null |
| 创建时间 | datetime | 是 | - | `UserBlacklist.created_at` | - |

**筛选区：** 关键字（用户名） / 原因类型 / 状态 / 时间范围

**操作列：**
- 查看详情
- 编辑
- 解除（二次确认 + 原因）
- 删除（二次确认）

**新增 / 编辑用户黑名单 Modal 字段：**

| 字段 | 类型 | 必填 | 校验 | 默认值 |
|------|------|------|------|-------|
| 用户 | string | 是 | 用户名搜索 | - |
| 原因类型 | enum | 是 | - | `OTHER` |
| 原因描述 | string | 是 | 1-500 字符 | - |
| 限制范围 | enum[] | 是 | 至少 1 个 | `[ALL]` |
| 生效时间 | datetime | 是 | - | 当前时间 |
| 失效时间 | datetime | 否 | > 生效时间 | 永久 |
| 证据附件 | file[] | 否 | 单文件 ≤ 10MB，最多 5 个 | - |
| 内部备注 | string | 否 | 0-500 字符 | - |

**10.2.2 IP 黑名单**

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 黑名单 ID | string | 是 | - | `IpBlacklist.id` | - |
| IP 段 | string | 是 | CIDR / 单 IP | `IpBlacklist.ip_range` | - |
| 地理位置 | string | 否 | - | 派生 | - |
| 原因类型 | enum | 是 | - | `IpBlacklist.reason_type` | - |
| 原因描述 | string | 是 | - | `IpBlacklist.reason` | - |
| 拦截次数 | int | 是 | - | 计数 | - |
| 状态 | enum | 是 | - | `IpBlacklist.status` | - |
| 操作人 | string | 是 | - | - | - |
| 生效时间 | datetime | 是 | - | - | - |
| 失效时间 | datetime | 否 | - | - | - |

**操作列：** 编辑 / 解除 / 删除

**10.2.3 设备黑名单**

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 黑名单 ID | string | 是 | - | `DeviceBlacklist.id` | - |
| 设备指纹 | string | 是 | - | `DeviceBlacklist.fingerprint` | 哈希 |
| 关联用户数 | int | 是 | - | 计数 | 链接 |
| 原因 | string | 是 | - | - | - |
| 状态 | enum | 是 | - | - | - |
| 操作人 | string | 是 | - | - | - |
| 生效时间 | datetime | 是 | - | - | - |
| 失效时间 | datetime | 否 | - | - | - |

**10.2.4 邮箱域名黑名单**

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 黑名单 ID | string | 是 | - | `EmailDomainBlacklist.id` | - |
| 域名 | string | 是 | - | `EmailDomainBlacklist.domain` | 顶级域名 |
| 原因 | string | 是 | - | - | - |
| 拒绝注册数 | int | 是 | - | 计数 | - |
| 状态 | enum | 是 | - | - | - |
| 操作人 | string | 是 | - | - | - |
| 创建时间 | datetime | 是 | - | - | - |

**新增 Modal 字段：**
- 域名（一行一个，支持批量）
- 原因

**分页：** 20/50
**排序：** 创建时间 / 拦截次数

---

### 10.3 IP 限制

**路径：** `/admin/ip-restrictions`
**权限点：** `iprestriction:list`
**菜单层级：** 安全中心 / IP 限制
**默认 data scope：** ALL

**页面布局：**
- 顶部 KPI 卡片：总规则数 / 启用规则 / 今日命中数 / 拒绝访问数
- 中部 Tab：白名单 / 灰名单 / 黑名单（按策略分级）
- 中部表格
- 底部：分页器

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 规则 ID | string | 是 | - | `IpRestriction.id` | - |
| 名称 | string | 是 | 1-50 字符 | `IpRestriction.name` | - |
| IP 段 | string | 是 | CIDR / 单 IP / 通配符 | `IpRestriction.ip_range` | - |
| 策略 | enum | 是 | `ALLOW` / `GRAY` / `DENY` | `IpRestriction.policy` | 颜色徽标 |
| 适用范围 | enum[] | 是 | `ADMIN` / `API` / `WEB` / `ALL` | `IpRestriction.scopes` | 多选 |
| 命中次数 | int | 是 | - | 计数 | - |
| 状态 | enum | 是 | `ACTIVE` / `DISABLED` | `IpRestriction.status` | 开关 |
| 描述 | string | 否 | 0-200 字符 | `IpRestriction.description` | - |
| 创建人 | string | 是 | - | `User.username` | - |
| 生效时间 | datetime | 是 | - | `IpRestriction.start_at` | - |
| 失效时间 | datetime | 否 | - | `IpRestriction.end_at` | - |

**筛选区：**
- 关键字（名称 / IP 段）
- 策略
- 适用范围
- 状态

**操作列：**
- 编辑
- 启用 / 禁用
- 删除（二次确认）

**新增 / 编辑 IP 限制 Modal 字段：**

| 字段 | 类型 | 必填 | 校验 | 默认值 |
|------|------|------|------|-------|
| 名称 | string | 是 | 1-50 字符 | - |
| IP 段 | string | 是 | 支持格式：`192.168.1.1`、`192.168.1.0/24`、`192.168.1.*`、`192.168.1.1-100` | - |
| 策略 | enum | 是 | - | `ALLOW` |
| 适用范围 | enum[] | 是 | 至少 1 个 | `[ALL]` |
| 描述 | string | 否 | 0-200 字符 | - |
| 生效时间 | datetime | 是 | - | 当前时间 |
| 失效时间 | datetime | 否 | > 生效时间 | 永久 |
| 状态 | enum | 是 | - | `ACTIVE` |

**匹配优先级：**
```
DENY > ALLOW > GRAY > 默认规则
（同级按创建时间倒序）
```

**KPI 卡片字段：**

| 卡片 | 字段 | 来源 |
|------|------|------|
| 总规则数 | int | `count(IpRestriction)` |
| 启用规则 | int | `count(IpRestriction where status=ACTIVE)` |
| 今日命中数 | int | `count(IpAccessLog where date=today)` |
| 拒绝访问数 | int | `count(IpAccessLog where action=DENY)` |

**批量导入 Modal 字段：**

| 字段 | 类型 | 必填 | 校验 | 默认值 |
|------|------|------|------|-------|
| 批量粘贴 | text | 是 | 一行一个 IP 段 | - |
| 默认策略 | enum | 是 | - | `ALLOW` |
| 默认适用范围 | enum[] | 是 | - | `[ALL]` |

**IP 访问日志 `/admin/ip-restrictions/logs`：**

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 日志 ID | string | 是 | - | `IpAccessLog.id` | - |
| 源 IP | string | 是 | - | - | 链接 |
| 访问目标 | string | 是 | - | - | 路径 |
| 命中规则 | string | 否 | - | - | 链接 |
| 处置 | enum | 是 | `ALLOW` / `DENY` / `CHALLENGE` | - | - |
| User-Agent | string | 是 | - | - | - |
| 用户 | string | 否 | - | - | 链接 |
| 时间 | datetime | 是 | - | - | - |

**分页：** 50/100
**排序：** 创建时间

---

## 11. 系统中心

### 11.1 系统设置

**路径：** `/admin/settings`
**权限点：** `settings:view`
**菜单层级：** 系统中心 / 系统设置
**默认 data scope：** ALL

**页面布局：**
- 左侧 Tabs：基本设置 / 安全设置 / 邮件设置 / 短信设置 / 支付设置 / 存储设置 / 第三方集成 / 限流配置
- 右侧表单：当前 Tab 的所有配置项
- 顶部：保存按钮

**11.1.1 基本设置**

**字段：**

| 字段 | 类型 | 必填 | 校验 | 默认值 | 说明 |
|------|------|------|------|-------|------|
| 平台名称 | string | 是 | 1-50 字符 | `ToAIAPI` | - |
| 平台 Logo | file | 否 | png/svg，≤ 2MB | - | - |
| 平台 Favicon | file | 否 | ico/png，≤ 500KB | - | - |
| 平台域名 | string | 是 | URL 格式 | - | - |
| 联系邮箱 | string | 是 | email 格式 | - | - |
| 客服电话 | string | 否 | - | - | - |
| ICP 备案号 | string | 否 | - | - | - |
| 平台介绍（富文本） | string | 是 | 1-5000 字符 | - | - |
| 用户协议（富文本） | string | 是 | 1-20000 字符 | - | - |
| 隐私政策（富文本） | string | 是 | 1-20000 字符 | - | - |
| 默认语言 | enum | 是 | `zh-CN` / `en-US` / `ja-JP` | `zh-CN` | - |
| 默认时区 | enum | 是 | 时区列表 | `Asia/Shanghai` | - |
| 默认货币 | enum | 是 | `CNY` / `USD` / `EUR` | `CNY` | - |
| 维护模式 | bool | 是 | - | false | - |
| 维护提示 | string | 否 | 0-200 字符 | - | - |
| 注册开关 | bool | 是 | - | true | - |
| 邀请注册 | bool | 是 | - | true | 需邀请码 |
| 邮箱验证 | bool | 是 | - | true | - |
| 手机验证 | bool | 是 | - | false | - |
| 实名认证 | bool | 是 | - | false | - |

**11.1.2 安全设置**

**字段：**

| 字段 | 类型 | 必填 | 校验 | 默认值 |
|------|------|------|------|-------|
| 密码最小长度 | int | 是 | 6-32 | 8 |
| 密码复杂度要求 | enum[] | 是 | `UPPER` / `LOWER` / `DIGIT` / `SPECIAL` | `[UPPER, LOWER, DIGIT]` |
| 密码有效期 | int | 否 | 0-365 天 | 0（永不过期） |
| 登录失败锁定次数 | int | 是 | 1-20 | 5 |
| 锁定时长 | int | 是 | 1-1440 分钟 | 30 |
| 二次验证强制开启 | bool | 是 | - | false |
| 二次验证方式 | enum[] | 是 | `TOTP` / `SMS` / `EMAIL` | `[TOTP]` |
| 会话超时 | int | 是 | 5-1440 分钟 | 60 |
| 并发会话数 | int | 是 | 1-10 | 3 |
| 异地登录提醒 | bool | 是 | - | true |
| 新设备验证 | bool | 是 | - | true |
| 退出全部设备 | bool | 是 | - | - | 用户自助 |
| API Key 加密算法 | enum | 是 | `ARGON2ID` / `BCRYPT` | `ARGON2ID` |
| API Key 显示前缀长度 | int | 是 | 4-16 | 16 |
| 单用户最大 API Key 数 | int | 是 | 1-50 | 10 |
| IP 信任有效期 | int | 是 | 1-720 小时 | 24 |
| 审计日志保留天数 | int | 是 | 30-3650 | 180 |
| 调用日志保留天数 | int | 是 | 7-365 | 90 |

**11.1.3 邮件设置**

**字段：**

| 字段 | 类型 | 必填 | 校验 | 默认值 |
|------|------|------|------|-------|
| SMTP 主机 | string | 是 | - | - |
| SMTP 端口 | int | 是 | 1-65535 | 465 |
| SMTP 用户名 | string | 是 | - | - |
| SMTP 密码 | string | 是 | 1-100 字符 | 加密存储 |
| 加密方式 | enum | 是 | `SSL` / `TLS` / `NONE` | `SSL` |
| 发件人邮箱 | string | 是 | email 格式 | - |
| 发件人名称 | string | 是 | 1-50 字符 | - |
| 测试收件人 | string | 否 | email 格式 | - |
| 每日发送上限 | int | 是 | 1-1000000 | 100000 |
| 启用邮件模板 | bool | 是 | - | true |

**11.1.4 短信设置**

**字段：**

| 字段 | 类型 | 必填 | 校验 | 默认值 |
|------|------|------|------|-------|
| 短信服务商 | enum | 是 | `ALIYUN` / `TENCENT` / `HUAWEI` / `TWILIO` | `ALIYUN` |
| AccessKey ID | string | 是 | - | 加密存储 |
| AccessKey Secret | string | 是 | - | 加密存储 |
| 短信签名 | string | 是 | 1-20 字符 | - |
| 验证码模板 ID | string | 是 | - | - |
| 通知模板 ID | string | 否 | - | - |
| 营销模板 ID | string | 否 | - | - |
| 每日发送上限 | int | 是 | 1-100000 | 10000 |
| 单手机号日上限 | int | 是 | 1-20 | 5 |

**11.1.5 支付设置**

**字段：**

| 字段 | 类型 | 必填 | 校验 | 默认值 |
|------|------|------|------|-------|
| 微信支付 AppID | string | 否 | - | - |
| 微信支付商户号 | string | 否 | - | - |
| 微信支付 API v3 密钥 | string | 否 | - | 加密存储 |
| 微信支付证书 | file | 否 | pem，≤ 2MB | - |
| 支付宝 AppID | string | 否 | - | - |
| 支付宝商户私钥 | string | 否 | - | 加密存储 |
| 支付宝公钥 | string | 否 | - | 加密存储 |
| 支付宝证书 | file | 否 | pem，≤ 2MB | - |
| Stripe Publishable Key | string | 否 | - | - |
| Stripe Secret Key | string | 否 | - | 加密存储 |
| Stripe Webhook Secret | string | 否 | - | 加密存储 |
| USDT 收款地址 | string | 否 | TRC20 格式 | - |
| 回调地址白名单 | string[] | 是 | URL 列表 | - |
| 支付超时 | int | 是 | 60-7200 秒 | 1800 |
| 最小充值金额 | decimal | 是 | 0.01-10000 | 1 |
| 最大充值金额 | decimal | 是 | 1-10000000 | 100000 |
| 自动对账 | bool | 是 | - | true |
| 对账时间 | time | 是 | - | 03:00 |

**11.1.6 存储设置**

**字段：**

| 字段 | 类型 | 必填 | 校验 | 默认值 |
|------|------|------|------|-------|
| 存储类型 | enum | 是 | `LOCAL` / `S3` / `OSS` / `COS` / `MINIO` | `LOCAL` |
| 本地存储路径 | string | 否 | - | `./uploads` |
| 访问域名 | string | 否 | URL 格式 | - |
| S3 区域 | string | 否 | - | - |
| S3 桶名 | string | 否 | - | - |
| S3 Access Key | string | 否 | - | 加密存储 |
| S3 Secret Key | string | 否 | - | 加密存储 |
| S3 端点 | string | 否 | URL 格式 | - |
| CDN 域名 | string | 否 | URL 格式 | - |
| 自动清理 | bool | 是 | - | true |
| 清理周期 | int | 是 | 1-365 天 | 30 |
| 单文件大小上限 | int | 是 | 1-1024 MB | 50 |

**11.1.7 第三方集成**

**字段：**

| 字段 | 类型 | 必填 | 校验 | 默认值 |
|------|------|------|------|-------|
| 百度统计 ID | string | 否 | - | - |
| Google Analytics ID | string | 否 | - | - |
| Sentry DSN | string | 否 | URL 格式 | - |
| 客服系统 | enum | 否 | `INTERCOM` / `ZENDESK` / `CRISP` | - |
| 客服系统 Key | string | 否 | - | 加密存储 |
| 推送服务 | enum | 否 | `BARK` / `PUSHPLUS` / `TELEGRAM` | - |
| 推送 Token | string | 否 | - | 加密存储 |
| Webhook URL | string | 否 | URL 格式 | - |
| Webhook Secret | string | 否 | - | 加密存储 |

**11.1.8 限流配置**

**字段：**

| 字段 | 类型 | 必填 | 校验 | 默认值 |
|------|------|------|------|-------|
| 全局 QPS 限制 | int | 是 | 1-100000 | 10000 |
| 单用户 QPS 限制 | int | 是 | 1-10000 | 100 |
| 单 IP QPS 限制 | int | 是 | 1-10000 | 1000 |
| 单 API Key QPS 限制 | int | 是 | 1-10000 | 500 |
| 单 API Key 日请求上限 | int | 是 | 0-100000000 | 0（无限） |
| 限流算法 | enum | 是 | `TOKEN_BUCKET` / `LEAKY_BUCKET` / `SLIDING_WINDOW` | `TOKEN_BUCKET` |
| 超限响应 | int | 是 | 400-599 | 429 |
| 超限提示 | string | 是 | 0-200 字符 | - |

**保存按钮：**
- 全部 Tab 顶部有"保存"按钮
- 切换 Tab 时若有未保存修改，弹确认对话框

---

### 11.2 操作日志

**路径：** `/admin/operation-logs`
**权限点：** `audit:list`
**菜单层级：** 系统中心 / 操作日志
**默认 data scope：** ALL

**页面布局：**
- 顶部 KPI：今日操作数 / 失败操作 / 异常登录 / 数据导出
- 顶部筛选区
- 中部表格
- 底部：分页器

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 日志 ID | string | 是 | - | `OperationLog.id` | - |
| 操作人 | string | 是 | - | `User.username` | 链接 |
| 角色 | string | 是 | - | `User.role` | - |
| 模块 | enum | 是 | `USER` / `ORDER` / `MODEL` / `CHANNEL` / `ANNOUNCEMENT` / `TICKET` / `PROMOTION` / `RISK` / `SETTINGS` / `AUTH` | `OperationLog.module` | - |
| 操作 | enum | 是 | `CREATE` / `READ` / `UPDATE` / `DELETE` / `LOGIN` / `LOGOUT` / `EXPORT` / `IMPORT` / `BATCH` | `OperationLog.action` | - |
| 资源类型 | string | 是 | - | `OperationLog.resource_type` | 实体名 |
| 资源 ID | string | 是 | - | `OperationLog.resource_id` | 链接 |
| 描述 | string | 是 | - | `OperationLog.description` | - |
| IP | string | 是 | - | `OperationLog.ip` | - |
| 位置 | string | 否 | - | 派生 | - |
| User-Agent | string | 是 | - | `OperationLog.user_agent` | 截断 |
| 请求方法 | enum | 否 | `GET` / `POST` / `PUT` / `DELETE` / `PATCH` | `OperationLog.method` | - |
| 请求路径 | string | 否 | - | `OperationLog.path` | - |
| 请求参数 | json | 否 | - | `OperationLog.request_body` | 脱敏 |
| 响应状态 | int | 是 | - | `OperationLog.status_code` | 颜色 |
| 耗时 | int | 是 | - | `OperationLog.duration` | 毫秒 |
| 结果 | enum | 是 | `SUCCESS` / `FAILURE` | `OperationLog.result` | 颜色 |
| 错误信息 | string | 否 | - | `OperationLog.error` | - |
| 时间 | datetime | 是 | - | `OperationLog.created_at` | - |

**筛选区：**
- 关键字（操作人 / 资源 ID / 描述）
- 模块
- 操作
- 资源类型
- 结果
- 状态码
- 时间范围
- IP

**操作列：**
- 查看详情
- 复制为 Markdown
- 查看请求详情

**详情 Modal 字段：**
- 基础信息（同上）
- 请求参数（完整 JSON）
- 响应数据（完整 JSON）
- 变更前后对比（仅 UPDATE 操作）
- 链路追踪 ID

**导出：**
- 导出范围：当前筛选条件
- 导出格式：CSV / Excel / JSON
- 包含字段：可勾选
- 导出条数上限：100000
- 导出操作本身记录到日志

**KPI 卡片字段：**

| 卡片 | 字段 | 来源 |
|------|------|------|
| 今日操作数 | int | `count(OperationLog where date=today)` |
| 失败操作 | int | `count(OperationLog where result=FAILURE and date=today)` |
| 异常登录 | int | `count(OperationLog where action=LOGIN and result=FAILURE)` |
| 数据导出 | int | `count(OperationLog where action=EXPORT)` |

**分页：** 50/100
**排序：** 时间（默认倒序）

---

### 11.3 调用日志

**路径：** `/admin/request-logs`
**权限点：** `requestlog:list`
**菜单层级：** 系统中心 / 调用日志
**默认 data scope：** ALL

**页面布局：**
- 顶部 KPI：今日请求 / 成功请求 / 失败请求 / 平均延迟 / 总消耗 Token
- 顶部筛选区
- 中部表格
- 底部：分页器

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 日志 ID | string | 是 | - | `RequestLog.id` | 链接到详情 |
| 链路 ID | string | 是 | - | `RequestLog.trace_id` | 复制 |
| 请求时间 | datetime | 是 | - | `RequestLog.created_at` | - |
| 用户 | string | 是 | - | `User.username` | 链接 |
| API Key | string | 是 | - | `ApiKey.prefix` | 链接 |
| 模型 | string | 是 | - | `Model.name` | 链接 |
| 提供商 | string | 是 | - | `Provider.name` | - |
| 渠道 | string | 否 | - | `Channel.name` | 链接 |
| 端点 | string | 是 | - | `RequestLog.endpoint` | `/v1/chat/completions` |
| 方法 | enum | 是 | - | `RequestLog.method` | - |
| 流式 | bool | 是 | - | `RequestLog.is_stream` | ✓/✗ |
| 请求大小 | int | 是 | - | `RequestLog.request_size` | 字节 |
| 响应大小 | int | 是 | - | `RequestLog.response_size` | 字节 |
| 输入 Token | int | 是 | - | `RequestLog.prompt_tokens` | - |
| 输出 Token | int | 是 | - | `RequestLog.completion_tokens` | - |
| 总 Token | int | 是 | - | 派生 | - |
| 消耗金额 | decimal | 是 | - | `RequestLog.cost` | 元 |
| 输入延迟 | int | 是 | - | `RequestLog.ttft` | 毫秒，首 token |
| 总延迟 | int | 是 | - | `RequestLog.duration` | 毫秒 |
| HTTP 状态 | int | 是 | - | `RequestLog.status_code` | 颜色 |
| 错误类型 | enum | 否 | `RATE_LIMIT` / `AUTH` / `INVALID` / `UPSTREAM` / `TIMEOUT` / `INTERNAL` | `RequestLog.error_type` | - |
| 错误信息 | string | 否 | - | `RequestLog.error` | 截断 |
| IP | string | 是 | - | `RequestLog.ip` | - |
| User-Agent | string | 是 | - | `RequestLog.user_agent` | 截断 |

**筛选区：**
- 关键字（链路 ID / 用户 / API Key）
- 模型
- 提供商
- 端点
- 流式
- 状态码
- 错误类型
- 时间范围
- Token 范围
- 延迟范围
- IP

**操作列：**
- 查看详情
- 复制链路 ID
- 重放请求（仅失败请求，二次确认）
- 查看同链路

**详情页 `/admin/request-logs/[id]`:**

**概览 Tab：**
- 基础信息（同上）
- 完整请求 Headers
- 完整请求 Body（脱敏）
- 完整响应 Body（脱敏）
- 完整响应 Headers

**链路 Tab：**
- 链路追踪树（Trace + Span）
- 各阶段耗时分布

**用户上下文 Tab：**
- 用户信息
- 余额扣减
- 同一用户最近 10 次请求

**导出：**
- 同操作日志

**KPI 卡片字段：**

| 卡片 | 字段 | 来源 |
|------|------|------|
| 今日请求 | int | `count(RequestLog where date=today)` |
| 成功请求 | int | `count(RequestLog where status=2xx and date=today)` |
| 失败请求 | int | `count(RequestLog where status>=4xx and date=today)` |
| 平均延迟 | int | `avg(RequestLog.duration)` |
| 总消耗 Token | int | `sum(prompt_tokens + completion_tokens)` |

**分页：** 50/100
**排序：** 请求时间（默认倒序）/ 延迟 / Token

---

### 11.4 系统监控

**路径：** `/admin/monitor`
**权限点：** `monitor:list`
**菜单层级：** 系统中心 / 系统监控
**默认 data scope：** ALL

**页面布局：**
- 顶部 Tab：服务状态 / 资源监控 / 数据库 / 缓存 / 队列 / 任务
- 中部卡片区：服务实例状态 / 关键指标 / 告警信息
- 底部图表区：实时 / 24h / 7d / 30d 切换

**11.4.1 服务状态**

**服务实例卡片字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 实例 ID | string | 是 | - | `ServiceInstance.id` | - |
| 服务名 | string | 是 | - | `ServiceInstance.name` | - |
| 版本 | string | 是 | - | `ServiceInstance.version` | - |
| 主机 | string | 是 | - | `ServiceInstance.host` | - |
| 端口 | int | 是 | - | `ServiceInstance.port` | - |
| 状态 | enum | 是 | `UP` / `DOWN` / `DEGRADED` / `STARTING` / `STOPPING` | `ServiceInstance.status` | 颜色 |
| CPU 使用率 | float | 是 | - | 实时 | 百分比 |
| 内存使用率 | float | 是 | - | 实时 | 百分比 |
| 磁盘使用率 | float | 是 | - | 实时 | 百分比 |
| 网络入流量 | int | 是 | - | 实时 | KB/s |
| 网络出流量 | int | 是 | - | 实时 | KB/s |
| 活跃连接 | int | 是 | - | 实时 | - |
| 启动时间 | datetime | 是 | - | `ServiceInstance.started_at` | - |
| 心跳时间 | datetime | 是 | - | `ServiceInstance.heartbeat_at` | - |

**11.4.2 资源监控**

**图表区：**
- CPU 使用率（多实例折线图）
- 内存使用率
- 磁盘使用率
- 磁盘 IO
- 网络流量
- 负载（Load Average）

**11.4.3 数据库监控**

**PostgreSQL 监控字段：**

| 字段 | 类型 | 来源 |
|------|------|------|
| 连接数 | int | 实时 |
| 活跃连接 | int | 实时 |
| 慢查询数 | int | 1h 内 |
| QPS | int | 实时 |
| TPS | int | 实时 |
| 复制延迟 | int | 秒 |
| 表大小 Top 10 | array | 实时 |
| 索引使用率 | float | 实时 |
| 缓存命中率 | float | 实时 |
| 锁等待 | int | 实时 |

**Prisma 监控字段：**

| 字段 | 类型 | 来源 |
|------|------|------|
| 平均查询耗时 | int | 毫秒 |
| 慢查询列表 | array | - |
| 连接池使用率 | float | - |
| 错误率 | float | - |

**11.4.4 缓存监控（Redis）**

**字段：**

| 字段 | 类型 | 来源 |
|------|------|------|
| 内存使用 | int | 字节 |
| 内存使用率 | float | - |
| 连接数 | int | - |
| 命中率 | float | - |
| 击穿率 | float | - |
| Key 数量 | int | - |
| 过期 Key 数 | int | - |
| 平均响应时间 | int | 微秒 |
| 慢查询 | array | - |
| 大 Key Top 10 | array | - |

**11.4.5 队列监控（BullMQ）**

**字段：**

| 字段 | 类型 | 来源 |
|------|------|------|
| 队列名 | string | - |
| 等待中 | int | - |
| 活跃中 | int | - |
| 已完成 | int | - |
| 失败 | int | - |
| 延迟 | int | - |
| 优先级 | array | - |
| Worker 数 | int | - |
| 平均处理时间 | int | 毫秒 |

**11.4.6 定时任务**

**表格字段：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 任务 ID | string | 是 | - | `ScheduledTask.id` | - |
| 任务名 | string | 是 | - | `ScheduledTask.name` | - |
| Cron 表达式 | string | 是 | - | `ScheduledTask.cron` | - |
| 上次执行 | datetime | 否 | - | `ScheduledTask.last_run_at` | - |
| 上次结果 | enum | 否 | `SUCCESS` / `FAILURE` | - | 颜色 |
| 上次耗时 | int | 否 | - | - | 毫秒 |
| 下次执行 | datetime | 是 | - | `ScheduledTask.next_run_at` | - |
| 状态 | enum | 是 | `ACTIVE` / `PAUSED` / `DISABLED` | - | - |
| 失败重试 | int | 是 | - | - | - |

**操作列：**
- 立即执行
- 暂停 / 启用
- 查看历史
- 编辑 Cron

**11.4.7 告警信息**

**告警规则配置：**
- 指标（如：CPU > 80%）
- 比较符（> / < / ==）
- 阈值
- 持续时长
- 通知渠道（邮件 / 短信 / Webhook）

**告警事件列表：**

| 字段 | 类型 | 必填 | 校验 | 来源 | 备注 |
|------|------|------|------|------|------|
| 告警 ID | string | 是 | - | `AlertEvent.id` | - |
| 规则 | string | 是 | - | `AlertEvent.rule_name` | - |
| 指标 | string | 是 | - | `AlertEvent.metric` | - |
| 当前值 | string | 是 | - | `AlertEvent.value` | - |
| 阈值 | string | 是 | - | `AlertEvent.threshold` | - |
| 严重度 | enum | 是 | `INFO` / `WARNING` / `ERROR` / `CRITICAL` | `AlertEvent.severity` | 颜色 |
| 状态 | enum | 是 | `FIRING` / `RESOLVED` / `ACKNOWLEDGED` | `AlertEvent.status` | - |
| 触发时间 | datetime | 是 | - | `AlertEvent.fired_at` | - |
| 恢复时间 | datetime | 否 | - | `AlertEvent.resolved_at` | - |
| 处理人 | string | 否 | - | `User.username` | - |

**操作列：** 确认告警 / 静默（1h / 4h / 24h） / 查看历史

**11.4.8 健康检查**

**路径：** `/admin/monitor/health`

**字段：**
- 各服务健康状态（UP / DOWN）
- 数据库连接测试
- Redis 连接测试
- 外部依赖（支付 / 短信 / 邮件）连通性
- 最后检查时间

**分页：** 不分页
**实时刷新：** 5s / 10s / 30s / 关闭

---

## 12. 认证流程

### 12.1 登录

**路径：** `/admin/login`
**权限点：** 无（公开页面）
**适用范围：** 所有 Admin 角色

**页面布局：**
- 左侧：平台 Logo + 平台名 + 介绍
- 右侧：登录卡片

**登录卡片字段：**

| 字段 | 类型 | 必填 | 校验 | 默认值 |
|------|------|------|------|-------|
| 用户名 / 邮箱 | string | 是 | 1-100 字符 | - |
| 密码 | password | 是 | 1-100 字符 | - |
| 二次验证代码 | string | 否 | 6 位数字 | - |
| 记住我 | bool | 否 | - | false |
| 验证码 | string | 否 | 4 位字符 | - |
| 登录来源 | enum | 否 | `WEB` / `MOBILE` / `API` | `WEB` |

**登录流程：**
```
1. 用户输入用户名 / 邮箱 + 密码
2. 若启用图形验证码：先校验图形验证码
3. 后端校验用户名 + 密码
4. 若密码错误：记录失败次数，超限锁定
5. 若用户启用 2FA：返回"需要二次验证"，前端弹出输入框
6. 用户输入 TOTP / 短信 / 邮箱验证码
7. 后端校验验证码
8. 校验通过：生成 Access Token + Refresh Token
9. 写入登录日志
10. 跳转至 /admin 或上次访问页
```

**登录失败处理：**
- 连续失败 1-4 次：返回通用错误"用户名或密码错误"
- 连续失败达到锁定阈值：账号锁定指定时长，提示"账号已锁定，请 X 分钟后重试"
- 异常 IP 登录：触发风控事件

**登录成功处理：**
- 写入 `OperationLog`（action=LOGIN, result=SUCCESS）
- 写入 `LoginLog`（包含 IP、UA、位置、设备指纹）
- 推送登录通知（若开启异地登录提醒且为新设备 / 新位置）
- 单点登录：踢出其他设备（若开启"单点登录"）

**Token 机制：**
| Token 类型 | 存储 | 有效期 | 用途 |
|-----------|------|--------|------|
| Access Token | 内存（HttpOnly Cookie 或 LocalStorage） | 15 分钟 | API 请求 |
| Refresh Token | HttpOnly Cookie | 7 天 | 刷新 Access Token |
| Remember Me Token | HttpOnly Cookie | 30 天 | 自动登录 |

**Token 刷新机制：**
- Access Token 过期前 5 分钟：自动调用 /auth/refresh
- Refresh Token 过期：强制重新登录

**错误提示：**
- 用户名或密码错误
- 账号已锁定
- 账号已停用
- 账号未激活
- 二次验证代码错误
- 二次验证已过期
- 验证码错误
- 异地登录需要二次验证

---

### 12.2 注册

**路径：** `/admin/register`（仅当平台开启"开放注册"时启用）
**权限点：** 无（公开页面）
**适用范围：** 新用户

**注册方式：**
- 邮箱注册
- 手机号注册（若开启）
- 邀请码注册（若开启）

**注册字段：**

| 字段 | 类型 | 必填 | 校验 | 默认值 |
|------|------|------|------|-------|
| 用户名 | string | 是 | 4-20 字符，字母数字下划线，唯一 | - |
| 邮箱 | string | 是 | email 格式，唯一 | - |
| 邮箱验证码 | string | 是 | 6 位数字 | - |
| 手机号 | string | 条件 | 手机号格式，唯一 | - |
| 手机验证码 | string | 条件 | 6 位数字 | - |
| 密码 | password | 是 | 符合密码强度 | - |
| 确认密码 | password | 是 | 与密码一致 | - |
| 邀请码 | string | 条件 | 8-16 位 | - |
| 用户协议 | bool | 是 | 必须勾选 | false |
| 隐私政策 | bool | 是 | 必须勾选 | false |
| 图形验证码 | string | 条件 | 4 位字符 | - |

**注册流程：**
```
1. 用户填写注册表单
2. 实时校验：用户名 / 邮箱是否已存在
3. 用户点击"获取验证码"：发送邮件 / 短信（60s 倒计时）
4. 用户输入验证码
5. 用户点击"注册"
6. 后端校验所有字段
7. 创建用户（status=INACTIVE）
8. 发送激活邮件（若开启邮箱验证）
9. 提示"注册成功，请激活邮箱"
10. 跳转至登录页
```

**激活流程：**
```
1. 用户点击邮件中的激活链接
2. 跳转至 /admin/activate?token=xxx
3. 后端校验 token
4. 激活成功：设置 status=ACTIVE
5. 提示"激活成功，请登录"
```

**注册限制：**
- 同一 IP 每日注册上限：5
- 同一设备每日注册上限：3
- 同一手机号 / 邮箱每日发送验证码上限：5
- 黑名单 IP / 邮箱域名：禁止注册

---

### 12.3 重置密码

**路径：** `/admin/forgot-password`
**权限点：** 无（公开页面）

**页面布局：**
- 步骤 1：输入账号
- 步骤 2：身份验证
- 步骤 3：设置新密码
- 步骤 4：完成

**字段：**

**步骤 1 - 输入账号：**
| 字段 | 类型 | 必填 | 校验 |
|------|------|------|------|
| 用户名 / 邮箱 / 手机号 | string | 是 | 1-100 字符 |
| 图形验证码 | string | 是 | 4 位字符 |

**步骤 2 - 身份验证：**
| 字段 | 类型 | 必填 | 校验 |
|------|------|------|------|
| 邮箱验证码 / 短信验证码 | string | 是 | 6 位数字 |
| 二次验证代码（如有） | string | 条件 | 6 位数字 |

**步骤 3 - 设置新密码：**
| 字段 | 类型 | 必填 | 校验 |
|------|------|------|------|
| 新密码 | password | 是 | 符合密码强度 |
| 确认密码 | password | 是 | 与新密码一致 |

**步骤 4 - 完成：**
- 提示"密码重置成功"
- 自动跳转至登录页

**重置流程：**
```
1. 用户输入账号
2. 后端判断账号是否存在 / 找回方式
3. 返回可用的找回方式（邮箱 / 短信）
4. 用户选择找回方式
5. 发送验证码（60s 倒计时）
6. 用户输入验证码
7. 后端校验验证码
8. 用户输入新密码
9. 后端更新密码（加密存储）
10. 强制登出所有设备
11. 写入操作日志
12. 提示成功
```

**安全措施：**
- 同一账号每日找回密码次数：3
- 同一 IP 每日找回密码次数：10
- 验证码有效期：10 分钟
- 重置后强制登出所有设备
- 重置后通知用户（邮件 / 短信）

---

### 12.4 二次验证（2FA）设置

**路径：** `/admin/profile/2fa`
**权限点：** `profile:2fa:manage`
**适用范围：** 所有登录用户

**字段：**

| 字段 | 类型 | 必填 | 校验 | 默认值 |
|------|------|------|------|-------|
| 启用方式 | enum | 是 | `TOTP` / `SMS` / `EMAIL` | - |
| 手机号 | string | 条件 | 手机号格式 | - |
| 邮箱 | string | 条件 | email 格式 | - |
| TOTP 密钥 | string | 自动 | Base32 | - |
| 验证二维码 | image | 自动 | 二维码图片 | - |
| 当前密码 | password | 是 | - | - |
| 首次验证码 | string | 是 | 6 位数字 | - |

**启用 TOTP 流程：**
```
1. 用户点击"启用 TOTP"
2. 后端生成 TOTP 密钥
3. 前端展示二维码（otpauth:// 链接）
4. 用户使用 Google Authenticator / 1Password 扫描
5. 用户输入 6 位验证码
6. 后端校验
7. 校验通过：保存 TOTP 配置
8. 展示 8 组备用恢复码（一次性）
9. 用户保存备用恢复码
```

**备用恢复码：**
- 数量：8 组
- 格式：8 位字母数字，每组用 `-` 分隔
- 一次性使用
- 用尽后可重新生成（需重新认证）

**禁用 2FA 流程：**
```
1. 用户点击"禁用 2FA"
2. 输入当前密码
3. 输入当前 2FA 验证码
4. 后端校验
5. 禁用成功
```

---

### 12.5 登出

**路径：** `POST /auth/logout`
**权限点：** 已登录用户

**流程：**
```
1. 用户点击"登出"
2. 弹二次确认
3. 后端撤销 Refresh Token（加入黑名单）
4. 清除 Access Token
5. 清除本地存储
6. 跳转至 /admin/login
```

**强制登出（管理员）：**
- 路径：`/admin/users/[id]/force-logout`
- 权限：`user:update`
- 二次确认

---

## 13. 附录 A：字段汇总表

> 本附录汇总所有 Admin 后台涉及的核心实体字段，作为《03 数据库 Schema》设计的输入。字段类型映射 Prisma 数据类型。

### A.1 User 实体

| 字段 | Prisma 类型 | 必填 | 唯一 | 索引 | 说明 |
|------|-------------|------|------|------|------|
| id | String @id | 是 | 是 | PK | CUID |
| username | String | 是 | 是 | UQ | 4-20 字符 |
| email | String | 是 | 是 | UQ | email 格式 |
| phone | String? | 否 | 是 | UQ | 手机号格式 |
| password_hash | String | 是 | 否 | - | Argon2id |
| nickname | String? | 否 | 否 | - | 1-30 字符 |
| avatar | String? | 否 | 否 | - | URL |
| role | UserRole | 是 | 否 | IDX | 6 种角色 |
| user_group | UserGroup | 是 | 否 | IDX | 5 种用户组 |
| organization_id | String? | 否 | 否 | IDX | 外键 |
| department_id | String? | 否 | 否 | IDX | 外键 |
| status | UserStatus | 是 | 否 | IDX | 5 种状态 |
| email_verified | Boolean | 是 | 否 | - | - |
| phone_verified | Boolean | 是 | 否 | - | - |
| totp_secret | String? | 否 | 否 | - | Base32 |
| totp_enabled | Boolean | 是 | 否 | - | - |
| backup_codes | Json? | 否 | 否 | - | 数组 |
| last_login_at | DateTime? | 否 | 否 | IDX | - |
| last_login_ip | String? | 否 | 否 | - | - |
| failed_login_count | Int | 是 | 否 | - | - |
| locked_until | DateTime? | 否 | 否 | - | - |
| risk_score | Int | 是 | 否 | - | 0-100 |
| referrer_id | String? | 否 | 否 | IDX | 外键 |
| invite_code_id | String? | 否 | 否 | IDX | 外键 |
| created_at | DateTime | 是 | 否 | IDX | - |
| updated_at | DateTime | 是 | 否 | - | - |
| deleted_at | DateTime? | 否 | 否 | - | 软删 |

### A.2 ApiKey 实体

| 字段 | Prisma 类型 | 必填 | 唯一 | 索引 | 说明 |
|------|-------------|------|------|------|------|
| id | String @id | 是 | 是 | PK | CUID |
| user_id | String | 是 | 否 | IDX | 外键 |
| name | String | 是 | 否 | - | 1-50 字符 |
| prefix | String | 是 | 是 | UQ | 前 16 位 |
| hash | String | 是 | 否 | - | Argon2id 哈希 |
| key_group | String? | 否 | 否 | - | 1-50 字符 |
| scopes | Json | 是 | 否 | - | 数组 |
| rate_limit | Int? | 否 | 否 | - | QPS |
| daily_quota | Decimal? | 否 | 否 | - | 元 |
| total_quota | Decimal? | 否 | 否 | - | 元 |
| used_amount | Decimal | 是 | 否 | - | 元 |
| expires_at | DateTime? | 否 | 否 | - | - |
| last_used_at | DateTime? | 否 | 否 | - | - |
| status | ApiKeyStatus | 是 | 否 | IDX | 4 种状态 |
| ip_whitelist | Json? | 否 | 否 | - | 数组 |
| created_at | DateTime | 是 | 否 | IDX | - |
| updated_at | DateTime | 是 | 否 | - | - |
| revoked_at | DateTime? | 否 | 否 | - | - |
| revoked_reason | String? | 否 | 否 | - | - |

### A.3 Model 实体

| 字段 | Prisma 类型 | 必填 | 唯一 | 索引 | 说明 |
|------|-------------|------|------|------|------|
| id | String @id | 是 | 是 | PK | CUID |
| provider_id | String | 是 | 否 | IDX | 外键 |
| name | String | 是 | 是 | UQ | 模型标识 |
| display_name | String | 是 | 否 | - | 显示名 |
| description | String? | 否 | 否 | - | 描述 |
| max_context | Int | 是 | 否 | - | tokens |
| max_output | Int? | 否 | 否 | - | tokens |
| supports_streaming | Boolean | 是 | 否 | - | - |
| supports_tools | Boolean | 是 | 否 | - | - |
| supports_vision | Boolean | 是 | 否 | - | - |
| supports_audio | Boolean | 是 | 否 | - | - |
| supports_reasoning | Boolean | 是 | 否 | - | - |
| input_price | Int | 是 | 否 | - | 分/百万 token |
| output_price | Int | 是 | 否 | - | 分/百万 token |
| cached_price | Int? | 否 | 否 | - | 分/百万 token |
| reasoning_price | Int? | 否 | 否 | - | 分/百万 token |
| multiplier | Decimal | 是 | 否 | - | 倍率 |
| sort_order | Int | 是 | 否 | IDX | 排序 |
| status | ModelStatus | 是 | 否 | IDX | 3 种状态 |
| metadata | Json? | 否 | 否 | - | 扩展信息 |
| created_at | DateTime | 是 | 否 | IDX | - |
| updated_at | DateTime | 是 | 否 | - | - |

### A.4 Provider 实体

| 字段 | Prisma 类型 | 必填 | 唯一 | 索引 | 说明 |
|------|-------------|------|------|------|------|
| id | String @id | 是 | 是 | PK | CUID |
| name | String | 是 | 是 | UQ | 标识 |
| display_name | String | 是 | 否 | - | 显示名 |
| logo | String? | 否 | 否 | - | URL |
| website | String? | 否 | 否 | - | URL |
| api_base_url | String | 是 | 否 | - | - |
| auth_type | ProviderAuthType | 是 | 否 | - | 3 种 |
| status | ProviderStatus | 是 | 否 | IDX | 3 种 |
| sort_order | Int | 是 | 否 | - | 排序 |
| created_at | DateTime | 是 | 否 | - | - |
| updated_at | DateTime | 是 | 否 | - | - |

### A.5 Channel 实体

| 字段 | Prisma 类型 | 必填 | 唯一 | 索引 | 说明 |
|------|-------------|------|------|------|------|
| id | String @id | 是 | 是 | PK | CUID |
| provider_id | String | 是 | 否 | IDX | 外键 |
| name | String | 是 | 否 | - | 1-50 字符 |
| base_url | String | 是 | 否 | - | URL |
| weight | Int | 是 | 否 | - | 1-100 |
| priority | Int | 是 | 否 | - | 1-100 |
| status | ChannelStatus | 是 | 否 | IDX | 4 种 |
| health_check_url | String? | 否 | 否 | - | URL |
| health_check_interval | Int | 是 | 否 | - | 秒 |
| failure_threshold | Int | 是 | 否 | - | - |
| success_threshold | Int | 是 | 否 | - | - |
| retry_config | Json? | 否 | 否 | - | - |
| proxy_url | String? | 否 | 否 | - | URL |
| last_health_check_at | DateTime? | 否 | 否 | - | - |
| last_success_at | DateTime? | 否 | 否 | - | - |
| last_failure_at | DateTime? | 否 | 否 | - | - |
| consecutive_failures | Int | 是 | 否 | - | - |
| created_at | DateTime | 是 | 否 | IDX | - |
| updated_at | DateTime | 是 | 否 | - | - |

### A.6 ChannelApiKey 实体

| 字段 | Prisma 类型 | 必填 | 唯一 | 索引 | 说明 |
|------|-------------|------|------|------|------|
| id | String @id | 是 | 是 | PK | CUID |
| channel_id | String | 是 | 否 | IDX | 外键 |
| name | String | 是 | 否 | - | 1-50 字符 |
| api_key_hash | String | 是 | 否 | - | 哈希 |
| api_key_prefix | String | 是 | 否 | IDX | 前 8 位 |
| weight | Int | 是 | 否 | - | 1-100 |
| status | ChannelKeyStatus | 是 | 否 | IDX | 3 种 |
| last_used_at | DateTime? | 否 | 否 | - | - |
| used_count | Int | 是 | 否 | - | - |
| error_count | Int | 是 | 否 | - | - |
| rate_limit | Int? | 否 | 否 | - | - |
| expires_at | DateTime? | 否 | 否 | - | - |
| created_at | DateTime | 是 | 否 | - | - |
| updated_at | DateTime | 是 | 否 | - | - |

### A.7 Order 实体

| 字段 | Prisma 类型 | 必填 | 唯一 | 索引 | 说明 |
|------|-------------|------|------|------|------|
| id | String @id | 是 | 是 | PK | CUID |
| order_no | String | 是 | 是 | UQ | 自动生成 |
| user_id | String | 是 | 否 | IDX | 外键 |
| type | OrderType | 是 | 否 | IDX | 5 种 |
| amount | Decimal | 是 | 否 | - | 元 |
| discount_amount | Decimal | 是 | 否 | - | 元 |
| actual_amount | Decimal | 是 | 否 | - | 元 |
| currency | String | 是 | 否 | - | CNY / USD |
| payment_method | PaymentMethod? | 否 | 否 | IDX | 5 种 |
| payment_channel | String? | 否 | 否 | - | - |
| status | OrderStatus | 是 | 否 | IDX | 8 种 |
| plan_id | String? | 否 | 否 | IDX | 外键 |
| subscription_id | String? | 否 | 否 | IDX | 外键 |
| coupon_id | String? | 否 | 否 | - | 外键 |
| paid_at | DateTime? | 否 | 否 | - | - |
| expired_at | DateTime? | 否 | 否 | IDX | - |
| refunded_at | DateTime? | 否 | 否 | - | - |
| refund_amount | Decimal? | 否 | 否 | - | 元 |
| refund_reason | String? | 否 | 否 | - | - |
| invoice_id | String? | 否 | 否 | - | 外键 |
| metadata | Json? | 否 | 否 | - | - |
| created_at | DateTime | 是 | 否 | IDX | - |
| updated_at | DateTime | 是 | 否 | - | - |
| completed_at | DateTime? | 否 | 否 | - | - |

### A.8 UserBalance 实体

| 字段 | Prisma 类型 | 必填 | 唯一 | 索引 | 说明 |
|------|-------------|------|------|------|------|
| id | String @id | 是 | 是 | PK | CUID |
| user_id | String | 是 | 是 | UQ | 外键 |
| balance | Decimal | 是 | 否 | - | 元 |
| frozen_balance | Decimal | 是 | 否 | - | 元 |
| gift_balance | Decimal | 是 | 否 | - | 元 |
| total_recharged | Decimal | 是 | 否 | - | 元 |
| total_consumed | Decimal | 是 | 否 | - | 元 |
| total_refunded | Decimal | 是 | 否 | - | 元 |
| total_gifted | Decimal | 是 | 否 | - | 元 |
| credit_limit | Decimal | 是 | 否 | - | 元 |
| alert_threshold | Decimal | 是 | 否 | - | 元 |
| alert_enabled | Boolean | 是 | 否 | - | - |
| version | Int | 是 | 否 | - | 乐观锁 |
| created_at | DateTime | 是 | 否 | - | - |
| updated_at | DateTime | 是 | 否 | - | - |

### A.9 UserTransaction 实体

| 字段 | Prisma 类型 | 必填 | 唯一 | 索引 | 说明 |
|------|-------------|------|------|------|------|
| id | String @id | 是 | 是 | PK | CUID |
| transaction_no | String | 是 | 是 | UQ | 自动生成 |
| user_id | String | 是 | 否 | IDX | 外键 |
| type | TransactionType | 是 | 否 | IDX | 8 种 |
| direction | TransactionDirection | 是 | 否 | - | IN / OUT |
| amount | Decimal | 是 | 否 | - | 元 |
| balance_before | Decimal | 是 | 否 | - | 元 |
| balance_after | Decimal | 是 | 否 | - | 元 |
| related_order_id | String? | 否 | 否 | IDX | 外键 |
| related_request_id | String? | 否 | 否 | - | 外键 |
| description | String | 是 | 否 | - | - |
| operator_id | String? | 否 | 否 | - | 外键 |
| metadata | Json? | 否 | 否 | - | - |
| created_at | DateTime | 是 | 否 | IDX | - |

### A.10 RequestLog 实体

| 字段 | Prisma 类型 | 必填 | 唯一 | 索引 | 说明 |
|------|-------------|------|------|------|------|
| id | String @id | 是 | 是 | PK | CUID |
| trace_id | String | 是 | 否 | IDX | - |
| user_id | String | 是 | 否 | IDX | 外键 |
| api_key_id | String | 是 | 否 | IDX | 外键 |
| model_id | String | 是 | 否 | IDX | 外键 |
| provider_id | String | 是 | 否 | IDX | 外键 |
| channel_id | String? | 否 | 否 | IDX | 外键 |
| endpoint | String | 是 | 否 | IDX | - |
| method | String | 是 | 否 | - | - |
| is_stream | Boolean | 是 | 否 | - | - |
| request_body | Json? | 否 | 否 | - | 脱敏 |
| response_body | Json? | 否 | 否 | - | 脱敏 |
| request_headers | Json? | 否 | 否 | - | - |
| response_headers | Json? | 否 | 否 | - | - |
| request_size | Int | 是 | 否 | - | 字节 |
| response_size | Int | 是 | 否 | - | 字节 |
| prompt_tokens | Int | 是 | 否 | - | - |
| completion_tokens | Int | 是 | 否 | - | - |
| total_tokens | Int | 是 | 否 | - | - |
| cost | Decimal | 是 | 否 | IDX | 元 |
| ttft | Int? | 否 | 否 | - | 毫秒 |
| duration | Int | 是 | 否 | IDX | 毫秒 |
| status_code | Int | 是 | 否 | IDX | - |
| error_type | String? | 否 | 否 | - | - |
| error_message | String? | 否 | 否 | - | - |
| ip | String | 是 | 否 | IDX | - |
| user_agent | String | 是 | 否 | - | - |
| created_at | DateTime | 是 | 否 | IDX | - |

### A.11 Subscription 实体

| 字段 | Prisma 类型 | 必填 | 唯一 | 索引 | 说明 |
|------|-------------|------|------|------|------|
| id | String @id | 是 | 是 | PK | CUID |
| user_id | String | 是 | 否 | IDX | 外键 |
| plan_id | String | 是 | 否 | IDX | 外键 |
| status | SubscriptionStatus | 是 | 否 | IDX | 5 种 |
| started_at | DateTime | 是 | 否 | - | - |
| current_period_start | DateTime | 是 | 否 | - | - |
| current_period_end | DateTime | 是 | 否 | IDX | - |
| canceled_at | DateTime? | 否 | 否 | - | - |
| ended_at | DateTime? | 否 | 否 | - | - |
| trial_start | DateTime? | 否 | 否 | - | - |
| trial_end | DateTime? | 否 | 否 | - | - |
| cancel_at_period_end | Boolean | 是 | 否 | - | - |
| auto_renew | Boolean | 是 | 否 | - | - |
| metadata | Json? | 否 | 否 | - | - |
| created_at | DateTime | 是 | 否 | - | - |
| updated_at | DateTime | 是 | 否 | - | - |

### A.12 Coupon 实体

| 字段 | Prisma 类型 | 必填 | 唯一 | 索引 | 说明 |
|------|-------------|------|------|------|------|
| id | String @id | 是 | 是 | PK | CUID |
| code | String | 是 | 是 | UQ | - |
| name | String | 是 | 否 | - | - |
| type | CouponType | 是 | 否 | - | 3 种 |
| value | Decimal | 是 | 否 | - | - |
| min_amount | Decimal? | 否 | 否 | - | 元 |
| max_discount | Decimal? | 否 | 否 | - | 元 |
| total_quota | Int | 是 | 否 | - | - |
| used_count | Int | 是 | 否 | - | - |
| per_user_limit | Int | 是 | 否 | - | - |
| applicable_plans | Json? | 否 | 否 | - | - |
| applicable_user_groups | Json? | 否 | 否 | - | - |
| started_at | DateTime | 是 | 否 | - | - |
| expired_at | DateTime | 是 | 否 | IDX | - |
| status | CouponStatus | 是 | 否 | IDX | 4 种 |
| created_by | String | 是 | 否 | - | 外键 |
| created_at | DateTime | 是 | 否 | - | - |
| updated_at | DateTime | 是 | 否 | - | - |

### A.13 Ticket 实体

| 字段 | Prisma 类型 | 必填 | 唯一 | 索引 | 说明 |
|------|-------------|------|------|------|------|
| id | String @id | 是 | 是 | PK | CUID |
| ticket_no | String | 是 | 是 | UQ | - |
| user_id | String | 是 | 否 | IDX | 外键 |
| assignee_id | String? | 否 | 否 | IDX | 外键 |
| type | TicketType | 是 | 否 | - | - |
| priority | TicketPriority | 是 | 否 | IDX | - |
| status | TicketStatus | 是 | 否 | IDX | - |
| subject | String | 是 | 否 | - | - |
| description | String | 是 | 否 | - | - |
| related_order_id | String? | 否 | 否 | - | 外键 |
| related_user_id | String? | 否 | 否 | - | 外键 |
| related_api_key_id | String? | 否 | 否 | - | 外键 |
| attachments | Json? | 否 | 否 | - | - |
| sla_first_response | DateTime? | 否 | 否 | - | - |
| sla_resolve | DateTime? | 否 | 否 | - | - |
| first_response_at | DateTime? | 否 | 否 | - | - |
| resolved_at | DateTime? | 否 | 否 | - | - |
| closed_at | DateTime? | 否 | 否 | - | - |
| last_reply_at | DateTime | 是 | 否 | - | - |
| satisfaction_rating | Int? | 否 | 否 | - | 1-5 |
| satisfaction_comment | String? | 否 | 否 | - | - |
| created_at | DateTime | 是 | 否 | IDX | - |
| updated_at | DateTime | 是 | 否 | - | - |

### A.14 Announcement 实体

| 字段 | Prisma 类型 | 必填 | 唯一 | 索引 | 说明 |
|------|-------------|------|------|------|------|
| id | String @id | 是 | 是 | PK | CUID |
| title | String | 是 | 否 | - | - |
| subtitle | String? | 否 | 否 | - | - |
| type | AnnouncementType | 是 | 否 | - | - |
| priority | AnnouncementPriority | 是 | 否 | - | - |
| content | String | 是 | 否 | - | - |
| placements | AnnouncementPlacement[] | 是 | 否 | - | - |
| channels | AnnouncementChannel[] | 是 | 否 | - | - |
| target_user_groups | String[] | 是 | 否 | - | - |
| start_at | DateTime | 是 | 否 | IDX | - |
| end_at | DateTime | 是 | 否 | IDX | - |
| is_modal | Boolean | 是 | 否 | - | - |
| modal_duration | Int? | 否 | 否 | - | - |
| action_url | String? | 否 | 否 | - | - |
| action_text | String? | 否 | 否 | - | - |
| status | AnnouncementStatus | 是 | 否 | IDX | - |
| view_count | Int | 是 | 否 | - | - |
| click_count | Int | 是 | 否 | - | - |
| created_by | String | 是 | 否 | - | 外键 |
| created_at | DateTime | 是 | 否 | IDX | - |
| updated_at | DateTime | 是 | 否 | - | - |

### A.15 OperationLog 实体

| 字段 | Prisma 类型 | 必填 | 唯一 | 索引 | 说明 |
|------|-------------|------|------|------|------|
| id | String @id | 是 | 是 | PK | CUID |
| user_id | String | 是 | 否 | IDX | 外键 |
| username | String | 是 | 否 | - | 冗余 |
| role | String | 是 | 否 | - | 冗余 |
| module | String | 是 | 否 | IDX | - |
| action | String | 是 | 否 | IDX | - |
| resource_type | String | 是 | 否 | - | - |
| resource_id | String? | 否 | 否 | - | - |
| description | String | 是 | 否 | - | - |
| method | String? | 否 | 否 | - | - |
| path | String? | 否 | 否 | - | - |
| request_body | Json? | 否 | 否 | - | 脱敏 |
| response_body | Json? | 否 | 否 | - | 脱敏 |
| status_code | Int? | 否 | 否 | - | - |
| duration | Int? | 否 | 否 | - | 毫秒 |
| result | String | 是 | 否 | IDX | - |
| error | String? | 否 | 否 | - | - |
| ip | String | 是 | 否 | IDX | - |
| location | String? | 否 | 否 | - | - |
| user_agent | String | 是 | 否 | - | - |
| created_at | DateTime | 是 | 否 | IDX | - |

---

## 14. 附录 B：状态机

### B.1 User 状态机

```
                register
                    ↓
   (deleted) ← INACTIVE ← email/phone verify
                    ↓
              ACTIVE ─────→ LOCKED ─────→ ACTIVE
                ↓    ↑           ↓
                ↓    └── unlock  ↓ auto-unlock
                ↓               ↓
              FROZEN ──────────→ FROZEN_RELEASE
                ↓
                ↓ admin un-freeze
                ↓
              ACTIVE
                ↓
                ↓ soft delete
                ↓
              DELETED
```

**状态枚举：** `INACTIVE` / `ACTIVE` / `LOCKED` / `FROZEN` / `DELETED`

**转换规则：**

| From | To | 触发条件 | 操作人 |
|------|----|---------| -------|
| (none) | INACTIVE | 注册成功 | 系统 |
| INACTIVE | ACTIVE | 邮箱/手机验证 | 用户 |
| ACTIVE | LOCKED | 登录失败超限 | 系统 |
| LOCKED | ACTIVE | 锁定时间到期 | 系统 |
| LOCKED | ACTIVE | 手动解锁 | 管理员 |
| ACTIVE | FROZEN | 风控冻结 / 管理员冻结 | 管理员/系统 |
| FROZEN | ACTIVE | 解冻 | 管理员 |
| 任何 | DELETED | 软删 | 管理员 / 用户 |

### B.2 ApiKey 状态机

```
    (created) → ACTIVE ──→ REVOKED
                  ↓  ↑
                  ↓  └── reactivate
                SUSPENDED
                  ↓
                  ↓ admin unsuspend
                  ↓
                ACTIVE
                  ↓
                  ↓ expire
                  ↓
                EXPIRED
```

**状态枚举：** `ACTIVE` / `SUSPENDED` / `REVOKED` / `EXPIRED`

**转换规则：**

| From | To | 触发条件 | 操作人 |
|------|----|---------| -------|
| (none) | ACTIVE | 创建成功 | 用户/管理员 |
| ACTIVE | SUSPENDED | 风控暂停 / 异常使用 | 系统/管理员 |
| SUSPENDED | ACTIVE | 解除暂停 | 管理员 |
| ACTIVE | REVOKED | 撤销 | 用户/管理员 |
| ACTIVE | EXPIRED | 过期时间到 | 系统 |
| 任何 | REVOKED | 软删 | 管理员 |

### B.3 Order 状态机

```
   (created) → PENDING ──pay──→ PAID ──fulfill──→ FULFILLED ──complete──→ COMPLETED
                  ↓                                    ↓
                  ↓ cancel                             ↓ refund
                  ↓                                    ↓
               CANCELLED                          REFUNDING ──→ REFUNDED
                                                      ↓
                                                      ↓ partial refund
                                                      ↓
                                                  PARTIAL_REFUNDED
```

**状态枚举：** `PENDING` / `PAID` / `FULFILLED` / `COMPLETED` / `CANCELLED` / `REFUNDING` / `REFUNDED` / `PARTIAL_REFUNDED` / `FAILED`

**转换规则：**

| From | To | 触发条件 | 操作人 |
|------|----|---------| -------|
| (none) | PENDING | 创建订单 | 用户 |
| PENDING | PAID | 支付成功回调 | 系统 |
| PENDING | CANCELLED | 用户主动取消 / 超时 | 用户/系统 |
| PENDING | FAILED | 支付失败 | 系统 |
| PAID | FULFILLED | 充值到账 / 订阅激活 | 系统 |
| FULFILLED | COMPLETED | 订单完成（无后续服务） | 系统 |
| PAID / FULFILLED | REFUNDING | 申请退款 | 用户/管理员 |
| REFUNDING | REFUNDED | 退款成功 | 系统 |
| REFUNDING | PARTIAL_REFUNDED | 部分退款 | 管理员 |
| 任何非 PENDING | FAILED | 系统异常 | 系统 |

### B.4 Subscription 状态机

```
   (created) → ACTIVE ──cancel at period end──→ CANCELING ──period end──→ CANCELED
                  ↓
                  ↓ expire (no auto-renew)
                  ↓
                EXPIRED
                  ↓
                  ↓ admin pause
                  ↓
                PAUSED ──resume──→ ACTIVE
                  ↓
                  ↓ payment fail
                  ↓
                PAST_DUE ──retry success──→ ACTIVE
                              ↓
                              ↓ retry fail
                              ↓
                            EXPIRED
```

**状态枚举：** `TRIALING` / `ACTIVE` / `PAST_DUE` / `PAUSED` / `CANCELING` / `CANCELED` / `EXPIRED` / `INCOMPLETE`

**转换规则：**

| From | To | 触发条件 | 操作人 |
|------|----|---------| -------|
| (none) | TRIALING | 订阅试用 | 系统 |
| TRIALING | ACTIVE | 试用转付费 | 系统 |
| (none) | ACTIVE | 直接订阅 | 系统 |
| ACTIVE | CANCELING | 用户取消（期末生效） | 用户/管理员 |
| CANCELING | CANCELED | 当前周期结束 | 系统 |
| ACTIVE | PAUSED | 管理员暂停 | 管理员 |
| PAUSED | ACTIVE | 恢复订阅 | 管理员 |
| ACTIVE | PAST_DUE | 自动续费失败 | 系统 |
| PAST_DUE | ACTIVE | 补扣成功 | 系统 |
| PAST_DUE | EXPIRED | 重试用尽 | 系统 |
| ACTIVE | EXPIRED | 周期结束未续费 | 系统 |

### B.5 Ticket 状态机

```
   (created) → OPEN ──assign──→ PROCESSING ──reply──→ PENDING (waiting user)
                  ↓                 ↓                      ↓
                  ↓ cancel          ↓ resolve              ↓ user reply
                  ↓                 ↓                      ↓
               CANCELLED         RESOLVED ──close──→ CLOSED
                                     ↓                 ↑
                                     ↓ reopen          │
                                     └─────────────────┘
```

**状态枚举：** `OPEN` / `PENDING` / `PROCESSING` / `RESOLVED` / `CLOSED` / `CANCELLED`

**转换规则：**

| From | To | 触发条件 | 操作人 |
|------|----|---------| -------|
| (none) | OPEN | 提交工单 | 用户 |
| OPEN | PROCESSING | 客服受理 | 客服 |
| PROCESSING | PENDING | 等待用户回复 | 客服 |
| PENDING | PROCESSING | 用户回复 | 用户 |
| PROCESSING | RESOLVED | 标记已解决 | 客服 |
| RESOLVED | CLOSED | 关闭工单 | 客服/系统 |
| CLOSED | OPEN | 重新打开 | 用户/客服 |
| 任何非 CLOSED | CANCELLED | 取消工单 | 管理员 |

### B.6 Announcement 状态机

```
   (created) → DRAFT ──publish──→ ACTIVE ──time end──→ EXPIRED
                  │                  │                    ↓
                  │                  │ schedule           ↓ archive
                  │                  ↓                    ↓
                  │              SCHEDULED             ARCHIVED
                  │                  ↓
                  │              (time start)
                  │                  ↓
                  │              ACTIVE
                  │                  ↓
                  │              (撤回)
                  │                  ↓
                  │              DRAFT
                  ↓
               (delete)
```

**状态枚举：** `DRAFT` / `SCHEDULED` / `ACTIVE` / `EXPIRED` / `ARCHIVED`

**转换规则：**

| From | To | 触发条件 | 操作人 |
|------|----|---------| -------|
| (none) | DRAFT | 创建草稿 | 管理员 |
| DRAFT | SCHEDULED | 设置定时发布 | 管理员 |
| DRAFT | ACTIVE | 立即发布 | 管理员 |
| SCHEDULED | ACTIVE | 定时时间到 | 系统 |
| ACTIVE | DRAFT | 撤回 | 管理员 |
| ACTIVE | EXPIRED | 结束时间到 | 系统 |
| EXPIRED | ARCHIVED | 归档 | 管理员 |

### B.7 Channel 状态机

```
   (created) → ACTIVE ──health fail──→ DEGRADED ──threshold met──→ DOWN
                  ↑                          ↓
                  │                          ↓ recover
                  │                          ↓
                  └────────────────── ACTIVE
                                          ↓
                                       MAINTENANCE
                                          ↓
                                       (complete)
                                          ↓
                                        ACTIVE
```

**状态枚举：** `ACTIVE` / `DEGRADED` / `DOWN` / `MAINTENANCE` / `DISABLED`

**转换规则：**

| From | To | 触发条件 | 操作人 |
|------|----|---------| -------|
| (none) | ACTIVE | 创建并启用 | 管理员 |
| ACTIVE | DEGRADED | 健康检查失败 1-2 次 | 系统 |
| DEGRADED | DOWN | 连续失败达到阈值 | 系统 |
| DOWN | ACTIVE | 健康检查恢复 | 系统 |
| 任何 | MAINTENANCE | 进入维护 | 管理员 |
| MAINTENANCE | ACTIVE | 退出维护 | 管理员 |
| 任何 | DISABLED | 禁用 | 管理员 |

### B.8 Model 状态机

```
   (created) → ONLINE ──issue──→ OFFLINE ──fix──→ ONLINE
                  │
                  ↓ beta
                  ↓
                BETA ──stable──→ ONLINE
                  │
                  ↓ issue
                  ↓
                OFFLINE
```

**状态枚举：** `ONLINE` / `OFFLINE` / `BETA` / `DEPRECATED`

**转换规则：**

| From | To | 触发条件 | 操作人 |
|------|----|---------| -------|
| (none) | ONLINE | 上线 | 管理员 |
| ONLINE | OFFLINE | 紧急下线 | 管理员 |
| OFFLINE | ONLINE | 重新上线 | 管理员 |
| ONLINE | BETA | 转为测试 | 管理员 |
| BETA | ONLINE | 测试通过 | 管理员 |
| 任何 | DEPRECATED | 弃用 | 管理员 |

### B.9 RiskEvent 状态机

```
   (created) → PENDING ──review──→ CONFIRMED
                  │                    │
                  │                    │ 处置
                  │                    ↓
                  │              HANDLED
                  │                    │
                  │ 忽略               │ 撤销
                  ↓                    ↓
              IGNORED            IGNORED
```

**状态枚举：** `PENDING` / `CONFIRMED` / `IGNORED` / `AUTO_HANDLED`

**转换规则：**

| From | To | 触发条件 | 操作人 |
|------|----|---------| -------|
| (none) | PENDING | 风险事件触发 | 系统 |
| PENDING | CONFIRMED | 审核通过 | 管理员 |
| PENDING | IGNORED | 忽略 | 管理员 |
| PENDING | AUTO_HANDLED | 自动处置 | 系统 |
| CONFIRMED | HANDLED | 处置完成 | 管理员 |

### B.10 Withdrawal 状态机

```
   (created) → PENDING ──approve──→ APPROVED ──pay──→ PAID
                  │                     │              ↓
                  │ reject              ↓              ↓ fail
                  ↓                     ↓              ↓
               REJECTED              FAILED          FAILED
```

**状态枚举：** `PENDING` / `APPROVED` / `REJECTED` / `PAID` / `FAILED`

**转换规则：**

| From | To | 触发条件 | 操作人 |
|------|----|---------| -------|
| (none) | PENDING | 申请提现 | 用户 |
| PENDING | APPROVED | 审核通过 | 管理员 |
| PENDING | REJECTED | 审核拒绝 | 管理员 |
| APPROVED | PAID | 打款成功 | 系统/管理员 |
| APPROVED | FAILED | 打款失败 | 系统/管理员 |

---

## 15. 附录 C：权限矩阵

### C.1 角色定义

| 角色 | 角色代码 | 描述 | 默认 Data Scope |
|------|---------|------|-----------------|
| 超级管理员 | SUPER_ADMIN | 平台所有者，拥有所有权限 | ALL |
| 管理员 | ADMIN | 业务管理员，管理部门级数据 | ORGANIZATION |
| 运营 | OPERATOR | 日常运营，处理工单、公告等 | ORGANIZATION |
| 财务 | FINANCE | 财务相关，订单、退款、提现 | ORGANIZATION |
| 审计 | AUDITOR | 只读所有数据，含敏感信息 | ALL |
| 用户 | USER | 普通用户，仅看自己数据 | SELF |

### C.2 模块权限矩阵

> ✓ = 允许，✗ = 禁止，R = 只读，✱ = 二次确认

#### C.2.1 Dashboard

| 操作 | SUPER_ADMIN | ADMIN | OPERATOR | FINANCE | AUDITOR | USER |
|------|-------------|-------|----------|---------|---------|------|
| 查看 Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| 查看实时数据 | ✓ | ✓ | ✓ | ✓ | R | ✗ |
| 查看财务报表 | ✓ | ✓ | ✗ | ✓ | R | ✗ |
| 导出报表 | ✓ | ✓ | ✓ | ✓ | R | ✗ |

#### C.2.2 用户中心

| 操作 | SUPER_ADMIN | ADMIN | OPERATOR | FINANCE | AUDITOR | USER |
|------|-------------|-------|----------|---------|---------|------|
| 用户列表 | ✓ | R | R | R | R | ✗ |
| 用户详情 | ✓ | R | R | R | R | ✗ |
| 新建用户 | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| 编辑用户 | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| 启用/禁用用户 | ✓✱ | ✓✱ | ✗ | ✗ | ✗ | ✗ |
| 重置密码 | ✓✱ | ✓✱ | ✗ | ✗ | ✗ | ✗ |
| 调整余额 | ✓✱ | ✓✱ | ✗ | ✓✱ | ✗ | ✗ |
| 调整用户组 | ✓✱ | ✓✱ | ✗ | ✗ | ✗ | ✗ |
| 删除用户 | ✓✱ | ✗ | ✗ | ✗ | ✗ | ✗ |
| API Key 列表 | ✓ | R | R | R | R | ✗ |
| API Key 新建 | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| API Key 撤销 | ✓✱ | ✓✱ | ✗ | ✗ | ✗ | ✗ |
| 用户组管理 | ✓ | ✓ | ✗ | ✗ | R | ✗ |
| 角色管理 | ✓ | ✗ | ✗ | ✗ | R | ✗ |

#### C.2.3 订单中心

| 操作 | SUPER_ADMIN | ADMIN | OPERATOR | FINANCE | AUDITOR | USER |
|------|-------------|-------|----------|---------|---------|------|
| 订单列表 | ✓ | R | R | R | R | ✗ |
| 订单详情 | ✓ | R | R | R | R | ✗ |
| 订单搜索 | ✓ | ✓ | ✓ | ✓ | R | ✗ |
| 订单导出 | ✓ | ✓ | ✗ | ✓ | R | ✗ |
| 订单退款 | ✓✱ | ✓✱ | ✗ | ✓✱ | ✗ | ✗ |
| 强制完成 | ✓✱ | ✗ | ✗ | ✓✱ | ✗ | ✗ |
| 取消订单 | ✓✱ | ✓✱ | ✗ | ✓✱ | ✗ | ✗ |
| 充值订单处理 | ✓ | ✗ | ✗ | ✓ | R | ✗ |
| 退款审核 | ✓ | ✗ | ✗ | ✓ | R | ✗ |
| 优惠券列表 | ✓ | R | R | R | R | ✗ |
| 优惠券创建 | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| 优惠券发放 | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| 订阅列表 | ✓ | R | R | R | R | ✗ |
| 订阅详情 | ✓ | R | R | R | R | ✗ |
| 订阅取消 | ✓✱ | ✓✱ | ✗ | ✓✱ | ✗ | ✗ |
| 续费/升降级 | ✓✱ | ✓✱ | ✗ | ✓✱ | ✗ | ✗ |
| 发票审核 | ✓ | ✗ | ✗ | ✓ | R | ✗ |

#### C.2.4 模型中心

| 操作 | SUPER_ADMIN | ADMIN | OPERATOR | FINANCE | AUDITOR | USER |
|------|-------------|-------|----------|---------|---------|------|
| 模型列表 | ✓ | R | R | R | R | ✗ |
| 模型详情 | ✓ | R | R | R | R | ✗ |
| 模型创建 | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| 模型编辑 | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| 模型上线/下线 | ✓✱ | ✓✱ | ✗ | ✗ | ✗ | ✗ |
| 模型删除 | ✓✱ | ✗ | ✗ | ✗ | ✗ | ✗ |
| 提供商管理 | ✓ | ✓ | ✗ | ✗ | R | ✗ |
| 渠道列表 | ✓ | R | R | R | R | ✗ |
| 渠道详情 | ✓ | R | R | R | R | ✗ |
| 渠道创建 | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| 渠道编辑 | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| 渠道启用/禁用 | ✓✱ | ✓✱ | ✗ | ✗ | ✗ | ✗ |
| 渠道删除 | ✓✱ | ✗ | ✗ | ✗ | ✗ | ✗ |
| 渠道 API Key 管理 | ✓ | ✓ | ✗ | ✗ | R | ✗ |
| 价格查看 | ✓ | R | R | R | R | ✗ |
| 价格编辑 | ✓✱ | ✓✱ | ✗ | ✗ | ✗ | ✗ |
| 价格历史 | ✓ | R | R | R | R | ✗ |

#### C.2.5 运营中心

| 操作 | SUPER_ADMIN | ADMIN | OPERATOR | FINANCE | AUDITOR | USER |
|------|-------------|-------|----------|---------|---------|------|
| 公告列表 | ✓ | R | R | R | R | ✗ |
| 公告创建 | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| 公告编辑 | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| 公告发布 | ✓✱ | ✓✱ | ✓✱ | ✗ | ✗ | ✗ |
| 公告撤回 | ✓✱ | ✓✱ | ✓✱ | ✗ | ✗ | ✗ |
| 公告删除 | ✓✱ | ✓✱ | ✗ | ✗ | ✗ | ✗ |
| 工单列表（全部） | ✓ | R | R | R | R | ✗ |
| 工单受理 | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| 工单回复 | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| 工单转交 | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| 工单关闭 | ✓✱ | ✓✱ | ✓✱ | ✗ | ✗ | ✗ |
| 邀请码列表 | ✓ | R | R | R | R | ✗ |
| 邀请码创建 | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| 邀请码禁用 | ✓✱ | ✓✱ | ✓✱ | ✗ | ✗ | ✗ |
| 返佣规则管理 | ✓ | ✓ | ✗ | ✓ | R | ✗ |
| 提现审核 | ✓ | ✗ | ✗ | ✓ | R | ✗ |

#### C.2.6 安全中心

| 操作 | SUPER_ADMIN | ADMIN | OPERATOR | FINANCE | AUDITOR | USER |
|------|-------------|-------|----------|---------|---------|------|
| 风险事件列表 | ✓ | R | R | R | R | ✗ |
| 风险事件审核 | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| 风险规则管理 | ✓ | ✓ | ✗ | ✗ | R | ✗ |
| 批量处置 | ✓✱ | ✓✱ | ✗ | ✗ | ✗ | ✗ |
| 用户黑名单 | ✓ | ✓ | ✗ | ✗ | R | ✗ |
| IP 黑名单 | ✓ | ✓ | ✗ | ✗ | R | ✗ |
| 设备黑名单 | ✓ | ✓ | ✗ | ✗ | R | ✗ |
| 邮箱域名黑名单 | ✓ | ✓ | ✗ | ✗ | R | ✗ |
| IP 限制管理 | ✓ | ✓ | ✗ | ✗ | R | ✗ |
| IP 访问日志 | ✓ | R | R | R | R | ✗ |

#### C.2.7 系统中心

| 操作 | SUPER_ADMIN | ADMIN | OPERATOR | FINANCE | AUDITOR | USER |
|------|-------------|-------|----------|---------|---------|------|
| 系统设置查看 | ✓ | R | R | R | R | ✗ |
| 系统设置编辑 | ✓✱ | ✗ | ✗ | ✗ | ✗ | ✗ |
| 操作日志查看 | ✓ | R | R | R | R | ✗ |
| 操作日志导出 | ✓✱ | ✗ | ✗ | ✗ | R | ✗ |
| 调用日志查看 | ✓ | R | R | R | R | ✗ |
| 调用日志导出 | ✓✱ | ✓✱ | ✗ | ✗ | R | ✗ |
| 系统监控查看 | ✓ | R | R | R | R | ✗ |
| 服务重启 | ✓✱ | ✗ | ✗ | ✗ | ✗ | ✗ |
| 任务触发 | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| 告警确认 | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |

#### C.2.8 认证

| 操作 | SUPER_ADMIN | ADMIN | OPERATOR | FINANCE | AUDITOR | USER |
|------|-------------|-------|----------|---------|---------|------|
| 登录 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 登出 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 修改自己密码 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 启用 2FA | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 强制重置他人密码 | ✓✱ | ✓✱ | ✗ | ✗ | ✗ | ✗ |
| 强制登出他人 | ✓✱ | ✓✱ | ✗ | ✗ | ✗ | ✗ |

### C.3 数据权限（Data Scope）

| Scope | 说明 | 适用场景 |
|-------|------|---------|
| ALL | 查看所有数据 | 超级管理员、审计 |
| ORGANIZATION | 仅查看本组织数据 | 部门级管理员 |
| DEPARTMENT | 仅查看本部门数据 | 部门内运营 |
| SELF | 仅查看本人数据 | 用户本人 |

**Data Scope 应用规则：**
- 列表查询：自动注入 where 条件
- 详情查询：若不满足 scope，禁止访问
- 写入操作：scope 必须包含目标数据所属范围
- 跨 scope 操作：必须申请权限提升

### C.4 字段级权限

| 实体 | 字段 | ADMIN | OPERATOR | FINANCE | AUDITOR | USER |
|------|------|-------|----------|---------|---------|------|
| User | password_hash | ✗ | ✗ | ✗ | R | ✗ |
| User | totp_secret | ✗ | ✗ | ✗ | R | ✗ |
| User | email | R | R | R | R | R |
| User | phone | R | R | R | R | R |
| User | risk_score | R | ✗ | ✗ | R | ✗ |
| ApiKey | hash | ✗ | ✗ | ✗ | R | ✗ |
| ApiKey | prefix | R | R | R | R | R |
| Order | user_email | R | R | R | R | R |
| Order | amount | R | R | R | R | R |
| Order | refund_reason | ✗ | ✗ | R | R | R |
| UserBalance | balance | R | R | R | R | R |
| RequestLog | request_body | R | ✗ | ✗ | R | ✗ |
| RequestLog | response_body | R | ✗ | ✗ | R | ✗ |
| RequestLog | ip | R | R | R | R | R |
| OperationLog | request_body | R | ✗ | ✗ | R | ✗ |

### C.5 接口级权限（关键 API）

| API | SUPER_ADMIN | ADMIN | OPERATOR | FINANCE | AUDITOR | USER |
|-----|-------------|-------|----------|---------|---------|------|
| `POST /admin/users` | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| `DELETE /admin/users/:id` | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `POST /admin/users/:id/balance` | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| `POST /admin/orders/:id/refund` | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| `POST /admin/channels/:id/disable` | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| `PUT /admin/pricing/:id` | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| `POST /admin/announcements` | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| `POST /admin/tickets/:id/close` | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| `POST /admin/withdrawals/:id/approve` | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ |
| `POST /admin/blacklist/users` | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| `PUT /admin/settings` | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `GET /admin/operation-logs/export` | ✓ | ✗ | ✗ | ✗ | R | ✗ |
| `GET /admin/request-logs/export` | ✓ | ✓ | ✗ | ✗ | R | ✗ |
| `POST /admin/users/:id/force-logout` | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |

### C.6 二次确认权限

> 涉及资金、状态变更、不可逆操作的接口，必须二次确认。

| 操作 | 二次确认方式 | 备注 |
|------|-------------|------|
| 删除用户 | 输入用户名 + 原因 | - |
| 重置密码 | 输入当前管理员密码 | - |
| 调整余额 > 100 元 | 输入金额 + 原因 + 短信验证（可选） | - |
| 订单退款 | 输入退款金额 + 原因 | 部分退款必填 |
| 强制完成订单 | 输入订单号 | - |
| 模型下线 | 输入模型名 | - |
| 删除渠道 | 输入渠道名 | - |
| 调整价格 | 输入新价格 + 短信验证（可选） | - |
| 发布公告 | 预览 + 确认 | - |
| 关闭工单 | 输入关闭原因 | - |
| 提现审核 | 输入审核意见 | - |
| 用户拉黑 | 输入用户名 + 原因 | - |
| 批量处置风险 | 输入二次密码 | - |
| 编辑系统设置 | 输入管理员密码 | - |
| 操作日志导出 | 输入二次密码 | - |
| 调用日志导出 | 输入二次密码 | - |
| 强制登出他人 | 输入被登出用户名 | - |
| 服务重启 | 输入二次密码 + 服务名 | - |

### C.7 权限申请与审批

**权限提升申请：**
- 临时权限：有效期 1-24 小时
- 永久权限：需 SUPER_ADMIN 审批
- 紧急权限：需 2 名 ADMIN 联签

**审批流程：**
```
申请人提交 → 直接上级 → 部门负责人 → SUPER_ADMIN
                                          ↓
                                       同意/拒绝
                                          ↓
                                       通知申请人
```

---

## 16. 文档结束

| 字段 | 值 |
|------|----|
| 文档编号 | DOC-03-ADMIN-01 |
| 文档名称 | Admin 后台产品需求文档 (PRD) |
| 版本 | V1.0 |
| 状态 | 已评审 |
| 总章节数 | 16 章（含 3 个附录） |
| 下一步 | 《02 RBAC 设计》《03 数据库 Schema》《04 API 规范》 |

> 本文档为后续所有 Admin 后台相关设计（UI / DB / API / RBAC / 路由）的唯一产品输入。所有字段、操作、状态机、权限均已显式定义，无任何占位符、TODO 或模糊描述。




