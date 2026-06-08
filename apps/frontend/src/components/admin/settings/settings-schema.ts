export type SettingFieldType = "text" | "number" | "boolean" | "select" | "textarea" | "password" | "html";

export interface SettingCategory {
  key: string;
  route: string;
  label: string;
  description: string;
}

export interface SettingFieldDef {
  key: string;
  label: string;
  type: SettingFieldType;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  suffix?: string;
  tip?: string;
}

export const SETTINGS_CATEGORIES: SettingCategory[] = [
  { key: "basic", route: "basic", label: "基础设置", description: "站点身份、备案、语言与联系信息" },
  { key: "website", route: "website", label: "网站设置", description: "公告、维护模式、SEO 与页脚内容" },
  { key: "user", route: "user", label: "用户设置", description: "账号能力、API Key 与组织功能开关" },
  { key: "captcha", route: "captcha", label: "验证码配置", description: "行为验证码、邮箱验证码与防刷策略" },
  { key: "register", route: "register", label: "注册设置", description: "注册验证、邀请码、默认额度与白名单" },
  { key: "email", route: "email", label: "邮件设置", description: "SMTP 服务、发件身份与测试邮件" },
  { key: "rate_limit", route: "rate-limit", label: "风控设置", description: "请求频率、并发和 Token 限制" },
  { key: "security", route: "security", label: "安全设置", description: "登录锁定、密码策略、Session 和 IP 策略" },
  { key: "api", route: "api", label: "API 设置", description: "接口前缀、超时、缓存与流式响应" },
  { key: "notification", route: "notification", label: "通知设置", description: "邮件、Webhook 与系统事件通知" },
  { key: "storage", route: "storage", label: "存储设置", description: "上传开关、文件大小和文件类型" },
];

