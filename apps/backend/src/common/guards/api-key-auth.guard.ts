import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiKeyCacheService } from '../../redis/api-key-cache.service';
import { parseJsonArray } from '../utils/json-array.util';
import * as argon2 from 'argon2';
import { isIPv4 } from 'net';
import { createHash } from 'crypto';

interface VerifiedApiKeyCacheEntry {
  id: string;
  user_id: string;
  name: string | null;
  is_active: boolean;
  expires_at: string | null;
  updated_at: string | null;
  rate_limit: number | null;
  token_limit: number | null;
  rpm_limit: number | null;
  tpm_limit: number | null;
  unlimited_quota?: boolean;
  model_limit: string[];
  ip_whitelist: string[];
}

/**
 * API Key 认证守卫
 *
 * 支持两种传递方式：
 * 1. X-API-Key 头
 * 2. Authorization: Bearer sk-toai-xxx
 *
 * 验证流程：
 * 1. 提取 API Key
 * 2. 按 prefix 查找
 * 3. Argon2id 验证
 * 4. 检查状态和过期时间
 * 5. 将 Key 信息附加到 request.apiKey
 */
@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly apiKeyCache: ApiKeyCacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    // 验证 API Key 格式
    if (!apiKey.startsWith('sk-toai-')) {
      throw new UnauthorizedException('Invalid API key format');
    }

    // 从缓存中查找（按完整 key 的 SHA-256 哈希作为缓存 key）
    const keyHash = this.hashApiKey(apiKey);
    // 尝试从 Redis 获取已验证的 key 信息（缓存 5 分钟）
    const cachedInfo = await this.apiKeyCache.getVerified<VerifiedApiKeyCacheEntry>(keyHash);

    if (cachedInfo) {
      if (!cachedInfo.is_active) {
        throw new UnauthorizedException('API key is disabled');
      }
      if (this.isExpired(cachedInfo.expires_at)) {
        throw new UnauthorizedException('API key has expired');
      }
      this.assertIpWhitelist(request, cachedInfo.ip_whitelist);
      this.attachApiKey(request, cachedInfo, cachedInfo.model_limit, cachedInfo.ip_whitelist);
      return true;
    }

    // 缓存未命中，从数据库查找（按 prefix）
    const prefix = apiKey.substring(0, 16);
    const keyRecord = await this.prisma.apiKey.findFirst({
      where: { key_prefix: prefix },
      select: {
        id: true,
        key_hash: true,
        user_id: true,
        name: true,
        is_active: true,
        expires_at: true,
        updated_at: true,
        rate_limit: true,
        token_limit: true,
        rpm_limit: true,
        tpm_limit: true,
        unlimited_quota: true,
        model_limit: true,
        ip_whitelist: true,
      },
    });

    if (!keyRecord) {
      throw new UnauthorizedException('Invalid API key');
    }

    // 检查是否激活
    if (!keyRecord.is_active) {
      throw new UnauthorizedException('API key is disabled');
    }

    // 检查是否过期
    if (keyRecord.expires_at && keyRecord.expires_at < new Date()) {
      throw new UnauthorizedException('API key has expired');
    }

    // 验证 key hash（Argon2 是 CPU 密集型，只在缓存未命中时执行）
    const isValid = await argon2.verify(keyRecord.key_hash, apiKey);
    if (!isValid) {
      throw new UnauthorizedException('Invalid API key');
    }

    // 解析 JSON 数组字段
    const modelLimit = parseJsonArray(keyRecord.model_limit);
    const ipWhitelist = parseJsonArray(keyRecord.ip_whitelist);

    // 缓存验证结果（不含 key_hash），5 分钟过期
    await this.apiKeyCache.setVerified(keyHash, {
      id: keyRecord.id,
      user_id: keyRecord.user_id,
      name: keyRecord.name,
      is_active: keyRecord.is_active,
      expires_at: keyRecord.expires_at?.toISOString() ?? null,
      updated_at: keyRecord.updated_at.toISOString(),
      rate_limit: keyRecord.rate_limit,
      token_limit: keyRecord.token_limit,
      rpm_limit: keyRecord.rpm_limit,
      tpm_limit: keyRecord.tpm_limit,
      unlimited_quota: keyRecord.unlimited_quota,
      model_limit: modelLimit,
      ip_whitelist: ipWhitelist,
    }, 300);

    // SECURITY: 检查 IP 白名单
    this.assertIpWhitelist(request, ipWhitelist);

    // 将 key 信息附加到请求
    this.attachApiKey(request, keyRecord, modelLimit, ipWhitelist);

    return true;
  }

  /**
   * 计算 API Key 的 SHA-256 哈希（用于 Redis 缓存 key）
   */
  private hashApiKey(apiKey: string): string {
    return createHash('sha256').update(apiKey).digest('hex');
  }

  private attachApiKey(
    request: Record<string, unknown>,
    keyInfo: {
      id: string;
      user_id: string;
      name: string | null;
      rate_limit: number | null;
      token_limit: number | null;
      rpm_limit: number | null;
      tpm_limit: number | null;
      unlimited_quota?: boolean;
    },
    modelLimit: string[],
    ipWhitelist: string[],
  ): void {
    request['apiKey'] = {
      id: keyInfo.id,
      userId: keyInfo.user_id,
      name: keyInfo.name,
      rateLimit: keyInfo.rpm_limit ?? keyInfo.rate_limit,
      tokenLimit: keyInfo.tpm_limit ?? keyInfo.token_limit,
      rpmLimit: keyInfo.rpm_limit ?? keyInfo.rate_limit,
      tpmLimit: keyInfo.tpm_limit ?? keyInfo.token_limit,
      unlimitedQuota: keyInfo.unlimited_quota ?? false,
      modelLimit,
      ipWhitelist,
    };
  }

  private assertIpWhitelist(request: Record<string, unknown>, whitelist: string[]): void {
    if (whitelist.length === 0) return;

    const clientIp = this.extractClientIp(request);
    if (!this.isIpWhitelisted(clientIp, whitelist)) {
      throw new ForbiddenException('IP ' + clientIp + ' is not allowed by API key whitelist');
    }
  }

  private isExpired(expiresAt: string | null | undefined): boolean {
    if (!expiresAt) return false;
    const expiry = new Date(expiresAt);
    return Number.isNaN(expiry.getTime()) || expiry < new Date();
  }

  /**
   * 从请求中提取 API Key
   */
  private extractApiKey(request: Record<string, unknown>): string | null {
    const headers = request['headers'] as Record<string, string | string[]>;

    // 方式1: X-API-Key 头
    const headerKey = headers['x-api-key'];
    if (typeof headerKey === 'string') {
      return headerKey;
    }

    // 方式2: Authorization: Bearer sk-toai-xxx
    const authHeader = headers['authorization'];
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token.startsWith('sk-toai-')) {
        return token;
      }
    }

    return null;
  }

  /**
   * 提取客户端真实 IP
   * SECURITY: 只使用 Fastify 在 trustProxy 配置后计算出的 request.ip。
   */
  private extractClientIp(request: Record<string, unknown>): string {
    const ip = request['ip'];
    return typeof ip === 'string' && ip.trim() ? ip.trim() : '127.0.0.1';
  }

  /**
   * 检查 IP 是否在白名单中
   * 支持精确匹配和 CIDR 表示法（如 10.0.0.0/24）
   */
  private isIpWhitelisted(clientIp: string, whitelist: string[]): boolean {
    for (const entry of whitelist) {
      if (entry.includes('/')) {
        // CIDR 表示法
        if (this.isIpInCidr(clientIp, entry)) return true;
      } else {
        // 精确匹配
        if (clientIp === entry) return true;
      }
    }
    return false;
  }

  /**
   * 检查 IPv4 地址是否在 CIDR 范围内
   */
  private isIpInCidr(ip: string, cidr: string): boolean {
    const [network, prefixStr] = cidr.split('/');
    if (!network || !prefixStr) return false;

    const prefix = parseInt(prefixStr, 10);
    if (!isIPv4(ip) || !isIPv4(network) || isNaN(prefix) || prefix < 0 || prefix > 32) {
      return false;
    }

    const ipNum = this.ipv4ToNumber(ip);
    const networkNum = this.ipv4ToNumber(network);
    const mask = (~0 << (32 - prefix)) >>> 0;

    return (ipNum & mask) === (networkNum & mask);
  }

  /**
   * IPv4 地址转 32 位整数
   */
  private ipv4ToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
  }
}
