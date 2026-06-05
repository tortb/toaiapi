import { Module, forwardRef } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
    ThrottlerModule.forRoot([
      {
        name: 'gateway',
        ttl: 60000,
        limit: 60,
      },
    ]),
  ],
  controllers: [GatewayController],
  providers: [
    GatewayService,
    ChannelService,
    ChannelRepository,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [GatewayService, ChannelService],
})
export class GatewayModule {}
