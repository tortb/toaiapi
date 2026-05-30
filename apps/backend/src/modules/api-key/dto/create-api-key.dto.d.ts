/**
 * 创建 API Key 请求 DTO
 */
export declare class CreateApiKeyDto {
    readonly name?: string;
    readonly expiresAt?: string;
    readonly rateLimit?: number;
    readonly tokenLimit?: number;
    readonly modelLimit?: string[];
    readonly ipWhitelist?: string[];
}
//# sourceMappingURL=create-api-key.dto.d.ts.map