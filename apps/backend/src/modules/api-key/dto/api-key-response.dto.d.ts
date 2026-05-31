/**
 * API Key 响应 DTO
 *
 * 创建时返回完整的 key，之后只返回 prefix
 */
export declare class ApiKeyResponseDto {
    readonly id: string;
    readonly name: string | null;
    readonly keyPrefix: string;
    readonly key?: string;
    readonly isActive: boolean;
    readonly expiresAt: Date | null;
    readonly rateLimit: number | null;
    readonly tokenLimit: number | null;
    readonly modelLimit: string[];
    readonly ipWhitelist: string[];
    readonly createdAt: Date;
}
//# sourceMappingURL=api-key-response.dto.d.ts.map