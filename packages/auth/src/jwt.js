import jwt from 'jsonwebtoken';
/**
 * 获取 JWT 密钥，缺失时抛出异常终止进程
 * SECURITY: 绝不使用硬编码默认值，环境变量必须配置
 *
 * @param configValue - 配置对象中的密钥值
 * @param envKey - 环境变量名
 * @returns 密钥字符串
 * @throws 环境变量未配置时抛出 Error
 */
function getRequiredSecret(configValue, envKey) {
    const secret = configValue || process.env[envKey];
    if (!secret) {
        throw new Error(`[SECURITY] ${envKey} 未配置！JWT 密钥必须通过环境变量或 AuthConfig 提供。` +
            `请在 .env 文件中设置 ${envKey}=<至少32字节的随机字符串>`);
    }
    if (secret.length < 32) {
        throw new Error(`[SECURITY] ${envKey} 长度不足 32 字节，当前长度: ${secret.length}。` +
            `请使用更安全的密钥。`);
    }
    return secret;
}
/**
 * 生成访问令牌
 * SECURITY: 使用 HS256 算法，显式指定防止算法混淆攻击
 *
 * @param payload - JWT 载荷（必须包含 type: 'access'）
 * @param secret - 签名密钥
 * @param expiresIn - 过期时间，默认 '15m'
 * @returns 签名后的 JWT 字符串
 */
export function generateAccessToken(payload, secret, expiresIn = '15m') {
    return jwt.sign({ ...payload, type: 'access' }, secret, {
        algorithm: 'HS256',
        expiresIn: expiresIn,
    });
}
/**
 * 生成刷新令牌
 * SECURITY: 使用 HS256 算法，显式指定防止算法混淆攻击
 *
 * @param payload - JWT 载荷（必须包含 type: 'refresh'）
 * @param secret - 签名密钥（必须与访问令牌密钥不同）
 * @param expiresIn - 过期时间，默认 '7d'
 * @returns 签名后的 JWT 字符串
 */
export function generateRefreshToken(payload, secret, expiresIn = '7d') {
    return jwt.sign({ ...payload, type: 'refresh' }, secret, {
        algorithm: 'HS256',
        expiresIn: expiresIn,
    });
}
/**
 * 生成 Token 对（访问令牌 + 刷新令牌）
 * SECURITY: 访问令牌和刷新令牌使用不同密钥签名
 *
 * @param payload - JWT 载荷
 * @param config - 认证配置（可选，未提供时从环境变量读取）
 * @returns TokenPair 包含 accessToken 和 refreshToken
 * @throws 环境变量未配置时抛出 Error
 */
export function generateTokenPair(payload, config) {
    const jwtSecret = getRequiredSecret(config?.jwtSecret, 'JWT_SECRET');
    const jwtRefreshSecret = getRequiredSecret(config?.jwtRefreshSecret, 'JWT_REFRESH_SECRET');
    const accessTokenExpiry = config?.accessTokenExpiry || '15m';
    const refreshTokenExpiry = config?.refreshTokenExpiry || '7d';
    return {
        accessToken: generateAccessToken(payload, jwtSecret, accessTokenExpiry),
        refreshToken: generateRefreshToken(payload, jwtRefreshSecret, refreshTokenExpiry),
    };
}
/**
 * 验证并解码 JWT Token
 * SECURITY: 显式指定 HS256 算法，防止算法混淆攻击
 *
 * @param token - JWT 字符串
 * @param secret - 签名密钥
 * @returns 解码后的 JwtPayload
 * @throws Token 过期、无效或算法不匹配时抛出 JsonWebTokenError / TokenExpiredError
 */
export function verifyToken(token, secret) {
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    // 验证返回值结构
    if (typeof decoded === 'string' || !decoded.sub) {
        throw new Error('Token 格式无效：缺少必要字段');
    }
    return decoded;
}
/**
 * 解码 JWT Token（不验证签名）
 * WARNING: 仅用于调试，不要在生产环境中用于信任数据
 *
 * @param token - JWT 字符串
 * @returns 解码后的 JwtPayload，无效时返回 null
 */
export function decodeToken(token) {
    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded === 'string') {
        return null;
    }
    return decoded;
}
//# sourceMappingURL=jwt.js.map