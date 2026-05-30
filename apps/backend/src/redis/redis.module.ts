import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

/**
 * Redis 全局模块
 *
 * 注册为全局模块，所有模块可直接注入 RedisService。
 */
@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
