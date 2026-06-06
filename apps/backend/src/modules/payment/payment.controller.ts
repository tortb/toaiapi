import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserInfo } from '../../common/decorators/current-user.decorator';
import { CreateOrderDto, OrderResponseDto, OrderDetailDto } from './dto/create-order.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

/**
 * 支付控制器
 *
 * 处理用户端支付相关请求：
 * - 创建订单
 * - 查询订单
 * - 取消订单
 * - 支付回调
 *
 * IMPORTANT: 回调端点必须始终返回 success（HTTP 200），
 * 否则支付平台会持续重试通知。
 */
@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  // ──────────────────────────────────────────────
  // 用户端 API（需要认证）
  // ──────────────────────────────────────────────

  @Post('orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建订单', description: '创建充值订单并获取支付链接' })
  @ApiCreatedResponse({ type: OrderResponseDto })
  async createOrder(
    @CurrentUser() user: CurrentUserInfo,
    @Body() dto: CreateOrderDto,
  ) {
    return this.paymentService.createOrder(user.id, dto);
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取订单列表', description: '获取当前用户的订单列表' })
  @ApiOkResponse()
  async getOrders(
    @CurrentUser() user: CurrentUserInfo,
    @Query() pagination: PaginationDto,
  ) {
    return this.paymentService.getUserOrders(user.id, pagination.page, pagination.pageSize);
  }

  @Get('orders/:orderNo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取订单详情' })
  @ApiOkResponse({ type: OrderDetailDto })
  async getOrder(
    @CurrentUser() user: CurrentUserInfo,
    @Param('orderNo') orderNo: string,
  ) {
    return this.paymentService.getOrder(orderNo, user.id);
  }

  @Post('orders/:orderNo/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '取消订单', description: '取消待支付的订单' })
  @ApiOkResponse()
  async cancelOrder(
    @CurrentUser() user: CurrentUserInfo,
    @Param('orderNo') orderNo: string,
  ) {
    await this.paymentService.cancelOrder(orderNo, user.id);
    return { message: '订单已取消' };
  }

  @Get('methods')
  @ApiOperation({ summary: '获取可用支付方式' })
  @ApiOkResponse()
  async getAvailableMethods() {
    return this.paymentService.getAvailableMethods();
  }

  @Get('promotions')
  @ApiOperation({ summary: '获取当前有效的充值赠送活动' })
  @ApiOkResponse()
  async getActivePromotions(@Query('amount') amount?: string) {
    const amountNum = amount ? parseInt(amount, 10) : 0;
    return this.paymentService.getActivePromotions(amountNum);
  }

  // ──────────────────────────────────────────────
  // 支付回调 API（无需认证）
  //
  // IMPORTANT: 回调端点必须始终返回 HTTP 200 + 'success'，
  // 即使处理失败也不能抛异常，否则支付平台会无限重试。
  // 同时支持 GET 和 POST（不同支付平台回调方式不同）。
  // ──────────────────────────────────────────────

  /**
   * 易支付异步通知
   * 支持 GET 和 POST（EPay V1 文档指定 GET）
   */
  @Get('notify/epay')
  @HttpCode(HttpStatus.OK)
  async epayNotifyGet(@Query() query: Record<string, any>) {
    return this.handleEpayNotify(query);
  }

  @Post('notify/epay')
  @HttpCode(HttpStatus.OK)
  async epayNotifyPost(@Body() body: Record<string, any>) {
    return this.handleEpayNotify(body);
  }

  private async handleEpayNotify(params: Record<string, any>) {
    this.logger.log(`EPay notify received: ${JSON.stringify(params)}`);
    try {
      await this.paymentService.handlePaymentNotify('epay', params);
      this.logger.log(`EPay notify processed successfully for order: ${params['out_trade_no']}`);
    } catch (error) {
      this.logger.error(
        `EPay notify processing failed: ${error instanceof Error ? error.message : error}`,
      );
    }
    // 始终返回 success，避免 EPay 重试
    return 'success';
  }

  /**
   * 支付宝异步通知
   */
  @Get('notify/alipay')
  @HttpCode(HttpStatus.OK)
  async alipayNotifyGet(@Query() query: Record<string, any>) {
    return this.handleAlipayNotify(query);
  }

  @Post('notify/alipay')
  @HttpCode(HttpStatus.OK)
  async alipayNotifyPost(@Body() body: Record<string, any>) {
    return this.handleAlipayNotify(body);
  }

  private async handleAlipayNotify(params: Record<string, any>) {
    this.logger.log(`Alipay notify received: ${JSON.stringify(params)}`);
    try {
      await this.paymentService.handlePaymentNotify('alipay', params);
      this.logger.log(`Alipay notify processed successfully`);
    } catch (error) {
      this.logger.error(
        `Alipay notify processing failed: ${error instanceof Error ? error.message : error}`,
      );
    }
    return 'success';
  }

  /**
   * 微信支付异步通知
   */
  @Post('notify/wechatpay')
  @HttpCode(HttpStatus.OK)
  async wechatPayNotify(
    @Req() req: Request,
    @Body() body: Record<string, any>,
  ) {
    const headers: Record<string, string> = {
      'wechatpay-timestamp': req.headers['wechatpay-timestamp'] as string || '',
      'wechatpay-nonce': req.headers['wechatpay-nonce'] as string || '',
      'wechatpay-signature': req.headers['wechatpay-signature'] as string || '',
      'wechatpay-serial': req.headers['wechatpay-serial'] as string || '',
    };

    this.logger.log(`WeChatPay notify received`);
    try {
      await this.paymentService.handlePaymentNotify('wechatpay', body, headers);
      this.logger.log(`WeChatPay notify processed successfully`);
    } catch (error) {
      this.logger.error(
        `WeChatPay notify processing failed: ${error instanceof Error ? error.message : error}`,
      );
    }
    return { code: 'SUCCESS', message: '成功' };
  }

  /**
   * 易支付同步跳转（GET）
   */
  @Get('return/epay')
  @ApiOperation({ summary: '易支付同步跳转' })
  async epayReturn(
    @Query() query: Record<string, string>,
    @Res() res: Response,
  ) {
    try {
      const result = await this.paymentService.verifyEpayReturn(query);
      if (result.valid) {
        res.redirect(`/recharge?success=true&orderNo=${result.orderNo}`);
      } else {
        res.redirect('/recharge?success=false');
      }
    } catch {
      res.redirect('/recharge?success=false');
    }
  }
}
