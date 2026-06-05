/**
 * 从 Prisma User 转换为 UserEntity（排除敏感字段）
 */
export function userFromPrisma(user) {
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
//# sourceMappingURL=user.entity.js.map