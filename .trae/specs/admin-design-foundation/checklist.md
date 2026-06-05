# Checklist

> 检查点说明：每个检查点对应一个可验证的产物。Spec 阶段产物 = 文档，所以检查点围绕"文档是否覆盖 / 字段是否定义 / 流程是否清晰"展开。
> 任何 ❌ 都必须回退到对应 Task 修复，不允许带"❌ 残留"进入 Apply 阶段。

---

## 01-admin-prd.md 检查点

- [ ] 文档结构包含：背景 / 目标 / 用户角色 / 术语表 / 全局页面树 / 各中心详情 / 附录
- [ ] Dashboard 三页全部定义：系统概览（今日请求数 / Token / 收入 / 支出 / 利润 / 活跃用户 / 在线 API Key / 系统状态）、模型统计（GPT-5 / Claude / Gemini / DeepSeek / Qwen 占比）、渠道状态（OpenAI / Anthropic / Google / Azure / 阿里云 / 腾讯云 在线/异常/延迟/成功率）
- [ ] 用户列表字段齐全：ID / 用户名 / 邮箱 / 手机号 / 注册时间 / 注册 IP / 最后登录时间 / 最后登录 IP / 余额 / 状态 / 角色 / 用户组 / API Key 数量 / 今日消费 / 总消费 / 操作
- [ ] 用户列表操作按钮齐全：查看详情 / 编辑 / 充值 / 冻结 / 解冻 / 限制登录 / 重置密码 / API Key 管理 / 删除
- [ ] 用户详情页 Tabs 完整：基础信息 / 消费记录 / 订单记录 / API Key / 调用日志 / 登录日志 / 权限信息 / 企业信息
- [ ] 用户分组默认六组齐全：free / vip / enterprise / agent_lv1 / agent_lv2 / admin
- [ ] 用户分组字段齐全：组名称 / RPM / TPM / 允许模型 / 允许渠道 / 最大 Key 数 / 价格倍率 / 是否允许代理
- [ ] API Key 管理表格字段齐全：Key ID / 用户 / Key 名称 / 创建时间 / 到期时间 / 状态 / 允许模型 / RPM / TPM / 调用次数 / 消费金额
- [ ] API Key 详情 JSON 结构定义清晰：allowed_models / rpm / tpm / budget / ip_whitelist
- [ ] API Key 操作齐全：编辑 / 禁用 / 重置 / 查看日志 / 删除
- [ ] 订单管理字段齐全：订单号 / 用户 / 订单类型 / 支付方式 / 金额 / 状态 / 创建时间 / 完成时间
- [ ] 订单类型齐全：充值 / 订阅 / 套餐购买 / 人工充值
- [ ] 订单状态齐全：待支付 / 已支付 / 已退款 / 失败
- [ ] 充值记录字段齐全：用户 / 充值金额 / 赠送金额 / 支付方式 / 时间 / 状态
- [ ] 账单管理字段齐全：账单号 / 用户 / 模型 / 输入 Token / 输出 Token / 成本 / 售价 / 利润 / 时间
- [ ] 发票管理字段齐全：发票号 / 公司名称 / 税号 / 金额 / 状态 / 申请时间；状态含待审核 / 已开票 / 已驳回
- [ ] 模型管理字段齐全：模型名称 / 模型 ID / 供应商 / 状态 / 上下文长度 / 输入价格 / 输出价格 / 倍率 / 排序
- [ ] 模型管理操作齐全：新增模型 / 编辑模型 / 上下架 / 测试模型 / 删除模型
- [ ] 渠道管理字段齐全：名称 / Base URL / Key 数量 / 权重 / 成功率 / 状态
- [ ] 渠道管理子页齐全：API Key 池 / 轮询策略 / 测速 / 健康检查 / 失败重试
- [ ] 模型价格页面定义：模型 / 成本价 / 销售价 / 倍率 / 用户组价格（普通 / VIP / 企业）
- [ ] 系统设置拆分 Tabs：基础设置（站点名称 / Logo / SEO / 公告）、用户设置（注册 / 邮箱验证 / 邀请注册 / 默认余额）、支付设置（支付宝 / 微信 / Stripe / PayPal）、SMTP（Host / Port / User / Password）、Redis（Host / Password）
- [ ] 操作日志字段齐全：管理员 / 动作 / 对象 / IP / 时间
- [ ] 调用日志字段齐全：Request ID / 用户 / Key / 模型 / 渠道 / Token / 耗时 / 状态码 / 时间
- [ ] 调用日志详情示例 JSON：request_id / model / prompt_tokens / completion_tokens
- [ ] 系统监控三块：服务状态（Node / Redis / PostgreSQL / SQLite / SMTP）、资源监控（CPU / 内存 / 磁盘 / 网络）、请求监控（QPS / RPM / TPM / 成功率 / 错误率）
- [ ] 登录 / 注册 / 重置密码三流程定义完整，含流程图或步骤表
- [ ] 附录：所有页面字段汇总表（一张大表，可被 AI 直接查询）

## 02-rbac-design.md 检查点

