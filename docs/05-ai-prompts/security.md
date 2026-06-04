# AI 提示词 — 安全开发

## 安全审查提示词

```
审查 ToAIAPI 的以下代码，检查安全漏洞：

代码文件：{文件路径}

检查项：
1. SQL 注入风险
2. XSS 风险
3. CSRF 风险
4. 认证绕过
5. 权限提升
6. 敏感信息泄露
7. 密码存储安全
8. API Key 安全
9. 输入校验完整性
10. 错误信息泄露

输出格式：
- 漏洞描述
- 风险等级（Critical/High/Medium/Low）
- 修复建议
- 修复代码
```

## 认证模块提示词

```
为 ToAIAPI 实现 {功能名} 认证功能。

现有认证系统：
- JWT Access Token（15分钟）
- JWT Refresh Token（7天，Redis 存储）
- API Key（Argon2id 哈希）
- 密码：Argon2id

安全要求：
1. 密码最少 8 字符
2. 登录失败限制（5次/分钟/IP）
3. Token 黑名单支持
4. 敏感操作二次验证

参考实现：
- apps/backend/src/modules/auth/
- packages/auth/
```

## 加密实现提示词

```
为 ToAIAPI 实现数据加密功能。

需求：
{加密需求}

现有加密基础设施：
- @toai/auth：Argon2id 哈希
- AES-256-GCM：Channel API Key 加密
- 环境变量：ENCRYPTION_KEY

要求：
1. 使用 Node.js crypto 模块
2. 随机 IV/Nonce
3. 认证加密（AEAD）
4. 密钥轮换支持
5. 错误处理
```
