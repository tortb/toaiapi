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
import { Controller, Get, Post, Patch, Delete, UseGuards, HttpCode, HttpStatus, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse, ApiNoContentResponse, } from '@nestjs/swagger';
import { ApiKeyResponseDto } from './dto/api-key-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
/**
 * API Key 控制器
 *
 * 处理 API Key 的 CRUD 操作。
 * 所有接口都需要 JWT 认证。
 */
let ApiKeyController = (() => {
    let _classDecorators = [ApiTags('API Keys'), ApiBearerAuth(), UseGuards(JwtAuthGuard), Controller('api-keys')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _createApiKey_decorators;
    let _listApiKeys_decorators;
    let _updateApiKey_decorators;
    let _disableApiKey_decorators;
    let _enableApiKey_decorators;
    let _deleteApiKey_decorators;
    var ApiKeyController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _createApiKey_decorators = [Post(), ApiOperation({
                    summary: '创建 API Key',
                    description: '创建新的 API Key，完整 key 只在此次返回',
                }), ApiCreatedResponse({ type: ApiKeyResponseDto })];
            _listApiKeys_decorators = [Get(), ApiOperation({ summary: '获取 API Key 列表' }), ApiOkResponse({ type: [ApiKeyResponseDto] })];
            _updateApiKey_decorators = [Patch(':id'), ApiOperation({ summary: '更新 API Key 配置' }), ApiOkResponse({ type: ApiKeyResponseDto })];
            _disableApiKey_decorators = [Patch(':id/disable'), HttpCode(HttpStatus.OK), ApiOperation({ summary: '禁用 API Key' }), ApiOkResponse({ type: ApiKeyResponseDto })];
            _enableApiKey_decorators = [Patch(':id/enable'), HttpCode(HttpStatus.OK), ApiOperation({ summary: '启用 API Key' }), ApiOkResponse({ type: ApiKeyResponseDto })];
            _deleteApiKey_decorators = [Delete(':id'), HttpCode(HttpStatus.NO_CONTENT), ApiOperation({ summary: '删除 API Key' }), ApiNoContentResponse()];
            __esDecorate(this, null, _createApiKey_decorators, { kind: "method", name: "createApiKey", static: false, private: false, access: { has: obj => "createApiKey" in obj, get: obj => obj.createApiKey }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _listApiKeys_decorators, { kind: "method", name: "listApiKeys", static: false, private: false, access: { has: obj => "listApiKeys" in obj, get: obj => obj.listApiKeys }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateApiKey_decorators, { kind: "method", name: "updateApiKey", static: false, private: false, access: { has: obj => "updateApiKey" in obj, get: obj => obj.updateApiKey }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _disableApiKey_decorators, { kind: "method", name: "disableApiKey", static: false, private: false, access: { has: obj => "disableApiKey" in obj, get: obj => obj.disableApiKey }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _enableApiKey_decorators, { kind: "method", name: "enableApiKey", static: false, private: false, access: { has: obj => "enableApiKey" in obj, get: obj => obj.enableApiKey }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteApiKey_decorators, { kind: "method", name: "deleteApiKey", static: false, private: false, access: { has: obj => "deleteApiKey" in obj, get: obj => obj.deleteApiKey }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ApiKeyController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        apiKeyService = __runInitializers(this, _instanceExtraInitializers);
        constructor(apiKeyService) {
            this.apiKeyService = apiKeyService;
        }
        /**
         * 创建 API Key
         */
        async createApiKey(user, dto) {
            return this.apiKeyService.createApiKey(user.id, dto);
        }
        /**
         * 获取 API Key 列表
         */
        async listApiKeys(user) {
            return this.apiKeyService.listApiKeys(user.id);
        }
        /**
         * 更新 API Key
         */
        async updateApiKey(user, keyId, dto) {
            return this.apiKeyService.updateApiKey(user.id, keyId, dto);
        }
        /**
         * 禁用 API Key
         */
        async disableApiKey(user, keyId) {
            return this.apiKeyService.toggleApiKey(user.id, keyId, false);
        }
        /**
         * 启用 API Key
         */
        async enableApiKey(user, keyId) {
            return this.apiKeyService.toggleApiKey(user.id, keyId, true);
        }
        /**
         * 删除 API Key
         */
        async deleteApiKey(user, keyId) {
            await this.apiKeyService.deleteApiKey(user.id, keyId);
        }
    };
    return ApiKeyController = _classThis;
})();
export { ApiKeyController };
//# sourceMappingURL=api-key.controller.js.map