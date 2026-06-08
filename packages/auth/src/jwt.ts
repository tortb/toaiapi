import jwt from 'jsonwebtoken';
import type { Algorithm, SignOptions, VerifyOptions } from 'jsonwebtoken';
import type { JwtPayload, TokenPair, AuthConfig } from './types';

type AsymmetricJwtAlgorithm = 'RS256' | 'ES256';
type SupportedJwtAlgorithm = AsymmetricJwtAlgorithm | 'HS256';

type ResolvedAuthConfig = {
  mode: 'asymmetric' | 'hmac';
  jwtAlgorithm: SupportedJwtAlgorithm;
  jwtPrivateKey?: string;
  jwtPublicKey?: string;
  jwtSecret?: string;
  jwtRefreshSecret?: string;
  jwtIssuer?: string;
  jwtAudience?: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
};

function normalizeKey(value: string): string {
  return value.replace(/\\n/g, '\n');
}

function readOptionalValue(value: string | undefined, envKey: string): string | undefined {
  const resolved = value || process.env[envKey];
  return resolved || undefined;
}

function readHmacSecret(value: string | undefined, envKey: string): string {
  const secret = readOptionalValue(value, envKey);
  if (!secret) {
    throw new Error(`[SECURITY] ${envKey} 未配置！请配置 JWT_PRIVATE_KEY/JWT_PUBLIC_KEY 或旧版 ${envKey}。`);
  }
  if (secret.length < 32) {
    throw new Error(`[SECURITY] ${envKey} 长度不足 32 字节，当前长度: ${secret.length}。请使用更安全的密钥。`);
  }
  return secret;
}

function resolveAsymmetricAlgorithm(value?: string): AsymmetricJwtAlgorithm {
  const algorithm = (value || process.env['JWT_ALGORITHM'] || 'RS256') as AsymmetricJwtAlgorithm;
  if (algorithm !== 'RS256' && algorithm !== 'ES256') {
    throw new Error('[SECURITY] JWT_ALGORITHM 使用非对称密钥时只允许 RS256 或 ES256');
  }
  return algorithm;
}

function resolveConfig(config?: Partial<AuthConfig>): ResolvedAuthConfig {
  const privateKey = readOptionalValue(config?.jwtPrivateKey, 'JWT_PRIVATE_KEY');
  const publicKey = readOptionalValue(config?.jwtPublicKey, 'JWT_PUBLIC_KEY');

  if (privateKey || publicKey) {
    if (!privateKey || !publicKey) {
      throw new Error('[SECURITY] JWT_PRIVATE_KEY 与 JWT_PUBLIC_KEY 必须同时配置');
    }

    const issuer = readOptionalValue(config?.jwtIssuer, 'JWT_ISSUER');
    const audience = readOptionalValue(config?.jwtAudience, 'JWT_AUDIENCE');
    if (!issuer || !audience) {
      throw new Error('[SECURITY] 使用 JWT_PRIVATE_KEY/JWT_PUBLIC_KEY 时必须配置 JWT_ISSUER 和 JWT_AUDIENCE');
    }

    return {
      mode: 'asymmetric',
      jwtPrivateKey: normalizeKey(privateKey),
      jwtPublicKey: normalizeKey(publicKey),
      jwtAlgorithm: resolveAsymmetricAlgorithm(config?.jwtAlgorithm),
      jwtIssuer: issuer,
      jwtAudience: audience,
      accessTokenExpiry: config?.accessTokenExpiry || process.env['JWT_EXPIRATION'] || '15m',
      refreshTokenExpiry: config?.refreshTokenExpiry || process.env['JWT_REFRESH_EXPIRATION'] || '7d',
    };
  }

  return {
    mode: 'hmac',
    jwtAlgorithm: 'HS256',
    jwtSecret: readHmacSecret(config?.jwtSecret, 'JWT_SECRET'),
    jwtRefreshSecret: readHmacSecret(config?.jwtRefreshSecret, 'JWT_REFRESH_SECRET'),
    jwtIssuer: readOptionalValue(config?.jwtIssuer, 'JWT_ISSUER'),
    jwtAudience: readOptionalValue(config?.jwtAudience, 'JWT_AUDIENCE'),
    accessTokenExpiry: config?.accessTokenExpiry || process.env['JWT_EXPIRATION'] || '15m',
    refreshTokenExpiry: config?.refreshTokenExpiry || process.env['JWT_REFRESH_EXPIRATION'] || '7d',
  };
}

