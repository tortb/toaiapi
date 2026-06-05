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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
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
let EmailService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var EmailService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            EmailService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        smtpConfigService;
        logger = new Logger(EmailService.name);
        transporter = null;
        currentConfigHash = null;
        constructor(smtpConfigService) {
            this.smtpConfigService = smtpConfigService;
        }
        async onModuleInit() {
            await this.refreshTransporter();
        }
        /**
         * 刷新邮件传输器
         *
         * 当 SMTP 配置变更时调用。
         */
        async refreshTransporter() {
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
                this.transporter = nodemailer.createTransport({
                    host: config.host,
                    port: config.port,
                    secure: config.secure,
                    auth: config.username
                        ? {
                            user: config.username,
                            pass: config.password || '',
                        }
                        : undefined,
                });
                this.currentConfigHash = configHash;
                this.logger.log(`Email service refreshed: ${config.host}:${config.port}`);
            }
            catch (error) {
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
        async sendPasswordResetEmail(email, resetToken, appUrl = 'http://localhost:3000') {
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
            }
            catch (error) {
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
        async sendVerificationCodeEmail(email, code, purpose = '验证') {
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
            }
            catch (error) {
                this.logger.error(`Failed to send email to ${email}: ${error}`);
                return false;
            }
        }
        /**
         * 测试SMTP连接
         */
        async testConnection() {
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
            }
            catch (error) {
                return {
                    success: false,
                    message: `SMTP连接失败: ${error.message}`,
                };
            }
        }
        /**
         * 发送测试邮件
         */
        async sendTestEmail(to) {
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
            }
            catch (error) {
                return {
                    success: false,
                    message: `发送失败: ${error.message}`,
                };
            }
        }
        /**
         * 密码重置邮件模板
         */
        getPasswordResetTemplate(resetUrl) {
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
        getVerificationCodeTemplate(code, purpose) {
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
        getTestEmailTemplate() {
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
    };
    return EmailService = _classThis;
})();
export { EmailService };
//# sourceMappingURL=email.service.js.map