#!/bin/bash

# ToAIAPI Seed 验证脚本
# 使用方法: ./scripts/verify-seed.sh

set -e

echo "🔍 ToAIAPI Seed Verification"
echo "=================================================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查数据库连接
echo ""
echo "📊 Checking database connection..."

if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  psql not found, skipping SQL verification${NC}"
    echo "   Use Prisma Studio instead: pnpm db:studio"
    exit 0
fi

# 从 .env 读取 DATABASE_URL
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL not set${NC}"
    exit 1
fi

# 检查 Providers
echo ""
echo "📦 Checking Providers..."
PROVIDER_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM providers WHERE deleted_at IS NULL;" 2>/dev/null | tr -d ' ')

if [ "$PROVIDER_COUNT" -ge 8 ]; then
    echo -e "${GREEN}✓ Found $PROVIDER_COUNT providers${NC}"
    psql "$DATABASE_URL" -c "SELECT name, display_name FROM providers ORDER BY name;" 2>/dev/null
else
    echo -e "${RED}❌ Expected 8+ providers, found $PROVIDER_COUNT${NC}"
fi

# 检查 Models
echo ""
echo "🤖 Checking Models..."
MODEL_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM models WHERE deleted_at IS NULL;" 2>/dev/null | tr -d ' ')

if [ "$MODEL_COUNT" -ge 8 ]; then
    echo -e "${GREEN}✓ Found $MODEL_COUNT models${NC}"
    psql "$DATABASE_URL" -c "SELECT m.name, m.display_name, p.name as provider FROM models m JOIN providers p ON m.provider_id = p.id ORDER BY p.name, m.name;" 2>/dev/null
else
    echo -e "${RED}❌ Expected 8+ models, found $MODEL_COUNT${NC}"
fi

# 检查 Model Pricing
echo ""
echo "💰 Checking Model Pricing..."
PRICING_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM model_pricing;" 2>/dev/null | tr -d ' ')

if [ "$PRICING_COUNT" -ge 8 ]; then
    echo -e "${GREEN}✓ Found $PRICING_COUNT pricing entries${NC}"
else
    echo -e "${RED}❌ Expected 8+ pricing entries, found $PRICING_COUNT${NC}"
fi

# 检查 Admin
echo ""
echo "👤 Checking Admin User..."
ADMIN_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM users WHERE role = 'ADMIN' AND deleted_at IS NULL;" 2>/dev/null | tr -d ' ')

if [ "$ADMIN_COUNT" -ge 1 ]; then
    echo -e "${GREEN}✓ Found $ADMIN_COUNT admin user(s)${NC}"
    psql "$DATABASE_URL" -c "SELECT email, role, status FROM users WHERE role = 'ADMIN';" 2>/dev/null
else
    echo -e "${RED}❌ No admin users found${NC}"
fi

# 总结
echo ""
echo "=================================================="
if [ "$PROVIDER_COUNT" -ge 8 ] && [ "$MODEL_COUNT" -ge 8 ] && [ "$ADMIN_COUNT" -ge 1 ]; then
    echo -e "${GREEN}✅ Seed verification passed!${NC}"
else
    echo -e "${RED}❌ Seed verification failed!${NC}"
    echo "   Run: pnpm db:seed"
    exit 1
fi
