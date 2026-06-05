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
import { Controller, Get, Post, Patch, Delete, Put, UseGuards, HttpCode, HttpStatus, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse, ApiNoContentResponse, } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ProviderResponseDto } from './dto/provider-response.dto';
import { ChannelResponseDto } from './dto/channel-response.dto';
import { ModelResponseDto } from './dto/model-response.dto';
/**
 * Admin 管理控制器
 *
 * 所有端点需要 JWT 认证 + admin 角色。
 * 提供 Provider / Channel / Model / User 的管理 API。
 */
let AdminController = (() => {
    let _classDecorators = [ApiTags('Admin'), ApiBearerAuth(), UseGuards(JwtAuthGuard, RolesGuard), Roles('admin'), Controller('admin')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _listProviders_decorators;
    let _createProvider_decorators;
    let _getProvider_decorators;
    let _updateProvider_decorators;
    let _deleteProvider_decorators;
    let _listChannels_decorators;
    let _createChannel_decorators;
    let _getChannel_decorators;
    let _updateChannel_decorators;
    let _enableChannel_decorators;
    let _disableChannel_decorators;
    let _deleteChannel_decorators;
    let _listModels_decorators;
    let _createModel_decorators;
    let _getModel_decorators;
    let _updateModel_decorators;
    let _deleteModel_decorators;
    let _upsertPricing_decorators;
    let _listUsers_decorators;
    let _getUser_decorators;
    let _updateUserRole_decorators;
    let _updateUserStatus_decorators;
    let _listPaymentConfigs_decorators;
    let _getPaymentConfig_decorators;
    let _updatePaymentConfig_decorators;
    let _togglePaymentConfig_decorators;
    let _getSmtpConfig_decorators;
    let _updateSmtpConfig_decorators;
    let _toggleSmtpConfig_decorators;
    let _testSmtpConnection_decorators;
    let _sendTestEmail_decorators;
    var AdminController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _listProviders_decorators = [Get('providers'), ApiOperation({ summary: '获取 Provider 列表', description: '分页查询所有 Provider' }), ApiOkResponse({ type: [ProviderResponseDto] })];
            _createProvider_decorators = [Post('providers'), ApiOperation({ summary: '创建 Provider' }), ApiCreatedResponse({ type: ProviderResponseDto })];
            _getProvider_decorators = [Get('providers/:id'), ApiOperation({ summary: '获取 Provider 详情' }), ApiOkResponse({ type: ProviderResponseDto })];
            _updateProvider_decorators = [Patch('providers/:id'), ApiOperation({ summary: '更新 Provider' }), ApiOkResponse({ type: ProviderResponseDto })];
            _deleteProvider_decorators = [Delete('providers/:id'), HttpCode(HttpStatus.NO_CONTENT), ApiOperation({ summary: '删除 Provider', description: '有关联渠道时拒绝删除' }), ApiNoContentResponse()];
            _listChannels_decorators = [Get('channels'), ApiOperation({ summary: '获取渠道列表', description: '分页查询，支持按 Provider 筛选' }), ApiOkResponse({ type: [ChannelResponseDto] })];
            _createChannel_decorators = [Post('channels'), ApiOperation({ summary: '创建渠道' }), ApiCreatedResponse({ type: ChannelResponseDto })];
            _getChannel_decorators = [Get('channels/:id'), ApiOperation({ summary: '获取渠道详情' }), ApiOkResponse({ type: ChannelResponseDto })];
            _updateChannel_decorators = [Patch('channels/:id'), ApiOperation({ summary: '更新渠道' }), ApiOkResponse({ type: ChannelResponseDto })];
            _enableChannel_decorators = [Patch('channels/:id/enable'), ApiOperation({ summary: '启用渠道' }), ApiOkResponse({ type: ChannelResponseDto })];
            _disableChannel_decorators = [Patch('channels/:id/disable'), ApiOperation({ summary: '禁用渠道' }), ApiOkResponse({ type: ChannelResponseDto })];
            _deleteChannel_decorators = [Delete('channels/:id'), HttpCode(HttpStatus.NO_CONTENT), ApiOperation({ summary: '删除渠道' }), ApiNoContentResponse()];
            _listModels_decorators = [Get('models'), ApiOperation({ summary: '获取模型列表', description: '分页查询所有模型（含定价）' }), ApiOkResponse({ type: [ModelResponseDto] })];
            _createModel_decorators = [Post('models'), ApiOperation({ summary: '创建模型' }), ApiCreatedResponse({ type: ModelResponseDto })];
            _getModel_decorators = [Get('models/:id'), ApiOperation({ summary: '获取模型详情' }), ApiOkResponse({ type: ModelResponseDto })];
            _updateModel_decorators = [Patch('models/:id'), ApiOperation({ summary: '更新模型' }), ApiOkResponse({ type: ModelResponseDto })];
            _deleteModel_decorators = [Delete('models/:id'), HttpCode(HttpStatus.NO_CONTENT), ApiOperation({ summary: '删除模型' }), ApiNoContentResponse()];
            _upsertPricing_decorators = [Put('models/:id/pricing'), ApiOperation({ summary: '设置/更新模型定价', description: '如果无定价则创建，已有则更新' }), ApiOkResponse({ type: ModelResponseDto })];
            _listUsers_decorators = [Get('users'), ApiOperation({ summary: '获取用户列表', description: '分页查询，支持按角色/状态筛选' }), ApiOkResponse()];
            _getUser_decorators = [Get('users/:id'), ApiOperation({ summary: '获取用户详情', description: '含余额和统计信息' }), ApiOkResponse()];
            _updateUserRole_decorators = [Patch('users/:id/role'), Roles('super_admin'), ApiOperation({ summary: '修改用户角色', description: '仅 super_admin 可执行' }), ApiOkResponse()];
            _updateUserStatus_decorators = [Patch('users/:id/status'), ApiOperation({ summary: '修改用户状态', description: '禁用/封禁/启用用户' }), ApiOkResponse()];
            _listPaymentConfigs_decorators = [Get('payment-configs'), ApiOperation({ summary: '获取所有支付配置' }), ApiOkResponse()];
            _getPaymentConfig_decorators = [Get('payment-configs/:name'), ApiOperation({ summary: '获取单个支付配置' }), ApiOkResponse()];
            _updatePaymentConfig_decorators = [Put('payment-configs/:name'), ApiOperation({ summary: '更新支付配置' }), ApiOkResponse()];
            _togglePaymentConfig_decorators = [Patch('payment-configs/:name/toggle'), ApiOperation({ summary: '切换支付配置启用状态' }), ApiOkResponse()];
            _getSmtpConfig_decorators = [Get('smtp-config'), ApiOperation({ summary: '获取SMTP配置' }), ApiOkResponse()];
            _updateSmtpConfig_decorators = [Put('smtp-config'), ApiOperation({ summary: '更新SMTP配置' }), ApiOkResponse()];
            _toggleSmtpConfig_decorators = [Patch('smtp-config/toggle'), ApiOperation({ summary: '切换SMTP配置启用状态' }), ApiOkResponse()];
            _testSmtpConnection_decorators = [Post('smtp-config/test-connection'), ApiOperation({ summary: '测试SMTP连接' }), ApiOkResponse()];
            _sendTestEmail_decorators = [Post('smtp-config/send-test'), ApiOperation({ summary: '发送测试邮件' }), ApiOkResponse()];
            __esDecorate(this, null, _listProviders_decorators, { kind: "method", name: "listProviders", static: false, private: false, access: { has: obj => "listProviders" in obj, get: obj => obj.listProviders }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createProvider_decorators, { kind: "method", name: "createProvider", static: false, private: false, access: { has: obj => "createProvider" in obj, get: obj => obj.createProvider }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getProvider_decorators, { kind: "method", name: "getProvider", static: false, private: false, access: { has: obj => "getProvider" in obj, get: obj => obj.getProvider }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateProvider_decorators, { kind: "method", name: "updateProvider", static: false, private: false, access: { has: obj => "updateProvider" in obj, get: obj => obj.updateProvider }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteProvider_decorators, { kind: "method", name: "deleteProvider", static: false, private: false, access: { has: obj => "deleteProvider" in obj, get: obj => obj.deleteProvider }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _listChannels_decorators, { kind: "method", name: "listChannels", static: false, private: false, access: { has: obj => "listChannels" in obj, get: obj => obj.listChannels }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createChannel_decorators, { kind: "method", name: "createChannel", static: false, private: false, access: { has: obj => "createChannel" in obj, get: obj => obj.createChannel }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getChannel_decorators, { kind: "method", name: "getChannel", static: false, private: false, access: { has: obj => "getChannel" in obj, get: obj => obj.getChannel }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateChannel_decorators, { kind: "method", name: "updateChannel", static: false, private: false, access: { has: obj => "updateChannel" in obj, get: obj => obj.updateChannel }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _enableChannel_decorators, { kind: "method", name: "enableChannel", static: false, private: false, access: { has: obj => "enableChannel" in obj, get: obj => obj.enableChannel }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _disableChannel_decorators, { kind: "method", name: "disableChannel", static: false, private: false, access: { has: obj => "disableChannel" in obj, get: obj => obj.disableChannel }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteChannel_decorators, { kind: "method", name: "deleteChannel", static: false, private: false, access: { has: obj => "deleteChannel" in obj, get: obj => obj.deleteChannel }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _listModels_decorators, { kind: "method", name: "listModels", static: false, private: false, access: { has: obj => "listModels" in obj, get: obj => obj.listModels }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createModel_decorators, { kind: "method", name: "createModel", static: false, private: false, access: { has: obj => "createModel" in obj, get: obj => obj.createModel }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getModel_decorators, { kind: "method", name: "getModel", static: false, private: false, access: { has: obj => "getModel" in obj, get: obj => obj.getModel }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateModel_decorators, { kind: "method", name: "updateModel", static: false, private: false, access: { has: obj => "updateModel" in obj, get: obj => obj.updateModel }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteModel_decorators, { kind: "method", name: "deleteModel", static: false, private: false, access: { has: obj => "deleteModel" in obj, get: obj => obj.deleteModel }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _upsertPricing_decorators, { kind: "method", name: "upsertPricing", static: false, private: false, access: { has: obj => "upsertPricing" in obj, get: obj => obj.upsertPricing }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _listUsers_decorators, { kind: "method", name: "listUsers", static: false, private: false, access: { has: obj => "listUsers" in obj, get: obj => obj.listUsers }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getUser_decorators, { kind: "method", name: "getUser", static: false, private: false, access: { has: obj => "getUser" in obj, get: obj => obj.getUser }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateUserRole_decorators, { kind: "method", name: "updateUserRole", static: false, private: false, access: { has: obj => "updateUserRole" in obj, get: obj => obj.updateUserRole }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateUserStatus_decorators, { kind: "method", name: "updateUserStatus", static: false, private: false, access: { has: obj => "updateUserStatus" in obj, get: obj => obj.updateUserStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _listPaymentConfigs_decorators, { kind: "method", name: "listPaymentConfigs", static: false, private: false, access: { has: obj => "listPaymentConfigs" in obj, get: obj => obj.listPaymentConfigs }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getPaymentConfig_decorators, { kind: "method", name: "getPaymentConfig", static: false, private: false, access: { has: obj => "getPaymentConfig" in obj, get: obj => obj.getPaymentConfig }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updatePaymentConfig_decorators, { kind: "method", name: "updatePaymentConfig", static: false, private: false, access: { has: obj => "updatePaymentConfig" in obj, get: obj => obj.updatePaymentConfig }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _togglePaymentConfig_decorators, { kind: "method", name: "togglePaymentConfig", static: false, private: false, access: { has: obj => "togglePaymentConfig" in obj, get: obj => obj.togglePaymentConfig }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getSmtpConfig_decorators, { kind: "method", name: "getSmtpConfig", static: false, private: false, access: { has: obj => "getSmtpConfig" in obj, get: obj => obj.getSmtpConfig }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateSmtpConfig_decorators, { kind: "method", name: "updateSmtpConfig", static: false, private: false, access: { has: obj => "updateSmtpConfig" in obj, get: obj => obj.updateSmtpConfig }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _toggleSmtpConfig_decorators, { kind: "method", name: "toggleSmtpConfig", static: false, private: false, access: { has: obj => "toggleSmtpConfig" in obj, get: obj => obj.toggleSmtpConfig }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _testSmtpConnection_decorators, { kind: "method", name: "testSmtpConnection", static: false, private: false, access: { has: obj => "testSmtpConnection" in obj, get: obj => obj.testSmtpConnection }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _sendTestEmail_decorators, { kind: "method", name: "sendTestEmail", static: false, private: false, access: { has: obj => "sendTestEmail" in obj, get: obj => obj.sendTestEmail }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AdminController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        adminService = __runInitializers(this, _instanceExtraInitializers);
        constructor(adminService) {
            this.adminService = adminService;
        }
        // ──────────────────────────────────────────────
        // Provider 管理
        // ──────────────────────────────────────────────
        async listProviders(pagination) {
            return this.adminService.listProviders(pagination.page, pagination.pageSize);
        }
        async createProvider(dto) {
            return this.adminService.createProvider(dto);
        }
        async getProvider(id) {
            return this.adminService.getProvider(id);
        }
        async updateProvider(id, dto) {
            return this.adminService.updateProvider(id, dto);
        }
        async deleteProvider(id) {
            await this.adminService.deleteProvider(id);
        }
        // ──────────────────────────────────────────────
        // Channel 管理
        // ──────────────────────────────────────────────
        async listChannels(pagination, providerId) {
            return this.adminService.listChannels(pagination.page, pagination.pageSize, providerId);
        }
        async createChannel(dto) {
            return this.adminService.createChannel(dto);
        }
        async getChannel(id) {
            return this.adminService.getChannel(id);
        }
        async updateChannel(id, dto) {
            return this.adminService.updateChannel(id, dto);
        }
        async enableChannel(id) {
            return this.adminService.enableChannel(id);
        }
        async disableChannel(id) {
            return this.adminService.disableChannel(id);
        }
        async deleteChannel(id) {
            await this.adminService.deleteChannel(id);
        }
        // ──────────────────────────────────────────────
        // Model 管理
        // ──────────────────────────────────────────────
        async listModels(pagination) {
            return this.adminService.listModels(pagination.page, pagination.pageSize);
        }
        async createModel(dto) {
            return this.adminService.createModel(dto);
        }
        async getModel(id) {
            return this.adminService.getModel(id);
        }
        async updateModel(id, dto) {
            return this.adminService.updateModel(id, dto);
        }
        async deleteModel(id) {
            await this.adminService.deleteModel(id);
        }
        async upsertPricing(id, dto) {
            return this.adminService.upsertPricing(id, dto);
        }
        // ──────────────────────────────────────────────
        // User 管理
        // ──────────────────────────────────────────────
        async listUsers(pagination, role, status) {
            return this.adminService.listUsers(pagination.page, pagination.pageSize, role, status);
        }
        async getUser(id) {
            return this.adminService.getUser(id);
        }
        async updateUserRole(id, dto, operator) {
            return this.adminService.updateUserRole(id, dto, operator.role, operator.id);
        }
        async updateUserStatus(id, dto, operator) {
            return this.adminService.updateUserStatus(id, dto, operator.id);
        }
        // ──────────────────────────────────────────────
        // 支付配置管理
        // ──────────────────────────────────────────────
        async listPaymentConfigs() {
            return this.adminService.listPaymentConfigs();
        }
        async getPaymentConfig(name) {
            return this.adminService.getPaymentConfig(name);
        }
        async updatePaymentConfig(name, dto) {
            return this.adminService.updatePaymentConfig(name, dto);
        }
        async togglePaymentConfig(name) {
            return this.adminService.togglePaymentConfig(name);
        }
        // ──────────────────────────────────────────────
        // SMTP配置管理
        // ──────────────────────────────────────────────
        async getSmtpConfig() {
            return this.adminService.getSmtpConfig();
        }
        async updateSmtpConfig(dto) {
            return this.adminService.updateSmtpConfig(dto);
        }
        async toggleSmtpConfig() {
            return this.adminService.toggleSmtpConfig();
        }
        async testSmtpConnection() {
            return this.adminService.testSmtpConnection();
        }
        async sendTestEmail(dto) {
            return this.adminService.sendTestEmail(dto.email);
        }
    };
    return AdminController = _classThis;
})();
export { AdminController };
//# sourceMappingURL=admin.controller.js.map