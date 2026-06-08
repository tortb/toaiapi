import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity, ApiOkResponse } from '@nestjs/swagger';
import { CheckinService } from './checkin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateCheckinConfigDto } from './dto/update-checkin-config.dto';

/**
 * 签到控制器
 *
 * 提供用户签到、查询签到记录、管理员配置等端点
 */
@ApiTags('Checkin')
@Controller('checkin')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  /**
   * 用户签到
   *
   * POST /checkin
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('jwt')
  @ApiOperation({
    summary: '用户签到',
    description: '每日签到获取随机奖励，自动增加余额',
  })
  @ApiOkResponse({
    description: '签到成功',
    schema: {
      example: {
        reward: 2500,
        consecutiveDays: 5,
        totalDays: 15,
        totalReward: 35000,
      },
    },
  })
  async checkin(@CurrentUser() user: { userId: string }) {
    return this.checkinService.checkin(user.userId);
  }

  /**
   * 获取签到历史
   *
   * GET /checkin/history
   */
  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('jwt')
  @ApiOperation({
    summary: '获取签到历史',
    description: '查询用户的签到记录，默认返回最近 30 条',
  })
  @ApiOkResponse({
    description: '签到历史',
    schema: {
      example: [
        {
          id: 'clxxxxx',
          user_id: 'clxxxxx',
          check_date: '2026-06-08T00:00:00.000Z',
          reward: 2500,
          created_at: '2026-06-08T08:30:00.000Z',
        },
      ],
    },
  })
  async getHistory(
    @CurrentUser() user: { userId: string },
    @Query('limit') limit?: number,
  ) {
    return this.checkinService.getHistory(user.userId, limit || 30);
  }

  /**
   * 获取签到统计
   *
   * GET /checkin/stats
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('jwt')
  @ApiOperation({
    summary: '获取签到统计',
    description: '查询用户的签到统计信息（总天数、总奖励、连续天数）',
  })
  @ApiOkResponse({
    description: '签到统计',
    schema: {
      example: {
        totalDays: 15,
        totalReward: 35000,
        consecutiveDays: 5,
      },
    },
  })
  async getStats(@CurrentUser() user: { userId: string }) {
    return this.checkinService.getStats(user.userId);
  }

  /**
   * 获取签到配置
   *
   * GET /checkin/config
   */
  @Get('config')
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('jwt')
  @ApiOperation({
    summary: '获取签到配置',
    description: '查询当前签到功能的配置（奖励范围、是否启用）',
  })
  @ApiOkResponse({
    description: '签到配置',
    schema: {
      example: {
        id: 'clxxxxx',
        is_enabled: true,
        min_reward: 1000,
        max_reward: 5000,
        updated_at: '2026-06-08T00:00:00.000Z',
        created_at: '2026-06-08T00:00:00.000Z',
      },
    },
  })
  async getConfig() {
    return this.checkinService.getConfig();
  }

  /**
   * 更新签到配置（管理员）
   *
   * PUT /checkin/config
   */
  @Put('config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiSecurity('jwt')
  @ApiOperation({
    summary: '更新签到配置',
    description: '管理员更新签到功能配置（仅管理员可用）',
  })
  @ApiOkResponse({
    description: '配置更新成功',
  })
  async updateConfig(@Body() dto: UpdateCheckinConfigDto) {
    return this.checkinService.updateConfig(dto);
  }
}
