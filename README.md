# ToAIAPI

**企业级 AI 网关平台**

统一管理所有大模型 API，支持主流 AI 编程工具。

---

## 功能特性

### AI 模型支持

- OpenAI（GPT-4o、GPT-4o-mini、o1、o3）
- Anthropic（Claude Opus 4、Claude Sonnet 4、Claude Haiku 4）
- Google（Gemini 2.5 Pro、Gemini 2.5 Flash）
- DeepSeek（V3、R1）
- Qwen（Qwen 3）
- GLM（GLM-4）
- Moonshot（Kimi）
- Grok（Grok-3）

### AI 编程工具

- Claude Code
- Codex CLI
- Cursor
- Roo Code
- Cline
- Windsurf
- Continue

### 用户系统

- 邮箱注册 / 登录
- JWT 认证（Access Token + Refresh Token）
- 密码重置
- API Key 管理（创建、删除、启停、限流、模型白名单、IP 白名单）

### 计费系统

- Token 使用追踪
- 精确 Token 计量（Tokenizer）
- 余额系统（充值、扣费、冻结、交易流水）
- 模型定价管理（输入/输出/缓存/推理 分开计价）

### 网关核心

- OpenAI 兼容接口（`/v1/chat/completions`、`/v1/models`）
- 流式响应（SSE）
- 多渠道故障转移
- 渠道权重与优先级
- 请求限流（多级：短期/中期/长期）

### 数据库设计

- 用户、余额、交易流水
- API Key（支持限流、模型/IP 白名单）
- 模型与定价
- Provider、渠道、渠道模型映射
- 订单与支付
- 套餐与订阅
- 企业组织
- 请求日志

---

## 架构

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端层                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Claude   │  │  Cursor  │  │  Codex   │  │ Windsurf │    │
│  │  Code    │  │          │  │   CLI    │  │          │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
└───────┼──────────────┼──────────────┼──────────────┼────────┘
        │              │              │              │
┌───────▼──────────────▼──────────────▼──────────────▼────────┐
│                      API 网关层                               │
│              限流 / 认证 / 日志 / 路由                         │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                      后端服务层                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │  认证   │ │  用户   │ │  计费   │ │  余额   │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                       数据层                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │    Redis     │  │   Prisma     │      │
│  │   (主库)     │  │   (缓存)    │  │   (ORM)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 技术栈

### 前端

- **框架**: Next.js + React
- **语言**: TypeScript
- **样式**: TailwindCSS + Shadcn/ui
- **状态管理**: Zustand + TanStack Query

### 后端

- **框架**: NestJS + Fastify
- **语言**: TypeScript
- **ORM**: Prisma
- **API 文档**: Swagger / OpenAPI

### 数据库

- **主库**: PostgreSQL
- **缓存**: Redis

### 基础设施

- **Monorepo**: pnpm workspace + Turbo
- **包管理**: pnpm

---

## 快速开始

### 环境要求

- Node.js >= 20
- pnpm 9+
- PostgreSQL 16+
- Redis 7+

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-username/toaiapi.git
cd toaiapi

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env

# 数据库迁移
pnpm db:migrate

# 启动开发服务
pnpm dev
```

### 常用命令

```bash
# 开发
pnpm dev                    # 启动所有服务
pnpm build                  # 构建所有包
pnpm test                   # 运行测试
pnpm lint                   # 代码检查

# 数据库
pnpm db:generate            # 生成 Prisma Client
pnpm db:migrate             # 运行迁移
pnpm db:push                # 推送 Schema 变更
pnpm db:studio              # 打开 Prisma Studio

# 单个包
pnpm --filter @toai/backend dev
pnpm --filter @toai/frontend dev
```

---

## 项目结构

```
toaiapi/
├── apps/
│   ├── frontend/           # Next.js 前端
│   ├── admin/              # 管理后台（规划中）
│   └── backend/            # NestJS 后端
├── packages/
│   ├── sdk/                # 客户端 SDK
│   ├── billing/            # 计费核心逻辑
│   ├── gateway/            # 网关核心逻辑
│   ├── auth/               # 认证授权
│   └── common/             # 公共工具与类型
├── docs/                   # 项目文档
├── .ai/                    # AI 开发规则
└── CLAUDE.md               # Claude Code 配置
```

---

## 文档

- [架构概览](docs/architecture/overview.md)
- [领域驱动设计](docs/architecture/DDD.md)
- [Token 计费规范](docs/billing/Token-Billing-Spec.md)
- [安全审计指南](docs/security/Security-Audit-Guide.md)
- [开发路线图](docs/roadmap/development-plan.md)

---

## 贡献

提交 PR 前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

---

## 安全

如需报告安全漏洞，请阅读 [SECURITY.md](SECURITY.md)。

---

## 开源协议

本项目基于 MIT 协议开源，详见 [LICENSE](LICENSE)。

---

## 致谢

- [OpenRouter](https://openrouter.ai/) — 多模型路由灵感
- [OneAPI](https://github.com/songquanpeng/one-api) — API 管理灵感
- [NewAPI](https://github.com/Calcium-Ion/new-api) — 计费系统灵感
