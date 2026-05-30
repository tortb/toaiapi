import { User as PrismaUser, UserRole, UserStatus } from '@prisma/client';

/**
 * 用户实体
 *
 * 对应 Prisma User model，排除敏感字段。
 */
export interface UserEntity {
  id: string;
  email: string;
  phone: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  status: UserStatus;
  github_id: string | null;
  google_id: string | null;
  wechat_id: string | null;
  organization_id: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * 从 Prisma User 转换为 UserEntity（排除敏感字段）
 */
export function userFromPrisma(user: PrismaUser): UserEntity {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    display_name: user.display_name,
    avatar_url: user.avatar_url,
    role: user.role,
    status: user.status,
    github_id: user.github_id,
    google_id: user.google_id,
    wechat_id: user.wechat_id,
    organization_id: user.organization_id,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}
