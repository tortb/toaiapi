import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

const VERIFIED_PREFIX = 'apikey:verified:';
const INDEX_PREFIX = 'apikey:index:';
const DEFAULT_TTL_SECONDS = 300;

@Injectable()
export class ApiKeyCacheService {
  private readonly logger = new Logger(ApiKeyCacheService.name);

  constructor(private readonly redis: RedisService) {}

  getVerifiedCacheKey(keyHash: string): string {
    return VERIFIED_PREFIX + keyHash;
  }

  async getVerified<T>(keyHash: string): Promise<T | null> {
    try {
      return await this.redis.getJson<T>(this.getVerifiedCacheKey(keyHash));
    } catch (error) {
      this.logger.warn(`API key cache read skipped: ${error instanceof Error ? error.message : error}`);
      return null;
    }
  }

  async setVerified<T extends { id: string }>(
    keyHash: string,
    data: T,
    ttlSeconds: number = DEFAULT_TTL_SECONDS,
  ): Promise<void> {
    const cacheKey = this.getVerifiedCacheKey(keyHash);
    try {
      await this.redis.setJson(cacheKey, data, ttlSeconds);
      await this.addIndexEntry(data.id, cacheKey, ttlSeconds);
    } catch (error) {
      this.logger.warn(`API key cache write skipped: ${error instanceof Error ? error.message : error}`);
    }
  }

  async invalidateByKeyId(keyId: string): Promise<void> {
    const indexKey = this.getIndexKey(keyId);
    try {
      const cacheKeys = await this.redis.getJson<string[]>(indexKey);
      if (Array.isArray(cacheKeys)) {
        for (const cacheKey of cacheKeys) {
          await this.redis.del(cacheKey);
        }
      }
      await this.redis.del(indexKey);
    } catch (error) {
      this.logger.warn(`API key cache invalidation skipped for ${keyId}: ${error instanceof Error ? error.message : error}`);
    }
  }

  private async addIndexEntry(keyId: string, cacheKey: string, ttlSeconds: number): Promise<void> {
    const indexKey = this.getIndexKey(keyId);
    const existing = await this.redis.getJson<string[]>(indexKey);
    const cacheKeys = new Set(Array.isArray(existing) ? existing : []);
    cacheKeys.add(cacheKey);
    await this.redis.setJson(indexKey, Array.from(cacheKeys), ttlSeconds);
  }

  private getIndexKey(keyId: string): string {
    return INDEX_PREFIX + keyId;
  }
}
