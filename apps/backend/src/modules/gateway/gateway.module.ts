import { Module, forwardRef } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ChannelService } from './channel/channel.service';
import { ChannelRepository } from './channel/channel.repository';
import { ApiKeyModule } from '../api-key/api-key.module';
import { BillingModule } from '../billing/billing.module';
import { RequestLogModule } from '../request-log/request-log.module';

@Module({
  imports: [
    forwardRef(() => BillingModule),
    forwardRef(() => RequestLogModule),
    ApiKeyModule,
  ],
  controllers: [GatewayController],
  providers: [
    GatewayService,
    ChannelService,
    ChannelRepository,
  ],
  exports: [GatewayService, ChannelService],
})
export class GatewayModule {}
