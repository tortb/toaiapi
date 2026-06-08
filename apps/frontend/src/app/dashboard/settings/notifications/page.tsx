"use client";

import { useEffect, useState } from "react";
import { getNotificationConfig, sendTestNotification, updateNotificationConfig, type NotificationConfig } from "@/lib/user-api";

export default function NotificationsPage() {
  const [config, setConfig] = useState<NotificationConfig | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getNotificationConfig().then(setConfig).catch((err) => setError(err instanceof Error ? err.message : "加载失败"));
  }, []);

  async function save() {
    if (!config) return;
    setError("");
    setMessage("");
    try {
      setConfig(await updateNotificationConfig(config));
      setMessage("已保存");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    }
  }

  async function test(channel: string) {
    setError("");
    setMessage("");
    try {
      await sendTestNotification(channel);
      setMessage("测试通知已发送");
    } catch (err) {
      setError(err instanceof Error ? err.message : "发送失败");
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div><h1 className="page-title">通知设置</h1><p className="page-subtitle">配置低余额提醒、Webhook 和 WxPusher</p></div>
      {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {message && <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>}
      {!config ? <div className="text-sm text-[var(--text-secondary)]">加载中...</div> : (
        <section className="bg-white border border-[var(--line)] rounded-lg p-5 space-y-4 max-w-2xl">
          <label className="flex items-center gap-3"><input type="checkbox" checked={config.channels.email.enabled} onChange={(event) => setConfig({ ...config, channels: { ...config.channels, email: { enabled: event.target.checked } } })} />邮件通知</label>
          <label className="block"><span className="text-sm text-[var(--text-secondary)]">低余额阈值（分）</span><input type="number" value={config.lowBalanceThreshold} onChange={(event) => setConfig({ ...config, lowBalanceThreshold: Number(event.target.value) })} className="mt-1 w-full px-3 py-2.5 border border-[var(--line)] rounded-md" /></label>
          <label className="block"><span className="text-sm text-[var(--text-secondary)]">Webhook URL</span><input value={config.channels.webhook.url || ""} onChange={(event) => setConfig({ ...config, channels: { ...config.channels, webhook: { ...config.channels.webhook, enabled: Boolean(event.target.value), url: event.target.value } } })} className="mt-1 w-full px-3 py-2.5 border border-[var(--line)] rounded-md" /></label>
          <label className="block"><span className="text-sm text-[var(--text-secondary)]">WxPusher UID</span><input value={config.channels.wxpusher.uid || ""} onChange={(event) => setConfig({ ...config, channels: { ...config.channels, wxpusher: { ...config.channels.wxpusher, enabled: Boolean(event.target.value), uid: event.target.value } } })} className="mt-1 w-full px-3 py-2.5 border border-[var(--line)] rounded-md" /></label>
          <div className="flex gap-2"><button onClick={save} className="notion-btn-primary px-4 py-2.5 text-sm">保存</button><button onClick={() => test("email")} className="notion-btn-secondary px-4 py-2.5 text-sm">测试邮件</button><button onClick={() => test("webhook")} className="notion-btn-secondary px-4 py-2.5 text-sm">测试 Webhook</button></div>
        </section>
      )}
    </div>
  );
}
