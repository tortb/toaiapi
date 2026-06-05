# Tasks

> 任务原则：本次 Spec 阶段**不写任何代码**，只产出 7 份设计文档 + 1 份安全修复设计。所有任务都是文档编写任务。
> 任务顺序：先有 PRD → 再有 RBAC → 再有 Schema → 再有 API → 再有 UI → 再有路由 → 最后有集成计划。后续任务以前序任务的产物为输入。

---

- [ ] Task 1: 编写 01-admin-prd.md（Admin 后台产品需求文档）
  - [ ] SubTask 1.1: 编写文档骨架（背景、目标、用户角色、术语表）
  - [ ] SubTask 1.2: 编写 Dashboard 三页（系统概览 / 模型统计 / 渠道状态）字段与交互
  - [ ] SubTask 1.3: 编写用户中心四页（用户列表 / 用户详情 / 用户分组 / API Key 管理）字段与操作
  - [ ] SubTask 1.4: 编写订单中心四页（订单管理 / 充值记录 / 账单管理 / 发票管理）字段与状态机
  - [ ] SubTask 1.5: 编写模型中心三页（模型管理 / 渠道管理 / 模型价格）字段与子页面
  - [ ] SubTask 1.6: 编写运营中心三页（公告管理 / 工单系统 / 邀请推广）字段
  - [ ] SubTask 1.7: 编写安全中心三页（风控中心 / 黑名单 / IP 限制）字段
  - [ ] SubTask 1.8: 编写系统中心四页（系统设置 Tabs / 操作日志 / 调用日志 / 系统监控）字段
  - [ ] SubTask 1.9: 编写登录 / 注册 / 重置密码完整流程图
  - [ ] SubTask 1.10: 附录：所有页面的字段汇总表（一页流）

- [x] Task 2: 编写 02-rbac-design.md（RBAC 权限系统设计）
  - [x] SubTask 2.1: 实体模型：User / Role / Permission / Menu / RolePermission / UserRole 字段定义
  - [x] SubTask 2.2: 权限四象限：菜单权限 / 按钮权限 / API 权限 / 数据权限
  - [x] SubTask 2.3: 内置六角色矩阵：super_admin / admin / operator / finance / auditor / user
  - [x] SubTask 2.4: 鉴权链路：Middleware(JWT) → Guard(Role) → Guard(Permission) → Handler
  - [x] SubTask 2.5: Admin 路由保护规则设计（/admin/:path* 的 Next.js Middleware）
  - [x] SubTask 2.6: 前端按钮级权限组件 `<Can permission="...">` 设计
  - [x] SubTask 2.7: 权限缓存策略：Redis 缓存 + TTL + 主动失效
  - [x] SubTask 2.8: Admin 无鉴权漏洞修复方案（Middleware + 后端 Guard 双保险）

- [ ] Task 3: 编写 03-database-schema.md（Admin 数据库 Schema 设计）
  - [ ] SubTask 3.1: 列出所有新增表（roles / permissions / role_permissions / user_roles / menus / invoices / announcements / tickets / blacklist / ip_rules 等）
  - [ ] SubTask 3.2: 列出所有现有表扩展（users / api_keys / orders / request_logs 等）
  - [ ] SubTask 3.3: 索引策略与外键级联策略
  - [ ] SubTask 3.4: 与现有 `apps/backend/prisma/schema.prisma` 的 diff 分析
  - [ ] SubTask 3.5: 分阶段 Migration 计划（每个 Apply 阶段一个 migration 文件）

- [ ] Task 4: 编写 04-api-spec.md（Admin API 规范）
  - [ ] SubTask 4.1: 通用规范：路径前缀 /api/v1/admin、统一响应、分页参数、错误码
  - [ ] SubTask 4.2: 认证与会话接口：`/auth/login` `/auth/logout` `/auth/me` `/auth/change-password`
  - [ ] SubTask 4.3: Dashboard 接口：概览统计、模型占比、渠道状态
  - [ ] SubTask 4.4: 用户中心接口：用户 CRUD、用户分组 CRUD、API Key CRUD、用户详情聚合
  - [ ] SubTask 4.5: 订单中心接口：订单 CRUD、充值记录、账单查询、发票 CRUD
  - [ ] SubTask 4.6: 模型中心接口：模型 CRUD、渠道 CRUD、价格 CRUD、测速
  - [ ] SubTask 4.7: 运营中心接口：公告、工单、邀请码
  - [ ] SubTask 4.8: 安全中心接口：风控规则、黑名单、IP 限制
  - [ ] SubTask 4.9: 系统中心接口：系统设置 Tabs、SMTP、Redis、操作日志、调用日志、系统监控
  - [ ] SubTask 4.10: 限流策略：登录、注册、密码重置等敏感接口的限流规则

