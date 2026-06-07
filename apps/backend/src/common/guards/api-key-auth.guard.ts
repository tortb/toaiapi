import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { parseJsonArray } from '../utils/json-array.util';
import * as argon2 from 'argon2';
import { isIPv4 } from 'net';
import { createHash } from 'crypto';

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
    private readonly redis: RedisService,
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
    const cacheKey = `apikey:verified:${keyHash}`;

    // 尝试从 Redis 获取已验证的 key 信息（缓存 5 分钟）
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      try {
        const cachedInfo = JSON.parse(cached) as {
          id: string;
          user_id: string;
          name: string | null;
          rate_limit: number | null;
          token_limit: number | null;
          rpm_limit: number | null;
          tpm_limit: number | null;
          unlimited_quota?: boolean;
          model_limit: string[];
          ip_whitelist: string[];
        };
        // 检查 IP 白名单
        if (cachedInfo.ip_whitelist && cachedInfo.ip_whitelist.length > 0) {
          const clientIp = this.extractClientIp(request);
          if (!this.isIpWhitelisted(clientIp, cachedInfo.ip_whitelist)) {
            throw new ForbiddenException(`IP ${clientIp} is not allowed by this API key's whitelist`);
          }
        }
        request['apiKey'] = {
          id: cachedInfo.id,
          userId: cachedInfo.user_id,
          name: cachedInfo.name,
          rateLimit: cachedInfo.rpm_limit ?? cachedInfo.rate_limit,
          tokenLimit: cachedInfo.tpm_limit ?? cachedInfo.token_limit,
          rpmLimit: cachedInfo.rpm_limit ?? cachedInfo.rate_limit,
          tpmLimit: cachedInfo.tpm_limit ?? cachedInfo.token_limit,
          unlimitedQuota: cachedInfo.unlimited_quota ?? false,
          modelLimit: cachedInfo.model_limit,
          ipWhitelist: cachedInfo.ip_whitelist,
        };
        return true;
      } catch (e) {
        if (e instanceof ForbiddenException) throw e;
        // 缓存解析失败，继续走数据库验证
      }
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
    const cacheData = JSON.stringify({
      id: keyRecord.id,
      user_id: keyRecord.user_id,
      name: keyRecord.name,
      rate_limit: keyRecord.rate_limit,
      token_limit: keyRecord.token_limit,
      rpm_limit: keyRecord.rpm_limit,
      tpm_limit: keyRecord.tpm_limit,
      unlimited_quota: keyRecord.unlimited_quota,
      model_limit: modelLimit,
      ip_whitelist: ipWhitelist,
    });
    await this.redis.set(cacheKey, cacheData, 300);

    // SECURITY: 检查 IP 白名单
    if (ipWhitelist.length > 0) {
      const clientIp = this.extractClientIp(request);
      if (!this.isIpWhitelisted(clientIp, ipWhitelist)) {
        throw new ForbiddenException(`IP ${clientIp} is not allowed by this API key's whitelist`);
      }
    }

    // 将 key 信息附加到请求
    request['apiKey'] = {
      id: keyRecord.id,
      userId: keyRecord.user_id,
      name: keyRecord.name,
      rateLimit: keyRecord.rpm_limit ?? keyRecord.rate_limit,
      tokenLimit: keyRecord.tpm_limit ?? keyRecord.token_limit,
      rpmLimit: keyRecord.rpm_limit ?? keyRecord.rate_limit,
      tpmLimit: keyRecord.tpm_limit ?? keyRecord.token_limit,
      unlimitedQuota: keyRecord.unlimited_quota,
      modelLimit,
      ipWhitelist,
    };

    return true;
  }

  /**
   * 计算 API Key 的 SHA-256 哈希（用于 Redis 缓存 key）
   */
  private hashApiKey(apiKey: string): string {
    return createHash('sha256').update(apiKey).digest('hex');
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
   * SECURITY: 优先使用 X-Forwarded-For（反向代理场景）
   */
  private extractClientIp(request: Record<string, unknown>): string {
    const headers = request['headers'] as Record<string, string | string[]>;

    // X-Forwarded-For 可能包含多个 IP，取第一个（最接近客户端的）
    const forwarded = headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      const firstIp = forwarded.split(',')[0]?.trim();
      if (firstIp) return firstIp;
    }

    // X-Real-IP（Nginx 常用）
    const realIp = headers['x-real-ip'];
    if (typeof realIp === 'string') return realIp;

    // Fastify 默认的 IP
    return (request['ip'] as string) || '127.0.0.1';
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
