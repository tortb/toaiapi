"use client";

import { useCallback, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { AdminResourceList, type AdminResourceColumn } from "@/components/admin/AdminResourceList";
import { Modal } from "@/components/ui/modal";
import { getProviders, updateProvider, createProvider, getProviderStatusLabel, type ProviderData, type UpdateProviderPayload, type CreateProviderPayload } from "@/lib/admin-api";
import { formatTableDate } from "@/lib/utils";

export default function AdminProvidersPage() {
  const [editItem, setEditItem] = useState<ProviderData | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ displayName: "", baseUrl: "", name: "" });
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");

  const loadData = useCallback((params: { page: number; pageSize: number; search?: string }) => getProviders(params), []);

  function openEdit(item: ProviderData) {
    setEditItem(item);
    setForm({ displayName: item.displayName, baseUrl: item.baseUrl, name: item.name });
    setError("");
  }

  function openCreate() {
    setShowCreate(true);
    setForm({ displayName: "", baseUrl: "", name: "" });
    setError("");
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      if (editItem) {
        const payload: UpdateProviderPayload = {};
        if (form.displayName !== editItem.displayName) payload.displayName = form.displayName;
        if (form.baseUrl !== editItem.baseUrl) payload.baseUrl = form.baseUrl;
        await updateProvider(editItem.id, payload);
      } else {
        await createProvider(form as CreateProviderPayload);
      }
      setEditItem(null);
      setShowCreate(false);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(item: ProviderData) {
    try {
      await updateProvider(item.id, { isActive: !item.isActive });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : "操作失败");
    }
  }

  async function handleDelete(item: ProviderData) {
    if (!confirm(`确定删除服务商「${item.displayName}」吗？有关联渠道时无法删除。`)) return;
    try {
      await (await import("@/lib/admin-api")).deleteProvider(item.id);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
    }
  }

  const actions = useCallback((item: ProviderData) => (
    <div className="flex items-center justify-end gap-1">
      <button onClick={() => openEdit(item)} className="rounded px-2 py-1 text-xs text-primary hover:bg-primary/10 transition-colors">编辑</button>
      <button onClick={() => handleToggle(item)} className="rounded px-2 py-1 text-xs text-orange-600 hover:bg-orange-50 transition-colors">{item.isActive ? "禁用" : "启用"}</button>
      <button onClick={() => handleDelete(item)} className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 transition-colors">删除</button>
    </div>
  ), []);

  const columns: AdminResourceColumn<ProviderData>[] = [
    { header: "服务商", render: (item) => <div><div className="font-medium">{item.displayName}</div><div className="text-xs text-[var(--text-muted)]">{item.name}</div></div> },
    { header: "Base URL", render: (item) => <span className="font-mono text-xs">{item.baseUrl}</span> },
    { header: "通道数", width: "90px", render: (item) => item.channelCount.toLocaleString("zh-CN") },
    { header: "状态", width: "90px", render: (item) => { const status = getProviderStatusLabel(item.isActive); return <span className={status.color}>{status.label}</span>; } },
    { header: "创建时间", width: "160px", render: (item) => formatTableDate(item.createdAt) },
  ];

  const modalItem = editItem;
  const isOpen = editItem !== null || showCreate;

  return (
    <>
      <AdminResourceList
        key={refreshKey}
        title="服务商"
        description="管理上游 AI 服务商配置"
        searchPlaceholder="搜索服务商"
        loadData={loadData}
        columns={columns}
        actions={actions}
        toolbarExtra={
          <button onClick={openCreate} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[var(--accent)] px-3 text-sm font-medium text-white hover:bg-[var(--accent)]/90">
            <Plus className="h-4 w-4" />新建
          </button>
        }
      />

      <Modal open={isOpen} onClose={() => { setEditItem(null); setShowCreate(false); }} title={editItem ? "编辑服务商" : "新建服务商"}>
        {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <div className="space-y-4">
          {showCreate && (
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">名称</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="deepseek" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">显示名称</label>
            <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="DeepSeek" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">API 基础 URL</label>
            <input value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="https://api.deepseek.com" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setEditItem(null); setShowCreate(false); }} className="rounded-md border border-[var(--line)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-soft)]">取消</button>
            <button onClick={handleSave} disabled={saving || !form.displayName || !form.baseUrl || (showCreate && !form.name)} className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent)]/90 disabled:opacity-50">
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