- [x] 实体模型字段定义完整：User / Role / Permission / Menu / RolePermission / UserRole
- [x] 四类权限定义清晰：菜单权限 / 按钮权限 / API 权限 / 数据权限
- [x] 内置六角色权限矩阵完整：super_admin / admin / operator / finance / auditor / user
- [x] 鉴权链路定义清晰：Middleware(JWT) → Guard(Role) → Guard(Permission) → Handler
- [x] Admin 路由保护规则：`/admin/:path*` 未登录 → /login；非管理员 → /403；管理员 → 放行
- [x] 前端按钮级权限组件 `<Can permission="...">` 设计
- [x] 权限缓存策略：Redis 缓存 + TTL + 主动失效
- [x] Admin 无鉴权漏洞修复设计（Middleware + 后端 Guard 双保险）
- [x] 紧急预案：RBAC 锁死管理员 → 启动时自动恢复 super_admin 脚本

## 03-database-schema.md 检查点

- [ ] 新增表清单：roles / permissions / role_permissions / user_roles / menus / invoices / announcements / tickets / blacklist / ip_rules
- [ ] 每张新增表给出 Prisma model 片段（可直接复制）
- [ ] 现有表扩展清单：users 字段补全（手机号、注册 IP、最后登录 IP、企业 ID 等）
- [ ] api_keys 字段补全：allowed_models / RPM / TPM / budget / ip_whitelist / 到期时间
- [ ] orders 字段补全
- [ ] 与现有 `apps/backend/prisma/schema.prisma` 的 diff 分析
- [ ] 索引策略：高频查询字段（email / username / user_id / created_at / status）
- [ ] 外键与级联策略
- [ ] 分阶段 Migration 计划：每阶段一个 migration 文件
- [ ] Migration 命名规范遵循仓库既有约定

## 04-api-spec.md 检查点

- [ ] 统一规范：路径前缀 `/api/v1/admin`、统一响应 `{ code, message, data }`、分页参数、错误码
- [ ] 认证与会话接口：`/auth/login` `/auth/logout` `/auth/me` `/auth/change-password`
- [ ] Dashboard 接口：概览统计、模型占比、渠道状态
- [ ] 用户中心接口：用户 CRUD、用户分组 CRUD、API Key CRUD、用户详情聚合
- [ ] 订单中心接口：订单 CRUD、充值记录、账单查询、发票 CRUD
- [ ] 模型中心接口：模型 CRUD、渠道 CRUD、价格 CRUD、测速
- [ ] 运营中心接口：公告、工单、邀请码
- [ ] 安全中心接口：风控规则、黑名单、IP 限制
- [ ] 系统中心接口：系统设置 Tabs、SMTP、Redis、操作日志、调用日志、系统监控
- [ ] 所有接口标注：`@Roles` `@Permissions` 装饰器
- [ ] 所有接口标注：限流策略（登录/注册/重置密码敏感接口）
- [ ] Swagger Tag 与 Summary 命名规范
- [ ] DTO 基于 class-validator，包含校验规则

## 05-admin-ui-spec.md 检查点

- [ ] 整体布局：Sidebar + TopBar + Content + Footer
- [ ] 菜单结构与 PRD 五大中心对齐
- [ ] 列表页规范：筛选区、表格列、操作列、分页、批量操作
- [ ] 表单页规范：标签对齐、必填星号、错误提示、提交/取消
- [ ] 详情页规范：Tabs 分组
- [ ] Dashboard 卡片与图表选型：ECharts 或 Recharts，数据接口
- [ ] 状态颜色映射：成功 / 警告 / 错误 / 信息
- [ ] 加载 / 空 / 错误状态
- [ ] 主题、间距、字号、断点（最低 1280×800）

## 06-frontend-route-map.md 检查点

- [ ] Next.js App Router 路由表：路径 / 文件 / 权限点 / 菜单显示
- [ ] 菜单树结构：层级 / 图标 / 排序 / 折叠
- [ ] 动态路由：`/admin/users/[id]` `/admin/apikeys/[id]` 等
- [ ] 根 `middleware.ts` 设计：匹配 `/admin/:path*`、JWT 校验、跳转规则
- [ ] 面包屑生成规则
- [ ] 403 / 404 页面

## 07-integration-plan.md 检查点

- [ ] 6 个阶段范围与依赖关系清晰
- [ ] 阶段 1：RBAC + Middleware（优先，含 Admin 安全修复）
- [ ] 阶段 2：用户中心 + API Key 管理
- [ ] 阶段 3：订单中心 + 账单 + 充值 + 发票
- [ ] 阶段 4：模型中心 + 渠道管理 + 模型价格
- [ ] 阶段 5：运营中心 + 安全中心
- [ ] 阶段 6：系统中心 + Dashboard + 系统监控
- [ ] 每阶段风险、缓解、回滚、验收标准
- [ ] 紧急预案：RBAC 锁死管理员 → 启动时自动恢复 super_admin 脚本

## docs/README.md 更新检查点

- [ ] 文档结构树新增 `03-admin/` 章节
- [ ] 阅读指南"开发新功能"段落引用 `03-admin/`
- [ ] 版本状态表登记 7 份文档为 ✅ 完成

## 全局质量检查点

- [ ] 7 份文档均使用中文
- [ ] 文档与 `.ai/coding-rules.md` 文风一致
- [ ] 文档与 `.ai/system-prompt.md` "禁止事项"无冲突
- [ ] 文档无 TODO / Coming Soon / Placeholder 占位
- [ ] 文档无"待定 / TBD"模糊描述
- [ ] 文档可被 AI 直接消费（无歧义字段定义）
- [ ] 文档与现有 `docs/00-project` ~ `docs/06-devops` 体系衔接
