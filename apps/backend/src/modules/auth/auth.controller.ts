import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, TokenResponseDto } from './dto/token-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendVerificationCodeDto } from './dto/send-verification-code.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserInfo } from '../../common/decorators/current-user.decorator';

/**
 * 认证控制器
 *
 * 处理用户注册、登录、Token 刷新、密码修改等认证相关请求。
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 用户注册
   *
   * 支持阿里云 ESA AI 验证码：前端通过 header `captcha-verify-param` 传递验签参数，
   * ESA 边缘层自动完成验签并在响应头中返回 `X-Captcha-Verify-Code`。
   */
  @Post('register')
  @ApiOperation({ summary: '用户注册', description: '使用邮箱注册新账号' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  async register(
    @Body() dto: RegisterDto,
    @Headers('captcha-verify-param') captchaVerifyParam?: string,
  ): Promise<AuthResponseDto> {
    return this.authService.register(dto, captchaVerifyParam);
  }

  /**
   * 用户登录
   *
   * 支持阿里云 ESA AI 验证码：前端通过 header `captcha-verify-param` 传递验签参数。
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登录', description: '使用邮箱和密码登录' })
  @ApiOkResponse({ type: AuthResponseDto })
  async login(
    @Body() dto: LoginDto,
    @Headers('captcha-verify-param') captchaVerifyParam?: string,
  ): Promise<AuthResponseDto> {
    return this.authService.login(dto, captchaVerifyParam);
  }

  /**
   * 刷新 Token
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '刷新 Token',
    description: '使用 Refresh Token 获取新的 Access Token',
  })
  @ApiOkResponse({ type: TokenResponseDto })
  async refresh(
    @Body('refreshToken') refreshToken: string,
  ): Promise<TokenResponseDto> {
    return this.authService.refreshTokens(refreshToken);
  }

  /**
   * 登出
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '登出', description: '撤销当前用户的 Refresh Token' })
  async logout(@CurrentUser() user: CurrentUserInfo): Promise<void> {
    await this.authService.logout(user.id);
  }

  /**
   * 修改密码
   */
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '修改密码', description: '使用当前密码修改为新密码' })
  async changePassword(
    @CurrentUser() user: CurrentUserInfo,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    await this.authService.changePassword(user.id, dto.currentPassword, dto.newPassword);
  }

  /**
   * 发送邮箱验证码
   *
   * 用于注册、找回密码等场景。验证码 5 分钟内有效，同一邮箱 60 秒内只能发送一次。
   */
  @Post('send-verification-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '发送邮箱验证码',
    description: '发送 6 位验证码到指定邮箱，用于注册或找回密码',
  })
  async sendVerificationCode(@Body() dto: SendVerificationCodeDto): Promise<{ message: string }> {
    await this.authService.sendVerificationCode(dto.email, dto.purpose || '注册');
    return { message: '验证码已发送' };
  }

  /**
   * 忘记密码 - 发送重置链接
   *
   * 支持阿里云 ESA AI 验证码。
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '忘记密码',
    description: '发送密码重置链接到用户邮箱',
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @Headers('captcha-verify-param') captchaVerifyParam?: string,
  ): Promise<{ message: string }> {
    await this.authService.forgotPassword(dto.email, captchaVerifyParam);
    return { message: 'If the email exists, a reset link has been sent' };
  }

  /**
   * 重置密码
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '重置密码',
    description: '使用重置 token 设置新密码',
  })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    await this.authService.resetPassword(dto.token, dto.newPassword);
    return { message: 'Password has been reset successfully' };
  }
}