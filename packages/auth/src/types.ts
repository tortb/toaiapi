/**
 * JWT Token 类型
 * - access: 访问令牌，用于 API 认证
 * - refresh: 刷新令牌，用于续期访问令牌
 */
export type TokenType = 'access' | 'refresh';

/**
 * JWT Payload 结构
 * 所有 JWT Token 的载荷都遵循此结构
 */
export interface JwtPayload {
  /** 用户 ID */
  sub: string;
  /** 用户邮箱 */
  email: string;
  /** 用户角色 */
  role: string;
  /** Token 类型：access 或 refresh */
  type: TokenType;
  /** JWT ID，可选 */
  jti?: string;
  /** 签发方 */
  iss?: string;
  /** 接收方 */
  aud?: string;
  /** 签发时间戳 */
  iat?: number;
  /** 过期时间戳 */
  exp?: number;
}

/**
 * Token 对：包含访问令牌和刷新令牌
 */
export interface TokenPair {
  /** 访问令牌（短期，15分钟） */
  accessToken: string;
  /** 刷新令牌（长期，7天） */
  refreshToken: string;
}

/**
 * 认证配置
 */
export interface AuthConfig {
  /** JWT 私钥（PEM，RS256/ES256）。配置后优先使用非对称签名。 */
  jwtPrivateKey?: string;
  /** JWT 公钥（PEM，RS256/ES256）。配置后优先使用非对称签名。 */
  jwtPublicKey?: string;
  /** JWT 访问令牌密钥（旧版 HS256 兼容）。 */
  jwtSecret?: string;
  /** JWT 刷新令牌密钥（旧版 HS256 兼容）。 */
  jwtRefreshSecret?: string;
  /** JWT 算法 */
  jwtAlgorithm?: 'RS256' | 'ES256' | 'HS256';
  /** JWT 签发方 */
  jwtIssuer?: string;
  /** JWT 接收方 */
  jwtAudience?: string;
  /** 访问令牌过期时间，格式如 '15m'、'1h' */
  accessTokenExpiry?: string;
  /** 刷新令牌过期时间，格式如 '7d'、'30d' */
  refreshTokenExpiry?: string;
}
