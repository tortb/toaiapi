import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { EPayService } from './epay.service';
import { AlipayService } from './alipay.service';
import { WechatPayService } from './wechatpay.service';
import { GatewayModule } from '../gateway/gateway.module';

/**
 * 支付模块
 *
 * 提供统一的支付功能：
 * - 易支付（EPay V2 RSA）
 * - 支付宝
 * - 微信支付
 */
@Module({
  imports: [GatewayModule],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    EPayService,
    AlipayService,
    WechatPayService,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
