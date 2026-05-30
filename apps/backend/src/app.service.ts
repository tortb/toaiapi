import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async healthCheck() {
    const checks = {
      database: false,
      redis: false,
    };

    // 检查数据库连接
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = true;
    } catch {
      // 数据库连接失败
    }

    // 检查 Redis 连接
    try {
      await this.redis.ping();
      checks.redis = true;
    } catch {
      // Redis 连接失败
    }

    const isHealthy = checks.database && checks.redis;

    return {
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'ToAIAPI Backend',
      version: '0.2.0',
      checks,
    };
  }
}
