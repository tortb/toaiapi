import { Module, forwardRef } from '@nestjs/common';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { BillingModule } from '../billing/billing.module';
import { RequestLogModule } from '../request-log/request-log.module';

/**
 * 余额模块
 *
 * 提供余额查询、充值、交易流水查询等功能。
 */
@Module({
  imports: [
    forwardRef(() => BillingModule),
    forwardRef(() => RequestLogModule),
  ],
  controllers: [BalanceController],
  providers: [BalanceService],
  exports: [BalanceService],
})
export class BalanceModule {}
