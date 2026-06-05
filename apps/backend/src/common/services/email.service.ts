import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SmtpConfigService } from './smtp-config.service';

/**
 * 邮件服务
 *
 * 使用 nodemailer 通过 SMTP 发送邮件。
 * SMTP 配置从数据库读取，支持通过 Admin 前端动态配置。
 *
 * 支持：
 * - 密码重置邮件
 * - 验证码邮件
 * - 通用邮件发送
 */
@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private currentConfigHash: string | null = null;

  constructor(private readonly smtpConfigService: SmtpConfigService) {}

  async onModuleInit() {
    await this.refreshTransporter();
  }

  /**
   * 刷新邮件传输器
   *
   * 当 SMTP 配置变更时调用。
   */
  async refreshTransporter(): Promise<void> {
    try {
      const config = await this.smtpConfigService.getEnabledConfig();

      if (!config || !config.host) {
        this.logger.warn('SMTP not configured or disabled, email sending disabled');
        this.transporter = null;
        this.currentConfigHash = null;
        return;
      }

      // 生成配置哈希，检测配置是否变更
      const configHash = `${config.host}:${config.port}:${config.secure}:${config.username}:${config.password}`;
      if (configHash === this.currentConfigHash) {
        return; // 配置未变更
      }

      // 创建新的传输器
      // port 465: secure=true (直接 SSL/TLS)
      // port 587: secure=false + requireTLS=true (STARTTLS)
      // port 25:  secure=false (无加密)
      this.transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        requireTLS: !config.secure && config.port === 587,
        tls: {
          rejectUnauthorized: false, // 允许自签名证书
        },
        auth: config.username
          ? {
              user: config.username,
              pass: config.password || '',
            }
          : undefined,
      } as nodemailer.TransportOptions);

      this.currentConfigHash = configHash;
      this.logger.log(`Email service refreshed: ${config.host}:${config.port}`);
    } catch (error) {
      this.logger.error(`Failed to refresh email transporter: ${error}`);
      this.transporter = null;
      this.currentConfigHash = null;
    }
  }

  /**
   * 发送密码重置邮件
   *
   * @param email - 收件人邮箱
   * @param resetToken - 重置 Token
   * @param appUrl - 前端应用地址
   */
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    appUrl: string = 'http://localhost:3000',
  ): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('Email service not configured, skipping email send');
      return false;
    }

    const config = await this.smtpConfigService.getDecryptedConfig();
    const from = config?.from_address
      ? `"${config.from_name || 'ToAIAPI'}" <${config.from_address}>`
      : 'noreply@toaiapi.com';

    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

    try {
      await this.transporter.sendMail({
        from,
        to: email,
        subject: 'ToAIAPI - 密码重置',
        html: this.getPasswordResetTemplate(resetUrl),
      });

      this.logger.log(`Password reset email sent to: ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}: ${error}`);
      return false;
    }
  }

  /**
   * 发送验证码邮件
   *
   * @param email - 收件人邮箱
   * @param code - 验证码
   * @param purpose - 用途说明
   */
  async sendVerificationCodeEmail(
    email: string,
    code: string,
    purpose: string = '验证',
  ): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('Email service not configured, skipping email send');
      return false;
    }

    const config = await this.smtpConfigService.getDecryptedConfig();
    const from = config?.from_address
      ? `"${config.from_name || 'ToAIAPI'}" <${config.from_address}>`
      : 'noreply@toaiapi.com';

    try {
      await this.transporter.sendMail({
        from,
        to: email,
        subject: `ToAIAPI - ${purpose}验证码`,
        html: this.getVerificationCodeTemplate(code, purpose),
      });

      this.logger.log(`Verification code email sent to: ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}: ${error}`);
      return false;
    }
  }

  /**
   * 测试SMTP连接
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.transporter) {
      return {
        success: false,
        message: 'SMTP未配置或已禁用',
      };
    }

    try {
      await this.transporter.verify();
      return {
        success: true,
        message: 'SMTP连接成功',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `SMTP连接失败: ${error.message}`,
      };
    }
  }

  /**
   * 发送测试邮件
   */
  async sendTestEmail(to: string): Promise<{ success: boolean; message: string }> {
    if (!this.transporter) {
      return {
        success: false,
        message: 'SMTP未配置或已禁用',
      };
    }

    const config = await this.smtpConfigService.getDecryptedConfig();
    const from = config?.from_address
      ? `"${config.from_name || 'ToAIAPI'}" <${config.from_address}>`
      : 'noreply@toaiapi.com';

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject: 'ToAIAPI - 测试邮件',
        html: this.getTestEmailTemplate(),
      });

      return {
        success: true,
        message: `测试邮件已发送至 ${to}`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `发送失败: ${error.message}`,
      };
    }
  }

  /**
   * 密码重置邮件模板
   */
  private getPasswordResetTemplate(resetUrl: string): string {
    return `
      <div style="max-width: 480px; margin: 0 auto; padding: 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <h2 style="color: #111; margin-bottom: 16px;">密码重置</h2>
        <p style="color: #555; line-height: 1.6;">
          您好，我们收到了您的密码重置请求。请点击下方按钮重置密码：
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}"
             style="display: inline-block; padding: 12px 32px; background: #3b82f6; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500;">
            重置密码
          </a>
        </div>
        <p style="color: #888; font-size: 13px; line-height: 1.6;">
          此链接将在 1 小时后失效。如果您没有请求重置密码，请忽略此邮件。
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #aaa; font-size: 12px;">
          ToAIAPI — Enterprise AI Gateway Platform
        </p>
      </div>
    `;
  }

  /**
   * 验证码邮件模板
   */
  private getVerificationCodeTemplate(code: string, purpose: string): string {
    return `
      <div style="max-width: 480px; margin: 0 auto; padding: 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <h2 style="color: #111; margin-bottom: 16px;">${purpose}验证码</h2>
        <p style="color: #555; line-height: 1.6;">
          您的验证码是：
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="display: inline-block; padding: 16px 32px; background: #f3f4f6; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111;">
            ${code}
          </span>
        </div>
        <p style="color: #888; font-size: 13px; line-height: 1.6;">
          验证码将在 10 分钟后失效。请勿将验证码告知他人。
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #aaa; font-size: 12px;">
          ToAIAPI — Enterprise AI Gateway Platform
        </p>
      </div>
    `;
  }

  /**
   * 测试邮件模板
   */
  private getTestEmailTemplate(): string {
    return `
      <div style="max-width: 480px; margin: 0 auto; padding: 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <h2 style="color: #111; margin-bottom: 16px;">SMTP 配置测试</h2>
        <p style="color: #555; line-height: 1.6;">
          恭喜！您的 SMTP 配置已成功。这是一封测试邮件。
        </p>
        <p style="color: #888; font-size: 13px; line-height: 1.6; margin-top: 24px;">
          发送时间：${new Date().toLocaleString('zh-CN')}
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #aaa; font-size: 12px;">
          ToAIAPI — Enterprise AI Gateway Platform
        </p>
      </div>
    `;
  }
}
