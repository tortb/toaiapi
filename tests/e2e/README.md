# ToAIAPI E2E 测试

基于 Playwright 的端到端测试套件，覆盖核心业务流程。

## 快速开始

```bash
# 1. 安装依赖
cd tests/e2e
pnpm install

# 2. 安装浏览器（仅首次）
pnpm exec playwright install --with-deps chromium

# 3. 复制环境变量
cp .env.example .env

# 4. 确保前后端服务已启动（或让 Playwright 自动启动）
cd ../.. && pnpm dev

# 5. 运行所有测试
pnpm test
```

## 测试结构

```
tests/e2e/
├── playwright.config.ts    # Playwright 配置
├── global.setup.ts         # 全局初始化（注册测试用户、保存登录态）
├── fixtures/
│   └── auth.fixture.ts     # 自定义 fixture（已登录 page、API Key 等）
├── utils/
│   ├── test-data.ts        # 测试数据工厂（幂等生成）
│   └── api-helper.ts       # 后端 API 辅助工具
├── tests/
│   ├── auth.spec.ts        # 认证流程（注册/登录/登出/登录态）
│   ├── apikeys.spec.ts     # API Key 管理（创建/列表/启禁用/删除）
│   ├── navigation.spec.ts  # UI 导航稳定性（路由/侧边栏/跳转）
│   └── api-gateway.spec.ts # API Gateway（chat/completions/模型列表）
└── .env.example
```

## 运行指定测试

```bash
# 只跑认证测试
pnpm test:auth

# 只跑 API Key 测试
pnpm test:apikeys

# 只跑导航测试
pnpm test:navigation

# 只跑 API Gateway 测试
pnpm test:api

# 带浏览器界面运行（调试用）
pnpm test:headed

# 交互式调试模式
pnpm test:debug

# Playwright UI 模式
pnpm test:ui

# 查看测试报告
pnpm report
```

## 测试覆盖范围

### auth.spec.ts — 认证流程
- ✅ 注册页面渲染
- ✅ 密码不一致/过短校验
- ✅ 成功注册后跳转 + token 存储
- ✅ 登录页面渲染
- ✅ 错误密码提示
- ✅ 成功登录后跳转 + token 存储
- ✅ 登录/注册页互相跳转
- ✅ 已登录用户访问 dashboard 不被重定向
- ✅ 刷新页面后登录态保持
- ✅ 未登录访问 dashboard 被重定向
- ✅ 退出登录后跳转 + token 清除

### apikeys.spec.ts — API Key 管理
- ✅ 页面标题和操作按钮
- ✅ 空状态展示
- ✅ 创建弹窗表单
- ✅ 填写表单创建密钥
- ✅ 创建后状态为活动
- ✅ 列表表格列头
- ✅ 密钥前缀格式验证
- ✅ 禁用后状态变更
- ✅ 启用后状态变更
- ✅ 删除后从列表移除
- ✅ API 层创建/查询/删除/启禁用

### navigation.spec.ts — UI 导航稳定性
- ✅ 8 个公开页面可正常访问
- ✅ 6 个 Dashboard 页面登录保护
- ✅ 侧边栏 6 个导航项路由正确
- ✅ 返回前台链接
- ✅ 首页 → 控制台跳转
- ✅ /dashboard → /dashboard/overview 重定向
- ✅ 用户菜单项
- ✅ 用户菜单跳转设置
- ✅ 首页导航栏链接

### api-gateway.spec.ts — API Gateway
- ✅ 健康检查端点
- ✅ 公开模型列表
- ✅ 服务状态端点
- ✅ 公开配置端点
- ✅ 同步 chat completion（需 TEST_API_KEY）
- ✅ 流式 SSE 响应（需 TEST_API_KEY）
- ✅ 无效 Key 返回 401
- ✅ 缺少 Key 被拒绝
- ✅ Bearer 方式传递 Key
- ✅ 模型列表端点
- ✅ 缺少 model 字段返回 400
- ✅ 空 messages 返回 400

## 设计原则

- **幂等性**：所有测试数据使用时间戳后缀，每次运行唯一
- **真实浏览器**：禁止 mock 核心逻辑，使用 Chromium 实际渲染
- **POM 模式**：Page Object 封装在 `pages/` 目录（可选扩展）
- **Fixture 注入**：通过 `auth.fixture.ts` 提供已登录 page 和 API 工具
- **数据隔离**：每个测试独立上下文，通过 API 创建/清理数据
- **CI 友好**：headless 模式、自动截图、HTML 报告、artifact 上传

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `BASE_URL` | 前端地址 | `http://localhost:3000` |
| `API_BASE_URL` | 后端地址 | `http://localhost:3001` |
| `ADMIN_EMAIL` | 管理员邮箱 | `admin@toaiapi.com` |
| `ADMIN_PASSWORD` | 管理员密码 | `Admin@123456` |
| `TEST_API_KEY` | 真实 API Key（网关测试用） | 空（跳过网关调用测试） |
| `TEST_MODEL` | 测试模型名 | `gpt-4o-mini` |
