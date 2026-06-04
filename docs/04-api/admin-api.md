# Admin API

## 基础信息

- **Base URL:** `https://api.toaiapi.com/admin`
- **认证:** JWT Bearer Token（需要 ADMIN 或 SUPER_ADMIN 角色）
- **限流:** 120 请求/分钟

## Provider 管理

### 列表

```
GET /admin/providers?page=1&pageSize=20
```

### 创建

```
POST /admin/providers
{
  "name": "openai",
  "displayName": "OpenAI",
  "baseUrl": "https://api.openai.com",
  "isActive": true
}
```

### 详情

```
GET /admin/providers/:id
```

### 更新

```
PATCH /admin/providers/:id
{
  "displayName": "OpenAI Inc.",
  "isActive": false
}
```

### 删除

```
DELETE /admin/providers/:id
```

> 删除前检查：如果该 Provider 下有关联 Channel，拒绝删除。

---

## Channel 管理

### 列表

```
GET /admin/channels?page=1&pageSize=20&providerId=xxx
```

### 创建

```
POST /admin/channels
{
  "providerId": "provider-id",
  "name": "openai-main",
  "baseUrl": "https://api.openai.com",
  "apiKey": "sk-xxx",
  "weight": 50,
  "priority": 10
}
```

### 详情

```
GET /admin/channels/:id
```

### 更新

```
PATCH /admin/channels/:id
{
  "weight": 80,
  "priority": 20
}
```

### 启用

```
PATCH /admin/channels/:id/enable
```

### 禁用

```
PATCH /admin/channels/:id/disable
```

### 删除

```
DELETE /admin/channels/:id
```

---

## Model 管理

### 列表

```
GET /admin/models?page=1&pageSize=20
```

### 创建

```
POST /admin/models
{
  "name": "gpt-4o",
  "displayName": "GPT-4o",
  "providerId": "openai",
  "maxContext": 128000,
  "supportsStreaming": true,
  "supportsTools": true,
  "supportsVision": true
}
```

### 详情

```
GET /admin/models/:id
```

### 更新

```
PATCH /admin/models/:id
{
  "displayName": "GPT-4o Updated",
  "isActive": false
}
```

### 删除

```
DELETE /admin/models/:id
```

### 设置定价

```
PUT /admin/models/:id/pricing
{
  "inputPrice": 250,
  "outputPrice": 1000,
  "cachedPrice": 125,
  "reasoningPrice": null,
  "multiplier": 1.0
}
```

> 价格单位：分/百万 Token

---

## User 管理

### 列表

```
GET /admin/users?page=1&pageSize=20&role=USER&status=ACTIVE
```

### 详情

```
GET /admin/users/:id
```

返回包含用户余额和使用统计。

### 修改角色

```
PATCH /admin/users/:id/role
{
  "role": "ADMIN"
}
```

> 仅 SUPER_ADMIN 可修改角色。

### 修改状态

```
PATCH /admin/users/:id/status
{
  "status": "SUSPENDED",
  "reason": "违规操作"
}
```
