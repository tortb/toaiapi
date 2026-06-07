import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../common/services/email.service';

/**
 * 通知分发器
 *
 * 负责将通知发送到不同的渠道
 */
@Injectable()
export class NotificationDispatcherService {
  private readonly logger = new Logger(NotificationDispatcherService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  /**
   * 发送邮件通知
   */
  async sendEmail(to: string, subject: string, content: string): Promise<boolean> {
    try {
      // 使用 EmailService 的底层方法发送简单文本邮件
      const result = await (this.emailService as any).transporter?.sendMail({
        to,
        subject,
        text: content,
        html: `<p>${content.replace(/\n/g, '<br>')}</p>`,
      });

      return !!result;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error}`);
      return false;
    }
  }

  /**
   * 发送 Webhook 通知
   */
  async sendWebhook(url: string, payload: Record<string, any>): Promise<boolean> {
    try {
      const https = await import('https');
      const http = await import('http');
      const urlModule = await import('url');

      const parsedUrl = new urlModule.URL(url);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;

      return new Promise<boolean>((resolve) => {
        const postData = JSON.stringify(payload);
        const options = {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port,
          path: parsedUrl.pathname + parsedUrl.search,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
          },
          timeout: 5000,
        };

        const req = protocol.request(options, (res) => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(true);
          } else {
            this.logger.error(`Webhook returned status ${res.statusCode}`);
            resolve(false);
          }
        });

        req.on('error', (error) => {
          this.logger.error(`Failed to send webhook: ${error}`);
          resolve(false);
        });

        req.on('timeout', () => {
          this.logger.error('Webhook request timeout');
          req.destroy();
          resolve(false);
        });

        req.write(postData);
        req.end();
      });
    } catch (error) {
      this.logger.error(`Failed to send webhook: ${error}`);
      return false;
    }
  }

  /**
   * 发送 WxPusher 通知
   */
  async sendWxPusher(uid: string, title: string, content: string): Promise<boolean> {
    try {
      const appToken = this.config.get<string>('WXPUSHER_APP_TOKEN');
      if (!appToken) {
        this.logger.warn('WxPusher app token not configured');
        return false;
      }

      const payload = JSON.stringify({
        appToken,
        content,
        summary: title,
        contentType: 1,
        uids: [uid],
      });

      return await this.sendWebhook('https://wxpusher.zjiecode.com/api/send/message', JSON.parse(payload));
    } catch (error) {
      this.logger.error(`Failed to send WxPusher: ${error}`);
      return false;
    }
  }
}
