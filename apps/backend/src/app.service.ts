import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';
import { SystemSettingService } from './common/services/system-setting.service';

const packageVersion = (() => {
  try {
    const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8')) as { version?: string };
    return pkg.version || 'unknown';
  } catch {
    return 'unknown';
  }
})();

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
      version: process.env['APP_VERSION'] || packageVersion,
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
      'copyright', 'icp_number', 'icp_number_show', 'psb_number', 'psb_number_show',
      'contact_email', 'support_email',
      'default_language', 'default_timezone',
      'maintenance_mode', 'maintenance_notice',
      'home_notice', 'login_notice', 'register_notice', 'footer_content',
      'seo_title', 'seo_description', 'seo_keywords',
      'allow_register', 'allow_change_email', 'allow_change_username',
      'allow_create_api_key', 'allow_delete_api_key', 'allow_webhook',
      'allow_organization', 'allow_delete_account',
      'email_verify', 'captcha_enabled', 'invite_code_required',
      'whitelist_enabled',
      'captcha_identity', 'captcha_region', 'captcha_mode',
      'captcha_register_enabled', 'captcha_register_scene_id',
      'captcha_login_enabled', 'captcha_login_scene_id',
      'captcha_forgot_password_enabled', 'captcha_forgot_password_scene_id',
      'captcha_send_email_code_enabled', 'captcha_send_email_code_scene_id',
    ];

    const config: Record<string, unknown> = {};
    for (const key of keys) {
      config[key] = await this.systemSettingService.getTypedByKey(key);
    }
    return config;
  }
}
