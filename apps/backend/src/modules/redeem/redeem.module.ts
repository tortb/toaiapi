import { Module, forwardRef } from '@nestjs/common';
import { RedeemController } from './redeem.controller';
import { RedeemService } from './redeem.service';
import { RedeemRepository } from './redeem.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { BalanceModule } from '../balance/balance.module';

/**
 * 兑换码模块
 */
@Module({
  imports: [
    PrismaModule,
    forwardRef(() => BalanceModule),
  ],
  controllers: [RedeemController],
  providers: [RedeemService, RedeemRepository],
  exports: [RedeemService],
})
export class RedeemModule {}
