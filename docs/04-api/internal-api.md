# 内部 API（用户端）

## 基础信息

- **Base URL:** `https://api.toaiapi.com`
- **认证:** JWT Bearer Token

## Auth

### 注册

```
POST /auth/register
{
  "email": "user@example.com",
  "password": "securePassword123",
  "displayName": "张三"
}
```

响应：
```json
{
  "user": {
    "id": "cuid",
    "email": "user@example.com",
    "displayName": "张三",
    "role": "USER",
    "status": "ACTIVE"
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

### 登录

```
POST /auth/login
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### 刷新 Token

```
POST /auth/refresh
{
  "refreshToken": "eyJ..."
}
```

### 登出

```
POST /auth/logout
Authorization: Bearer eyJ...
```

### 修改密码

```
POST /auth/change-password
Authorization: Bearer eyJ...
{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword123"
}
```

### 忘记密码

```
POST /auth/forgot-password
{
  "email": "user@example.com"
}
```

### 重置密码

```
POST /auth/reset-password
{
  "token": "reset-token",
  "newPassword": "newPassword123"
}
```

---

## User

### 获取当前用户

```
GET /users/me
Authorization: Bearer eyJ...
```

### 更新资料

```
PATCH /users/me
Authorization: Bearer eyJ...
{
  "displayName": "新名字",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

### 注销账号

```
DELETE /users/me
Authorization: Bearer eyJ...
```

---

## API Key

### 列表

```
GET /api-keys
Authorization: Bearer eyJ...
```

### 创建

```
POST /api-keys
Authorization: Bearer eyJ...
{
  "name": "My App",
  "expiresAt": "2025-12-31T23:59:59Z",
  "rateLimit": 60,
  "tokenLimit": 100000,
  "modelLimit": ["gpt-4o", "claude-sonnet-4"],
  "ipWhitelist": ["192.168.1.0/24"]
}
```

响应（仅创建时返回完整 Key）：
```json
{
  "id": "cuid",
  "name": "My App",
  "keyPrefix": "sk-toai-aBcDeFg",
  "key": "sk-toai-aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789abcdefghijklmn",
  "isActive": true,
  "rateLimit": 60,
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### 更新

```
PATCH /api-keys/:id
Authorization: Bearer eyJ...
{
  "rateLimit": 120,
  "modelLimit": ["gpt-4o"]
}
```

### 启用

```
PATCH /api-keys/:id/enable
Authorization: Bearer eyJ...
```

### 禁用

```
PATCH /api-keys/:id/disable
Authorization: Bearer eyJ...
```

### 删除

```
DELETE /api-keys/:id
Authorization: Bearer eyJ...
```

---

## Balance

### 查看余额

```
GET /balance
Authorization: Bearer eyJ...
```

响应：
```json
{
  "amount": 10000,
  "frozen": 0,
  "available": 10000
}
```

> 金额单位：分

### 交易记录

```
GET /balance/transactions?page=1&pageSize=20
Authorization: Bearer eyJ...
```

### 调用日志

```
GET /balance/logs?page=1&pageSize=20
Authorization: Bearer eyJ...
```

---

## 公共端点

### 充值（管理员）

```
POST /balance/recharge
Authorization: Bearer eyJ...
{
  "userId": "target-user-id",
  "amount": 10000,
  "remark": "管理员充值"
}
```
