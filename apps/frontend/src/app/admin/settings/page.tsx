"use client";

/**
 * 系统设置页（Admin）
 *
 * /admin/settings — 系统参数配置
 * 左侧 Tab 导航 + 右侧表单
 *
 * 特殊处理：
 * - email 分类使用独立的 SMTP 配置表单
 * - 支持 HTML 公告的实时预览
 * - 维护模式开关联动后端
 */

import * as React from "react";
import {
  getSystemSettings,
  updateSystemSettings,
  getSmtpConfig,
  updateSmtpConfig,
  toggleSmtpConfig,
  testSmtpConnection,
  sendTestEmail,
  type SystemSettingData,
  type SmtpConfigData,
  type UpdateSmtpConfigPayload,
} from "@/lib/admin-api";
import { AdminShell } from "@/components/admin/AdminShell";

/* ============== 分类定义 ============== */
interface SettingCategory {
  key: string;
  label: string;
  icon: string;
}

const CATEGORIES: SettingCategory[] = [
  { key: "basic", label: "基础设置", icon: "🏠" },
  { key: "website", label: "网站设置", icon: "🌐" },
  { key: "user", label: "用户设置", icon: "👤" },
  { key: "register", label: "注册设置", icon: "📝" },
  { key: "email", label: "邮件设置", icon: "📧" },
  { key: "payment", label: "支付设置", icon: "💳" },
  { key: "finance", label: "财务设置", icon: "💰" },
  { key: "rate_limit", label: "风控设置", icon: "🛡️" },
  { key: "security", label: "安全设置", icon: "🔒" },
  { key: "api", label: "API设置", icon: "⚡" },
  { key: "notification", label: "通知设置", icon: "🔔" },
  { key: "storage", label: "存储设置", icon: "📦" },
  { key: "developer", label: "开发者设置", icon: "🛠️" },
];

/* ============== 字段定义 ============== */
interface FieldDef {
  key: string;
  label: string;
  type: "text" | "number" | "boolean" | "select" | "textarea" | "password" | "html";
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  suffix?: string;
  tip?: string;
}

