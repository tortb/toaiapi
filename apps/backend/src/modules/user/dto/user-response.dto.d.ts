/**
 * 用户响应 DTO
 *
 * 排除敏感字段（password_hash）
 */
export declare class UserResponseDto {
    readonly id: string;
    readonly email: string;
    readonly phone: string | null;
    readonly displayName: string | null;
    readonly avatarUrl: string | null;
    readonly role: string;
    readonly status: string;
    readonly createdAt: Date;
}
//# sourceMappingURL=user-response.dto.d.ts.map