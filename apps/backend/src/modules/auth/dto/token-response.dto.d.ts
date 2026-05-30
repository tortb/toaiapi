/**
 * Token 响应 DTO
 *
 * 登录成功后返回的 token 信息
 */
export declare class TokenResponseDto {
    readonly accessToken: string;
    readonly refreshToken: string;
    readonly tokenType: string;
    readonly expiresIn: number;
}
/**
 * 用户信息 + Token 响应
 */
export declare class AuthResponseDto {
    readonly user: {
        readonly id: string;
        readonly email: string;
        readonly displayName: string | null;
        readonly role: string;
    };
    readonly tokens: TokenResponseDto;
}
//# sourceMappingURL=token-response.dto.d.ts.map