- [ ] Task 5: 编写 05-admin-ui-spec.md（Admin UI 规范）
  - [ ] SubTask 5.1: 整体布局：Sidebar + TopBar + Content + Footer
  - [ ] SubTask 5.2: 菜单结构（与 PRD 五大中心对齐）
  - [ ] SubTask 5.3: 列表页规范：筛选区、表格列、操作列、分页、批量操作
  - [ ] SubTask 5.4: 表单页规范：标签对齐、必填星号、错误提示、提交/取消
  - [ ] SubTask 5.5: 详情页规范：Tabs 分组
  - [ ] SubTask 5.6: Dashboard 卡片与图表选型（ECharts / Recharts）
  - [ ] SubTask 5.7: 状态颜色映射、加载/空/错误状态
  - [ ] SubTask 5.8: 主题、间距、字号、断点

- [ ] Task 6: 编写 06-frontend-route-map.md（前端路由与菜单映射）
  - [ ] SubTask 6.1: Next.js App Router 路由表（路径 / 文件 / 权限点 / 菜单显示）
  - [ ] SubTask 6.2: 菜单树结构（层级 / 图标 / 排序 / 折叠）
  - [ ] SubTask 6.3: 动态路由设计：`/admin/users/[id]` `/admin/apikeys/[id]` 等
  - [ ] SubTask 6.4: 根 `middleware.ts` 设计：匹配 `/admin/:path*`、JWT 校验、跳转规则
  - [ ] SubTask 6.5: 面包屑生成规则
  - [ ] SubTask 6.6: 403 / 404 页面

- [ ] Task 7: 编写 07-integration-plan.md（前后端对接与实施计划）
  - [ ] SubTask 7.1: 6 个阶段的范围、产出物、依赖关系
  - [ ] SubTask 7.2: 阶段 1：RBAC + Middleware（优先，含 Admin 安全修复）
  - [ ] SubTask 7.3: 阶段 2：用户中心 + API Key 管理
  - [ ] SubTask 7.4: 阶段 3：订单中心 + 账单 + 充值 + 发票
  - [ ] SubTask 7.5: 阶段 4：模型中心 + 渠道管理 + 模型价格
  - [ ] SubTask 7.6: 阶段 5：运营中心 + 安全中心
  - [ ] SubTask 7.7: 阶段 6：系统中心 + Dashboard + 系统监控
  - [ ] SubTask 7.8: 每阶段的风险、缓解、回滚、验收标准
  - [ ] SubTask 7.9: 紧急预案：RBAC 锁死管理员 → 启动时自动恢复 super_admin 脚本

- [ ] Task 8: 更新 `docs/README.md` 文档索引
  - [ ] SubTask 8.1: 在文档结构树中新增 `03-admin/` 章节
  - [ ] SubTask 8.2: 在"阅读指南 → 开发新功能"段落引用 `03-admin/`
  - [ ] SubTask 8.3: 在"版本状态"表登记 7 份文档为 ✅ 完成

---

# Task Dependencies

```
Task 1 (PRD)
   ↓
Task 2 (RBAC) ─┬─→ Task 3 (Schema)
   ↓           │       ↓
   └───────────┴─→ Task 4 (API)
                       ↓
                  Task 5 (UI)
                       ↓
                  Task 6 (Route Map)
                       ↓
                  Task 7 (Integration Plan)
                       ↓
                  Task 8 (docs/README.md 更新)

Task 2 含 Admin 安全修复设计 → 阶段 1 实施时优先
```

- Task 1 是所有后续任务的基础输入
- Task 2 与 Task 3 部分并行（RBAC 实体建模与 Schema 紧密相关，建议 Task 2 先完成）
- Task 4 依赖 Task 1 + Task 2 + Task 3
- Task 5、6 依赖 Task 1 + Task 2 + Task 4
- Task 7 依赖所有前序任务
- Task 8 必须在所有 1-7 完成后再做
