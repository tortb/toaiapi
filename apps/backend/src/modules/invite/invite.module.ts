import { Module, forwardRef } from '@nestjs/common';
import { InviteController } from './invite.controller';
import { InviteService } from './invite.service';
import { InviteRepository } from './invite.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { BalanceModule } from '../balance/balance.module';

/**
 * 邀请奖励模块
 *
 * 提供邀请功能：
 * - 邀请码生成与管理
 * - 邀请关系绑定
 * - 新用户注册奖励
 * - 充值返现奖励
 * - 邀请统计查询
 */
@Module({
  imports: [
    PrismaModule,
    forwardRef(() => BalanceModule),
  ],
  controllers: [InviteController],
  providers: [InviteService, InviteRepository],
  exports: [InviteService],
})
export class InviteModule {}