const FIELDS: Record<string, FieldDef[]> = {
  basic: [
    { key: "site_name", label: "站点名称", type: "text", placeholder: "ToAIAPI" },
    { key: "site_subtitle", label: "站点副标题", type: "text", placeholder: "企业级 AI API 网关" },
    { key: "logo_url", label: "Logo URL", type: "text", placeholder: "https://..." },
    { key: "favicon_url", label: "Favicon URL", type: "text", placeholder: "https://..." },
    { key: "copyright", label: "版权信息", type: "text", placeholder: "© 2026 ToAIAPI" },
    { key: "icp_number", label: "备案号", type: "text", placeholder: "京ICP备xxxxxxxx号" },
    { key: "contact_email", label: "联系邮箱", type: "text", placeholder: "contact@example.com" },
    { key: "support_email", label: "技术支持邮箱", type: "text", placeholder: "support@example.com" },
    { key: "default_language", label: "默认语言", type: "select", options: [
      { value: "zh-CN", label: "简体中文" },
      { value: "en-US", label: "English" },
    ]},
    { key: "default_timezone", label: "默认时区", type: "select", options: [
      { value: "Asia/Shanghai", label: "Asia/Shanghai (UTC+8)" },
      { value: "America/New_York", label: "America/New_York (UTC-5)" },
      { value: "Europe/London", label: "Europe/London (UTC+0)" },
    ]},
  ],
  website: [
    { key: "maintenance_mode", label: "维护模式", type: "boolean", tip: "开启后全站显示维护公告（管理员不受影响）" },
    { key: "maintenance_notice", label: "维护公告", type: "html", placeholder: "支持 HTML 标签，如 <b>加粗</b>、<br> 换行" },
    { key: "home_notice", label: "首页公告", type: "html", placeholder: "支持 HTML 标签" },
    { key: "login_notice", label: "登录页公告", type: "html", placeholder: "支持 HTML 标签" },
    { key: "register_notice", label: "注册页公告", type: "html", placeholder: "支持 HTML 标签" },
    { key: "footer_content", label: "页脚内容", type: "html", placeholder: "支持 HTML 标签" },
    { key: "seo_title", label: "SEO 标题", type: "text" },
    { key: "seo_description", label: "SEO 描述", type: "textarea" },
    { key: "seo_keywords", label: "SEO 关键词", type: "text", placeholder: "用逗号分隔" },
  ],
  user: [
    { key: "allow_register", label: "允许用户注册", type: "boolean", tip: "关闭后注册页面不可访问" },
    { key: "allow_delete_account", label: "允许用户注销", type: "boolean", tip: "关闭后用户无法自助注销账号" },
    { key: "allow_change_email", label: "允许修改邮箱", type: "boolean" },
    { key: "allow_change_username", label: "允许修改用户名", type: "boolean" },
    { key: "allow_create_api_key", label: "允许创建 API Key", type: "boolean" },
    { key: "allow_delete_api_key", label: "允许删除 API Key", type: "boolean" },
    { key: "allow_webhook", label: "允许 Webhook", type: "boolean" },
    { key: "allow_organization", label: "允许组织功能", type: "boolean" },
  ],
  register: [
    { key: "email_verify", label: "邮箱验证", type: "boolean", tip: "注册时需要邮箱验证码" },
    { key: "captcha_enabled", label: "验证码验证", type: "boolean", tip: "注册时需要图形/行为验证码" },
    { key: "invite_code_required", label: "邀请码注册", type: "boolean", tip: "开启后必须填写有效邀请码" },
    { key: "whitelist_enabled", label: "白名单注册", type: "boolean", tip: "开启后仅白名单邮箱可注册" },
    { key: "default_balance", label: "默认赠送余额", type: "number", suffix: "元", tip: "注册时赠送的余额" },
    { key: "default_quota", label: "默认赠送额度", type: "number", suffix: "Token", tip: "1000000 = 100 万 Token" },
    { key: "default_group", label: "默认用户组", type: "text", placeholder: "default" },
    { key: "default_role", label: "默认权限组", type: "select", options: [
      { value: "USER", label: "普通用户" },
      { value: "VIP", label: "VIP" },
    ]},
  ],
  finance: [
    { key: "min_recharge", label: "最低充值金额", type: "number", suffix: "元", tip: "最低0.01元" },
    { key: "max_recharge", label: "最高充值金额", type: "number", suffix: "元" },
    { key: "gift_ratio", label: "赠送比例", type: "number", suffix: "%", tip: "充值赠送百分比" },
    { key: "refund_enabled", label: "退款开关", type: "boolean" },
    { key: "withdraw_enabled", label: "余额提现开关", type: "boolean" },
    { key: "auto_refund", label: "自动退款开关", type: "boolean" },
    { key: "invoice_enabled", label: "发票申请开关", type: "boolean" },
  ],
  rate_limit: [
    { key: "rpm", label: "单分钟请求数", type: "number", suffix: "次/分钟" },
    { key: "rph", label: "单小时请求数", type: "number", suffix: "次/小时" },
    { key: "rpd", label: "单日请求数", type: "number", suffix: "次/日" },
    { key: "ip_limit", label: "单 IP 限制", type: "number", suffix: "次/分钟" },
    { key: "key_limit", label: "单 Key 限制", type: "number", suffix: "次/分钟" },
    { key: "token_limit", label: "Token 限制", type: "number", suffix: "Token/日" },
    { key: "concurrent_limit", label: "并发限制", type: "number", suffix: "个" },
  ],
  security: [
    { key: "login_lock_enabled", label: "登录失败锁定", type: "boolean" },
    { key: "login_max_attempts", label: "最大登录尝试", type: "number", suffix: "次" },
    { key: "login_lock_duration", label: "锁定时长", type: "number", suffix: "秒", tip: "1800 = 30 分钟" },
    { key: "two_factor_enabled", label: "2FA 双因素认证", type: "boolean" },
    { key: "password_min_length", label: "密码最小长度", type: "number", suffix: "位" },
    { key: "password_require_uppercase", label: "要求大写字母", type: "boolean" },
    { key: "password_require_number", label: "要求数字", type: "boolean" },
    { key: "password_require_special", label: "要求特殊字符", type: "boolean" },
    { key: "session_expire", label: "Session 有效期", type: "number", suffix: "秒", tip: "86400 = 24 小时" },
    { key: "jwt_access_expire", label: "JWT Access 有效期", type: "number", suffix: "秒", tip: "900 = 15 分钟" },
    { key: "jwt_refresh_expire", label: "JWT Refresh 有效期", type: "number", suffix: "秒", tip: "604800 = 7 天" },
    { key: "ip_whitelist", label: "IP 白名单", type: "textarea", placeholder: "每行一个 IP" },
    { key: "ip_blacklist", label: "IP 黑名单", type: "textarea", placeholder: "每行一个 IP" },
  ],
  api: [
    { key: "api_prefix", label: "API 前缀", type: "text", placeholder: "/api/v1" },
    { key: "api_version", label: "版本号", type: "text", placeholder: "v1" },
    { key: "request_timeout", label: "请求超时", type: "number", suffix: "毫秒", tip: "300000 = 5 分钟" },
    { key: "max_concurrent", label: "最大并发", type: "number", suffix: "个" },
    { key: "max_tokens", label: "最大 Token", type: "number", suffix: "Token" },
    { key: "cache_enabled", label: "缓存开关", type: "boolean" },
    { key: "stream_enabled", label: "流式响应开关", type: "boolean" },
  ],
  notification: [
    { key: "email_enabled", label: "邮件通知", type: "boolean" },
    { key: "webhook_enabled", label: "Webhook 通知", type: "boolean" },
    { key: "webhook_url", label: "Webhook URL", type: "text", placeholder: "https://..." },
    { key: "notify_recharge_success", label: "充值成功通知", type: "boolean" },
    { key: "notify_low_balance", label: "余额不足通知", type: "boolean" },
    { key: "notify_low_balance_threshold", label: "余额预警阈值", type: "number", suffix: "元", tip: "余额低于此值时发送通知" },
    { key: "notify_provider_error", label: "供应商异常通知", type: "boolean" },
    { key: "notify_system_error", label: "系统异常通知", type: "boolean" },
    { key: "notify_invoice_request", label: "发票申请通知", type: "boolean" },
  ],
  storage: [
    { key: "upload_enabled", label: "允许上传", type: "boolean" },
    { key: "max_file_size", label: "最大文件大小", type: "number", suffix: "MB" },
    { key: "allowed_file_types", label: "允许文件类型", type: "text", placeholder: "jpg,jpeg,png,gif,pdf" },
  ],
  developer: [
    { key: "debug_mode", label: "Debug 模式", type: "boolean" },
    { key: "log_level", label: "日志等级", type: "select", options: [
      { value: "error", label: "Error" },
      { value: "warn", label: "Warn" },
      { value: "info", label: "Info" },
      { value: "debug", label: "Debug" },
    ]},
    { key: "system_monitor", label: "系统监控", type: "boolean" },
  ],
};

