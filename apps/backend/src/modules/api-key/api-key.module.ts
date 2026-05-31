import { Module } from '@nestjs/common';
import { ApiKeyRepository } from './api-key.repository';
import { ApiKeyService } from './api-key.service';
import { ApiKeyController } from './api-key.controller';

/**
 * API Key 模块
 *
 * 提供 API Key 的创建、删除、验证等功能。
 */
@Module({
  controllers: [ApiKeyController],
  providers: [ApiKeyService, ApiKeyRepository],
  exports: [ApiKeyService, ApiKeyRepository],
})
export class ApiKeyModule {}
