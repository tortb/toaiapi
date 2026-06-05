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
import { ApiProperty } from '@nestjs/swagger';
/**
 * 指标卡数据
 */
let MetricCardDto = (() => {
    let _totalUsers_decorators;
    let _totalUsers_initializers = [];
    let _totalUsers_extraInitializers = [];
    let _totalUsersGrowth_decorators;
    let _totalUsersGrowth_initializers = [];
    let _totalUsersGrowth_extraInitializers = [];
    let _totalRecharge_decorators;
    let _totalRecharge_initializers = [];
    let _totalRecharge_extraInitializers = [];
    let _totalRechargeGrowth_decorators;
    let _totalRechargeGrowth_initializers = [];
    let _totalRechargeGrowth_extraInitializers = [];
    let _totalConsumption_decorators;
    let _totalConsumption_initializers = [];
    let _totalConsumption_extraInitializers = [];
    let _totalConsumptionGrowth_decorators;
    let _totalConsumptionGrowth_initializers = [];
    let _totalConsumptionGrowth_extraInitializers = [];
    let _totalRequests_decorators;
    let _totalRequests_initializers = [];
    let _totalRequests_extraInitializers = [];
    let _totalRequestsGrowth_decorators;
    let _totalRequestsGrowth_initializers = [];
    let _totalRequestsGrowth_extraInitializers = [];
    let _totalBalance_decorators;
    let _totalBalance_initializers = [];
    let _totalBalance_extraInitializers = [];
    return class MetricCardDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _totalUsers_decorators = [ApiProperty({ description: '注册用户数' })];
            _totalUsersGrowth_decorators = [ApiProperty({ description: '注册用户增长率 (%)' })];
            _totalRecharge_decorators = [ApiProperty({ description: '总充值金额（分）' })];
            _totalRechargeGrowth_decorators = [ApiProperty({ description: '充值增长率 (%)' })];
            _totalConsumption_decorators = [ApiProperty({ description: '总消费金额（分）' })];
            _totalConsumptionGrowth_decorators = [ApiProperty({ description: '消费增长率 (%)' })];
            _totalRequests_decorators = [ApiProperty({ description: '总调用次数' })];
            _totalRequestsGrowth_decorators = [ApiProperty({ description: '调用增长率 (%)' })];
            _totalBalance_decorators = [ApiProperty({ description: '总余额（分）' })];
            __esDecorate(null, null, _totalUsers_decorators, { kind: "field", name: "totalUsers", static: false, private: false, access: { has: obj => "totalUsers" in obj, get: obj => obj.totalUsers, set: (obj, value) => { obj.totalUsers = value; } }, metadata: _metadata }, _totalUsers_initializers, _totalUsers_extraInitializers);
            __esDecorate(null, null, _totalUsersGrowth_decorators, { kind: "field", name: "totalUsersGrowth", static: false, private: false, access: { has: obj => "totalUsersGrowth" in obj, get: obj => obj.totalUsersGrowth, set: (obj, value) => { obj.totalUsersGrowth = value; } }, metadata: _metadata }, _totalUsersGrowth_initializers, _totalUsersGrowth_extraInitializers);
            __esDecorate(null, null, _totalRecharge_decorators, { kind: "field", name: "totalRecharge", static: false, private: false, access: { has: obj => "totalRecharge" in obj, get: obj => obj.totalRecharge, set: (obj, value) => { obj.totalRecharge = value; } }, metadata: _metadata }, _totalRecharge_initializers, _totalRecharge_extraInitializers);
            __esDecorate(null, null, _totalRechargeGrowth_decorators, { kind: "field", name: "totalRechargeGrowth", static: false, private: false, access: { has: obj => "totalRechargeGrowth" in obj, get: obj => obj.totalRechargeGrowth, set: (obj, value) => { obj.totalRechargeGrowth = value; } }, metadata: _metadata }, _totalRechargeGrowth_initializers, _totalRechargeGrowth_extraInitializers);
            __esDecorate(null, null, _totalConsumption_decorators, { kind: "field", name: "totalConsumption", static: false, private: false, access: { has: obj => "totalConsumption" in obj, get: obj => obj.totalConsumption, set: (obj, value) => { obj.totalConsumption = value; } }, metadata: _metadata }, _totalConsumption_initializers, _totalConsumption_extraInitializers);
            __esDecorate(null, null, _totalConsumptionGrowth_decorators, { kind: "field", name: "totalConsumptionGrowth", static: false, private: false, access: { has: obj => "totalConsumptionGrowth" in obj, get: obj => obj.totalConsumptionGrowth, set: (obj, value) => { obj.totalConsumptionGrowth = value; } }, metadata: _metadata }, _totalConsumptionGrowth_initializers, _totalConsumptionGrowth_extraInitializers);
            __esDecorate(null, null, _totalRequests_decorators, { kind: "field", name: "totalRequests", static: false, private: false, access: { has: obj => "totalRequests" in obj, get: obj => obj.totalRequests, set: (obj, value) => { obj.totalRequests = value; } }, metadata: _metadata }, _totalRequests_initializers, _totalRequests_extraInitializers);
            __esDecorate(null, null, _totalRequestsGrowth_decorators, { kind: "field", name: "totalRequestsGrowth", static: false, private: false, access: { has: obj => "totalRequestsGrowth" in obj, get: obj => obj.totalRequestsGrowth, set: (obj, value) => { obj.totalRequestsGrowth = value; } }, metadata: _metadata }, _totalRequestsGrowth_initializers, _totalRequestsGrowth_extraInitializers);
            __esDecorate(null, null, _totalBalance_decorators, { kind: "field", name: "totalBalance", static: false, private: false, access: { has: obj => "totalBalance" in obj, get: obj => obj.totalBalance, set: (obj, value) => { obj.totalBalance = value; } }, metadata: _metadata }, _totalBalance_initializers, _totalBalance_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        totalUsers = __runInitializers(this, _totalUsers_initializers, void 0);
        totalUsersGrowth = (__runInitializers(this, _totalUsers_extraInitializers), __runInitializers(this, _totalUsersGrowth_initializers, void 0));
        totalRecharge = (__runInitializers(this, _totalUsersGrowth_extraInitializers), __runInitializers(this, _totalRecharge_initializers, void 0));
        totalRechargeGrowth = (__runInitializers(this, _totalRecharge_extraInitializers), __runInitializers(this, _totalRechargeGrowth_initializers, void 0));
        totalConsumption = (__runInitializers(this, _totalRechargeGrowth_extraInitializers), __runInitializers(this, _totalConsumption_initializers, void 0));
        totalConsumptionGrowth = (__runInitializers(this, _totalConsumption_extraInitializers), __runInitializers(this, _totalConsumptionGrowth_initializers, void 0));
        totalRequests = (__runInitializers(this, _totalConsumptionGrowth_extraInitializers), __runInitializers(this, _totalRequests_initializers, void 0));
        totalRequestsGrowth = (__runInitializers(this, _totalRequests_extraInitializers), __runInitializers(this, _totalRequestsGrowth_initializers, void 0));
        totalBalance = (__runInitializers(this, _totalRequestsGrowth_extraInitializers), __runInitializers(this, _totalBalance_initializers, void 0));
        constructor() {
            __runInitializers(this, _totalBalance_extraInitializers);
        }
    };
})();
export { MetricCardDto };
/**
 * 调用统计数据点
 */