/* ============== 通用字段组件 ============== */
function SettingField({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: string;
  onChange: (val: string) => void;
}) {
  const [showPreview, setShowPreview] = React.useState(false);

  if (field.type === "boolean") {
    const checked = value === "true" || value === "1";
    return (
      <div className="flex items-center justify-between py-3">
        <div>
          <div className="text-[13px] text-gray-800 font-medium">{field.label}</div>
          {field.tip && <div className="text-[11px] text-gray-400 mt-0.5">{field.tip}</div>}
        </div>
        <button
          type="button"
          onClick={() => onChange(checked ? "false" : "true")}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            checked ? "bg-primary" : "bg-gray-200"
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              checked ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
      </div>
    );
  }

  // HTML 编辑器：textarea + 预览切换
  if (field.type === "html") {
    return (
      <div className="py-3">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[13px] text-gray-800 font-medium">{field.label}</label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-[11px] text-primary hover:underline"
          >
            {showPreview ? "编辑" : "预览"}
          </button>
        </div>
        {field.tip && <div className="text-[11px] text-gray-400 mb-1.5">{field.tip}</div>}
        {showPreview ? (
          <div
            className="w-full min-h-[80px] px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: value || '<span style="color:#999">暂无内容</span>' }}
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        )}
      </div>
    );
  }

  return (
    <div className="py-3">
      <label className="block text-[13px] text-gray-800 font-medium mb-1.5">
        {field.label}
        {field.suffix && <span className="text-gray-400 font-normal ml-1">({field.suffix})</span>}
      </label>
      {field.tip && <div className="text-[11px] text-gray-400 mb-1.5">{field.tip}</div>}
      {field.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      ) : field.type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : field.type === "password" ? (
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      ) : (
        <input
          type={field.type === "number" ? "number" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      )}
    </div>
  );
}

