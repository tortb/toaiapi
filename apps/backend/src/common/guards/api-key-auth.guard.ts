import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import * as argon2 from 'argon2';
import { isIPv4 } from 'net';

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

    // 从缓存中查找（按 prefix）
    const prefix = apiKey.substring(0, 16);
    const cacheKey = `apikey:prefix:${prefix}`;

    // 尝试从 Redis 获取 key ID
    const cachedKeyId = await this.redis.get(cacheKey);

    let keyRecord: { id: string; key_hash: string; user_id: string; name: string | null; is_active: boolean; expires_at: Date | null; rate_limit: number | null; token_limit: number | null; model_limit: string[]; ip_whitelist: string[] } | null = null;

    if (cachedKeyId) {
      keyRecord = await this.prisma.apiKey.findUnique({
        where: { id: cachedKeyId },
        select: {
          id: true,
          key_hash: true,
          user_id: true,
          name: true,
          is_active: true,
          expires_at: true,
          rate_limit: true,
          token_limit: true,
          model_limit: true,
          ip_whitelist: true,
        },
      });
    }

    // 缓存未命中，从数据库查找
    if (!keyRecord) {
      keyRecord = await this.prisma.apiKey.findFirst({
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
          model_limit: true,
          ip_whitelist: true,
        },
      });

      if (keyRecord) {
        // 缓存 key ID，5 分钟过期
        await this.redis.set(cacheKey, keyRecord.id, 300);
      }
    }

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

    // 验证 key hash
    const isValid = await argon2.verify(keyRecord.key_hash, apiKey);
    if (!isValid) {
      throw new UnauthorizedException('Invalid API key');
    }

    // SECURITY: 检查 IP 白名单
    if (keyRecord.ip_whitelist && keyRecord.ip_whitelist.length > 0) {
      const clientIp = this.extractClientIp(request);
      if (!this.isIpWhitelisted(clientIp, keyRecord.ip_whitelist)) {
        throw new ForbiddenException(`IP ${clientIp} is not allowed by this API key's whitelist`);
      }
    }

    // 将 key 信息附加到请求
    request['apiKey'] = {
      id: keyRecord.id,
      userId: keyRecord.user_id,
      name: keyRecord.name,
      rateLimit: keyRecord.rate_limit,
      tokenLimit: keyRecord.token_limit,
      modelLimit: keyRecord.model_limit,
      ipWhitelist: keyRecord.ip_whitelist,
    };

    return true;
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
