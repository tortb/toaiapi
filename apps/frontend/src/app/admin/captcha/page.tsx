"use client";

import { useEffect, useState } from "react";
import { Save, RefreshCw, Shield } from "lucide-react";
import { getSystemSettingsByCategory, updateSystemSettings } from "@/lib/admin-api";
import { useErrorToast } from "@/lib/feedback/use-error-toast";

const CAPTCHA_FIELDS = [
  { key: "captcha_identity", label: "阿里云验证码 Identity", type: "text", placeholder: "必填：阿里云 ESA AI 验证码的身份标识", tip: "在阿里云 ESA 控制台 → AI 验证码中获取" },
  { key: "captcha_region", label: "服务区域", type: "select", options: [{ value: "cn", label: "中国（上海）" }, { value: "sgp", label: "新加坡" }] },
  { key: "captcha_mode", label: "验证码模式", type: "select", options: [{ value: "popup", label: "弹出式" }, { value: "embed", label: "嵌入式" }] },
] as const;

const SCENE_FIELDS = [
  { key: "captcha_register_enabled", label: "注册行为验证码", type: "boolean", tip: "注册提交前需要完成行为验证码" },
  { key: "captcha_register_scene_id", label: "注册场景 Scene ID", type: "text", placeholder: "阿里云验证码场景 ID" },
  { key: "captcha_send_email_code_enabled", label: "发码前行为验证", type: "boolean", tip: "获取邮箱验证码前先完成人机验证" },
  { key: "captcha_send_email_code_scene_id", label: "发码场景 Scene ID", type: "text", placeholder: "阿里云验证码场景 ID" },
  { key: "captcha_login_enabled", label: "登录行为验证码", type: "boolean" },
  { key: "captcha_login_scene_id", label: "登录场景 Scene ID", type: "text", placeholder: "阿里云验证码场景 ID" },
  { key: "captcha_forgot_password_enabled", label: "找回密码行为验证码", type: "boolean" },
  { key: "captcha_forgot_password_scene_id", label: "找回密码场景 Scene ID", type: "text", placeholder: "阿里云验证码场景 ID" },
] as const;

const EMAIL_CODE_FIELDS = [
  { key: "email_code_ttl_seconds", label: "验证码有效期", type: "number", suffix: "秒", tip: "默认 300 秒（60-1800）" },
  { key: "email_code_cooldown_seconds", label: "发送冷却时间", type: "number", suffix: "秒", tip: "默认 60 秒（10-3600）" },
  { key: "email_code_email_limit_per_hour", label: "同邮箱每小时上限", type: "number", suffix: "次" },
  { key: "email_code_ip_limit_per_hour", label: "同 IP 每小时上限", type: "number", suffix: "次" },
] as const;

type FieldDef = typeof CAPTCHA_FIELDS[number] | typeof SCENE_FIELDS[number] | typeof EMAIL_CODE_FIELDS[number];

export default function AdminCaptchaPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [, setError] = useErrorToast();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    setError("");
    getSystemSettingsByCategory("captcha")
      .then((data) => {
        setValues(Object.fromEntries(data.map((item) => [item.key, item.value ?? ""])));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "加载失败"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await updateSystemSettings(
        "captcha",
        Object.entries(values).map(([key, value]) => ({ key, value: value === "" ? null : value }))
      );
      setMessage("验证码配置已保存");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  function renderField(field: FieldDef) {
    const value = values[field.key] ?? "";
    const baseClass = "w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)] bg-white";

    if (field.type === "boolean") {
      return (
        <select value={value || "false"} onChange={(e) => setValues({ ...values, [field.key]: e.target.value })} className={baseClass}>
          <option value="true">启用</option>
          <option value="false">停用</option>
        </select>
      );
    }
    if (field.type === "select") {
      return (
        <select value={value} onChange={(e) => setValues({ ...values, [field.key]: e.target.value })} className={baseClass}>
          {field.options?.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      );
    }
    if (field.type === "number") {
      return (
        <div className="flex items-center gap-2">
          <input type="number" value={value} onChange={(e) => setValues({ ...values, [field.key]: e.target.value })} className={`${baseClass} flex-1`} />
          {'suffix' in field && field.suffix && <span className="text-xs text-[var(--text-muted)] shrink-0">{field.suffix}</span>}
        </div>
      );
    }
    return <input type="text" value={value} onChange={(e) => setValues({ ...values, [field.key]: e.target.value })} className={baseClass} placeholder={'placeholder' in field ? field.placeholder : ""} />;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">验证码配置</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">配置阿里云 ESA AI 验证码服务。未填写 Identity 和 Scene ID 时，对应场景的验证码不会启用。</p>
        </div>
        <button onClick={load} className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 text-sm text-[var(--foreground)] hover:bg-[var(--surface-soft)]">
          <RefreshCw className="h-4 w-4" />刷新
        </button>
      </div>
      {message && <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>}

      {/* 基础配置 */}
      <section className="bg-white border border-[var(--line)] rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-[var(--accent)]" />
          <h2 className="text-base font-semibold text-[var(--foreground)]">阿里云验证码基础配置</h2>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-4">这些是全局配置项，填写后下方各场景才能正常工作。</p>
        {loading ? (
          <div className="text-sm text-[var(--text-secondary)]">加载中...</div>
        ) : (
          <div className="space-y-4">
            {CAPTCHA_FIELDS.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">{field.label}</label>
                {renderField(field)}
                {'tip' in field && field.tip && <p className="mt-0.5 text-xs text-[var(--text-muted)]">{field.tip}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 场景配置 */}
      <section className="bg-white border border-[var(--line)] rounded-lg p-5">
        <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">场景配置</h2>
        <p className="text-xs text-[var(--text-muted)] mb-4">每个场景可独立启用/停用，并指定对应的 Scene ID。缺少 Scene ID 时即使开关开启也不会启用验证码。</p>
        {loading ? (
          <div className="text-sm text-[var(--text-secondary)]">加载中...</div>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {SCENE_FIELDS.map((field) => (
              <div key={field.key} className="py-3 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    {field.label}
                    {field.key.endsWith("_scene_id") && (
                      <span className="text-xs text-[var(--text-muted)] ml-2">（未填写时自动跳过）</span>
                    )}
                  </label>
                  {renderField(field)}
                  {'tip' in field && field.tip && <p className="mt-0.5 text-xs text-[var(--text-muted)]">{field.tip}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 邮箱验证码策略 */}
      <section className="bg-white border border-[var(--line)] rounded-lg p-5">
        <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">邮箱验证码策略</h2>
        {loading ? (
          <div className="text-sm text-[var(--text-secondary)]">加载中...</div>
        ) : (
          <div className="space-y-4">
            {EMAIL_CODE_FIELDS.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">{field.label}</label>
                {renderField(field)}
                {'tip' in field && field.tip && <p className="mt-0.5 text-xs text-[var(--text-muted)]">{field.tip}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving || loading} className="inline-flex items-center gap-1.5 rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent)]/90 disabled:opacity-60">
          <Save className="h-4 w-4" />{saving ? "保存中..." : "保存配置"}
        </button>
      </div>
    </div>
  );
}
