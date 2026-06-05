import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Public')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: '健康检查' })
  async healthCheck() {
    return this.appService.healthCheck();
  }

  @Get('maintenance-status')
  @ApiOperation({ summary: '获取维护模式状态（公开）' })
  async getMaintenanceStatus() {
    return this.appService.getMaintenanceStatus();
  }

  @Get('public-config')
  @ApiOperation({ summary: '获取公开站点配置（公开）' })
  async getPublicConfig() {
    return this.appService.getPublicConfig();
  }
}
