"use client";

/**
 * 验证码配置页（Admin）
 *
 * /admin/captcha — 阿里云 ESA AI 验证码配置
 *
 * 阿里云要求每个 URL 对应独立的 Scene ID，
 * 因此每个接口（register/login/forgot-password/send-email-code）
 * 都有独立的 Scene ID 和启用开关。
 * identity/region/mode 为全局共享配置。
 */

import * as React from "react";
import { getSystemSettings, updateSystemSettings } from "@/lib/admin-api";
import { AdminShell } from "@/components/admin/AdminShell";

/* ============== 接口配置定义 ============== */
interface EndpointConfig {
  key: string;
  label: string;
  path: string;
  method: string;
  description: string;
  tip: string;
}

const ENDPOINTS: EndpointConfig[] = [
  {
    key: "register",
    label: "用户注册",
    path: "/api/v1/auth/register",
    method: "POST",
    description: "用户注册新账号时需要验证码验证",
    tip: "在 ESA 控制台新增规则时，「需验签的接口」填写此路径的完整域名 URL",
  },
  {
    key: "login",
    label: "用户登录",
    path: "/api/v1/auth/login",
    method: "POST",
    description: "用户登录时需要验证码验证，防止暴力破解",
    tip: "适用于防暴力破解、撞库攻击",
  },
  {
    key: "forgot_password",
    label: "忘记密码",
    path: "/api/v1/auth/forgot-password",
    method: "POST",
    description: "用户找回密码时需要验证码验证",
    tip: "防止通过忘记密码接口枚举用户邮箱",
  },
  {
    key: "send_email_code",
    label: "发送邮箱验证码",
    path: "/api/v1/auth/send-email-code",
    method: "POST",
    description: "发送邮箱验证码前需要验证",
    tip: "防止恶意大量发送验证码邮件",
  },
];

