# Contributing to ToAIAPI

感谢你对 ToAIAPI 项目的关注！

## 开发流程

### 1. Fork & Clone

```bash
git clone https://github.com/your-username/toaiapi.git
cd toaiapi
```

### 2. 创建分支

```bash
git checkout -b feature/your-feature
# 或
git checkout -b fix/your-fix
```

### 3. 开发

请遵循以下规范：

- 阅读 `.ai/` 目录下的所有规则文件
- 遵循 TypeScript Strict 模式
- 代码必须通过 ESLint 和 Prettier
- 新增功能必须包含测试
- 数据库变更必须使用 Prisma Migration

### 4. 提交

```bash
git add .
git commit -m "feat(scope): description"
```

提交信息格式：

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Type:
- `feat`: 新功能
- `fix`: 修复
- `docs`: 文档
- `style`: 代码格式
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试
- `chore`: 构建/工具

### 5. Pull Request

- 确保所有测试通过
- 确保代码通过 ESLint
- 填写 PR 模板
- 等待 Code Review

## 代码规范

### TypeScript

- 禁止使用 `any`
- 禁止使用 `var`
- 禁止魔法数字
- 使用 `interface` 定义类型
- 使用 `enum` 定义常量

### 文件规范

- 单文件最大 500 行
- 单函数最大 50 行
- 使用 snake_case 命名文件
- 使用 PascalCase 命名类/接口
- 使用 camelCase 命名函数/变量

### 测试

- 新增代码必须有单元测试
- 核心逻辑必须有集成测试
- 关键流程必须有 E2E 测试

## 数据库规范

- 所有变更必须使用 Prisma Migration
- Migration 必须可回滚
- 表名使用 snake_case
- 字段名使用 snake_case
- 金额使用整数（分）

## 安全规范

- 所有输入必须校验
- 密码必须加密存储
- API Key 必须加密存储
- 敏感信息不得出现在日志
- 支付回调必须验证签名

## 计费规范

- 永远不能相信模型返回的 token 数
- 余额操作必须使用数据库事务
- 金额计算必须使用整数
- 费用计算必须向上取整

## 问题反馈

- 使用 GitHub Issues 报告问题
- 使用 Bug Report 模板
- 提供复现步骤
- 提供错误日志

## 行为准则

- 尊重他人
- 保持专业
- 接受建设性批评
- 专注于对社区最有利的事情
