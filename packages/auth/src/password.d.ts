/**
 * Hash password using Argon2id
 */
export declare function hashPassword(password: string): Promise<string>;
/**
 * Verify password against hash
 */
export declare function verifyPassword(password: string, hash: string): Promise<boolean>;
/**
 * Validate password strength
 */
export declare function validatePasswordStrength(password: string): {
    valid: boolean;
    errors: string[];
};
//# sourceMappingURL=password.d.ts.map