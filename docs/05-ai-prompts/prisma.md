# AI 提示词 — Prisma 数据库设计

## 新增模型提示词

```
为 ToAIAPI 项目在 Prisma Schema 中新增 {模型名} 模型。

当前 Schema：apps/backend/prisma/schema.prisma

需求：
{功能描述}

设计要求：
1. ID 使用 cuid()
2. 金额字段使用 Int（单位：分）
3. 时间字段使用 DateTime
4. 枚举类型定义在 schema 顶部
5. 关系使用 @relation 定义
6. 高频查询字段加 @@index
7. 表名使用 @@map 指定为 snake_case

输出：
1. 完整的 model 定义
2. 相关 enum（如需）
3. 必要的索引
4. Migration 命令
```

## Schema 变更提示词

```
修改 ToAIAPI 的 Prisma Schema。

当前模型：{模型名}
变更类型：新增字段 / 修改字段 / 删除字段 / 新增关系

变更内容：
{具体变更}

要求：
1. 保持向后兼容（新增字段设默认值）
2. 考虑数据迁移
3. 更新相关 Repository 和 Service
4. 生成 migration

输出：
1. Schema diff
2. Migration SQL
3. 受影响的代码文件
```

## Seed 数据提示词

```
为 ToAIAPI 的 {模型名} 编写 Seed 数据。

当前 Seed：apps/backend/prisma/seed.ts

数据内容：
{数据描述}

要求：
1. 使用 PrismaClient
2. 支持幂等执行（upsert）
3. 合理的默认值
4. 符合业务逻辑的数据

输出完整的 seed 代码。
```

## 查询优化提示词

```
优化 ToAIAPI 的 Prisma 查询性能。

当前查询：
{现有代码}

问题：
{性能问题描述}

优化方向：
1. 减少查询次数（include / select）
2. 添加索引
3. 分页优化（cursor vs offset）
4. 批量操作（createMany / updateMany）

输出优化后的代码和解释。
```
