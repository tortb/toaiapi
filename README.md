# ToAIAPI

🚀 **Enterprise AI Gateway Platform**

统一管理所有大模型 API，支持主流 AI 编程工具。

---

## ✨ Features

### 🤖 AI Model Support

- ✅ OpenAI (GPT-4o, GPT-4o-mini, o1, o3)
- ✅ Anthropic (Claude Opus 4, Claude Sonnet 4, Claude Haiku 4)
- ✅ Google (Gemini 2.5 Pro, Gemini 2.5 Flash)
- ✅ DeepSeek (DeepSeek V3, DeepSeek R1)
- ✅ Qwen (Qwen 3)
- ✅ GLM (GLM-4)
- ✅ Moonshot (Kimi)
- ✅ Grok (Grok-3)

### 🛠️ AI Coding Tools

- ✅ Claude Code
- ✅ Codex CLI
- ✅ Cursor
- ✅ Roo Code
- ✅ Cline
- ✅ Windsurf
- ✅ Continue

### 👤 User System

- ✅ User Registration & Login
- ✅ JWT Authentication
- ✅ OAuth (GitHub, Google, WeChat)
- ✅ API Key Management
- ✅ User Roles & Permissions

### 💰 Billing System

- ✅ Token Usage Tracking
- ✅ Accurate Token Counting (Tokenizer)
- ✅ Balance System
- ✅ Subscription Plans
- ✅ Pay As You Go

### 💳 Payment System

- ✅ WeChat Pay
- ✅ Alipay
- ✅ Order Management
- ✅ Refund Support

### 🏢 Enterprise Features

- ✅ Organization Management
- ✅ Team Management
- ✅ Role-Based Access Control
- ✅ Enterprise Billing

### 🔒 Security

- ✅ Rate Limiting
- ✅ IP Blacklist
- ✅ Content Safety
- ✅ Real-Name Verification
- ✅ API Key Encryption

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Claude   │  │  Cursor  │  │  Codex   │  │  Windsurf│    │
│  │  Code    │  │          │  │   CLI    │  │          │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
└───────┼──────────────┼──────────────┼──────────────┼────────┘
        │              │              │              │
┌───────▼──────────────▼──────────────▼──────────────▼────────┐
│                    API Gateway Layer                          │
│              Rate Limit / Auth / Logging / Routing            │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                     Backend Services                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │  Auth   │ │  User   │ │ Billing │ │ Payment │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │    Redis     │  │    SQLite    │      │
│  │   (主库)     │  │   (缓存)    │  │  (本地模式)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 16 + React 20
- **Language**: TypeScript
- **Styling**: TailwindCSS 4 + Shadcn/ui
- **State**: Zustand + TanStack Query
- **Animation**: Framer Motion

### Backend

- **Framework**: NestJS + Fastify
- **Language**: TypeScript
- **ORM**: Prisma
- **API**: OpenAPI / Swagger

### Database

- **Primary**: PostgreSQL
- **Cache**: Redis
- **Local**: SQLite

### Infrastructure

- **Monorepo**: pnpm workspace + turbo
- **Container**: Docker + Docker Compose
- **CI/CD**: GitHub Actions

---

## 🚀 Quick Start

### Prerequisites

- Node.js 24 LTS
- pnpm 9+
- PostgreSQL 16+
- Redis 7+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/toaiapi.git
cd toaiapi

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env

# Setup database
pnpm prisma migrate dev

# Start development
pnpm dev
```

### Docker

```bash
# Start all services
docker-compose up -d

# Or start specific service
docker-compose up backend
```

---

## 📁 Project Structure

```
toaiapi/
├── apps/
│   ├── frontend/           # Next.js 前端
│   ├── admin/              # 管理后台
│   └── backend/            # NestJS 后端
├── packages/
│   ├── sdk/                # 客户端 SDK
│   ├── billing/            # 计费核心逻辑
│   ├── gateway/            # 网关核心逻辑
│   ├── auth/               # 认证授权
│   └── common/             # 公共工具
├── docs/                   # 项目文档
├── .ai/                    # AI 开发规则
└── .claude/                # Claude Code 配置
```

---

## 📖 Documentation

- [Architecture Overview](docs/architecture/overview.md)
- [Domain-Driven Design](docs/architecture/DDD.md)
- [Token Billing Spec](docs/billing/Token-Billing-Spec.md)
- [Security Audit Guide](docs/security/Security-Audit-Guide.md)
- [Development Roadmap](docs/roadmap/development-plan.md)

---

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a PR.

---

## 🔒 Security

Please read [SECURITY.md](SECURITY.md) for reporting security vulnerabilities.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [OpenRouter](https://openrouter.ai/) - Inspiration for multi-model routing
- [OneAPI](https://github.com/songquanpeng/one-api) - Inspiration for API management
- [NewAPI](https://github.com/Calcium-Ion/new-api) - Inspiration for billing system
