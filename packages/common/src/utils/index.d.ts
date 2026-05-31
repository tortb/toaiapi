/**
 * Convert yuan to cents
 */
export declare function yuanToFen(yuan: number): number;
/**
 * Convert cents to yuan string
 */
export declare function fenToYuan(fen: number): string;
/**
 * Mask email for logging
 */
export declare function maskEmail(email: string): string;
/**
 * Mask phone number for logging
 */
export declare function maskPhone(phone: string): string;
/**
 * Mask API key for logging
 */
export declare function maskApiKey(key: string): string;
/**
 * Generate order number
 */
export declare function generateOrderNo(): string;
/**
 * Calculate token cost (in cents)
 */
export declare function calculateTokenCost(tokenCount: number, pricePerMillionTokens: number): number;
/**
 * Check if value is defined
 */
export declare function isDefined<T>(value: T | null | undefined): value is T;
/**
 * Sleep for specified milliseconds
 */
export declare function sleep(ms: number): Promise<void>;
//# sourceMappingURL=index.d.ts.map