import { Module, forwardRef } from '@nestjs/common';
import { CheckinController } from './checkin.controller';
import { CheckinService } from './checkin.service';
import { CheckinRepository } from './checkin.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { BalanceModule } from '../balance/balance.module';

/**
 * 签到模块
 *
 * 提供用户签到功能：
 * - 每日签到获取随机奖励
 * - 签到历史查询
 * - 连续签到统计
 * - 管理员配置管理
 */
@Module({
  imports: [
    PrismaModule,
    forwardRef(() => BalanceModule),
  ],
  controllers: [CheckinController],
  providers: [CheckinService, CheckinRepository],
  exports: [CheckinService],
})
export class CheckinModule {}
