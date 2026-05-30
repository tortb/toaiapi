# ToAIAPI Architecture Overview

## 项目定位

ToAIAPI 是一个企业级 AI Gateway 平台，定位为下一代 AI Infrastructure。

核心能力：
- 统一管理所有大模型 API
- 兼容主流 AI 编程工具
- 完整的用户管理、计费、支付系统
- 企业管理、风控、实名认证

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端层                              │
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
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘          │
│       │           │           │           │                 │
│  ┌────▼───────────▼───────────▼───────────▼────┐           │
│  │              Service Layer                    │           │
│  └────────────────────┬─────────────────────────┘           │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────┐           │
│  │            Repository Layer                    │           │
│  └────────────────────┬─────────────────────────┘           │
└───────────────────────┼──────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────────┐
│                      Data Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  PostgreSQL  │  │    Redis     │  │    SQLite    │       │
│  │   (主库)     │  │   (缓存)    │  │  (本地模式)  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└──────────────────────────────────────────────────────────────┘
```

## 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16 | 框架 |
| React | 20 | UI 库 |
| TypeScript | 5.x | 类型系统 |
| TailwindCSS | 4 | 样式 |
| Shadcn/ui | latest | UI 组件 |
| TanStack Query | 5 | 数据获取 |
| Zustand | 5 | 状态管理 |
| Framer Motion | 11 | 动画 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 24 LTS | 运行时 |
| NestJS | 11 | 框架 |
| Fastify | 5 | HTTP 服务器 |
| Prisma | 6 | ORM |
| OpenAPI/Swagger | 3.0 | API 文档 |

### 数据库

| 技术 | 用途 |
|------|------|
| PostgreSQL | 主数据库 |
| Redis | 缓存、限流、Session |
| SQLite | 本地模式、开发环境 |

## 模块划分

### 核心模块

| 模块 | 职责 | 依赖 |
|------|------|------|
| Auth | 认证、授权、JWT、OAuth | User |
| User | 用户注册、信息管理 | - |
| ApiKey | API Key 创建、管理、校验 | User |
| Billing | Token 计费、余额管理 | User, Model |
| Payment | 充值、支付回调、退款 | Billing, User |
| Channel | 渠道管理、负载均衡、故障转移 | Model |
| Model | 模型配置、定价管理 | - |
| Gateway | API 转发、协议兼容 | Auth, ApiKey, Billing, Channel |
| Admin | 管理后台、数据统计 | 所有模块 |
| Organization | 企业管理、团队管理 | User |
| ContentSafety | 内容安全、审核 | - |
| Verification | 实名认证 | User |

### 包结构

| 包 | 职责 |
|------|------|
| packages/sdk | 客户端 SDK |
| packages/billing | 计费核心逻辑 |
| packages/gateway | 网关核心逻辑 |
| packages/auth | 认证授权 |
| packages/common | 公共工具 |

## 数据流

### API 请求流程

```
客户端请求
    ↓
API Gateway（限流、鉴权）
    ↓
路由分发
    ↓
Controller（参数校验）
    ↓
Service（业务逻辑）
    ↓
Repository（数据访问）
    ↓
Prisma → PostgreSQL
```

### AI 请求流程

```
用户请求（OpenAI/Anthropic 兼容格式）
    ↓
API Gateway
    ↓
鉴权（API Key / JWT）
    ↓
限流检查
    ↓
模型路由（选择渠道）
    ↓
转发到 Provider
    ↓
接收响应
    ↓
Token 计算（Tokenizer）
    ↓
费用计算
    ↓
余额扣减（事务）
    ↓
记录日志
    ↓
返回响应
```

## 安全架构

### 认证

- JWT（Access Token + Refresh Token）
- OAuth 2.0（GitHub, Google, 微信）
- API Key
- 邮箱验证码
- 短信验证码

### 授权

- RBAC（基于角色的访问控制）
- 用户角色：游客、普通用户、VIP、企业用户、代理商、管理员、超级管理员

### 数据安全

- 密码加密（Argon2）
- API Key 加密存储
- 敏感信息脱敏
- HTTPS 强制
- CORS 配置

### 支付安全

- 回调签名验证
- 幂等保护
- 防重复支付
- 超时处理

## 部署架构

### 开发环境

```
本地开发
├── PostgreSQL (Docker)
├── Redis (Docker)
└── Node.js (本地)
```

### 生产环境

```
生产部署
├── Load Balancer (Nginx/Cloudflare)
├── Application Server (PM2/K8s)
├── PostgreSQL (主从)
├── Redis (集群)
└── Object Storage (S3/OSS)
```

## 扩展性设计

### 水平扩展

- 无状态服务，支持多实例部署
- Redis 存储 Session 和缓存
- 数据库读写分离

### 垂直扩展

- 模块化设计，按需扩展
- 微服务拆分预留

### 插件化

- Provider 适配器可插拔
- 支付方式可插拔
- 内容安全可插拔
