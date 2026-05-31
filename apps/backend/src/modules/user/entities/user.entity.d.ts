import { User as PrismaUser, UserRole, UserStatus } from '@prisma/client';
/**
 * 用户实体
 *
 * 对应 Prisma User model，排除敏感字段。
 */
export declare class UserEntity implements Omit<PrismaUser, 'password_hash' | 'deleted_at'> {
    readonly id: string;
    readonly email: string;
    readonly phone: string | null;
    readonly display_name: string | null;
    readonly avatar_url: string | null;
    readonly role: UserRole;
    readonly status: UserStatus;
    readonly github_id: string | null;
    readonly google_id: string | null;
    readonly wechat_id: string | null;
    readonly organization_id: string | null;
    readonly created_at: Date;
    readonly updated_at: Date;
    /**
     * 从 Prisma User 转换为 UserEntity（排除敏感字段）
     */
    static fromPrisma(user: PrismaUser): UserEntity;
}
//# sourceMappingURL=user.entity.d.ts.map