/* ============== 主页面 ============== */
export default function CaptchaConfigPage() {
  const [formValues, setFormValues] = React.useState<Record<string, string>>({});
  const [originalValues, setOriginalValues] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // 所有需要管理的 key
  const allKeys = React.useMemo(() => {
    const keys = ["captcha_identity", "captcha_region", "captcha_mode"];
    for (const ep of ENDPOINTS) {
      keys.push(`captcha_${ep.key}_enabled`, `captcha_${ep.key}_scene_id`);
    }
    return keys;
  }, []);

  // 加载设置
  React.useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await getSystemSettings();
        const values: Record<string, string> = {};
        for (const settings of Object.values(data)) {
          for (const s of settings) {
            values[s.key] = s.value ?? "";
          }
        }
        const picked: Record<string, string> = {};
        for (const key of allKeys) {
          picked[key] = values[key] ?? "";
        }
        setFormValues(picked);
        setOriginalValues({ ...picked });
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [allKeys]);

  const hasChanges = React.useMemo(() => {
    return allKeys.some((k) => formValues[k] !== originalValues[k]);
  }, [formValues, originalValues, allKeys]);

  const updateValue = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setSuccessMsg(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const settings = allKeys.map((key) => ({
        key,
        value: formValues[key] ?? "",
      }));
      await updateSystemSettings("captcha", settings);
      setOriginalValues({ ...formValues });
      setSuccessMsg("保存成功");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setIsSaving(false);
    }
  };

  // 检查全局配置是否完整
  const identity = formValues.captcha_identity;
  const globalComplete = !!identity;

  return (
    <AdminShell title="验证码配置">
      <div className="max-w-[780px] space-y-6">
        {isLoading ? (
          <div className="bg-white rounded-lg border border-gray-100 p-8 text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">加载中...</p>
          </div>
        ) : (
          <>
            {/* 全局配置 */}
            <div className="bg-white rounded-lg border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-bold text-gray-900">
                    🛡️ 全局配置
                  </h2>
                  <p className="text-[12px] text-gray-400 mt-0.5">
                    身份标、地区、模式 — 所有接口共享
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {successMsg && (
                    <span className="text-[12px] text-green-600">
                      {successMsg}
                    </span>
                  )}
                  {error && (
                    <span className="text-[12px] text-red-500">{error}</span>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    className="px-4 py-2 bg-primary text-white text-[13px] rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "保存中..." : "保存全部"}
                  </button>
                </div>
              </div>
              <div className="px-6 py-2 divide-y divide-gray-50">
                {/* 身份标 */}
                <div className="py-3">
                  <label className="block text-[13px] text-gray-800 font-medium mb-1.5">
                    身份标（Identity）
                  </label>
                  <div className="text-[11px] text-gray-400 mb-1.5">
                    在 ESA 控制台「配置」页面右上角获取，如{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      esa-q2*****cqb
                    </code>
                    。身份标标识您的 ESA 账户身份，是验证码服务的必要凭证。
                  </div>
                  <input
                    type="text"
                    value={formValues.captcha_identity ?? ""}
                    onChange={(e) =>
                      updateValue("captcha_identity", e.target.value)
                    }
                    placeholder="esa-q2*****cqb"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                {/* 服务地区 */}
                <div className="py-3">
                  <label className="block text-[13px] text-gray-800 font-medium mb-1.5">
                    服务地区（Region）
                  </label>
                  <div className="text-[11px] text-gray-400 mb-1.5">
                    客户端行为数据将回传至对应地域中心处理。
                  </div>
                  <select
                    value={formValues.captcha_region ?? "cn"}
                    onChange={(e) =>
                      updateValue("captcha_region", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="cn">中国内地（cn）</option>
                    <option value="sgp">新加坡（sgp）</option>
                  </select>
                </div>

                {/* 验证码模式 */}
                <div className="py-3">
                  <label className="block text-[13px] text-gray-800 font-medium mb-1.5">
                    验证码模式（Mode）
                  </label>
                  <div className="text-[11px] text-gray-400 mb-1.5">
                    弹出式：点击按钮后弹出验证码框。嵌入式：验证码直接嵌入页面。
                  </div>
                  <select
                    value={formValues.captcha_mode ?? "popup"}
                    onChange={(e) =>
                      updateValue("captcha_mode", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="popup">弹出式（popup）</option>
                    <option value="embed">嵌入式（embed）</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 全局配置未完成提示 */}
            {!globalComplete && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-[13px] text-amber-700">
                ⚠️ 请先填写<strong>身份标</strong>，再为各接口配置 Scene ID。
                <br />
                前往{" "}
                <a
                  href="https://esa.console.aliyun.com/captcha/configuration"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  阿里云 ESA 控制台
                </a>{" "}
                获取身份标和场景 ID。
              </div>
            )}

            {/* 各接口独立配置 */}
            {ENDPOINTS.map((ep) => {
              const enabled =
                formValues[`captcha_${ep.key}_enabled`] === "true";
              const sceneId =
                formValues[`captcha_${ep.key}_scene_id`] ?? "";
              const configured = enabled && !!sceneId;

              return (
                <div
                  key={ep.key}
                  className={`bg-white rounded-lg border transition-colors ${
                    configured
                      ? "border-green-200"
                      : enabled
                        ? "border-amber-200"
                        : "border-gray-100"
                  }`}
                >
                  {/* 接口头部 */}
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          configured
                            ? "bg-green-500"
                            : enabled
                              ? "bg-amber-500"
                              : "bg-gray-300"
                        }`}
                      />
                      <div>
                        <h3 className="text-[14px] font-bold text-gray-900">
                          {ep.label}
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          <code className="bg-gray-100 px-1 rounded text-[10px]">
                            {ep.method}
                          </code>{" "}
                          <code className="bg-gray-100 px-1 rounded text-[10px]">
                            {ep.path}
                          </code>
                        </p>
                      </div>
                    </div>
                    {/* 启用开关 */}
                    <button
                      type="button"
                      onClick={() =>
                        updateValue(
                          `captcha_${ep.key}_enabled`,
                          enabled ? "false" : "true"
                        )
                      }
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        enabled ? "bg-primary" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          enabled ? "left-[22px]" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  {/* 接口配置内容 */}
                  <div className="px-6 py-4 space-y-3">
                    <div className="text-[12px] text-gray-500">
                      {ep.description}
                    </div>

                    {/* Scene ID */}
                    <div>
                      <label className="block text-[13px] text-gray-800 font-medium mb-1">
                        场景 ID（SceneId）
                      </label>
                      <div className="text-[11px] text-gray-400 mb-1.5">
                        {ep.tip}
                      </div>
                      <input
                        type="text"
                        value={sceneId}
                        onChange={(e) =>
                          updateValue(
                            `captcha_${ep.key}_scene_id`,
                            e.target.value
                          )
                        }
                        placeholder={
                          enabled
                            ? "在 ESA 控制台为此接口创建规则后填入场景 ID"
                            : "请先启用此接口的验证码"
                        }
                        disabled={!enabled}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    </div>

                    {/* 状态提示 */}
                    {enabled && sceneId && (
                      <div className="text-[11px] text-green-600 bg-green-50 rounded px-2 py-1">
                        ✅ 已配置，Scene ID:{" "}
                        <code>{sceneId}</code>
                      </div>
                    )}
                    {enabled && !sceneId && (
                      <div className="text-[11px] text-amber-600 bg-amber-50 rounded px-2 py-1">
                        ⚠️ 已启用但未配置 Scene ID，验证码不会生效
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 帮助信息 */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
              <h3 className="text-[13px] font-bold text-gray-800 mb-3">
                📖 接入步骤
              </h3>
              <ol className="text-[12px] text-gray-600 space-y-2 leading-relaxed list-decimal pl-4">
                <li>
                  登录{" "}
                  <a
                    href="https://esa.console.aliyun.com/captcha/configuration"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    ESA 控制台
                  </a>
                  ，获取<strong>身份标</strong>（页面右上角）。
                </li>
                <li>
                  在上方「全局配置」中填入身份标，选择地区和模式。
                </li>
                <li>
                  为每个需要防护的接口在 ESA 控制台<strong>新增规则</strong>：
                  <ul className="list-disc pl-4 mt-1 space-y-0.5">
                    <li>
                      「需验签的接口」填写{" "}
                      <code className="bg-gray-100 px-1 rounded">
                        https://你的域名/api/v1/auth/xxx
                      </code>
                    </li>
                    <li>「需验签的请求方法」选择 POST</li>
                    <li>选择验证码类型（一点即过、滑块等）</li>
                  </ul>
                </li>
                <li>
                  创建规则后获取<strong>场景 ID</strong>，填入下方对应接口的配置中。
                </li>
                <li>
                  开启对应接口的开关，点击「保存全部」。
                </li>
              </ol>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <a
                  href="https://help.aliyun.com/zh/edge-security-acceleration/esa/user-guide/get-started-with-ai-captchas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-primary hover:underline"
                >
                  📄 阿里云 ESA AI 验证码官方文档 →
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
