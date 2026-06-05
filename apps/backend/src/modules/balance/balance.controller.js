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
import { Controller, Get, Post, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { IsInt, Min, IsString, IsNotEmpty, IsOptional, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
/**
 * 充值请求 DTO
 */
let RechargeDto = (() => {
    let _targetUserId_decorators;
    let _targetUserId_initializers = [];
    let _targetUserId_extraInitializers = [];
    let _amount_decorators;
    let _amount_initializers = [];
    let _amount_extraInitializers = [];
    let _remark_decorators;
    let _remark_initializers = [];
    let _remark_extraInitializers = [];
    return class RechargeDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _targetUserId_decorators = [ApiProperty({ description: '目标用户 ID', example: 'uuid-string' }), IsString(), IsNotEmpty()];
            _amount_decorators = [ApiProperty({ description: '充值金额（分）', example: 10000 }), IsInt(), Min(1), Max(100000000)];
            _remark_decorators = [ApiPropertyOptional({ description: '备注' }), IsOptional(), IsString()];
            __esDecorate(null, null, _targetUserId_decorators, { kind: "field", name: "targetUserId", static: false, private: false, access: { has: obj => "targetUserId" in obj, get: obj => obj.targetUserId, set: (obj, value) => { obj.targetUserId = value; } }, metadata: _metadata }, _targetUserId_initializers, _targetUserId_extraInitializers);
            __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: obj => "amount" in obj, get: obj => obj.amount, set: (obj, value) => { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
            __esDecorate(null, null, _remark_decorators, { kind: "field", name: "remark", static: false, private: false, access: { has: obj => "remark" in obj, get: obj => obj.remark, set: (obj, value) => { obj.remark = value; } }, metadata: _metadata }, _remark_initializers, _remark_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        targetUserId = __runInitializers(this, _targetUserId_initializers, void 0);
        amount = (__runInitializers(this, _targetUserId_extraInitializers), __runInitializers(this, _amount_initializers, void 0));
        remark = (__runInitializers(this, _amount_extraInitializers), __runInitializers(this, _remark_initializers, void 0));
        constructor() {
            __runInitializers(this, _remark_extraInitializers);
        }
    };
})();
/**
 * 余额控制器
 *
 * 提供余额查询、充值、交易流水查询等接口。
 */
let BalanceController = (() => {
    let _classDecorators = [ApiTags('Balance'), ApiBearerAuth(), UseGuards(JwtAuthGuard), Controller('balance')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getBalance_decorators;
    let _recharge_decorators;
    let _getTransactions_decorators;
    let _getRequestLogs_decorators;
    var BalanceController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getBalance_decorators = [Get(), ApiOperation({ summary: '查询余额' }), ApiOkResponse({
                    schema: {
                        properties: {
                            amount: { type: 'number', description: '总余额（分）' },
                            frozen: { type: 'number', description: '冻结金额（分）' },
                            available: { type: 'number', description: '可用余额（分）' },
                        },
                    },
                })];
            _recharge_decorators = [Post('recharge'), Roles('admin'), UseGuards(RolesGuard), ApiOperation({
                    summary: '充值余额',
                    description: '管理员为用户充值余额',
                })];
            _getTransactions_decorators = [Get('transactions'), ApiOperation({ summary: '获取交易流水' })];
            _getRequestLogs_decorators = [Get('logs'), ApiOperation({ summary: '获取请求日志' })];
            __esDecorate(this, null, _getBalance_decorators, { kind: "method", name: "getBalance", static: false, private: false, access: { has: obj => "getBalance" in obj, get: obj => obj.getBalance }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _recharge_decorators, { kind: "method", name: "recharge", static: false, private: false, access: { has: obj => "recharge" in obj, get: obj => obj.recharge }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getTransactions_decorators, { kind: "method", name: "getTransactions", static: false, private: false, access: { has: obj => "getTransactions" in obj, get: obj => obj.getTransactions }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getRequestLogs_decorators, { kind: "method", name: "getRequestLogs", static: false, private: false, access: { has: obj => "getRequestLogs" in obj, get: obj => obj.getRequestLogs }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            BalanceController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        balanceService = __runInitializers(this, _instanceExtraInitializers);
        constructor(balanceService) {
            this.balanceService = balanceService;
        }
        /**
         * 查询当前用户余额
         */
        async getBalance(user) {
            return this.balanceService.getBalance(user.id);
        }
        /**
         * 充值余额（管理员）
         */
        async recharge(user, dto) {
            return this.balanceService.recharge(dto.targetUserId, dto.amount, dto.remark);
        }
        /**
         * 获取交易流水
         */
        async getTransactions(user, pagination) {
            return this.balanceService.getTransactions(user.id, pagination.page, pagination.pageSize);
        }
        /**
         * 获取请求日志
         */
        async getRequestLogs(user, pagination) {
            return this.balanceService.getRequestLogs(user.id, pagination.page, pagination.pageSize);
        }
    };
    return BalanceController = _classThis;
})();
export { BalanceController };
//# sourceMappingURL=balance.controller.js.map