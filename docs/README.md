# ToAIAPI 文档中心

## 文档结构

```
docs/
├── README.md                    # 本文件
├── 00-project/                  # 项目文档
│   ├── vision.md                # 产品愿景
│   ├── roadmap.md               # 开发路线图
│   └── architecture.md          # 系统架构
│
├── 01-product/                  # 产品需求文档 (PRD)
│   ├── user-system.md           # 用户系统
│   ├── api-key.md               # API Key 系统
│   ├── billing.md               # 计费系统
│   ├── payment.md               # 支付系统 (V3.0)
│   ├── enterprise.md            # 企业系统 (V5.0)
│   └── reseller.md              # 代理商系统 (V6.0)
│
├── 02-technical/                # 技术设计文档 (TRD)
│   ├── backend.md               # 后端技术规范
│   ├── frontend.md              # 前端技术规范
│   ├── gateway.md               # Gateway 技术规范
│   ├── security.md              # 安全技术规范
│   └── monitoring.md            # 监控系统 (V4.0)
│
├── 03-database/                 # 数据库设计 (ERD)
│   ├── schema.md                # Schema 文档
│   └── erd.md                   # 实体关系图
│
├── 04-api/                      # 接口规范 (API SPEC)
│   ├── openai-compatible.md     # OpenAI 兼容 API
│   ├── admin-api.md             # Admin API
│   └── internal-api.md          # 内部 API（用户端）
│
├── 05-ai-prompts/               # AI 开发提示词库
│   ├── backend.md               # 后端开发提示词
│   ├── frontend.md              # 前端开发提示词
│   ├── prisma.md                # Prisma 数据库提示词
│   ├── security.md              # 安全开发提示词
│   └── testing.md               # 测试开发提示词
│
└── 06-devops/                   # 运维部署文档
    ├── docker.md                # Docker 部署
    ├── ci-cd.md                 # CI/CD 配置
    └── deployment.md            # 生产环境部署
```

## 阅读指南

### 新成员入门

1. 阅读 `00-project/vision.md` — 了解项目目标
2. 阅读 `00-project/architecture.md` — 了解技术架构
3. 阅读 `02-technical/backend.md` — 了解后端规范
4. 阅读 `02-technical/frontend.md` — 了解前端规范
5. 阅读 `03-database/schema.md` — 了解数据模型

### 开发新功能

1. 阅读 `01-product/` 下对应模块的 PRD
2. 阅读 `04-api/` 下的接口规范
3. 使用 `05-ai-prompts/` 下的提示词辅助开发
4. 参考 `02-technical/` 下的技术规范

### 部署上线

1. 阅读 `06-devops/docker.md` — 了解容器化
2. 阅读 `06-devops/deployment.md` — 了解部署流程
3. 阅读 `06-devops/ci-cd.md` — 了解 CI/CD

## 版本状态

| 文档 | 状态 | 说明 |
|------|------|------|
| 00-project | ✅ 完成 | 项目基础文档 |
| 01-product | ✅ 完成 | V1.0-V2.0 已实现，V3.0+ 为规划 |
| 02-technical | ✅ 完成 | 技术规范 |
| 03-database | ✅ 完成 | 当前 Schema 文档 |
| 04-api | ✅ 完成 | 已实现 API 文档 |
| 05-ai-prompts | ✅ 完成 | AI 辅助开发提示词 |
| 06-devops | ✅ 完成 | 部署运维文档 |
