FROM node:24-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# ============================================================
# Dependencies
# ============================================================
FROM base AS deps

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/common/package.json ./packages/common/
COPY packages/billing/package.json ./packages/billing/
COPY packages/gateway/package.json ./packages/gateway/
COPY packages/auth/package.json ./packages/auth/

# Install dependencies
RUN pnpm install --frozen-lockfile

# ============================================================
# Builder
# ============================================================
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=deps /app/packages/common/node_modules ./packages/common/node_modules
COPY --from=deps /app/packages/billing/node_modules ./packages/billing/node_modules
COPY --from=deps /app/packages/gateway/node_modules ./packages/gateway/node_modules
COPY --from=deps /app/packages/auth/node_modules ./packages/auth/node_modules

# Copy source code
COPY . .

# Generate Prisma Client
RUN cd apps/backend && pnpm prisma generate

# Build
RUN pnpm --filter @toai/backend build

# ============================================================
# Runner
# ============================================================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built files
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/prisma ./prisma
COPY --from=builder /app/apps/backend/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/v1/health || exit 1

# Start
CMD ["node", "dist/main.js"]
