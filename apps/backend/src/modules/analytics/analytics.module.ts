import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsRepository } from './analytics.repository';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * 分析看板模块
 *
 * 提供用户调用数据分析功能：
 * - 调用趋势分析
 * - 模型使用排行
 * - 消费统计
 * - 成功率分析
 */
@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsRepository],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
