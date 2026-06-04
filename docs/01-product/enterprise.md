# 企业系统 — PRD

## 状态：V5.0 计划中

## 功能清单

### 1. 组织管理

| 功能 | 说明 |
|------|------|
| 创建组织 | 企业用户创建组织 |
| 组织资料 | 名称、Logo、描述 |
| 组织配额 | 组织级别的余额和配额 |
| 组织 API Key | 组织级别的 API Key |

### 2. 团队管理

| 功能 | 说明 |
|------|------|
| 创建团队 | 组织下创建多个团队 |
| 团队配额 | 团队级别的配额分配 |
| 团队 API Key | 团队级别的 API Key |

### 3. 成员管理

| 功能 | 说明 |
|------|------|
| 邀请成员 | 通过邮件邀请 |
| 角色分配 | 为成员分配角色 |
| 移除成员 | 移除组织成员 |
| 成员列表 | 查看所有成员 |

### 4. RBAC 权限

| 角色 | 权限 |
|------|------|
| Owner | 全部权限，不可删除 |
| Admin | 管理成员、团队、配额 |
| Developer | 创建 API Key、查看用量 |
| Billing | 查看账单、管理支付 |
| Viewer | 只读权限 |

### 5. SSO 集成

- SAML 2.0
- OIDC
- 企业邮箱自动关联

## 数据库模型（待实现）

```prisma
model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  logo_url    String?
  description String?
  balance     Int      @default(0)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  members  User[]
  teams    Team[]

  @@map("organizations")
}

model Team {
  id              String   @id @default(cuid())
  organization_id String
  name            String
  description     String?
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  organization Organization @relation(fields: [organization_id], references: [id])
  members      TeamMember[]

  @@index([organization_id])
  @@map("teams")
}

model TeamMember {
  id       String @id @default(cuid())
  team_id  String
  user_id  String
  role     String @default("member")

  team Team @relation(fields: [team_id], references: [id])
  user User @relation(fields: [user_id], references: [id])

  @@unique([team_id, user_id])
  @@map("team_members")
}

model Invitation {
  id              String   @id @default(cuid())
  organization_id String
  email           String
  role            String
  token           String   @unique
  expires_at      DateTime
  accepted_at     DateTime?
  created_at      DateTime @default(now())

  organization Organization @relation(fields: [organization_id], references: [id])

  @@index([organization_id])
  @@map("invitations")
}
```
