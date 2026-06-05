var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { Controller, Get, Post, UseGuards, HttpCode, HttpStatus, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse, } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrderResponseDto, OrderDetailDto } from './dto/create-order.dto';
/**
 * 支付控制器
 *
 * 处理用户端支付相关请求：
 * - 创建订单
 * - 查询订单
 * - 取消订单
 * - 支付回调
 */
let PaymentController = (() => {
    let _classDecorators = [ApiTags('Payment'), Controller('payment')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _createOrder_decorators;
    let _getOrders_decorators;
    let _getOrder_decorators;
    let _cancelOrder_decorators;
    let _getAvailableMethods_decorators;
    let _epayNotify_decorators;
    let _alipayNotify_decorators;
    let _wechatPayNotify_decorators;
    let _epayReturn_decorators;
    var PaymentController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _createOrder_decorators = [Post('orders'), UseGuards(JwtAuthGuard), ApiBearerAuth(), ApiOperation({ summary: '创建订单', description: '创建充值订单并获取支付链接' }), ApiCreatedResponse({ type: OrderResponseDto })];
            _getOrders_decorators = [Get('orders'), UseGuards(JwtAuthGuard), ApiBearerAuth(), ApiOperation({ summary: '获取订单列表', description: '获取当前用户的订单列表' }), ApiOkResponse()];
            _getOrder_decorators = [Get('orders/:orderNo'), UseGuards(JwtAuthGuard), ApiBearerAuth(), ApiOperation({ summary: '获取订单详情' }), ApiOkResponse({ type: OrderDetailDto })];
            _cancelOrder_decorators = [Post('orders/:orderNo/cancel'), UseGuards(JwtAuthGuard), ApiBearerAuth(), HttpCode(HttpStatus.OK), ApiOperation({ summary: '取消订单', description: '取消待支付的订单' }), ApiOkResponse()];
            _getAvailableMethods_decorators = [Get('methods'), ApiOperation({ summary: '获取可用支付方式' }), ApiOkResponse()];
            _epayNotify_decorators = [Post('notify/epay'), HttpCode(HttpStatus.OK), ApiOperation({ summary: '易支付异步通知' })];
            _alipayNotify_decorators = [Post('notify/alipay'), HttpCode(HttpStatus.OK), ApiOperation({ summary: '支付宝异步通知' })];
            _wechatPayNotify_decorators = [Post('notify/wechatpay'), HttpCode(HttpStatus.OK), ApiOperation({ summary: '微信支付异步通知' })];
            _epayReturn_decorators = [Get('return/epay'), ApiOperation({ summary: '易支付同步跳转' })];
            __esDecorate(this, null, _createOrder_decorators, { kind: "method", name: "createOrder", static: false, private: false, access: { has: obj => "createOrder" in obj, get: obj => obj.createOrder }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getOrders_decorators, { kind: "method", name: "getOrders", static: false, private: false, access: { has: obj => "getOrders" in obj, get: obj => obj.getOrders }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getOrder_decorators, { kind: "method", name: "getOrder", static: false, private: false, access: { has: obj => "getOrder" in obj, get: obj => obj.getOrder }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _cancelOrder_decorators, { kind: "method", name: "cancelOrder", static: false, private: false, access: { has: obj => "cancelOrder" in obj, get: obj => obj.cancelOrder }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getAvailableMethods_decorators, { kind: "method", name: "getAvailableMethods", static: false, private: false, access: { has: obj => "getAvailableMethods" in obj, get: obj => obj.getAvailableMethods }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _epayNotify_decorators, { kind: "method", name: "epayNotify", static: false, private: false, access: { has: obj => "epayNotify" in obj, get: obj => obj.epayNotify }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _alipayNotify_decorators, { kind: "method", name: "alipayNotify", static: false, private: false, access: { has: obj => "alipayNotify" in obj, get: obj => obj.alipayNotify }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _wechatPayNotify_decorators, { kind: "method", name: "wechatPayNotify", static: false, private: false, access: { has: obj => "wechatPayNotify" in obj, get: obj => obj.wechatPayNotify }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _epayReturn_decorators, { kind: "method", name: "epayReturn", static: false, private: false, access: { has: obj => "epayReturn" in obj, get: obj => obj.epayReturn }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PaymentController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        paymentService = __runInitializers(this, _instanceExtraInitializers);
        constructor(paymentService) {
            this.paymentService = paymentService;
        }
        // ──────────────────────────────────────────────
        // 用户端 API（需要认证）
        // ──────────────────────────────────────────────
        async createOrder(user, dto) {
            return this.paymentService.createOrder(user.id, dto);
        }
        async getOrders(user, pagination) {
            return this.paymentService.getUserOrders(user.id, pagination.page, pagination.pageSize);
        }
        async getOrder(user, orderNo) {
            return this.paymentService.getOrder(orderNo, user.id);
        }
        async cancelOrder(user, orderNo) {
            await this.paymentService.cancelOrder(orderNo, user.id);
            return { message: '订单已取消' };
        }
        async getAvailableMethods() {
            return this.paymentService.getAvailableMethods();
        }
        // ──────────────────────────────────────────────
        // 支付回调 API（无需认证）
        // ──────────────────────────────────────────────
        async epayNotify(body) {
            await this.paymentService.handlePaymentNotify('epay', body);
            return 'success';
        }
        async alipayNotify(body) {
            await this.paymentService.handlePaymentNotify('alipay', body);
            return 'success';
        }
        async wechatPayNotify(req, body) {
            const headers = {
                'wechatpay-timestamp': req.headers['wechatpay-timestamp'] || '',
                'wechatpay-nonce': req.headers['wechatpay-nonce'] || '',
                'wechatpay-signature': req.headers['wechatpay-signature'] || '',
                'wechatpay-serial': req.headers['wechatpay-serial'] || '',
            };
            await this.paymentService.handlePaymentNotify('wechatpay', body, headers);
            return { code: 'SUCCESS', message: '成功' };
        }
        /**
         * 易支付同步跳转
         */
        async epayReturn(query, res) {
            const result = await this.paymentService['epayService'].verifyReturn(query);
            if (result.valid) {
                // 跳转到支付成功页面
                res.redirect(`/payment/success?orderNo=${result.orderNo}`);
            }
            else {
                res.redirect('/payment/failed');
            }
        }
    };
    return PaymentController = _classThis;
})();
export { PaymentController };
//# sourceMappingURL=payment.controller.js.map