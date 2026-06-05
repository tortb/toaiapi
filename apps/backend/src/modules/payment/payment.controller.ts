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
 */
@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
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
  // ──────────────────────────────────────────────

  @Post('notify/epay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '易支付异步通知' })
  async epayNotify(@Body() body: Record<string, any>) {
    await this.paymentService.handlePaymentNotify('epay', body);
    return 'success';
  }

  @Post('notify/alipay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '支付宝异步通知' })
  async alipayNotify(@Body() body: Record<string, any>) {
    await this.paymentService.handlePaymentNotify('alipay', body);
    return 'success';
  }

  @Post('notify/wechatpay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '微信支付异步通知' })
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

    await this.paymentService.handlePaymentNotify('wechatpay', body, headers);
    return { code: 'SUCCESS', message: '成功' };
  }

  /**
   * 易支付同步跳转
   */
  @Get('return/epay')
  @ApiOperation({ summary: '易支付同步跳转' })
  async epayReturn(
    @Query() query: Record<string, string>,
    @Res() res: Response,
  ) {
    const result = await this.paymentService['epayService'].verifyReturn(query);

    if (result.valid) {
      // 跳转到支付成功页面
      res.redirect(`/payment/success?orderNo=${result.orderNo}`);
    } else {
      res.redirect('/payment/failed');
    }
  }
}
