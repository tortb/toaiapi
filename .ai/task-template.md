# ToAIAPI AI Task Template

## 使用方法

不要直接说"帮我写登录"，而是使用以下模板：

---

# Task

实现邮箱登录模块

# Context

- 项目: ToAIAPI
- 技术栈: NestJS + Prisma + PostgreSQL + Redis
- 模块: auth

# Requirements

1. 支持邮箱 + 密码登录
2. 支持 JWT Access Token + Refresh Token
3. 支持 Redis 存储 Session
4. 支持邮箱验证码（注册/找回密码）
5. 支持登录限流（5次/分钟）

# Constraints

1. 禁止修改数据库结构（除非有 Migration）
2. 禁止修改公共模块（packages/common）
3. 禁止修改计费模块（packages/billing）
4. 必须使用 class-validator 校验输入
5. 必须使用 argon2 加密密码

# Database Impact

- 是否需要新表？
- 是否需要 Migration？
- 影响哪些现有表？

# API Design

```
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/send-code
POST /api/v1/auth/reset-password
```

# Output Requirements

1. 设计说明
2. 数据库影响分析
3. 代码实现
4. 单元测试
5. E2E 测试
6. Swagger 文档

# Risk Analysis

1. 安全风险
2. 性能风险
3. 兼容性风险

---

## 任务类型模板

### 新功能

```markdown
# Task
实现 [功能名称]

# Context
- 项目: ToAIAPI
- 技术栈: [相关技术]
- 模块: [所属模块]

# Requirements
1. [需求1]
2. [需求2]
3. [需求3]

# Constraints
1. [限制1]
2. [限制2]

# Database Impact
- [ ] 是否需要新表？
- [ ] 是否需要 Migration？
- [ ] 影响哪些现有表？

# API Design
[接口设计]

# Output Requirements
1. 设计说明
2. 数据库影响分析
3. 代码实现
4. 单元测试
5. E2E 测试
6. Swagger 文档

# Risk Analysis
1. 安全风险
2. 性能风险
3. 兼容性风险
```

### Bug 修复

```markdown
# Task
修复 [Bug 描述]

# Context
- 项目: ToAIAPI
- 模块: [所属模块]
- 错误信息: [错误日志]

# Reproduction Steps
1. [步骤1]
2. [步骤2]
3. [步骤3]

# Expected Behavior
[期望行为]

# Actual Behavior
[实际行为]

# Root Cause Analysis
[根本原因分析]

# Fix Plan
[修复方案]

# Impact Analysis
- [ ] 是否影响其他模块？
- [ ] 是否需要数据库变更？
- [ ] 是否需要更新测试？

# Output Requirements
1. 根本原因分析
2. 修复代码
3. 单元测试
4. 回归测试
```

### 重构

```markdown
# Task
重构 [模块/功能]

# Context
- 项目: ToAIAPI
- 模块: [所属模块]
- 当前问题: [问题描述]

# Refactoring Goals
1. [目标1]
2. [目标2]
3. [目标3]

# Current Architecture
[当前架构]

# Target Architecture
[目标架构]

# Migration Plan
[迁移计划]

# Constraints
1. 必须保持向后兼容
2. 必须保持测试通过
3. 必须分步骤执行

# Output Requirements
1. 重构方案
2. 影响范围分析
3. 代码实现
4. 测试更新
5. 文档更新
```

### 性能优化

```markdown
# Task
优化 [模块/功能] 性能

# Context
- 项目: ToAIAPI
- 模块: [所属模块]
- 当前性能: [性能指标]
- 目标性能: [性能目标]

# Performance Analysis
[性能分析]

# Optimization Plan
1. [优化1]
2. [优化2]
3. [优化3]

# Benchmark
[基准测试方案]

# Constraints
1. 必须保持功能正确
2. 必须保持测试通过
3. 必须有性能对比数据

# Output Requirements
1. 性能分析
2. 优化方案
3. 代码实现
4. 基准测试
5. 性能对比数据
```

## 模块特定模板

### 计费模块

```markdown
# Task
[任务描述]

# Billing Impact Analysis
- [ ] 是否影响 Token 计算？
- [ ] 是否影响价格计算？
- [ ] 是否影响余额扣减？
- [ ] 是否影响套餐计算？

# Token Usage
- 使用 Tokenizer 重新计算？
- 记录所有 token 类型？

# Balance Operations
- 使用数据库事务？
- 扣余额和写流水原子？

# Amount Calculation
- 使用整数（分）？
- 向上取整？

# Idempotency
- 有幂等保护？
- 订单号唯一？
```

### 支付模块

```markdown
# Task
[任务描述]

# Payment Impact Analysis
- [ ] 是否影响支付流程？
- [ ] 是否影响回调处理？
- [ ] 是否影响退款流程？

# Security
- 验证回调签名？
- 使用 timingSafeEqual？
- 防重复支付？

# State Machine
- 状态流转正确？
- 禁止直接修改状态？

# Idempotency
- 订单幂等？
- 回调幂等？
```

### 网关模块

```markdown
# Task
[任务描述]

# Gateway Impact Analysis
- [ ] 是否影响请求转发？
- [ ] 是否影响协议兼容？
- [ ] 是否影响流式响应？

# Protocol Compatibility
- OpenAI 兼容？
- Anthropic 兼容？

# Channel Management
- 渠道选择正确？
- 故障转移生效？

# Billing Integration
- 正确记录 token？
- 正确触发计费？
```
