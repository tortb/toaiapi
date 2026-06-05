import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';
import { SystemSettingService } from './common/services/system-setting.service';

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly systemSettingService: SystemSettingService,
  ) {}

  async healthCheck() {
    const checks = {
      database: false,
      redis: false,
    };

    // 检查数据库连接
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = true;
    } catch {
      // 数据库连接失败
    }

    // 检查 Redis 连接
    try {
      await this.redis.ping();
      checks.redis = true;
    } catch {
      // Redis 连接失败
    }

    const isHealthy = checks.database && checks.redis;

    return {
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'ToAIAPI Backend',
      version: '0.2.0',
      checks,
    };
  }

  /**
   * 获取维护模式状态（公开接口，无需认证）
   */
  async getMaintenanceStatus() {
    const maintenanceMode = await this.systemSettingService.getTypedByKey<boolean>(
      'maintenance_mode',
      false,
    );
    const notice = await this.systemSettingService.getByKey('maintenance_notice');

    return {
      maintenance: maintenanceMode,
      notice: maintenanceMode ? notice : null,
    };
  }

  /**
   * 获取公开站点配置（用于前端渲染）
   */
  async getPublicConfig() {
    const keys = [
      'site_name', 'site_subtitle', 'logo_url', 'favicon_url',
      'copyright', 'icp_number', 'contact_email', 'support_email',
      'default_language', 'default_timezone',
      'maintenance_mode', 'maintenance_notice',
      'home_notice', 'login_notice', 'register_notice', 'footer_content',
      'seo_title', 'seo_description', 'seo_keywords',
      'allow_register', 'allow_change_email', 'allow_change_username',
      'allow_create_api_key', 'allow_delete_api_key', 'allow_webhook',
      'allow_organization', 'allow_delete_account',
      'email_verify', 'captcha_enabled', 'invite_code_required',
    ];

    const config: Record<string, unknown> = {};
    for (const key of keys) {
      config[key] = await this.systemSettingService.getTypedByKey(key);
    }
    return config;
  }
}
