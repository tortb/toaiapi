import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { ApiKeyResponseDto } from './dto/api-key-response.dto';
import { CurrentUserInfo } from '../../common/decorators/current-user.decorator';
/**
 * API Key 控制器
 *
 * 处理 API Key 的 CRUD 操作。
 * 所有接口都需要 JWT 认证。
 */
export declare class ApiKeyController {
    private readonly apiKeyService;
    constructor(apiKeyService: ApiKeyService);
    /**
     * 创建 API Key
     */
    createApiKey(user: CurrentUserInfo, dto: CreateApiKeyDto): Promise<ApiKeyResponseDto>;
    /**
     * 获取 API Key 列表
     */
    listApiKeys(user: CurrentUserInfo): Promise<ApiKeyResponseDto[]>;
    /**
     * 更新 API Key
     */
    updateApiKey(user: CurrentUserInfo, keyId: string, dto: Partial<CreateApiKeyDto>): Promise<ApiKeyResponseDto>;
    /**
     * 禁用 API Key
     */
    disableApiKey(user: CurrentUserInfo, keyId: string): Promise<ApiKeyResponseDto>;
    /**
     * 启用 API Key
     */
    enableApiKey(user: CurrentUserInfo, keyId: string): Promise<ApiKeyResponseDto>;
    /**
     * 删除 API Key
     */
    deleteApiKey(user: CurrentUserInfo, keyId: string): Promise<void>;
}
//# sourceMappingURL=api-key.controller.d.ts.map