let CallStatsPointDto = (() => {
    let _label_decorators;
    let _label_initializers = [];
    let _label_extraInitializers = [];
    let _requests_decorators;
    let _requests_initializers = [];
    let _requests_extraInitializers = [];
    let _tokens_decorators;
    let _tokens_initializers = [];
    let _tokens_extraInitializers = [];
    let _cost_decorators;
    let _cost_initializers = [];
    let _cost_extraInitializers = [];
    return class CallStatsPointDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _label_decorators = [ApiProperty({ description: '时间标签 (MM-DD 或 HH:mm)' })];
            _requests_decorators = [ApiProperty({ description: '请求数' })];
            _tokens_decorators = [ApiProperty({ description: 'Token 数' })];
            _cost_decorators = [ApiProperty({ description: '费用（分）' })];
            __esDecorate(null, null, _label_decorators, { kind: "field", name: "label", static: false, private: false, access: { has: obj => "label" in obj, get: obj => obj.label, set: (obj, value) => { obj.label = value; } }, metadata: _metadata }, _label_initializers, _label_extraInitializers);
            __esDecorate(null, null, _requests_decorators, { kind: "field", name: "requests", static: false, private: false, access: { has: obj => "requests" in obj, get: obj => obj.requests, set: (obj, value) => { obj.requests = value; } }, metadata: _metadata }, _requests_initializers, _requests_extraInitializers);
            __esDecorate(null, null, _tokens_decorators, { kind: "field", name: "tokens", static: false, private: false, access: { has: obj => "tokens" in obj, get: obj => obj.tokens, set: (obj, value) => { obj.tokens = value; } }, metadata: _metadata }, _tokens_initializers, _tokens_extraInitializers);
            __esDecorate(null, null, _cost_decorators, { kind: "field", name: "cost", static: false, private: false, access: { has: obj => "cost" in obj, get: obj => obj.cost, set: (obj, value) => { obj.cost = value; } }, metadata: _metadata }, _cost_initializers, _cost_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        label = __runInitializers(this, _label_initializers, void 0);
        requests = (__runInitializers(this, _label_extraInitializers), __runInitializers(this, _requests_initializers, void 0));
        tokens = (__runInitializers(this, _requests_extraInitializers), __runInitializers(this, _tokens_initializers, void 0));
        cost = (__runInitializers(this, _tokens_extraInitializers), __runInitializers(this, _cost_initializers, void 0));
        constructor() {
            __runInitializers(this, _cost_extraInitializers);
        }
    };
})();
export { CallStatsPointDto };
/**
 * 模型分布数据
 */
let ModelDistributionDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _count_decorators;
    let _count_initializers = [];
    let _count_extraInitializers = [];
    let _percentage_decorators;
    let _percentage_initializers = [];
    let _percentage_extraInitializers = [];
    return class ModelDistributionDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [ApiProperty({ description: '模型名称' })];
            _count_decorators = [ApiProperty({ description: '请求数' })];
            _percentage_decorators = [ApiProperty({ description: '占比 (%)' })];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _count_decorators, { kind: "field", name: "count", static: false, private: false, access: { has: obj => "count" in obj, get: obj => obj.count, set: (obj, value) => { obj.count = value; } }, metadata: _metadata }, _count_initializers, _count_extraInitializers);
            __esDecorate(null, null, _percentage_decorators, { kind: "field", name: "percentage", static: false, private: false, access: { has: obj => "percentage" in obj, get: obj => obj.percentage, set: (obj, value) => { obj.percentage = value; } }, metadata: _metadata }, _percentage_initializers, _percentage_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        count = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _count_initializers, void 0));
        percentage = (__runInitializers(this, _count_extraInitializers), __runInitializers(this, _percentage_initializers, void 0));
        constructor() {
            __runInitializers(this, _percentage_extraInitializers);
        }
    };
})();
export { ModelDistributionDto };
/**
 * 最近订单
 */
