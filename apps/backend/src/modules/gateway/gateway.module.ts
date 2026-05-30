import { Module, forwardRef } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ChannelService } from './channel/channel.service';
import { ChannelRepository } from './channel/channel.repository';
import { BillingModule } from '../billing/billing.module';
import { RequestLogModule } from '../request-log/request-log.module';

/**
 * 网关模块
 *
 * 提供 OpenAI 兼容的 API 端点，负责请求路由、故障转移、计费等。
 */
@Module({
  imports: [
    forwardRef(() => BillingModule),
    forwardRef(() => RequestLogModule),
  ],
  controllers: [GatewayController],
  providers: [GatewayService, ChannelService, ChannelRepository],
  exports: [GatewayService, ChannelService],
})
export class GatewayModule {}
