import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity, ApiOkResponse } from '@nestjs/swagger';
import { InviteService } from './invite.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * 邀请奖励控制器
 */
@ApiTags('Invite')
@Controller('invite')
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  /**
   * 获取邀请码
   *
   * GET /invite/code
   */
  @Get('code')
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('jwt')
  @ApiOperation({
    summary: '获取邀请码',
    description: '获取或生成用户的邀请码和邀请链接',
  })
  @ApiOkResponse({
    description: '邀请码信息',
    schema: {
      example: {
        inviteCode: 'ABC123',
        inviteLink: 'http://localhost:3000/register?invite=ABC123',
      },
    },
  })
  async getInviteCode(@CurrentUser() user: { userId: string }) {
    return this.inviteService.getInviteCode(user.userId);
  }

  /**
   * 获取邀请记录
   *
   * GET /invite/records
   */
  @Get('records')
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('jwt')
  @ApiOperation({
    summary: '获取邀请记录',
    description: '查询用户邀请的所有用户记录',
  })
  @ApiOkResponse({
    description: '邀请记录列表',
    schema: {
      example: [
        {
          id: 'clxxxxx',
          inviter_id: 'clxxxxx',
          invitee_id: 'clxxxxx',
          reward: 10000,
          pending_reward: 0,
          recharge_count: 2,
          created_at: '2026-06-08T00:00:00.000Z',
          invitee: {
            id: 'clxxxxx',
            email: 'user@example.com',
            display_name: '用户',
            created_at: '2026-06-08T00:00:00.000Z',
          },
        },
      ],
    },
  })
  async getInviteRecords(@CurrentUser() user: { userId: string }) {
    return this.inviteService.getInviteRecords(user.userId);
  }

  /**
   * 获取邀请统计
   *
   * GET /invite/stats
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('jwt')
  @ApiOperation({
    summary: '获取邀请统计',
    description: '查询用户的邀请总数、总奖励、待确认奖励等统计信息',
  })
  @ApiOkResponse({
    description: '邀请统计',
    schema: {
      example: {
        totalInvites: 10,
        totalReward: 50000,
        pendingReward: 0,
      },
    },
  })
  async getInviteStats(@CurrentUser() user: { userId: string }) {
    return this.inviteService.getInviteStats(user.userId);
  }
}
