/**
 * 用户实体
 *
 * 对应 Prisma User model，排除敏感字段。
 */
export class UserEntity {
    id;
    email;
    phone;
    display_name;
    avatar_url;
    role;
    status;
    github_id;
    google_id;
    wechat_id;
    organization_id;
    created_at;
    updated_at;
    /**
     * 从 Prisma User 转换为 UserEntity（排除敏感字段）
     */
    static fromPrisma(user) {
        const entity = new UserEntity();
        entity.id = user.id;
        entity.email = user.email;
        entity.phone = user.phone;
        entity.display_name = user.display_name;
        entity.avatar_url = user.avatar_url;
        entity.role = user.role;
        entity.status = user.status;
        entity.github_id = user.github_id;
        entity.google_id = user.google_id;
        entity.wechat_id = user.wechat_id;
        entity.organization_id = user.organization_id;
        entity.created_at = user.created_at;
        entity.updated_at = user.updated_at;
        return entity;
    }
}
//# sourceMappingURL=user.entity.js.map