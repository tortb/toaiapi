import * as argon2 from 'argon2';
const ARGON2_OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
};
/**
 * Hash password using Argon2id
 */
export async function hashPassword(password) {
    return argon2.hash(password, ARGON2_OPTIONS);
}
/**
 * Verify password against hash
 */
export async function verifyPassword(password, hash) {
    return argon2.verify(hash, password);
}
/**
 * Validate password strength
 */
export function validatePasswordStrength(password) {
    const errors = [];
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (password.length > 128) {
        errors.push('Password must be at most 128 characters long');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
//# sourceMappingURL=password.js.map