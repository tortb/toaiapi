# API Key 系统 — PRD

## 功能清单

### 1. Key 生命周期

| 功能 | 状态 | 说明 |
|------|------|------|
| 创建 Key | ✅ V1.0 | 最多 20 个/用户 |
| 查看 Key 列表 | ✅ V1.0 | 显示前缀，不显示完整 Key |
| 启用/禁用 Key | ✅ V1.0 | 临时禁用 |
| 删除 Key | ✅ V1.0 | 不可恢复 |
| Key 过期 | ✅ V1.0 | 可选过期时间 |

### 2. Key 格式

```
sk-toai-{nanoid(48)}
示例: sk-toai-aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789abcdefghijklmn
```

- 前缀 `sk-toai-` 便于识别
- `nanoid(48)` 保证唯一性
- 存储时使用 Argon2id 哈希
- `key_prefix` 存储前 16 字符用于列表展示

### 3. 安全限制

| 限制项 | 状态 | 说明 |
|--------|------|------|
| 每分钟请求数 | ✅ V1.0 | rate_limit (1-10000) |
| 每分钟 Token 数 | ✅ V1.0 | token_limit |
| 允许的模型 | ✅ V1.0 | model_limit (白名单) |
| IP 白名单 | ✅ V1.0 | ip_whitelist |
| 过期时间 | ✅ V1.0 | expires_at |

### 4. Gateway 认证

Gateway 层通过 API Key 认证（非 JWT）：

```
# 方式一：Header
X-API-Key: sk-toai-xxxxx

# 方式二：Bearer
Authorization: Bearer sk-toai-xxxxx
```

**认证流程：**
1. 提取 API Key
2. 通过 key_prefix 查询候选 Key
3. 逐个验证 Argon2id 哈希
4. 检查 Key 状态（isActive）
5. 检查过期时间
6. 检查限流（Redis 计数器）
7. 返回用户信息

## API 端点

```
POST   /api-keys              # 创建 API Key
GET    /api-keys              # 列出用户的 API Key
PATCH  /api-keys/:id          # 更新配置
PATCH  /api-keys/:id/enable   # 启用
PATCH  /api-keys/:id/disable  # 禁用
DELETE /api-keys/:id          # 删除
```

## 数据库模型

```prisma
model ApiKey {
  id           String    @id @default(cuid())
  user_id      String
  name         String
  key_hash     String    @unique
  key_prefix   String    @unique
  is_active    Boolean   @default(true)
  expires_at   DateTime?
  rate_limit   Int       @default(60)
  token_limit  Int?
  model_limit  String[]
  ip_whitelist String[]
  created_at   DateTime  @default(now())
  updated_at   DateTime  @updatedAt

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id])
  @@map("api_keys")
}
```

## Redis 缓存

```
# API Key 验证缓存
apikey:prefix:{key_prefix} → { keyId, userId, isActive, ... }

# 限流计数器
ratelimit:{key_id}:{minute_timestamp} → request_count
tokenratelimit:{key_id}:{minute_timestamp} → token_count
```

缓存失效策略：
- 创建/更新/删除 Key 时主动清除缓存
- 缓存 TTL: 5 分钟
