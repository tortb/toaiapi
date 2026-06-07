"use client";

import * as React from "react";
import {
  getSmtpConfig,
  sendTestEmail,
  testSmtpConnection,
  toggleSmtpConfig,
  updateSmtpConfig,
  type SmtpConfigData,
  type UpdateSmtpConfigPayload,
} from "@/lib/admin-api";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Skeleton, Switch, useToast } from "@/components/ui";

export function SmtpSettingsForm() {
  const toast = useToast();
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
  const [testEmail, setTestEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isTesting, setIsTesting] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<{ success: boolean; message: string } | null>(null);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getSmtpConfig();
        if (!mounted) return;
        setConfig(data);
        if (data) {
          setForm({
            host: data.host ?? "",
            port: data.port,
            secure: data.secure,
            username: data.username ?? "",
            password: "",
            from_name: data.from_name ?? "",
            from_address: data.from_address ?? "",
          });
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "加载 SMTP 配置失败");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const updateField = <K extends keyof UpdateSmtpConfigPayload>(key: K, value: UpdateSmtpConfigPayload[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setResult(null);
  };

  const handleToggle = async () => {
    try {
      const updated = await toggleSmtpConfig();
      setConfig(updated);
      toast.success(updated.is_enabled ? "SMTP 已启用" : "SMTP 已禁用");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "切换失败");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const payload: UpdateSmtpConfigPayload = { ...form };
      if (!payload.password && config?.password) delete payload.password;
      const updated = await updateSmtpConfig(payload);
      setConfig(updated);
      setForm((prev) => ({ ...prev, password: "" }));
      toast.success("SMTP 配置已保存");
    } catch (err) {
      const message = err instanceof Error ? err.message : "保存失败";
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setResult(null);
    try {
      const next = await testSmtpConnection();
      setResult(next);
    } catch (err) {
      setResult({ success: false, message: err instanceof Error ? err.message : "测试失败" });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail.trim()) {
      setResult({ success: false, message: "请输入测试邮箱地址" });
      return;
    }
    setIsSending(true);
    setResult(null);
    try {
      const next = await sendTestEmail(testEmail.trim());
      setResult(next);
    } catch (err) {
      setResult({ success: false, message: err instanceof Error ? err.message : "发送失败" });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) return <Skeleton variant="card" lines={8} />;

  return (
    <Card variant="elevated" className="overflow-hidden">
      <CardHeader className="flex items-center justify-between gap-4 border-b border-neutral-150">
        <div>
          <CardTitle>邮件设置</CardTitle>
          <p className="mt-1 text-sm text-neutral-500">SMTP 服务、发件身份与测试邮件</p>
        </div>
        <Switch checked={config?.is_enabled ?? false} onCheckedChange={handleToggle} />
      </CardHeader>
      <CardContent className="space-y-6">
        {error && <div className="rounded-lg border border-error/20 bg-error-bg px-4 py-3 text-sm text-error">{error}</div>}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Input label="SMTP 服务器地址" value={form.host ?? ""} onChange={(event) => updateField("host", event.target.value)} placeholder="smtp.qq.com" />
          <Input label="端口" type="number" value={form.port ?? 587} onChange={(event) => updateField("port", Number(event.target.value) || 587)} hint="465 为 SSL，587 为 STARTTLS，25 通常不加密。" />
          <Input label="用户名" value={form.username ?? ""} onChange={(event) => updateField("username", event.target.value)} placeholder="your-email@example.com" />
          <Input label="密码 / 授权码" type="password" value={form.password ?? ""} onChange={(event) => updateField("password", event.target.value)} placeholder={config?.password ? "已设置，留空保持不变" : "输入密码或授权码"} />
          <Input label="发件人名称" value={form.from_name ?? ""} onChange={(event) => updateField("from_name", event.target.value)} placeholder="ToAIAPI" />
          <Input label="发件人邮箱" type="email" value={form.from_address ?? ""} onChange={(event) => updateField("from_address", event.target.value)} placeholder="noreply@example.com" />
        </div>
        <div className="rounded-xl border border-neutral-150 bg-neutral-50 p-4">
          <div className="mb-3 text-sm font-medium text-neutral-900">邮件测试</div>
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
            <Input value={testEmail} onChange={(event) => setTestEmail(event.target.value)} placeholder="测试邮箱地址" />
            <Button variant="secondary" onClick={handleSendTest} disabled={!testEmail.trim() || isSending} loading={isSending}>发送测试邮件</Button>
            <Button variant="secondary" onClick={handleTestConnection} loading={isTesting}>测试连接</Button>
          </div>
          {result && (
            <div className={`mt-3 rounded-lg border px-3 py-2 text-sm ${result.success ? "border-success/20 bg-success-bg text-success" : "border-error/20 bg-error-bg text-error"}`}>
              {result.message}
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} loading={isSaving}>保存 SMTP 配置</Button>
        </div>
      </CardContent>
    </Card>
  );
}
