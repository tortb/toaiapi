import jwt from 'jsonwebtoken';
/**
 * Generate access token
 */
export function generateAccessToken(payload, secret, expiresIn = '15m') {
    return jwt.sign(payload, secret, { expiresIn });
}
/**
 * Generate refresh token
 */
export function generateRefreshToken(payload, secret, expiresIn = '7d') {
    return jwt.sign(payload, secret, { expiresIn });
}
/**
 * Generate token pair
 */
export function generateTokenPair(payload, config) {
    return {
        accessToken: generateAccessToken(payload, config.jwtSecret, config.accessTokenExpiry),
        refreshToken: generateRefreshToken(payload, config.jwtRefreshSecret, config.refreshTokenExpiry),
    };
}
/**
 * Verify token
 */
export function verifyToken(token, secret) {
    return jwt.verify(token, secret);
}
/**
 * Decode token without verification
 */
export function decodeToken(token) {
    return jwt.decode(token);
}
//# sourceMappingURL=jwt.js.map