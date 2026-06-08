"use client";

import { useEffect, useMemo, useState } from "react";
import { getSystemSettingsByCategory, updateSystemSettings, type SystemSettingData } from "@/lib/admin-api";
import { SETTINGS_FIELDS, getCategoryByRoute, type SettingFieldDef } from "./settings-schema";
import { useErrorToast } from "@/lib/feedback/use-error-toast";

export function SettingsCategoryForm({ route }: { route: string }) {
  const category = getCategoryByRoute(route);
  const categoryKey = category?.key || route.replace(/-/g, "_");
  const fields = useMemo<SettingFieldDef[]>(() => SETTINGS_FIELDS[categoryKey] || [], [categoryKey]);
  const [settings, setSettings] = useState<SystemSettingData[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [, setError] = useErrorToast();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getSystemSettingsByCategory(categoryKey).then((data) => {
      if (cancelled) return;
      setSettings(data);
      setValues(Object.fromEntries(data.map((item) => [item.key, item.value ?? ""])));
    }).catch((err) => {
      if (!cancelled) setError(err instanceof Error ? err.message : "加载失败");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [categoryKey]);

  const visibleFields: SettingFieldDef[] = fields.length > 0 ? fields : settings.map((item) => ({ key: item.key, label: item.key, type: "text" }));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await updateSystemSettings(categoryKey, visibleFields.map((field) => {
        const value = values[field.key] ?? "";
        return { key: field.key, value: value === "" ? null : value };
      }));
      setMessage("设置已保存");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-4xl">
      <div><h1 className="text-2xl font-bold text-[var(--foreground)]">{category?.label || categoryKey}</h1><p className="mt-1 text-sm text-[var(--text-secondary)]">{category?.description || "系统设置"}</p></div>
      {message && <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>}
      <section className="bg-white border border-[var(--line)] rounded-lg p-5 space-y-4">
        {loading ? <div className="text-sm text-[var(--text-secondary)]">加载中...</div> : visibleFields.length === 0 ? <div className="text-sm text-[var(--text-secondary)]">该分类暂无设置项</div> : visibleFields.map((field) => <label key={field.key} className="block"><span className="text-sm font-medium text-[var(--foreground)]">{field.label}</span><FieldControl field={field} value={values[field.key] ?? ""} onChange={(value) => setValues((current) => ({ ...current, [field.key]: value }))} />{field.tip && <span className="mt-1 block text-xs text-[var(--text-muted)]">{field.tip}</span>}</label>)}
      </section>
      <button disabled={saving || loading} className="notion-btn-primary px-4 py-2.5 text-sm disabled:opacity-60">{saving ? "保存中..." : "保存设置"}</button>
    </form>
  );
}

function FieldControl({ field, value, onChange }: { field: SettingFieldDef; value: string; onChange: (value: string) => void }) {
  const baseClass = "mt-1 w-full px-3 py-2.5 border border-[var(--line)] rounded-md text-sm outline-none focus:border-[var(--accent)]";
  if (field.type === "boolean") {
    return <select value={value || "false"} onChange={(event) => onChange(event.target.value)} className={`${baseClass} bg-white`}><option value="true">启用</option><option value="false">停用</option></select>;
  }
  if (field.type === "select") {
    return <select value={value} onChange={(event) => onChange(event.target.value)} className={`${baseClass} bg-white`}><option value="">未设置</option>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>;
  }
  if (field.type === "textarea" || field.type === "html") {
    return <textarea value={value} onChange={(event) => onChange(event.target.value)} className={`${baseClass} min-h-24`} placeholder={field.placeholder} />;
  }
  return <input type={field.type === "number" ? "number" : field.type === "password" ? "password" : "text"} value={value} onChange={(event) => onChange(event.target.value)} className={baseClass} placeholder={field.placeholder} />;
}

export default SettingsCategoryForm;
