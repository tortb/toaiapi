import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';

/**
 * 排行榜控制器（公开接口）
 */
@ApiTags('Leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  /**
   * 获取排行榜综合数据
   *
   * GET /leaderboard
   */
  @Get()
  @ApiOperation({
    summary: '获取排行榜',
    description: '获取热门模型和提供商份额排行榜（公开接口）',
  })
  @ApiOkResponse({
    description: '排行榜数据',
    schema: {
      example: {
        period: 'WEEK',
        hot_models: [
          { model: 'gpt-4', requests: 5000, tokens: 2000000 },
          { model: 'claude-3-opus', requests: 3000, tokens: 1500000 },
        ],
        vendor_share: [
          { vendor: 'openai', requests: 8000, tokens: 3000000 },
          { vendor: 'anthropic', requests: 5000, tokens: 2000000 },
        ],
      },
    },
  })
  async getLeaderboard(@Query() query: LeaderboardQueryDto) {
    return this.leaderboardService.getLeaderboard(query.period);
  }

  /**
   * 获取热门模型
   *
   * GET /leaderboard/models
   */
  @Get('models')
  @ApiOperation({
    summary: '获取热门模型',
    description: '按 Token 使用量排序的热门模型列表（公开接口）',
  })
  @ApiOkResponse({
    description: '热门模型列表',
  })
  async getHotModels(@Query() query: LeaderboardQueryDto) {
    return this.leaderboardService.getHotModels(query.period, query.limit);
  }

  /**
   * 获取提供商份额
   *
   * GET /leaderboard/vendors
   */
  @Get('vendors')
  @ApiOperation({
    summary: '获取提供商份额',
    description: '各提供商的调用量和 Token 使用量统计（公开接口）',
  })
  @ApiOkResponse({
    description: '提供商份额数据',
  })
  async getVendorShare(@Query() query: LeaderboardQueryDto) {
    return this.leaderboardService.getVendorShare(query.period);
  }

  /**
   * 获取趋势分析
   *
   * GET /leaderboard/trending
   */
  @Get('trending')
  @ApiOperation({
    summary: '获取趋势分析',
    description: '对比上一周期的排名变化趋势（公开接口）',
  })
  @ApiOkResponse({
    description: '趋势分析数据',
  })
  async getTrending(@Query() query: LeaderboardQueryDto) {
    return this.leaderboardService.getTrending(query.period, query.limit);
  }
}
