# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ToAIAPI is an enterprise AI Gateway platform — a unified API gateway to all major LLM providers (OpenAI, Anthropic, Google, DeepSeek, Qwen, GLM, Moonshot, Grok). It offers OpenAI-compatible endpoints (`/v1/chat/completions`, `/v1/models`) so AI coding tools (Claude Code, Cursor, Codex CLI, Windsurf, etc.) can use any backend model. It includes a full user system, API key management, token-based billing, balance system, subscriptions, payment integration, and an admin backend.

## Monorepo Structure & Commands

```
toaiapi/
├── apps/
│   ├── backend/       # NestJS + Fastify API server (port 3001)
│   └── frontend/      # Next.js 16 + React 19 (port 3000)
├── packages/           # Shared libraries (build with tsc)
│   ├── common/         #   Zod schemas, shared types, constants
│   ├── auth/           #   argon2 password hashing, JWT helpers
│   ├── billing/        #   Cost calculator (decimal.js), token validators
│   ├── gateway/        #   Channel selector strategies, adapter interface
│   └── sdk/            #   Client SDK for API consumers
├── docs/               # Product & technical docs
└── .ai/                # AI development rules (authoritative for domain rules)
```

### Common Commands

```bash
pnpm install                     # Install all dependencies
pnpm dev                         # Run all apps in dev mode (turbo dev)
pnpm build                       # Build all packages and apps
pnpm lint                        # Lint all packages and apps
pnpm test                        # Run all tests (jest for backend)

# Database (Prisma, runs in apps/backend)
pnpm db:generate                 # Generate Prisma client
pnpm db:migrate                  # Run migrations (prisma migrate dev)
pnpm db:push                     # Push schema without migration
pnpm db:studio                   # Open Prisma Studio GUI
pnpm db:seed                     # Seed admin user

# Single-package operations
pnpm --filter @toai/backend dev          # Start backend only
pnpm --filter @toai/backend test         # Run backend tests
pnpm --filter @toai/backend test:cov     # Backend tests with coverage
pnpm --filter toaiapi-frontend dev       # Start frontend only
pnpm --filter @toai/gateway build        # Build gateway package only

# Formatting
pnpm format                      # Prettier all ts/tsx/md files
pnpm format:check                # Check formatting only
pnpm typecheck                   # TypeScript type-check all packages
```

## Architecture

### Backend Layering (Strictly Enforced)

```
Controller → Service → Repository → Prisma ORM
```

- **Controller**: HTTP handling, parameter validation via `class-validator`, Swagger docs. Never accesses the database directly.
- **Service**: All business logic, transaction management, cross-module calls. Never touches raw HTTP.
- **Repository**: Prisma query encapsulation. No business logic allowed.
- **DTOs**: Request/response types in `dto/` directories with validation decorators.

Modules are in `apps/backend/src/modules/` — Auth, User, ApiKey, Billing, Payment, Balance, Gateway, Admin, RequestLog. Modules call each other only through Service layers; never access another module's database tables directly. Forward references (`forwardRef`) resolve circular imports.

### Gateway Core Flow

The gateway is the heart of the platform:

1. **Request arrives** at `GatewayController` (`POST /v1/chat/completions`) — OpenAI-compatible format
2. **ApiKeyAuthGuard** authenticates via `X-API-Key` or `Authorization: Bearer sk-toai-...`
3. **ChannelService.selectChannelsWithFallback()** picks channels by priority-then-weight for the requested model
4. **ProviderAdapterFactory** creates the right adapter — OpenAI-compatible providers (DeepSeek, Qwen, GLM, Moonshot, Grok, OpenRouter) use `OpenAIAdapter`; Anthropic uses `AnthropicAdapter`; Google uses `GeminiAdapter`
5. **Adapter** translates the unified request to provider-native format, streams/returns response, normalizes back
6. **GatewayService** retries on next channel if one fails (up to `MAX_RETRIES = 2`), handles stream cleanup in `finally` block
7. **BillingService.processUsage()** calculates cost and deducts balance
8. **RequestLogService** records usage asynchronously (fire-and-forget)

Model → Channel → Provider relationships are many-to-many via `ChannelModel`. A model can have multiple channels across different providers for redundancy.

### Packages Dependency Rules

```
✅ apps → packages          # Apps can depend on any package
✅ packages → packages      # Packages can depend on other packages
❌ packages → apps          # Packages must never depend on apps
❌ Circular dependencies    # Forbidden
```

Packages are built to `dist/` with `tsc` and imported via `workspace:*` protocol.

## Database (Prisma)

The Prisma schema is at `apps/backend/prisma/schema.prisma`. Local dev uses **SQLite** (see `datasource db` in schema.prisma); production uses PostgreSQL.

Key schema conventions:
- All IDs use `@default(cuid())` — never autoincrement
- All monetary values are integers in **cents (分)** — `100 = ¥1.00`
- `created_at` / `updated_at` on every table; `deleted_at` for soft deletes
- Sensitive fields (channel API keys, payment config, SMTP passwords) are **AES-256-GCM encrypted** at the application layer before storage
- API keys are hashed with argon2; only the `key_prefix` (first 16 chars) is stored in plaintext

## Critical Business Rules

These are non-negotiable and enforced in `.ai/` rules:

### Billing (`.ai/billing-rules.md`)
- **Never trust the provider's token count** — re-verify with a tokenizer
- All monetary amounts in **integer cents**; always use `Math.ceil()` for cost calculations
- Balance deduction + transaction record MUST happen in a single Prisma `$transaction`
- Stream billing: if the provider doesn't return usage, estimate from character count (CJK ≈ 1.5, ASCII ≈ 0.25 tokens/char)

### Security (`.ai/security-rules.md`)
- All user input validated via `class-validator` (NestJS) or `zod` (packages)
- Passwords: argon2 only. JWT: short-lived (15min access + 7d refresh)
- Payment callbacks: verify signatures with `timingSafeEqual`
- Never log API keys, passwords, or payment secrets
- CORS restricted to `ALLOWED_ORIGINS` env var; Swagger disabled in production

### Database (`.ai/database-rules.md`)
- No raw SQL; use Prisma Client exclusively
- All schema changes via Prisma Migrate; migrations must be reversible
- Avoid N+1 queries; use `include` or batch queries

## Environment Variables

Copy `.env.example` → `.env`. Key variables:
- `DATABASE_URL` — defaults to SQLite for dev (no external DB needed)
- `REDIS_URL` — Redis for caching gateway model lists
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — 256-bit+ secrets
- `ENCRYPTION_KEY` — 32-byte hex key for AES-256-GCM (channel/storage encryption)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — seed defaults (`admin@toaiapi.com` / `Admin@123456`)

## .ai/ Rules Directory

The `.ai/` directory is authoritative for domain-specific development rules. Future Claude instances should consult these files when working in specific domains:
- `billing-rules.md` — token counting, pricing, balance transactions
- `gateway-rules.md` — channel selection, fault tolerance, protocol compatibility
- `security-rules.md` — encryption, auth, payment verification
- `database-rules.md` — schema design, migrations, query patterns
- `provider-rules.md` — adapter interface and provider registration
- `payment-rules.md` — WeChat Pay / Alipay integration, order state machine
- `architecture-rules.md` — full layered architecture specification
- `coding-rules.md` — TypeScript, file, and function standards
- `review-checklist.md` — pre-commit review checklist
- `system-prompt.md` — engineering system prompt with role context

