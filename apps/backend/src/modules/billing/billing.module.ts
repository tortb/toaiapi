import { Module } from '@nestjs/common';
import { BillingRepository } from './billing.repository';
import { BillingService } from './billing.service';

/**
 * 计费模块
 *
 * 提供余额管理、费用计算、交易流水等功能。
 */
@Module({
  providers: [BillingService, BillingRepository],
  exports: [BillingService, BillingRepository],
})
export class BillingModule {}
