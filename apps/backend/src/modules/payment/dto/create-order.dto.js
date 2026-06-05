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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { IsString, IsInt, IsEnum, IsOptional, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
/**
 * 支付方式枚举
 */
export var PaymentMethodDto;
(function (PaymentMethodDto) {
    PaymentMethodDto["EPAY_ALIPAY"] = "EPAY_ALIPAY";
    PaymentMethodDto["EPAY_WECHAT"] = "EPAY_WECHAT";
    PaymentMethodDto["EPAY_QQ"] = "EPAY_QQ";
    PaymentMethodDto["ALIPAY"] = "ALIPAY";
    PaymentMethodDto["WECHAT_PAY"] = "WECHAT_PAY";
})(PaymentMethodDto || (PaymentMethodDto = {}));
/**
 * 创建订单 DTO
 */
let CreateOrderDto = (() => {
    let _amount_decorators;
    let _amount_initializers = [];
    let _amount_extraInitializers = [];
    let _paymentMethod_decorators;
    let _paymentMethod_initializers = [];
    let _paymentMethod_extraInitializers = [];
    let _productName_decorators;
    let _productName_initializers = [];
    let _productName_extraInitializers = [];
    return class CreateOrderDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _amount_decorators = [ApiProperty({ description: '充值金额（分）', example: 1000 }), IsInt(), Min(100, { message: '充值金额最少1元' })];
            _paymentMethod_decorators = [ApiProperty({
                    description: '支付方式',
                    enum: PaymentMethodDto,
                    example: PaymentMethodDto.EPAY_ALIPAY,
                }), IsEnum(PaymentMethodDto, { message: '无效的支付方式' })];
            _productName_decorators = [ApiProperty({ description: '商品名称', example: 'ToAIAPI 余额充值', required: false }), IsString(), IsOptional(), MaxLength(100)];
            __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: obj => "amount" in obj, get: obj => obj.amount, set: (obj, value) => { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
            __esDecorate(null, null, _paymentMethod_decorators, { kind: "field", name: "paymentMethod", static: false, private: false, access: { has: obj => "paymentMethod" in obj, get: obj => obj.paymentMethod, set: (obj, value) => { obj.paymentMethod = value; } }, metadata: _metadata }, _paymentMethod_initializers, _paymentMethod_extraInitializers);
            __esDecorate(null, null, _productName_decorators, { kind: "field", name: "productName", static: false, private: false, access: { has: obj => "productName" in obj, get: obj => obj.productName, set: (obj, value) => { obj.productName = value; } }, metadata: _metadata }, _productName_initializers, _productName_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        amount = __runInitializers(this, _amount_initializers, void 0);
        paymentMethod = (__runInitializers(this, _amount_extraInitializers), __runInitializers(this, _paymentMethod_initializers, void 0));
        productName = (__runInitializers(this, _paymentMethod_extraInitializers), __runInitializers(this, _productName_initializers, void 0));
        constructor() {
            __runInitializers(this, _productName_extraInitializers);
        }
    };
})();
export { CreateOrderDto };
/**
 * 订单响应 DTO
 */
let OrderResponseDto = (() => {
    let _orderNo_decorators;
    let _orderNo_initializers = [];
    let _orderNo_extraInitializers = [];
    let _amount_decorators;
    let _amount_initializers = [];
    let _amount_extraInitializers = [];
    let _paymentMethod_decorators;
    let _paymentMethod_initializers = [];
    let _paymentMethod_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _payUrl_decorators;
    let _payUrl_initializers = [];
    let _payUrl_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    return class OrderResponseDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _orderNo_decorators = [ApiProperty({ description: '订单号' })];
            _amount_decorators = [ApiProperty({ description: '金额（分）' })];
            _paymentMethod_decorators = [ApiProperty({ description: '支付方式' })];
            _status_decorators = [ApiProperty({ description: '订单状态' })];
            _payUrl_decorators = [ApiProperty({ description: '支付链接或表单HTML' })];
            _createdAt_decorators = [ApiProperty({ description: '创建时间' })];
            __esDecorate(null, null, _orderNo_decorators, { kind: "field", name: "orderNo", static: false, private: false, access: { has: obj => "orderNo" in obj, get: obj => obj.orderNo, set: (obj, value) => { obj.orderNo = value; } }, metadata: _metadata }, _orderNo_initializers, _orderNo_extraInitializers);
            __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: obj => "amount" in obj, get: obj => obj.amount, set: (obj, value) => { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
            __esDecorate(null, null, _paymentMethod_decorators, { kind: "field", name: "paymentMethod", static: false, private: false, access: { has: obj => "paymentMethod" in obj, get: obj => obj.paymentMethod, set: (obj, value) => { obj.paymentMethod = value; } }, metadata: _metadata }, _paymentMethod_initializers, _paymentMethod_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _payUrl_decorators, { kind: "field", name: "payUrl", static: false, private: false, access: { has: obj => "payUrl" in obj, get: obj => obj.payUrl, set: (obj, value) => { obj.payUrl = value; } }, metadata: _metadata }, _payUrl_initializers, _payUrl_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        orderNo = __runInitializers(this, _orderNo_initializers, void 0);
        amount = (__runInitializers(this, _orderNo_extraInitializers), __runInitializers(this, _amount_initializers, void 0));
        paymentMethod = (__runInitializers(this, _amount_extraInitializers), __runInitializers(this, _paymentMethod_initializers, void 0));
        status = (__runInitializers(this, _paymentMethod_extraInitializers), __runInitializers(this, _status_initializers, void 0));
        payUrl = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _payUrl_initializers, void 0));
        createdAt = (__runInitializers(this, _payUrl_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
        constructor() {
            __runInitializers(this, _createdAt_extraInitializers);
        }
    };
})();
export { OrderResponseDto };
/**
 * 订单详情响应 DTO
 */
let OrderDetailDto = (() => {
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _orderNo_decorators;
    let _orderNo_initializers = [];
    let _orderNo_extraInitializers = [];
    let _amount_decorators;
    let _amount_initializers = [];
    let _amount_extraInitializers = [];
    let _paidAmount_decorators;
    let _paidAmount_initializers = [];
    let _paidAmount_extraInitializers = [];
    let _paymentMethod_decorators;
    let _paymentMethod_initializers = [];
    let _paymentMethod_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _productType_decorators;
    let _productType_initializers = [];
    let _productType_extraInitializers = [];
    let _productName_decorators;
    let _productName_initializers = [];
    let _productName_extraInitializers = [];
    let _paidAt_decorators;
    let _paidAt_initializers = [];
    let _paidAt_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    return class OrderDetailDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [ApiProperty({ description: '订单ID' })];
            _orderNo_decorators = [ApiProperty({ description: '订单号' })];
            _amount_decorators = [ApiProperty({ description: '金额（分）' })];
            _paidAmount_decorators = [ApiProperty({ description: '实付金额（分）' })];
            _paymentMethod_decorators = [ApiProperty({ description: '支付方式' })];
            _status_decorators = [ApiProperty({ description: '订单状态' })];
            _productType_decorators = [ApiProperty({ description: '商品类型' })];
            _productName_decorators = [ApiProperty({ description: '商品名称' })];
            _paidAt_decorators = [ApiProperty({ description: '支付时间' })];
            _createdAt_decorators = [ApiProperty({ description: '创建时间' })];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _orderNo_decorators, { kind: "field", name: "orderNo", static: false, private: false, access: { has: obj => "orderNo" in obj, get: obj => obj.orderNo, set: (obj, value) => { obj.orderNo = value; } }, metadata: _metadata }, _orderNo_initializers, _orderNo_extraInitializers);
            __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: obj => "amount" in obj, get: obj => obj.amount, set: (obj, value) => { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
            __esDecorate(null, null, _paidAmount_decorators, { kind: "field", name: "paidAmount", static: false, private: false, access: { has: obj => "paidAmount" in obj, get: obj => obj.paidAmount, set: (obj, value) => { obj.paidAmount = value; } }, metadata: _metadata }, _paidAmount_initializers, _paidAmount_extraInitializers);
            __esDecorate(null, null, _paymentMethod_decorators, { kind: "field", name: "paymentMethod", static: false, private: false, access: { has: obj => "paymentMethod" in obj, get: obj => obj.paymentMethod, set: (obj, value) => { obj.paymentMethod = value; } }, metadata: _metadata }, _paymentMethod_initializers, _paymentMethod_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _productType_decorators, { kind: "field", name: "productType", static: false, private: false, access: { has: obj => "productType" in obj, get: obj => obj.productType, set: (obj, value) => { obj.productType = value; } }, metadata: _metadata }, _productType_initializers, _productType_extraInitializers);
            __esDecorate(null, null, _productName_decorators, { kind: "field", name: "productName", static: false, private: false, access: { has: obj => "productName" in obj, get: obj => obj.productName, set: (obj, value) => { obj.productName = value; } }, metadata: _metadata }, _productName_initializers, _productName_extraInitializers);
            __esDecorate(null, null, _paidAt_decorators, { kind: "field", name: "paidAt", static: false, private: false, access: { has: obj => "paidAt" in obj, get: obj => obj.paidAt, set: (obj, value) => { obj.paidAt = value; } }, metadata: _metadata }, _paidAt_initializers, _paidAt_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        id = __runInitializers(this, _id_initializers, void 0);
        orderNo = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _orderNo_initializers, void 0));
        amount = (__runInitializers(this, _orderNo_extraInitializers), __runInitializers(this, _amount_initializers, void 0));
        paidAmount = (__runInitializers(this, _amount_extraInitializers), __runInitializers(this, _paidAmount_initializers, void 0));
        paymentMethod = (__runInitializers(this, _paidAmount_extraInitializers), __runInitializers(this, _paymentMethod_initializers, void 0));
        status = (__runInitializers(this, _paymentMethod_extraInitializers), __runInitializers(this, _status_initializers, void 0));
        productType = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _productType_initializers, void 0));
        productName = (__runInitializers(this, _productType_extraInitializers), __runInitializers(this, _productName_initializers, void 0));
        paidAt = (__runInitializers(this, _productName_extraInitializers), __runInitializers(this, _paidAt_initializers, void 0));
        createdAt = (__runInitializers(this, _paidAt_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
        constructor() {
            __runInitializers(this, _createdAt_extraInitializers);
        }
    };
})();
export { OrderDetailDto };
//# sourceMappingURL=create-order.dto.js.map