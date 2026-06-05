# ToAIAPI Review Checklist

## AI 每次提交代码前必须检查

所有检查项必须通过才能提交代码。

## 影响范围检查

- [ ] **是否影响数据库？**
  - 是否需要 Prisma Migration？
  - 是否影响现有数据？
  - 是否需要数据迁移？

- [ ] **是否影响计费系统？**
  - 是否修改了 Token 计算逻辑？
  - 是否修改了价格计算逻辑？
  - 是否修改了余额扣减逻辑？

- [ ] **是否影响支付系统？**
  - 是否修改了支付流程？
  - 是否修改了回调处理？
  - 是否修改了退款逻辑？

- [ ] **是否影响余额系统？**
  - 是否修改了余额操作？
  - 是否修改了交易流水？
  - 是否使用了数据库事务？

- [ ] **是否影响权限系统？**
  - 是否修改了认证逻辑？
  - 是否修改了授权逻辑？
  - 是否修改了 API Key 验证？

- [ ] **是否影响接口兼容性？**
  - 是否修改了现有 API？
  - 是否影响 OpenAI 兼容？
  - 是否影响 Anthropic 兼容？

- [ ] **是否影响 SDK？**
  - 是否修改了 packages/sdk？
  - 是否修改了公共类型？

- [ ] **是否影响 Claude Code？**
  - 是否影响 /v1/messages 端点？
  - 是否影响流式响应？

- [ ] **是否影响 Codex CLI？**
  - 是否影响 /v1/chat/completions 端点？
  - 是否影响 /v1/responses 端点？

## 代码质量检查

- [ ] **TypeScript**
  - 无 `any` 类型？
  - 无 `unknown` 滥用？
  - 无非空断言？
  - 无魔法数字？
  - 使用 strict 模式？

- [ ] **代码规范**
  - 单文件 < 500 行？
  - 单函数 < 50 行？
  - 命名语义清晰？
  - 注释充分？

- [ ] **架构规范**
  - Controller 未直接访问数据库？
  - Service 包含业务逻辑？
  - Repository 封装数据访问？
  - 模块间通过 Service 调用？

- [ ] **安全检查**
  - 所有输入已校验？
  - 无 SQL 注入风险？
  - 无 XSS 风险？
  - 敏感信息未出现在日志？
  - 密码/API Key 已加密存储？

## 测试检查

- [ ] **单元测试**
  - 新增代码有单元测试？
  - 核心逻辑有测试覆盖？
  - 边界条件有测试？

- [ ] **集成测试**
  - API 端点有测试？
  - 数据库操作有测试？
  - 事务操作有测试？

- [ ] **E2E 测试**
  - 关键流程有 E2E 测试？
  - 支付流程有测试？
  - 计费流程有测试？

## 文档检查

- [ ] **API 文档**
  - Swagger 已更新？
  - 请求/响应类型已定义？
  - 错误码已文档化？

- [ ] **设计文档**
  - 复杂功能有设计说明？
  - 数据库变更有说明？
  - 接口变更有说明？

## 迁移检查

- [ ] **数据库迁移**
  - Migration 已生成？
  - Migration 可回滚？
  - Migration 已测试？

- [ ] **数据迁移**
  - 是否需要数据迁移？
  - 迁移脚本已编写？
  - 迁移已测试？

## 部署检查

- [ ] **环境变量**
  - 新增环境变量已文档化？
  - .env.example 已更新？

- [ ] **依赖**
  - 新增依赖已审查？
  - 无安全漏洞？
  - 版本已锁定？

## 特殊模块检查

### 计费模块

- [ ] 是否使用 Tokenizer 重新计算 token？
- [ ] 金额是否使用整数（分）？
- [ ] 余额操作是否使用数据库事务？
- [ ] 费用计算是否向上取整？
- [ ] 是否有幂等保护？

### 支付模块

- [ ] 是否验证支付回调签名？
- [ ] 是否使用 timingSafeEqual？
- [ ] 是否有幂等保护？
- [ ] 订单状态是否只能通过回调修改？
- [ ] 是否有超时处理？

### 网关模块

- [ ] 是否支持流式响应？
- [ ] 渠道选择是否正确？
- [ ] 故障转移是否生效？
- [ ] 是否正确记录 token 使用？
- [ ] 是否正确触发计费？

## 提交信息格式

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Type

- `feat`: 新功能
- `fix`: 修复
- `docs`: 文档
- `style`: 代码格式
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试
- `chore`: 构建/工具

### Scope

- `auth`: 认证授权
- `user`: 用户管理
- `api-key`: API Key
- `billing`: 计费
- `payment`: 支付
- `gateway`: 网关
- `channel`: 渠道
- `model`: 模型
- `admin`: 管理后台
- `sdk`: SDK
- `docs`: 文档

### 示例

```
feat(billing): add token usage tracking

- Implement tokenizer for accurate token counting
- Add request log recording
- Add billing deduction logic

Closes #123
```

```
fix(payment): fix wechat pay signature verification

- Use timingSafeEqual for signature comparison
- Add nonce validation
- Fix timestamp parsing

Fixes #456
```
