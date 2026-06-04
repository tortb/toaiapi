# ToAIAPI — 系统架构

## 架构总览

```
┌─────────────────────────────────────────────────────┐
│                    Client Layer                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Frontend │  │  Admin   │  │  SDK / Third-party│  │
│  │ (Next.js)│  │ (Next.js)│  │                  │  │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘  │
│       │              │                 │             │
└───────┼──────────────┼─────────────────┼─────────────┘
        │              │                 │
        ▼              ▼                 ▼
┌─────────────────────────────────────────────────────┐
│                  NestJS Backend                      │
│  ┌─────────────────────────────────────────────┐    │
│  │              API Gateway (Fastify)           │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐  │    │
│  │  │ Auth │ │ User │ │Admin │ │ Gateway  │  │    │
│  │  └──────┘ └──────┘ └──────┘ └──────────┘  │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐  │    │
│  │  │ API  │ │Bill- │ │Balance│ │Request   │  │    │
│  │  │ Key  │ │ ing  │ │      │ │ Log      │  │    │
│  │  └──────┘ └──────┘ └──────┘ └──────────┘  │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │           Provider Adapters                  │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐  │    │
│  │  │OpenAI│ │Anthro│ │Gemini│ │ DeepSeek │  │    │
│  │  │      │ │ pic  │ │      │ │ Qwen ... │  │    │
│  │  └──────┘ └──────┘ └──────┘ └──────────┘  │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
        │              │
        ▼              ▼
┌──────────────┐ ┌──────────────┐
│  PostgreSQL  │ │    Redis     │
│  (主存储)     │ │ (缓存/会话)  │
└──────────────┘ └──────────────┘
```

## Monorepo 结构

```
toaiapi/
├── apps/
│   ├── frontend/           # Next.js 用户前端 (port 3000)
│   ├── admin/              # Next.js 管理后台 (port 3002)
│   └── backend/            # NestJS 后端 (port 3001)
├── packages/
│   ├── common/             # 共享常量、类型、工具
│   ├── auth/               # JWT + Argon2id
│   ├── billing/            # 计费计算引擎
│   ├── gateway/            # 渠道选择、Provider 适配器接口
│   └── sdk/                # 客户端 SDK
├── docs/                   # 文档
├── docker-compose.yml      # 本地开发环境
└── turbo.json              # Turborepo 配置
```

## 模块依赖关系

```
┌───────────┐     ┌───────────┐     ┌───────────┐
│  Gateway  │────▶│  Billing  │────▶│   Prisma  │
│  Module   │     │  Module   │     │  Service  │
└───────────┘     └───────────┘     └───────────┘
       │
       ▼
┌───────────┐     ┌───────────┐
│  Request  │     │  Channel  │
│  Log Mod  │     │  Service  │
└───────────┘     └───────────┘

┌───────────┐     ┌───────────┐
│   Auth    │────▶│   User    │
│  Module   │     │  Module   │
└───────────┘     └───────────┘
       │
       ▼
┌───────────┐
│  Billing  │
│  Module   │
└───────────┘

┌───────────┐     ┌───────────┐
│  Balance  │────▶│  Billing  │
│  Module   │     │  Module   │
└───────────┘     └───────────┘

┌───────────┐
│   Admin   │ (独立，直接使用 PrismaService)
│  Module   │
└───────────┘

┌───────────┐
│  API Key  │ (独立，使用 PrismaService + RedisService)
│  Module   │
└───────────┘
```

## 分层架构

每一层职责明确，禁止跨层调用：

| 层 | 职责 | 示例 |
|----|------|------|
| **Controller** | 路由、参数校验、响应格式化 | `admin.controller.ts` |
| **Service** | 业务逻辑、事务编排 | `admin.service.ts` |
| **Repository** | 数据访问、Prisma 调用 | `admin.repository.ts` |
| **Prisma** | ORM、Schema、Migration | `schema.prisma` |

## 限界上下文（Bounded Context）

| 上下文 | 核心聚合根 | 模块 |
|--------|-----------|------|
| 用户域 | User | user, auth |
| API Key 域 | ApiKey | api-key |
| 计费域 | UserBalance, UserTransaction | billing, balance |
| 订单域 | Order | (V3.0) |
| 支付域 | Payment | (V3.0) |
| 网关域 | Channel, ChannelModel | gateway |
| 模型域 | Model, ModelPricing, Provider | admin |
| 组织域 | Organization | (V5.0) |

## 安全架构

```
Client Request
       │
       ▼
┌──────────────┐
│ Rate Limiter │ ← Redis (60 req/min per API key)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Auth Guard   │ ← JWT (Dashboard) / API Key (Gateway)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Input Valid. │ ← class-validator / zod
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Controller   │
└──────────────┘
```

## 部署架构

```
                    ┌─────────────┐
                    │   Nginx     │
                    │  (Reverse   │
                    │   Proxy)    │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Frontend │ │  Admin   │ │ Backend  │
        │ :3000    │ │ :3002    │ │ :3001    │
        └──────────┘ └──────────┘ └──────────┘
                                      │
                           ┌──────────┼──────────┐
                           │                     │
                           ▼                     ▼
                     ┌──────────┐         ┌──────────┐
                     │PostgreSQL│         │  Redis   │
                     │ :5432    │         │ :6379    │
                     └──────────┘         └──────────┘
```

## 关键设计决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 金额单位 | 分（fen, Int） | 避免浮点精度问题 |
| API Key 存储 | Argon2id 哈希 | 安全性最高 |
| Token 计数 | 平台自行计算 | 不信任 Provider 返回值 |
| 余额扣减 | 数据库事务 | 保证原子性 |
| Provider 适配 | 工厂模式 + 策略模式 | 易扩展新 Provider |
| 渠道选择 | 优先级 + 加权随机 | 负载均衡 + 故障转移 |
| 认证方式 | JWT (Dashboard) + API Key (Gateway) | 场景分离 |
