import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminRepository } from './admin.repository';

/**
 * Admin 管理模块
 *
 * 提供 Provider / Channel / Model / User 的管理 API。
 * 所有端点需要 admin 角色。
 */
@Module({
  controllers: [AdminController],
  providers: [AdminService, AdminRepository],
  exports: [AdminService, AdminRepository],
})
export class AdminModule {}
