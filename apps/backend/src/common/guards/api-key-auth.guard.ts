import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import * as argon2 from 'argon2';

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

    let keyRecord: { id: string; key_hash: string; user_id: string; name: string | null; is_active: boolean; expires_at: Date | null; rate_limit: number | null; token_limit: number | null; model_limit: string[] } | null = null;

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

    // 将 key 信息附加到请求
    request['apiKey'] = {
      id: keyRecord.id,
      userId: keyRecord.user_id,
      name: keyRecord.name,
      rateLimit: keyRecord.rate_limit,
      tokenLimit: keyRecord.token_limit,
      modelLimit: keyRecord.model_limit,
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
}
