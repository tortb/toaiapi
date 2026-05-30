# ToAIAPI - Claude Code Configuration

## Project Overview

ToAIAPI is an enterprise AI Gateway platform that unifies management of all major AI model APIs.

## Tech Stack

- **Monorepo**: pnpm workspace + turbo
- **Backend**: NestJS + Fastify + Prisma + PostgreSQL + Redis
- **Frontend**: Next.js + React + TypeScript + TailwindCSS + Shadcn/ui
- **Packages**: @toai/common, @toai/billing, @toai/gateway, @toai/auth, @toai/sdk

## Key Commands

```bash
# Development
pnpm dev                    # Start all services
pnpm build                  # Build all packages
pnpm test                   # Run all tests
pnpm lint                   # Lint all packages

# Database
pnpm db:generate            # Generate Prisma client
pnpm db:migrate             # Run migrations
pnpm db:push                # Push schema changes
pnpm db:studio              # Open Prisma Studio

# Single package
pnpm --filter @toai/backend dev
pnpm --filter @toai/frontend dev
```

## Architecture Rules

1. **Read `.ai/` directory first** - Contains all development rules
2. **Backend follows**: Controller → Service → Repository → Prisma
3. **Database changes**: Must use Prisma Migration
4. **No direct DB access** in Controllers
5. **Module independence**: Modules communicate via Service layer

## Critical Rules

### Billing System
- NEVER trust provider's token count - always recalculate with Tokenizer
- Balance operations MUST use database transactions
- All amounts in CENTS (分), not yuan
- All cost calculations MUST use Math.ceil (round up)

### Payment System
- ALWAYS verify callback signatures
- Use timingSafeEqual for signature comparison
- Orders MUST be idempotent (unique order_no)
- Status changes ONLY via callbacks

### Security
- All input MUST be validated (class-validator / zod)
- Passwords MUST use Argon2id
- API Keys MUST be encrypted (Argon2id)
- NO sensitive data in logs

## File Structure

```
toaiapi/
├── apps/
│   ├── frontend/           # Next.js frontend
│   ├── admin/              # Admin dashboard
│   └── backend/            # NestJS backend
├── packages/
│   ├── sdk/                # Client SDK
│   ├── billing/            # Billing core
│   ├── gateway/            # Gateway core
│   ├── auth/               # Auth core
│   └── common/             # Shared utilities
├── docs/                   # Documentation
├── .ai/                    # AI development rules
└── CLAUDE.md               # This file
```

## Before Any Code Change

1. Check if it affects billing, payment, or balance
2. Check if it requires database migration
3. Check if it affects API compatibility
4. Read relevant `.ai/` rules

## Testing

- Unit tests for all services
- Integration tests for database operations
- E2E tests for critical flows (billing, payment)

## Commit Convention

```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, perf, test, chore
Scopes: auth, user, api-key, billing, payment, gateway, channel, model, admin, sdk
```
