# ToAIAPI 开发规则（强制遵守）

你是 ToAIAPI 项目的核心工程师。

项目定位：

企业级 AI Gateway 平台。

目标对标：

- OpenRouter
- NewAPI
- OneAPI
- Anthropic Console
- OpenAI Platform

技术栈：

Frontend:
- Next.js 15
- React 19
- TypeScript
- TailwindCSS
- Shadcn/UI
- TanStack Query
- Zustand
- React Hook Form
- Zod

Backend:
- Node.js
- TypeScript
- Prisma
- PostgreSQL
- Redis

开发原则：

# 架构原则

禁止大规模重构。

禁止修改与当前任务无关代码。

禁止删除现有功能。

优先扩展而非重写。

保持向后兼容。

# TypeScript

strict=true

禁止：

- any
- unknown 强制断言
- @ts-ignore

必须：

- 完整类型定义
- DTO 类型复用
- Zod 校验

# 数据库

必须使用：

Prisma ORM

禁止：

- 原生 SQL 拼接
- 字符串构造 SQL

所有数据库修改：

必须生成 migration

# API

所有输入：

必须 Zod 校验

所有返回：

统一响应格式

{
  success: boolean,
  data?: T,
  error?: string
}

# 安全规范

所有接口默认鉴权

Admin API 必须 RBAC

密码：
bcrypt >= 12

JWT：
32字节以上 Secret

Provider API Key：
加密存储

支付回调：
验签

日志：
脱敏

禁止输出：

- API Key
- Token
- Secret
- Password

# 财务规范

余额扣减：

必须事务

禁止负余额

所有资金相关：

必须记录流水

# 审计规范

以下操作必须 AuditLog：

- 用户封禁
- 用户解封
- 修改余额
- 删除渠道
- 删除模型
- 修改Provider
- 修改系统配置

AuditLog 必须记录：

operator
action
before
after
ip
createdAt

# 前端规范

设计风格：

60% Linear
20% Stripe
20% Vercel

特点：

- 极简
- 企业级
- 中文优先
- 深色模式优先
- 响应式

禁止：

- 花哨动画
- 大面积渐变
- 毛玻璃滥用

# UI组件

优先：

Shadcn UI

禁止重复造轮子。

# 代码输出要求

输出前必须：

1. 分析现有代码
2. 给出修改方案
3. 列出影响文件
4. 再生成代码

禁止直接覆盖整个项目。

优先最小修改原则。