let RecentOrderDto = (() => {
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _orderNo_decorators;
    let _orderNo_initializers = [];
    let _orderNo_extraInitializers = [];
    let _userEmail_decorators;
    let _userEmail_initializers = [];
    let _userEmail_extraInitializers = [];
    let _amount_decorators;
    let _amount_initializers = [];
    let _amount_extraInitializers = [];
    let _paymentMethod_decorators;
    let _paymentMethod_initializers = [];
    let _paymentMethod_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    return class RecentOrderDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [ApiProperty()];
            _orderNo_decorators = [ApiProperty({ description: '订单号' })];
            _userEmail_decorators = [ApiProperty({ description: '用户邮箱（脱敏）' })];
            _amount_decorators = [ApiProperty({ description: '金额（分）' })];
            _paymentMethod_decorators = [ApiProperty({ description: '支付方式' })];
            _status_decorators = [ApiProperty({ description: '状态' })];
            _createdAt_decorators = [ApiProperty({ description: '创建时间' })];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _orderNo_decorators, { kind: "field", name: "orderNo", static: false, private: false, access: { has: obj => "orderNo" in obj, get: obj => obj.orderNo, set: (obj, value) => { obj.orderNo = value; } }, metadata: _metadata }, _orderNo_initializers, _orderNo_extraInitializers);
            __esDecorate(null, null, _userEmail_decorators, { kind: "field", name: "userEmail", static: false, private: false, access: { has: obj => "userEmail" in obj, get: obj => obj.userEmail, set: (obj, value) => { obj.userEmail = value; } }, metadata: _metadata }, _userEmail_initializers, _userEmail_extraInitializers);
            __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: obj => "amount" in obj, get: obj => obj.amount, set: (obj, value) => { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
            __esDecorate(null, null, _paymentMethod_decorators, { kind: "field", name: "paymentMethod", static: false, private: false, access: { has: obj => "paymentMethod" in obj, get: obj => obj.paymentMethod, set: (obj, value) => { obj.paymentMethod = value; } }, metadata: _metadata }, _paymentMethod_initializers, _paymentMethod_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        id = __runInitializers(this, _id_initializers, void 0);
        orderNo = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _orderNo_initializers, void 0));
        userEmail = (__runInitializers(this, _orderNo_extraInitializers), __runInitializers(this, _userEmail_initializers, void 0));
        amount = (__runInitializers(this, _userEmail_extraInitializers), __runInitializers(this, _amount_initializers, void 0));
        paymentMethod = (__runInitializers(this, _amount_extraInitializers), __runInitializers(this, _paymentMethod_initializers, void 0));
        status = (__runInitializers(this, _paymentMethod_extraInitializers), __runInitializers(this, _status_initializers, void 0));
        createdAt = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
        constructor() {
            __runInitializers(this, _createdAt_extraInitializers);
        }
    };
})();
export { RecentOrderDto };
/**
 * 渠道状态
 */
let ChannelStatusDto = (() => {
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _avgLatency_decorators;
    let _avgLatency_initializers = [];
    let _avgLatency_extraInitializers = [];
    let _todayRequests_decorators;
    let _todayRequests_initializers = [];
    let _todayRequests_extraInitializers = [];
    return class ChannelStatusDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [ApiProperty()];
            _name_decorators = [ApiProperty({ description: '渠道名称' })];
            _status_decorators = [ApiProperty({ description: '状态' })];
            _avgLatency_decorators = [ApiProperty({ description: '平均响应时间（毫秒）' })];
            _todayRequests_decorators = [ApiProperty({ description: '今日调用次数' })];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _avgLatency_decorators, { kind: "field", name: "avgLatency", static: false, private: false, access: { has: obj => "avgLatency" in obj, get: obj => obj.avgLatency, set: (obj, value) => { obj.avgLatency = value; } }, metadata: _metadata }, _avgLatency_initializers, _avgLatency_extraInitializers);
            __esDecorate(null, null, _todayRequests_decorators, { kind: "field", name: "todayRequests", static: false, private: false, access: { has: obj => "todayRequests" in obj, get: obj => obj.todayRequests, set: (obj, value) => { obj.todayRequests = value; } }, metadata: _metadata }, _todayRequests_initializers, _todayRequests_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        id = __runInitializers(this, _id_initializers, void 0);
        name = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _name_initializers, void 0));
        status = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _status_initializers, void 0));
        avgLatency = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _avgLatency_initializers, void 0));
        todayRequests = (__runInitializers(this, _avgLatency_extraInitializers), __runInitializers(this, _todayRequests_initializers, void 0));
        constructor() {
            __runInitializers(this, _todayRequests_extraInitializers);
        }
    };
})();
export { ChannelStatusDto };
/**
 * Dashboard 完整响应
 */