export const SETTINGS_FIELDS: Record<string, SettingFieldDef[]> = {
  basic: [
    { key: "site_name", label: "站点名称", type: "text", placeholder: "ToAIAPI" },
    { key: "site_subtitle", label: "站点副标题", type: "text", placeholder: "企业级 AI API 网关" },
    { key: "logo_url", label: "Logo URL", type: "text", placeholder: "https://..." },
    { key: "favicon_url", label: "Favicon URL", type: "text", placeholder: "https://..." },
    { key: "copyright", label: "版权信息", type: "text", placeholder: "© 2026 ToAIAPI" },
    { key: "icp_number", label: "ICP备案号", type: "text", placeholder: "京ICP备xxxxxxxx号" },
    { key: "icp_number_show", label: "显示 ICP 备案", type: "boolean", tip: "在页脚显示 ICP 备案号" },
    { key: "psb_number", label: "公安网备案号", type: "text", placeholder: "京公网安备xxxxxxxx号" },
    { key: "psb_number_show", label: "显示公安网备案", type: "boolean", tip: "在页脚显示公安网备案号" },
    { key: "contact_email", label: "联系邮箱", type: "text", placeholder: "contact@example.com" },
    { key: "support_email", label: "技术支持邮箱", type: "text", placeholder: "support@example.com" },
    { key: "default_language", label: "默认语言", type: "select", options: [
      { value: "zh-CN", label: "简体中文" },
      { value: "en-US", label: "English" },
    ] },
    { key: "default_timezone", label: "默认时区", type: "select", options: [
      { value: "Asia/Shanghai", label: "Asia/Shanghai (UTC+8)" },
      { value: "America/New_York", label: "America/New_York (UTC-5)" },
      { value: "Europe/London", label: "Europe/London (UTC+0)" },
    ] },
  ],
  website: [
    { key: "maintenance_mode", label: "维护模式", type: "boolean", tip: "开启后全站显示维护公告，管理员不受影响" },
    { key: "maintenance_notice", label: "维护公告", type: "html", placeholder: "支持 HTML 标签" },
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
    { key: "allow_delete_account", label: "允许用户注销", type: "boolean" },
    { key: "allow_change_email", label: "允许修改邮箱", type: "boolean" },
    { key: "allow_change_username", label: "允许修改用户名", type: "boolean" },
    { key: "allow_create_api_key", label: "允许创建 API Key", type: "boolean" },
    { key: "allow_delete_api_key", label: "允许删除 API Key", type: "boolean" },
    { key: "allow_webhook", label: "允许 Webhook", type: "boolean" },
    { key: "allow_organization", label: "允许组织功能", type: "boolean" },
  ],
  register: [
    { key: "invite_code_required", label: "邀请码注册", type: "boolean" },
    { key: "whitelist_enabled", label: "白名单注册", type: "boolean" },
    { key: "whitelist_emails", label: "白名单邮箱", type: "textarea", placeholder: "每行一个邮箱或用逗号分隔" },
    { key: "default_balance", label: "默认赠送余额", type: "number", suffix: "元" },
    { key: "default_quota", label: "默认赠送额度", type: "number", suffix: "Token" },
    { key: "default_group", label: "默认用户组", type: "text", placeholder: "default" },
    { key: "default_role", label: "默认权限组", type: "select", options: [
      { value: "USER", label: "普通用户" },
      { value: "VIP", label: "VIP" },
    ] },
  ],
  captcha: [
    { key: "captcha_identity", label: "验证码身份标识", type: "text", placeholder: "阿里云验证码 Identity", tip: "阿里云 ESA AI 验证码的身份标识" },
    { key: "captcha_region", label: "验证码区域", type: "select", options: [
      { value: "cn", label: "中国（上海）" },
      { value: "sgp", label: "新加坡" },
    ], tip: "阿里云验证码服务区域" },
    { key: "captcha_mode", label: "验证码模式", type: "select", options: [
      { value: "popup", label: "弹出式" },
      { value: "embed", label: "嵌入式" },
    ] },
    { key: "captcha_register_enabled", label: "注册行为验证码", type: "boolean", tip: "注册提交前需要完成行为验证码" },
    { key: "captcha_register_scene_id", label: "注册验证码 Scene ID", type: "text", placeholder: "阿里云验证码场景 ID" },
    { key: "captcha_send_email_code_enabled", label: "发码前行为验证", type: "boolean", tip: "获取邮箱验证码前先完成人机验证，防止刷邮件" },
    { key: "captcha_send_email_code_scene_id", label: "发码验证码 Scene ID", type: "text", placeholder: "阿里云验证码场景 ID" },
    { key: "captcha_login_enabled", label: "登录行为验证码", type: "boolean", tip: "登录时需要完成行为验证码" },
    { key: "captcha_login_scene_id", label: "登录验证码 Scene ID", type: "text", placeholder: "阿里云验证码场景 ID" },
    { key: "captcha_forgot_password_enabled", label: "找回密码行为验证码", type: "boolean", tip: "找回密码时需要完成行为验证码" },
    { key: "captcha_forgot_password_scene_id", label: "找回密码验证码 Scene ID", type: "text", placeholder: "阿里云验证码场景 ID" },
    { key: "email_code_ttl_seconds", label: "邮箱验证码有效期", type: "number", suffix: "秒", tip: "默认 300 秒，范围 60-1800 秒" },
    { key: "email_code_cooldown_seconds", label: "同邮箱发送冷却", type: "number", suffix: "秒", tip: "默认 60 秒，范围 10-3600 秒" },
    { key: "email_code_email_limit_per_hour", label: "同邮箱每小时上限", type: "number", suffix: "次", tip: "防止邮箱被刷验证码" },
    { key: "email_code_ip_limit_per_hour", label: "同 IP 每小时上限", type: "number", suffix: "次", tip: "防止 IP 被刷验证码" },
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
    { key: "login_lock_duration", label: "锁定时长", type: "number", suffix: "秒" },
    { key: "two_factor_enabled", label: "2FA 双因素认证", type: "boolean" },
    { key: "password_min_length", label: "密码最小长度", type: "number", suffix: "位" },
    { key: "password_require_uppercase", label: "要求大写字母", type: "boolean" },
    { key: "password_require_number", label: "要求数字", type: "boolean" },
    { key: "password_require_special", label: "要求特殊字符", type: "boolean" },
    { key: "session_expire", label: "Session 有效期", type: "number", suffix: "秒" },
    { key: "jwt_access_expire", label: "JWT Access 有效期", type: "number", suffix: "秒" },
    { key: "jwt_refresh_expire", label: "JWT Refresh 有效期", type: "number", suffix: "秒" },
    { key: "ip_whitelist", label: "IP 白名单", type: "textarea", placeholder: "每行一个 IP" },
    { key: "ip_blacklist", label: "IP 黑名单", type: "textarea", placeholder: "每行一个 IP" },
  ],
  api: [
    { key: "api_prefix", label: "API 前缀", type: "text", placeholder: "/api/v1" },
    { key: "api_version", label: "版本号", type: "text", placeholder: "v1" },
    { key: "request_timeout", label: "请求超时", type: "number", suffix: "毫秒" },
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
    { key: "notify_low_balance_threshold", label: "余额预警阈值", type: "number", suffix: "元" },
    { key: "notify_provider_error", label: "供应商异常通知", type: "boolean" },
    { key: "notify_system_error", label: "系统异常通知", type: "boolean" },
    { key: "notify_invoice_request", label: "发票申请通知", type: "boolean" },
  ],
  storage: [
    { key: "upload_enabled", label: "允许上传", type: "boolean" },
    { key: "max_file_size", label: "最大文件大小", type: "number", suffix: "MB" },
    { key: "allowed_file_types", label: "允许文件类型", type: "text", placeholder: "jpg,jpeg,png,gif,pdf" },
  ],
};

export function getCategoryByRoute(route: string) {
  return SETTINGS_CATEGORIES.find((category) => category.route === route);
}

export function getCategoryByKey(key: string) {
  return SETTINGS_CATEGORIES.find((category) => category.key === key);
}
