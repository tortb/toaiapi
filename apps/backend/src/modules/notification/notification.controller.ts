import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity, ApiOkResponse } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateNotificationConfigDto, TestNotificationDto } from './dto/notification-config.dto';

/**
 * 通知配置控制器
 */
@ApiTags('Notification')
@Controller('users/me/notifications')
@UseGuards(JwtAuthGuard)
@ApiSecurity('jwt')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * 获取通知配置
   *
   * GET /users/me/notifications
   */
  @Get()
  @ApiOperation({
    summary: '获取通知配置',
    description: '获取当前用户的通知配置',
  })
  @ApiOkResponse({
    description: '通知配置',
    schema: {
      example: {
        email_enabled: true,
        webhook_enabled: false,
        webhook_url: null,
        wxpusher_enabled: false,
        wxpusher_uid: null,
        low_balance_threshold: 1000,
      },
    },
  })
  async getConfig(@CurrentUser() user: { userId: string }) {
    return this.notificationService.getConfig(user.userId);
  }

  /**
   * 更新通知配置
   *
   * PUT /users/me/notifications
   */
  @Put()
  @ApiOperation({
    summary: '更新通知配置',
    description: '更新当前用户的通知配置',
  })
  @ApiOkResponse({
    description: '更新后的配置',
  })
  async updateConfig(
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdateNotificationConfigDto,
  ) {
    return this.notificationService.updateConfig(user.userId, dto);
  }

  /**
   * 发送测试通知
   *
   * POST /users/me/notifications/test
   */
  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '发送测试通知',
    description: '向指定渠道发送测试通知',
  })
  @ApiOkResponse({
    description: '测试结果',
    schema: {
      example: {
        success: true,
        message: '测试通知发送成功',
      },
    },
  })
  async sendTestNotification(
    @CurrentUser() user: { userId: string; email: string },
    @Body() dto: TestNotificationDto,
  ) {
    return this.notificationService.sendTestNotification(user.userId, user.email, dto.channel);
  }
}
