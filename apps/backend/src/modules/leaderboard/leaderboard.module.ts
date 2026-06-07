import { Module } from '@nestjs/common';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardRepository } from './leaderboard.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { RedisModule } from '../../redis/redis.module';

/**
 * 排行榜模块
 *
 * 提供公开的排行榜数据：
 * - 热门模型排行
 * - 提供商份额统计
 * - 趋势分析
 * - 缓存优化（5 分钟 TTL）
 */
@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [LeaderboardController],
  providers: [LeaderboardService, LeaderboardRepository],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
