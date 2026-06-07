import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ApiKeyModule } from './modules/api-key/api-key.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { BillingModule } from './modules/billing/billing.module';
import { BalanceModule } from './modules/balance/balance.module';
import { RequestLogModule } from './modules/request-log/request-log.module';
import { AdminModule } from './modules/admin/admin.module';
import { PaymentModule } from './modules/payment/payment.module';
import { CheckinModule } from './modules/checkin/checkin.module';
import { RedeemModule } from './modules/redeem/redeem.module';
import { InviteModule } from './modules/invite/invite.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ConfigModule } from './common/services/config.module';
import { EmailModule } from './common/services/email.module';
import { MaintenanceMiddleware } from './common/middleware/maintenance.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    PrismaModule,

    // Cache
    RedisModule,

    // Common modules
    ConfigModule,
    EmailModule,

    // Business modules
    UserModule,
    AuthModule,
    ApiKeyModule,
    GatewayModule,
    BillingModule,
    BalanceModule,
    RequestLogModule,
    AdminModule,
    PaymentModule,
    CheckinModule,
    RedeemModule,
    InviteModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 维护模式中间件：对所有 API 路由生效
    consumer
      .apply(MaintenanceMiddleware)
      .forRoutes('*');
  }
}
