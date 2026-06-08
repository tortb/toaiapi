import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CaptchaService } from './captcha.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../user/user.module';
import { BillingModule } from '../billing/billing.module';
import { InviteModule } from '../invite/invite.module';

/**
 * 认证模块
 *
 * 提供用户注册、登录、JWT 认证等功能。
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    forwardRef(() => UserModule),
    forwardRef(() => BillingModule),
    forwardRef(() => InviteModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, CaptchaService],
  exports: [AuthService],
})
export class AuthModule {}
