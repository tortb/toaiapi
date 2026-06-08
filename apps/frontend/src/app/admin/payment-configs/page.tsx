"use client";

import { useEffect, useState } from "react";
import { Pencil, RefreshCw, Eye, EyeOff } from "lucide-react";
import { getPaymentConfigs, updatePaymentConfig, togglePaymentConfig, type PaymentConfigData, type UpdatePaymentConfigPayload } from "@/lib/admin-api";
import { formatTableDate } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { notifyError } from "@/lib/feedback/events";
import { useErrorToast } from "@/lib/feedback/use-error-toast";

export default function AdminPaymentConfigsPage() {
  const [items, setItems] = useState<PaymentConfigData[]>([]);
  const [, setError] = useErrorToast();
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<PaymentConfigData | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Set<string>>(new Set());

  function load() {
    setLoading(true);
    setError("");
    getPaymentConfigs().then(setItems).catch((err) => setError(err instanceof Error ? err.message : "加载失败")).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function openEdit(item: PaymentConfigData) {
    setEditItem(item);
    setForm({
      display_name: item.display_name,
      merchant_id: item.merchant_id ?? "",
      merchant_key: item.merchant_key ?? "",
      merchant_secret: item.merchant_secret ?? "",
      api_endpoint: item.api_endpoint ?? "",
      notify_url: item.notify_url ?? "",
      return_url: item.return_url ?? "",
    });
    setError("");
  }

  async function handleSave() {
    if (!editItem) return;
    setSaving(true);
    setError("");
    try {
      const payload: UpdatePaymentConfigPayload = {};
      if (form.display_name !== editItem.display_name) payload.display_name = form.display_name;
      if (form.merchant_id !== (editItem.merchant_id ?? "")) payload.merchant_id = form.merchant_id || undefined;
      if (form.merchant_key !== (editItem.merchant_key ?? "")) payload.merchant_key = form.merchant_key || undefined;
      if (form.merchant_secret !== (editItem.merchant_secret ?? "")) payload.merchant_secret = form.merchant_secret || undefined;
      if (form.api_endpoint !== (editItem.api_endpoint ?? "")) payload.api_endpoint = form.api_endpoint || undefined;
      if (form.notify_url !== (editItem.notify_url ?? "")) payload.notify_url = form.notify_url || undefined;
      if (form.return_url !== (editItem.return_url ?? "")) payload.return_url = form.return_url || undefined;
      await updatePaymentConfig(editItem.name, payload);
      setEditItem(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(item: PaymentConfigData) {
    try {
      await togglePaymentConfig(item.name);
      load();
    } catch (err) {
      notifyError(err, "操作失败");
    }
  }

  function toggleSecret(key: string) {
    setShowSecrets((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  function secretDisplay(value: string | null, key: string) {
    if (!value) return "-";
    if (showSecrets.has(key)) return <span className="font-mono text-xs break-all">{value}</span>;
    return <span className="font-mono text-xs">{value.slice(0, 4)}****{value.slice(-4)}</span>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">支付配置</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">管理支付通道配置，点击编辑修改。敏感字段加密存储。</p>
        </div>
        <button onClick={load} className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 text-sm text-[var(--foreground)] hover:bg-[var(--surface-soft)]">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />刷新
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-lg border border-[var(--line)] bg-white p-12 text-center text-sm text-[var(--text-secondary)]">加载中...</div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-[var(--line)] bg-white p-12 text-center text-sm text-[var(--text-secondary)]">暂无支付配置</div>
        ) : (
          items.map((item) => (
            <div key={item.name} className="rounded-lg border border-[var(--line)] bg-white overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-[var(--surface-soft)] border-b border-[var(--line)]">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-[var(--foreground)]">{item.display_name}</span>
                  <span className="font-mono text-xs text-[var(--text-muted)]">{item.name}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.is_enabled ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {item.is_enabled ? "已启用" : "已停用"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleToggle(item)} className="rounded px-3 py-1.5 text-xs font-medium border border-[var(--line)] hover:bg-[var(--surface-soft)] transition-colors">
                    {item.is_enabled ? "停用" : "启用"}
                  </button>
                  <button onClick={() => openEdit(item)} className="inline-flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 border border-primary/20 transition-colors">
                    <Pencil className="h-3 w-3" />编辑
                  </button>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 text-sm">
                  <Field label="商户 ID" value={item.merchant_id || "-"} />
                  <Field label="商户密钥" value={secretDisplay(item.merchant_key, `key-${item.name}`)} extra={<button onClick={() => toggleSecret(`key-${item.name}`)} className="text-xs text-primary ml-1">{showSecrets.has(`key-${item.name}`) ? "隐藏" : "显示"}</button>} />
                  <Field label="商户私钥" value={secretDisplay(item.merchant_secret, `secret-${item.name}`)} extra={<button onClick={() => toggleSecret(`secret-${item.name}`)} className="text-xs text-primary ml-1">{showSecrets.has(`secret-${item.name}`) ? "隐藏" : "显示"}</button>} />
                  <Field label="API 网关" value={item.api_endpoint || "-"} />
                  <Field label="异步通知" value={item.notify_url || "-"} />
                  <Field label="同步跳转" value={item.return_url || "-"} />
                  <Field label="更新时间" value={formatTableDate(item.updated_at)} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 编辑弹窗 */}
      <Modal open={editItem !== null} onClose={() => setEditItem(null)} title={`编辑支付配置 - ${editItem?.display_name ?? ""}`} width="600px">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <p className="text-xs text-[var(--text-muted)]">留空的字段将保持原值不变。敏感字段加密存储。</p>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">显示名称</label>
            <input value={form.display_name ?? ""} onChange={(e) => setForm({ ...form, display_name: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">商户 ID</label>
            <input value={form.merchant_id ?? ""} onChange={(e) => setForm({ ...form, merchant_id: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">商户密钥（安全字段）</label>
            <input value={form.merchant_key ?? ""} onChange={(e) => setForm({ ...form, merchant_key: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="留空则保持原值" type="password" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">商户私钥（安全字段）</label>
            <textarea value={form.merchant_secret ?? ""} onChange={(e) => setForm({ ...form, merchant_secret: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)] min-h-[60px]" placeholder="留空则保持原值" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">API 网关地址</label>
            <input value={form.api_endpoint ?? ""} onChange={(e) => setForm({ ...form, api_endpoint: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="https://api.example.com/gateway" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">异步通知地址</label>
            <input value={form.notify_url ?? ""} onChange={(e) => setForm({ ...form, notify_url: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="https://your-domain.com/api/payment/notify" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">同步跳转地址</label>
            <input value={form.return_url ?? ""} onChange={(e) => setForm({ ...form, return_url: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="https://your-domain.com/payment/success" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--line)]">
            <button onClick={() => setEditItem(null)} className="rounded-md border border-[var(--line)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-soft)]">取消</button>
            <button onClick={handleSave} disabled={saving} className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent)]/90 disabled:opacity-50">
              {saving ? "保存中..." : "保存配置"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Field({ label, value, extra }: { label: string; value: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-[var(--text-muted)] mb-0.5">{label}</div>
      <div className="font-medium text-[var(--foreground)] break-all flex items-center">
        {typeof value === "string" ? <span className="truncate">{value}</span> : value}
        {extra}
      </div>
    </div>
  );
}
