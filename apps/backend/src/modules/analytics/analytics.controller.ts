import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity, ApiOkResponse } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserInfo } from '../../common/decorators/current-user.decorator';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

/**
 * 分析看板控制器
 */
@ApiTags('Analytics')
@Controller('balance/analytics')
@UseGuards(JwtAuthGuard)
@ApiSecurity('jwt')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * 获取综合分析数据
   *
   * GET /balance/analytics
   */
  @Get()
  @ApiOperation({
    summary: '获取综合分析数据',
    description: '获取调用趋势、模型排行、统计概览等综合数据',
  })
  @ApiOkResponse({
    description: '分析数据',
    schema: {
      example: {
        overview: {
          total_requests: 1250,
          total_tokens: 450000,
          total_cost: 15000,
          avg_tokens_per_request: 360,
          success_rate: 98.5,
        },
        call_trend: [
          { date: '2026-06-01', requests: 150, tokens: 54000, cost: 1800 },
          { date: '2026-06-02', requests: 180, tokens: 64800, cost: 2160 },
        ],
        model_ranking: [
          { model: 'gpt-4', requests: 500, tokens: 200000, cost: 8000 },
          { model: 'claude-3-opus', requests: 300, tokens: 120000, cost: 4800 },
        ],
      },
    },
  })
  async getAnalytics(
    @CurrentUser() user: CurrentUserInfo,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getAnalytics(user.id, query.days);
  }

  /**
   * 获取调用趋势
   *
   * GET /balance/analytics/call-trend
   */
  @Get('call-trend')
  @ApiOperation({
    summary: '获取调用趋势',
    description: '按日期统计调用次数、Token 消耗、费用',
  })
  @ApiOkResponse({
    description: '调用趋势数据',
  })
  async getCallTrend(
    @CurrentUser() user: CurrentUserInfo,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getCallTrend(user.id, query.days);
  }

  /**
   * 获取模型排行
   *
   * GET /balance/analytics/model-ranking
   */
  @Get('model-ranking')
  @ApiOperation({
    summary: '获取模型排行',
    description: '按费用统计各模型使用情况',
  })
  @ApiOkResponse({
    description: '模型排行数据',
  })
  async getModelRanking(
    @CurrentUser() user: CurrentUserInfo,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getModelRanking(user.id, query.days, query.limit);
  }
}
