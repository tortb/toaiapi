# ToAIAPI Seed System 实现完成

## 📁 文件结构

```
toaiapi/
├── apps/backend/prisma/
│   ├── seed.ts              # ✅ 主种子脚本（单文件）
│   ├── schema.prisma        # 数据库 Schema
│   └── seed/                # 旧版多文件（可删除）
├── docs/
│   └── seed-system.md       # ✅ 详细文档
├── scripts/
│   └── verify-seed.sh       # ✅ 验证脚本
├── .env.example             # ✅ 已添加 ADMIN 配置
├── package.json             # ✅ 已添加 db:seed 命令
└── turbo.json               # ✅ 已配置 db:seed 任务
```

## 🚀 快速开始

### 1. 配置环境变量

编辑 `.env` 文件：

```bash
# 数据库连接
DATABASE_URL=postgresql://user:password@localhost:5432/toaiapi

# 管理员账号（可选，有默认值）
ADMIN_EMAIL=admin@toaiapi.com
ADMIN_PASSWORD=YourSecurePassword123
```

### 2. 运行数据库迁移

```bash
pnpm db:migrate
```

### 3. 执行 Seed

```bash
pnpm db:seed
```

### 4. 验证结果

```bash
# 方式一：使用验证脚本
./scripts/verify-seed.sh

# 方式二：使用 Prisma Studio
pnpm db:studio

# 方式三：直接查询
psql $DATABASE_URL -c "SELECT COUNT(*) FROM providers;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM models;"
psql $DATABASE_URL -c "SELECT email FROM users WHERE role='ADMIN';"
```

## 📦 Seed 内容

### Providers（8个）

| 名称 | 显示名 | Base URL |
|------|--------|----------|
| openai | OpenAI | https://api.openai.com |
| anthropic | Anthropic | https://api.anthropic.com |
| google | Google | https://generativelanguage.googleapis.com |
| deepseek | DeepSeek | https://api.deepseek.com |
| openrouter | OpenRouter | https://openrouter.ai/api |
| moonshot | Moonshot (Kimi) | https://api.moonshot.cn |
| grok | Grok (xAI) | https://api.x.ai |
| qwen | Qwen (通义千问) | https://dashscope.aliyuncs.com/compatible-mode |

### Models（8个）

| 模型 | Provider | 上下文 | 输入价格 | 输出价格 |
|------|----------|--------|----------|----------|
| gpt-4.1 | OpenAI | 1M | ¥2.00/M | ¥8.00/M |
| gpt-4o | OpenAI | 128K | ¥2.50/M | ¥10.00/M |
| o3 | OpenAI | 200K | ¥20.00/M | ¥80.00/M |
| claude-sonnet-4 | Anthropic | 200K | ¥3.00/M | ¥15.00/M |
| claude-opus-4 | Anthropic | 200K | ¥15.00/M | ¥75.00/M |
| gemini-2.5-pro | Google | 1M | ¥1.25/M | ¥5.00/M |
| deepseek-chat | DeepSeek | 64K | ¥0.14/M | ¥0.28/M |
| deepseek-reasoner | DeepSeek | 64K | ¥0.55/M | ¥2.19/M |

> 💡 价格单位：分/百万 token（CNY cents per 1M tokens）

### 默认管理员

- **邮箱**: `ADMIN_EMAIL` 环境变量（默认 `admin@toaiapi.com`）
- **密码**: `ADMIN_PASSWORD` 环境变量（默认 `Admin@123456`）
- **加密**: Argon2id
- **角色**: ADMIN

## ✨ 特性

- ✅ **幂等执行** - 使用 Prisma `upsert` 操作
- ✅ **重复执行不报错** - 安全的数据库操作
- ✅ **详细日志** - 输出每个步骤的状态
- ✅ **环境变量配置** - 管理员账号可自定义
- ✅ **TypeScript** - 完整类型支持

## 📝 执行日志示例

```
🌱 ToAIAPI Database Seeding
==================================================
📅 2026-05-31T12:00:00.000Z

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

## 🐳 Docker 部署

```yaml
# docker-compose.yml
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

## 🔧 命令参考

```bash
# 运行 seed
pnpm db:seed

# 或直接在 backend 目录
cd apps/backend
pnpm db:seed

# 验证 seed
./scripts/verify-seed.sh

# 查看数据
pnpm db:studio
```

## ⚠️ 注意事项

1. **首次部署**：必须先运行 `pnpm db:migrate`
2. **密码安全**：生产环境务必修改 `ADMIN_PASSWORD`
3. **API Key**：Seed 不会创建 Channel API Key，需在后台配置
4. **数据安全**：Seed 只创建基础数据，不会覆盖已修改的数据

## 📚 更多信息

详见 [docs/seed-system.md](docs/seed-system.md)
