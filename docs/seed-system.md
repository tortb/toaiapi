# ToAIAPI Seed System

## 概述

Seed 系统用于初始化数据库基础数据，部署后无需手动操作。

## 功能

### Providers（8个）
- OpenAI
- Anthropic
- Google
- DeepSeek
- OpenRouter
- Moonshot (Kimi)
- Grok (xAI)
- Qwen (通义千问)

### Models（8个）
| 模型 | Provider | 上下文长度 |
|------|----------|-----------|
| gpt-4.1 | OpenAI | 1M |
| gpt-4o | OpenAI | 128K |
| o3 | OpenAI | 200K |
| claude-sonnet-4 | Anthropic | 200K |
| claude-opus-4 | Anthropic | 200K |
| gemini-2.5-pro | Google | 1M |
| deepseek-chat | DeepSeek | 64K |
| deepseek-reasoner | DeepSeek | 64K |

### 默认管理员
- 使用环境变量配置
- 默认邮箱: `admin@toaiapi.com`
- 默认密码: `Admin@123456`
- 密码使用 Argon2id 加密

## 特性

- ✅ **幂等执行** - 使用 `upsert` 操作
- ✅ **重复执行不报错** - 安全的数据库操作
- ✅ **详细日志** - 输出每个步骤的状态
- ✅ **环境变量配置** - 管理员账号可配置

## 使用方法

### 1. 配置环境变量

在 `.env` 文件中设置：

```bash
# 必需
DATABASE_URL=postgresql://user:password@localhost:5432/toaiapi

# 可选（有默认值）
ADMIN_EMAIL=admin@toaiapi.com
ADMIN_PASSWORD=YourSecurePassword123
```

### 2. 运行 Seed

```bash
# 方式一：使用 pnpm（推荐）
pnpm db:seed

# 方式二：直接运行
cd apps/backend
pnpm db:seed

# 方式三：使用 ts-node
cd apps/backend
npx ts-node prisma/seed.ts
```

### 3. 验证结果

```bash
# 检查 Providers
pnpm --filter @toai/backend exec prisma studio

# 或使用 SQL 查询
psql -d toaiapi -c "SELECT name, display_name FROM providers;"
psql -d toaiapi -c "SELECT name, display_name FROM models;"
psql -d toaiapi -c "SELECT email, role FROM users WHERE role = 'ADMIN';"
```

## 文件结构

```
apps/backend/prisma/
├── seed.ts           # 主种子脚本（单文件）
├── schema.prisma     # 数据库 Schema
└── seed/             # 旧版多文件结构（可删除）
    ├── index.ts
    ├── providers.seed.ts
    ├── models.seed.ts
    ├── channels.seed.ts
    └── admin.seed.ts
```

## 执行流程

```
🌱 Starting Database Seeding
==================================================

📦 Seeding Providers...
   ✓ OpenAI
   ✓ Anthropic
   ✓ Google
   ✓ DeepSeek
   ✓ OpenRouter
   ✓ Moonshot (Kimi)
   ✓ Grok (xAI)
   ✓ Qwen (通义千问)
   📊 Total: 8 providers

🤖 Seeding Models...
   ✓ GPT-4.1 (openai)
   ✓ GPT-4o (openai)
   ✓ o3 (openai)
   ✓ Claude Sonnet 4 (anthropic)
   ✓ Claude Opus 4 (anthropic)
   ✓ Gemini 2.5 Pro (google)
   ✓ DeepSeek V3 (deepseek)
   ✓ DeepSeek R1 (deepseek)
   📊 Total: 8 models

👤 Seeding Admin User...
   ✓ Admin: admin@toaiapi.com

==================================================
✅ Database seeding completed successfully!
==================================================
```

## 自动化部署

### Docker Compose

```yaml
services:
  backend:
    build: .
    environment:
      - DATABASE_URL=postgresql://toaiapi:password@postgres:5432/toaiapi
      - ADMIN_EMAIL=admin@yourdomain.com
      - ADMIN_PASSWORD=YourSecurePassword
    command: >
      sh -c "npx prisma migrate deploy && pnpm db:seed && node dist/main.js"
```

### GitHub Actions

```yaml
- name: Run Database Seed
  run: pnpm db:seed
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    ADMIN_EMAIL: ${{ secrets.ADMIN_EMAIL }}
    ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
```

## 定价说明

所有价格单位为 **分/百万 token**（CNY/1M tokens）。

示例：
- `input_price: 300` = ¥3.00/百万输入 token
- `output_price: 1500` = ¥15.00/百万输出 token

## 注意事项

1. **首次部署**：确保数据库已迁移（`pnpm db:migrate`）
2. **密码安全**：生产环境务必修改默认密码
3. **API Key**：Seed 不会创建 Channel API Key，需要在后台配置
4. **数据安全**：Seed 只创建基础数据，不会覆盖用户修改的数据

## 故障排除

### 数据库连接失败
```bash
# 检查 PostgreSQL 是否运行
pg_isready

# 检查连接字符串
echo $DATABASE_URL
```

### 权限错误
```bash
# 确保数据库用户有足够权限
psql -c "ALTER USER toaiapi CREATEDB;"
```

### 重复执行
Seed 设计为幂等，可以安全重复执行：
```bash
pnpm db:seed  # 可多次运行
```