/* ============== SMTP 邮件配置表单 ============== */
function SmtpConfigForm() {
  const [config, setConfig] = React.useState<SmtpConfigData | null>(null);
  const [form, setForm] = React.useState<UpdateSmtpConfigPayload>({
    host: "",
    port: 587,
    secure: false,
    username: "",
    password: "",
    from_name: "",
    from_address: "",
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isTesting, setIsTesting] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [testEmail, setTestEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [testResult, setTestResult] = React.useState<{ success: boolean; message: string } | null>(null);

  // 加载 SMTP 配置
  React.useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await getSmtpConfig();
        if (data) {
          setConfig(data);
          setForm({
            host: data.host ?? "",
            port: data.port,
            secure: data.secure,
            username: data.username ?? "",
            password: "", // 不回填密码
            from_name: data.from_name ?? "",
            from_address: data.from_address ?? "",
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载 SMTP 配置失败");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const updateField = (key: keyof UpdateSmtpConfigPayload, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccessMsg(null);
    setTestResult(null);
  };

  // 保存配置
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const payload: UpdateSmtpConfigPayload = { ...form };
      // 如果密码为空且原配置有密码，不更新密码
      if (!payload.password && config?.password) {
        delete payload.password;
      }
      const updated = await updateSmtpConfig(payload);
      setConfig(updated);
      setForm((prev) => ({ ...prev, password: "" }));
      setSuccessMsg("SMTP 配置已保存");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setIsSaving(false);
    }
  };

  // 切换启用状态
  const handleToggle = async () => {
    setError(null);
    try {
      const updated = await toggleSmtpConfig();
      setConfig(updated);
      setSuccessMsg(updated.is_enabled ? "SMTP 已启用" : "SMTP 已禁用");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "切换失败");
    }
  };

  // 测试连接
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testSmtpConnection();
      setTestResult(result);
    } catch (err) {
      setTestResult({ success: false, message: err instanceof Error ? err.message : "测试失败" });
    } finally {
      setIsTesting(false);
    }
  };

  // 发送测试邮件
  const handleSendTest = async () => {
    if (!testEmail.trim()) {
      setTestResult({ success: false, message: "请输入测试邮箱地址" });
      return;
    }
    setIsSending(true);
    setTestResult(null);
    try {
      const result = await sendTestEmail(testEmail.trim());
      setTestResult(result);
    } catch (err) {
      setTestResult({ success: false, message: err instanceof Error ? err.message : "发送失败" });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">加载 SMTP 配置...</p>
      </div>
    );
  }

  const isEnabled = config?.is_enabled ?? false;

  return (
    <div>
      {/* 启用开关 */}
      <div className="flex items-center justify-between py-3 px-6 border-b border-gray-100">
        <div>
          <div className="text-[13px] text-gray-800 font-medium">启用 SMTP</div>
          <div className="text-[11px] text-gray-400 mt-0.5">
            {isEnabled ? "邮件服务运行中" : "邮件服务已禁用"}
          </div>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            isEnabled ? "bg-primary" : "bg-gray-200"
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              isEnabled ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {/* 配置表单 */}
      <div className="px-6 py-2 divide-y divide-gray-50">
        <div className="py-3">
          <label className="block text-[13px] text-gray-800 font-medium mb-1.5">SMTP 服务器地址</label>
          <input
            type="text"
            value={form.host ?? ""}
            onChange={(e) => updateField("host", e.target.value)}
            placeholder="smtp.qq.com"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="py-3">
          <label className="block text-[13px] text-gray-800 font-medium mb-1.5">端口</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={form.port ?? 587}
              onChange={(e) => updateField("port", parseInt(e.target.value) || 587)}
              className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            加密方式自动识别：465（SSL直连）、587（STARTTLS）、25（不加密）
          </div>
        </div>

        <div className="py-3">
          <label className="block text-[13px] text-gray-800 font-medium mb-1.5">用户名</label>
          <input
            type="text"
            value={form.username ?? ""}
            onChange={(e) => updateField("username", e.target.value)}
            placeholder="your-email@qq.com"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="py-3">
          <label className="block text-[13px] text-gray-800 font-medium mb-1.5">密码 / 授权码</label>
          <input
            type="password"
            value={form.password ?? ""}
            onChange={(e) => updateField("password", e.target.value)}
            placeholder={config?.password ? "已设置（留空保持不变）" : "输入密码或授权码"}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <div className="text-[11px] text-gray-400 mt-1">QQ邮箱填写授权码，Gmail 填写应用专用密码</div>
        </div>

        <div className="py-3">
          <label className="block text-[13px] text-gray-800 font-medium mb-1.5">发件人名称</label>
          <input
            type="text"
            value={form.from_name ?? ""}
            onChange={(e) => updateField("from_name", e.target.value)}
            placeholder="ToAIAPI"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="py-3">
          <label className="block text-[13px] text-gray-800 font-medium mb-1.5">发件人邮箱</label>
          <input
            type="email"
            value={form.from_address ?? ""}
            onChange={(e) => updateField("from_address", e.target.value)}
            placeholder="noreply@example.com"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* 测试区域 */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
        <div className="text-[13px] font-medium text-gray-800 mb-3">邮件测试</div>
        <div className="flex items-center gap-3 mb-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="输入测试邮箱地址"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <button
            type="button"
            onClick={handleSendTest}
            disabled={isSending || !testEmail.trim()}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-[13px] rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {isSending ? "发送中..." : "发送测试邮件"}
          </button>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-[13px] rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {isTesting ? "测试中..." : "测试连接"}
          </button>
        </div>

        {/* 测试结果 */}
        {testResult && (
          <div
            className={`p-3 rounded-lg text-[13px] ${
              testResult.success
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {testResult.success ? "✅ " : "❌ "}{testResult.message}
          </div>
        )}
      </div>

      {/* 底部状态栏 */}
      <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {successMsg && <span className="text-[12px] text-success">{successMsg}</span>}
          {error && <span className="text-[12px] text-red-500">{error}</span>}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-primary text-white text-[13px] rounded-lg hover:bg-primary-600 disabled:opacity-50"
        >
          {isSaving ? "保存中..." : "保存 SMTP 配置"}
        </button>
      </div>
    </div>
  );
}

/* ============== 主页面 ============== */
export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = React.useState("basic");
  const [formValues, setFormValues] = React.useState<Record<string, string>>({});
  const [originalValues, setOriginalValues] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // 加载所有设置
  React.useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getSystemSettings();
        const values: Record<string, string> = {};
        for (const settings of Object.values(data)) {
          for (const s of settings) {
            values[s.key] = s.value ?? "";
          }
        }
        setFormValues(values);
        setOriginalValues({ ...values });
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // 当前分类的字段
  const currentFields = FIELDS[activeCategory] ?? [];

  // 检测是否有修改
  const hasChanges = React.useMemo(() => {
    return currentFields.some((f) => formValues[f.key] !== originalValues[f.key]);
  }, [currentFields, formValues, originalValues]);

  // 更新单个值
  const updateValue = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setSuccessMsg(null);
  };

  // 保存当前分类
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const settings = currentFields.map((f) => ({
        key: f.key,
        value: formValues[f.key] ?? "",
      }));
      await updateSystemSettings(activeCategory, settings);
      setOriginalValues((prev) => {
        const updated = { ...prev };
        for (const f of currentFields) {
          updated[f.key] = formValues[f.key] ?? "";
        }
        return updated;
      });
      setSuccessMsg("保存成功");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setIsSaving(false);
    }
  };

  const isEmailCategory = activeCategory === "email";

  return (
    <AdminShell title="系统设置">
      <div className="flex gap-6 min-h-[calc(100vh-180px)]">
        {/* 左侧 Tab 导航 */}
        <div className="w-[180px] flex-shrink-0">
          <div className="bg-white rounded-lg border border-gray-100 sticky top-0">
            <nav className="py-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`w-full text-left px-4 py-2.5 text-[13px] flex items-center gap-2 transition ${
                    activeCategory === cat.key
                      ? "bg-primary-50 text-primary font-medium border-r-2 border-primary"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-[14px]">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 右侧表单 */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="bg-white rounded-lg border border-gray-100 p-8 text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">加载中...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-100">
              {/* 表单头部 */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-bold text-gray-900">
                    {CATEGORIES.find((c) => c.key === activeCategory)?.icon}{" "}
                    {CATEGORIES.find((c) => c.key === activeCategory)?.label}
                  </h2>
                  <p className="text-[12px] text-gray-400 mt-0.5">
                    {isEmailCategory
                      ? "SMTP 邮件服务器配置"
                      : `共 ${currentFields.length} 项设置`}
                  </p>
                </div>
                {!isEmailCategory && (
                  <div className="flex items-center gap-3">
                    {successMsg && (
                      <span className="text-[12px] text-success">{successMsg}</span>
                    )}
                    {error && (
                      <span className="text-[12px] text-red-500">{error}</span>
                    )}
                    <button
                      onClick={handleSave}
                      disabled={!hasChanges || isSaving}
                      className="px-4 py-2 bg-primary text-white text-[13px] rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? "保存中..." : "保存"}
                    </button>
                  </div>
                )}
              </div>

              {/* 表单内容 */}
              {isEmailCategory ? (
                <SmtpConfigForm />
              ) : (
                <div className="px-6 py-2 divide-y divide-gray-50">
                  {currentFields.map((field) => (
                    <SettingField
                      key={field.key}
                      field={field}
                      value={formValues[field.key] ?? ""}
                      onChange={(val) => updateValue(field.key, val)}
                    />
                  ))}
                  {currentFields.length === 0 && (
                    <div className="py-8 text-center text-sm text-gray-400">
                      暂无设置项
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