let DashboardResponseDto = (() => {
    let _metrics_decorators;
    let _metrics_initializers = [];
    let _metrics_extraInitializers = [];
    let _callStats_decorators;
    let _callStats_initializers = [];
    let _callStats_extraInitializers = [];
    let _modelDistribution_decorators;
    let _modelDistribution_initializers = [];
    let _modelDistribution_extraInitializers = [];
    let _recentOrders_decorators;
    let _recentOrders_initializers = [];
    let _recentOrders_extraInitializers = [];
    let _channelStatus_decorators;
    let _channelStatus_initializers = [];
    let _channelStatus_extraInitializers = [];
    return class DashboardResponseDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _metrics_decorators = [ApiProperty({ type: MetricCardDto })];
            _callStats_decorators = [ApiProperty({ type: [CallStatsPointDto] })];
            _modelDistribution_decorators = [ApiProperty({ type: [ModelDistributionDto] })];
            _recentOrders_decorators = [ApiProperty({ type: [RecentOrderDto] })];
            _channelStatus_decorators = [ApiProperty({ type: [ChannelStatusDto] })];
            __esDecorate(null, null, _metrics_decorators, { kind: "field", name: "metrics", static: false, private: false, access: { has: obj => "metrics" in obj, get: obj => obj.metrics, set: (obj, value) => { obj.metrics = value; } }, metadata: _metadata }, _metrics_initializers, _metrics_extraInitializers);
            __esDecorate(null, null, _callStats_decorators, { kind: "field", name: "callStats", static: false, private: false, access: { has: obj => "callStats" in obj, get: obj => obj.callStats, set: (obj, value) => { obj.callStats = value; } }, metadata: _metadata }, _callStats_initializers, _callStats_extraInitializers);
            __esDecorate(null, null, _modelDistribution_decorators, { kind: "field", name: "modelDistribution", static: false, private: false, access: { has: obj => "modelDistribution" in obj, get: obj => obj.modelDistribution, set: (obj, value) => { obj.modelDistribution = value; } }, metadata: _metadata }, _modelDistribution_initializers, _modelDistribution_extraInitializers);
            __esDecorate(null, null, _recentOrders_decorators, { kind: "field", name: "recentOrders", static: false, private: false, access: { has: obj => "recentOrders" in obj, get: obj => obj.recentOrders, set: (obj, value) => { obj.recentOrders = value; } }, metadata: _metadata }, _recentOrders_initializers, _recentOrders_extraInitializers);
            __esDecorate(null, null, _channelStatus_decorators, { kind: "field", name: "channelStatus", static: false, private: false, access: { has: obj => "channelStatus" in obj, get: obj => obj.channelStatus, set: (obj, value) => { obj.channelStatus = value; } }, metadata: _metadata }, _channelStatus_initializers, _channelStatus_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        metrics = __runInitializers(this, _metrics_initializers, void 0);
        callStats = (__runInitializers(this, _metrics_extraInitializers), __runInitializers(this, _callStats_initializers, void 0));
        modelDistribution = (__runInitializers(this, _callStats_extraInitializers), __runInitializers(this, _modelDistribution_initializers, void 0));
        recentOrders = (__runInitializers(this, _modelDistribution_extraInitializers), __runInitializers(this, _recentOrders_initializers, void 0));
        channelStatus = (__runInitializers(this, _recentOrders_extraInitializers), __runInitializers(this, _channelStatus_initializers, void 0));
        constructor() {
            __runInitializers(this, _channelStatus_extraInitializers);
        }
    };
})();
export { DashboardResponseDto };
//# sourceMappingURL=dashboard-response.dto.js.map