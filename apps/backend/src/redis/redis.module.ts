import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ApiKeyCacheService } from './api-key-cache.service';

/**
 * Redis 全局模块
 *
 * 注册为全局模块，所有模块可直接注入 RedisService。
 */
@Global()
@Module({
  providers: [RedisService, ApiKeyCacheService],
  exports: [RedisService, ApiKeyCacheService],
})
export class RedisModule {}