function signOptions(config: ResolvedAuthConfig, expiresIn: string): SignOptions {
  return {
    algorithm: config.jwtAlgorithm as Algorithm,
    expiresIn: expiresIn as SignOptions['expiresIn'],
    ...(config.jwtIssuer ? { issuer: config.jwtIssuer } : {}),
    ...(config.jwtAudience ? { audience: config.jwtAudience } : {}),
  };
}

function verifyOptions(config: ResolvedAuthConfig): VerifyOptions {
  return {
    algorithms: [config.jwtAlgorithm as Algorithm],
    ...(config.jwtIssuer ? { issuer: config.jwtIssuer } : {}),
    ...(config.jwtAudience ? { audience: config.jwtAudience } : {}),
  };
}

function signingKey(config: ResolvedAuthConfig, type: 'access' | 'refresh'): string {
  if (config.mode === 'asymmetric') {
    return config.jwtPrivateKey!;
  }
  return type === 'refresh' ? config.jwtRefreshSecret! : config.jwtSecret!;
}

function verificationKey(config: ResolvedAuthConfig, tokenType?: string): string {
  if (config.mode === 'asymmetric') {
    return config.jwtPublicKey!;
  }
  return tokenType === 'refresh' ? config.jwtRefreshSecret! : config.jwtSecret!;
}

function signToken(
  payload: JwtPayload,
  type: 'access' | 'refresh',
  config: ResolvedAuthConfig,
  expiresIn: string,
): string {
  const { iat, exp, iss, aud, ...claims } = payload;
  void iat;
  void exp;
  void iss;
  void aud;

  return jwt.sign(
    { ...claims, type } as object,
    signingKey(config, type),
    signOptions(config, expiresIn),
  );
}

export function generateAccessToken(payload: JwtPayload, config?: Partial<AuthConfig>): string {
  const resolved = resolveConfig(config);
  return signToken(payload, 'access', resolved, resolved.accessTokenExpiry);
}

export function generateRefreshToken(payload: JwtPayload, config?: Partial<AuthConfig>): string {
  const resolved = resolveConfig(config);
  return signToken(payload, 'refresh', resolved, resolved.refreshTokenExpiry);
}

export function generateTokenPair(payload: JwtPayload, config?: Partial<AuthConfig>): TokenPair {
  const resolved = resolveConfig(config);
  return {
    accessToken: signToken(payload, 'access', resolved, resolved.accessTokenExpiry),
    refreshToken: signToken(payload, 'refresh', resolved, resolved.refreshTokenExpiry),
  };
}

export function verifyToken(token: string, config?: Partial<AuthConfig>): JwtPayload {
  const resolved = resolveConfig(config);
  const decodedForType = jwt.decode(token);
  const tokenType = typeof decodedForType === 'object' && decodedForType ? String(decodedForType['type'] ?? '') : undefined;
  const decoded = jwt.verify(token, verificationKey(resolved, tokenType), verifyOptions(resolved));

  if (typeof decoded !== 'object' || decoded === null) {
    throw new Error('Token 格式无效：缺少必要字段');
  }

  const payload = decoded as Record<string, unknown>;
  if (typeof payload['sub'] !== 'string') {
    throw new Error('Token 格式无效：缺少必要字段');
  }

  return decoded as unknown as JwtPayload;
}

export function decodeToken(token: string): JwtPayload | null {
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded === 'string') {
    return null;
  }
  return decoded as JwtPayload;
}
