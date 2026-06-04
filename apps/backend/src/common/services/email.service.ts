import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

/**
 * 邮件服务
 *
 * 使用 nodemailer 通过 SMTP 发送邮件。
 * 支持自建邮件服务器和第三方 SMTP（如 SendGrid、阿里云邮件推送等）。
 *
 * 环境变量：
 * - SMTP_HOST: SMTP 服务器地址
 * - SMTP_PORT: SMTP 端口（默认 587）
 * - SMTP_SECURE: 是否使用 TLS（默认 false）
 * - SMTP_USER: SMTP 用户名
 * - SMTP_PASS: SMTP 密码
 * - SMTP_FROM: 发件人地址（默认 noreply@toaiapi.com）
 * - APP_URL: 前端应用地址（用于生成重置链接）
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.config.get<number>('SMTP_PORT', 587),
        secure: this.config.get<boolean>('SMTP_SECURE', false),
        auth: {
          user: this.config.get<string>('SMTP_USER'),
          pass: this.config.get<string>('SMTP_PASS'),
        },
      });
      this.logger.log(`Email service initialized: ${host}`);
    } else {
      this.logger.warn('SMTP_HOST not configured, email sending disabled');
    }
  }

  /**
   * 发送密码重置邮件
   *
   * @param email - 收件人邮箱
   * @param resetToken - 重置 Token
   */
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('Email service not configured, skipping email send');
      return;
    }

    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:3000');
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;
    const from = this.config.get<string>('SMTP_FROM', 'noreply@toaiapi.com');

    try {
      await this.transporter.sendMail({
        from,
        to: email,
        subject: 'ToAIAPI - 密码重置',
        html: `
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
        `,
      });

      this.logger.log(`Password reset email sent to: ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}: ${error}`);
      // 不抛出异常，防止邮件发送失败影响业务流程
      // 用户可以通过再次点击"忘记密码"重试
    }
  }
}
