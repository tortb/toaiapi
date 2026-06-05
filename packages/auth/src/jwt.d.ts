import type { JwtPayload, TokenPair, AuthConfig } from './types';
/**
 * 生成访问令牌
 * SECURITY: 使用 HS256 算法，显式指定防止算法混淆攻击
 *
 * @param payload - JWT 载荷（必须包含 type: 'access'）
 * @param secret - 签名密钥
 * @param expiresIn - 过期时间，默认 '15m'
 * @returns 签名后的 JWT 字符串
 */
export declare function generateAccessToken(payload: JwtPayload, secret: string, expiresIn?: string): string;
/**
 * 生成刷新令牌
 * SECURITY: 使用 HS256 算法，显式指定防止算法混淆攻击
 *
 * @param payload - JWT 载荷（必须包含 type: 'refresh'）
 * @param secret - 签名密钥（必须与访问令牌密钥不同）
 * @param expiresIn - 过期时间，默认 '7d'
 * @returns 签名后的 JWT 字符串
 */
export declare function generateRefreshToken(payload: JwtPayload, secret: string, expiresIn?: string): string;
/**
 * 生成 Token 对（访问令牌 + 刷新令牌）
 * SECURITY: 访问令牌和刷新令牌使用不同密钥签名
 *
 * @param payload - JWT 载荷
 * @param config - 认证配置（可选，未提供时从环境变量读取）
 * @returns TokenPair 包含 accessToken 和 refreshToken
 * @throws 环境变量未配置时抛出 Error
 */
export declare function generateTokenPair(payload: JwtPayload, config?: AuthConfig): TokenPair;
/**
 * 验证并解码 JWT Token
 * SECURITY: 显式指定 HS256 算法，防止算法混淆攻击
 *
 * @param token - JWT 字符串
 * @param secret - 签名密钥
 * @returns 解码后的 JwtPayload
 * @throws Token 过期、无效或算法不匹配时抛出 JsonWebTokenError / TokenExpiredError
 */
export declare function verifyToken(token: string, secret: string): JwtPayload;
/**
 * 解码 JWT Token（不验证签名）
 * WARNING: 仅用于调试，不要在生产环境中用于信任数据
 *
 * @param token - JWT 字符串
 * @returns 解码后的 JwtPayload，无效时返回 null
 */
export declare function decodeToken(token: string): JwtPayload | null;
//# sourceMappingURL=jwt.d.ts.map