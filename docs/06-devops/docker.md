# Docker 部署

## docker-compose.yml

当前配置（本地开发）：

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: toaiapi
      POSTGRES_PASSWORD: toaiapi
      POSTGRES_DB: toaiapi
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://toaiapi:toaiapi@postgres:5432/toaiapi
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev-jwt-secret
    depends_on:
      - postgres
      - redis

  frontend:
    build:
      context: .
      dockerfile: apps/frontend/Dockerfile
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:3001
    depends_on:
      - backend

  admin:
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
    ports:
      - "3002:3002"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:3001
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

## 生产环境 Dockerfile

### Backend

```dockerfile
# apps/backend/Dockerfile
FROM node:20-alpine AS base
RUN npm i -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/common/package.json ./packages/common/
COPY packages/auth/package.json ./packages/auth/
COPY packages/billing/package.json ./packages/billing/
COPY packages/gateway/package.json ./packages/gateway/
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/common/node_modules ./packages/common/node_modules
COPY --from=deps /app/packages/auth/node_modules ./packages/auth/node_modules
COPY --from=deps /app/packages/billing/node_modules ./packages/billing/node_modules
COPY --from=deps /app/packages/gateway/node_modules ./packages/gateway/node_modules
COPY . .
RUN pnpm db:generate
RUN pnpm --filter @toai/backend build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

### Frontend

```dockerfile
# apps/frontend/Dockerfile
FROM node:20-alpine AS base
RUN npm i -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/common/package.json ./packages/common/
COPY apps/frontend/package.json ./apps/frontend/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @toai/frontend build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./.next/static
COPY --from=builder /app/apps/frontend/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

## 环境变量

```bash
# .env.production
DATABASE_URL=postgresql://user:pass@postgres:5432/toaiapi
REDIS_URL=redis://redis:6379
JWT_SECRET=<random-32-bytes>
ENCRYPTION_KEY=<random-32-bytes>
NODE_ENV=production
PORT=3001
```

## 数据备份

```bash
# PostgreSQL 备份
pg_dump -h localhost -U toaiapi toaiapi > backup_$(date +%Y%m%d).sql

# Redis 备份
redis-cli BGSAVE
cp /var/lib/redis/dump.rdb /backup/redis_$(date +%Y%m%d).rdb
```
