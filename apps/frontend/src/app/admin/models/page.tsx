"use client";

import { useCallback, useState } from "react";
import { DollarSign, Plus } from "lucide-react";
import { AdminResourceList, type AdminResourceColumn } from "@/components/admin/AdminResourceList";
import { Modal } from "@/components/ui/modal";
import { getModelStatusLabel, getModels, updateModel, deleteModel, upsertModelPricing, getProviders, type ModelData, type UpdateModelPayload, type ProviderData, type UpsertPricingPayload } from "@/lib/admin-api";
import { formatTableDate } from "@/lib/utils";

function price(value: number | null | undefined) {
  return value == null ? "-" : "¥" + value;
}

export default function AdminModelsPage() {
  const [editItem, setEditItem] = useState<ModelData | null>(null);
  const [pricingItem, setPricingItem] = useState<ModelData | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [form, setForm] = useState({ displayName: "", maxContext: 4096, supportsStreaming: true, supportsTools: false, supportsVision: false, name: "", providerId: "" });
  const [pricingForm, setPricingForm] = useState({ inputPrice: 0, outputPrice: 0, cachedPrice: 0, reasoningPrice: 0, multiplier: 1 });
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");

  const loadData = useCallback((params: { page: number; pageSize: number; search?: string }) => getModels(params), []);

  async function openEdit(item: ModelData) {
    setEditItem(item);
    setForm({ displayName: item.displayName, maxContext: item.maxContext, supportsStreaming: item.supportsStreaming, supportsTools: item.supportsTools, supportsVision: item.supportsVision, name: item.name, providerId: item.providerId });
    setError("");
  }

  async function openCreate() {
    setShowCreate(true);
    setForm({ displayName: "", maxContext: 4096, supportsStreaming: true, supportsTools: false, supportsVision: false, name: "", providerId: "" });
    setError("");
    try {
      const res = await getProviders({ page: 1, pageSize: 100 });
      setProviders(res.items);
    } catch { /* ignore */ }
  }

  function openPricing(item: ModelData) {
    setPricingItem(item);
    setPricingForm({
      inputPrice: item.pricing?.inputPrice ?? 0,
      outputPrice: item.pricing?.outputPrice ?? 0,
      cachedPrice: item.pricing?.cachedPrice ?? 0,
      reasoningPrice: item.pricing?.reasoningPrice ?? 0,
      multiplier: item.pricing?.multiplier ?? 1,
    });
    setError("");
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      if (editItem) {
        const payload: UpdateModelPayload = {};
        if (form.displayName !== editItem.displayName) payload.displayName = form.displayName;
        if (form.maxContext !== editItem.maxContext) payload.maxContext = form.maxContext;
        if (form.supportsStreaming !== editItem.supportsStreaming) payload.supportsStreaming = form.supportsStreaming;
        if (form.supportsTools !== editItem.supportsTools) payload.supportsTools = form.supportsTools;
        if (form.supportsVision !== editItem.supportsVision) payload.supportsVision = form.supportsVision;
        await updateModel(editItem.id, payload);
      } else {
        await (await import("@/lib/admin-api")).createModel({
          name: form.name,
          displayName: form.displayName,
          providerId: form.providerId,
          maxContext: form.maxContext,
          supportsStreaming: form.supportsStreaming,
          supportsTools: form.supportsTools,
          supportsVision: form.supportsVision,
        });
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

  async function handleSavePricing() {
    if (!pricingItem) return;
    setSaving(true);
    setError("");
    try {
      const payload: UpsertPricingPayload = {
        inputPrice: pricingForm.inputPrice,
        outputPrice: pricingForm.outputPrice,
        cachedPrice: pricingForm.cachedPrice || undefined,
        reasoningPrice: pricingForm.reasoningPrice || undefined,
        multiplier: pricingForm.multiplier,
      };
      await upsertModelPricing(pricingItem.id, payload);
      setPricingItem(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(item: ModelData) {
    try {
      await updateModel(item.id, { isActive: !item.isActive });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : "操作失败");
    }
  }

  async function handleDelete(item: ModelData) {
    if (!confirm(`确定删除模型「${item.displayName}」吗？`)) return;
    try {
      await deleteModel(item.id);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
    }
  }

  const actions = useCallback((item: ModelData) => (
    <div className="flex items-center justify-end gap-1 flex-wrap">
      <button onClick={() => openEdit(item)} className="rounded px-2 py-1 text-xs text-primary hover:bg-primary/10 transition-colors">编辑</button>
      <button onClick={() => openPricing(item)} className="rounded px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50 transition-colors">定价</button>
      <button onClick={() => handleToggle(item)} className="rounded px-2 py-1 text-xs text-orange-600 hover:bg-orange-50 transition-colors">{item.isActive ? "下架" : "上架"}</button>
      <button onClick={() => handleDelete(item)} className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 transition-colors">删除</button>
    </div>
  ), []);

  const columns: AdminResourceColumn<ModelData>[] = [
    { header: "模型", render: (item) => <div><div className="font-medium">{item.displayName}</div><div className="text-xs text-[var(--text-muted)]">{item.name}</div></div> },
    { header: "Provider", width: "160px", render: (item) => item.providerId },
    { header: "上下文", width: "100px", render: (item) => item.maxContext.toLocaleString("zh-CN") },
    { header: "能力", render: (item) => [item.supportsStreaming ? "流式" : null, item.supportsTools ? "工具" : null, item.supportsVision ? "视觉" : null].filter(Boolean).join(" / ") || "-" },
    { header: "价格", render: (item) => item.pricing ? `输入 ${price(item.pricing.inputPrice)} / 输出 ${price(item.pricing.outputPrice)}` : "未配置" },
    { header: "状态", width: "90px", render: (item) => { const status = getModelStatusLabel(item.isActive); return <span className={status.color}>{status.label}</span>; } },
    { header: "创建时间", width: "160px", render: (item) => formatTableDate(item.createdAt) },
  ];

  return (
    <>
      <AdminResourceList
        key={refreshKey}
        title="模型管理"
        description="管理模型能力、上下文和计费价格"
        searchPlaceholder="搜索模型"
        loadData={loadData}
        columns={columns}
        actions={actions}
        toolbarExtra={
          <button onClick={openCreate} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[var(--accent)] px-3 text-sm font-medium text-white hover:bg-[var(--accent)]/90">
            <Plus className="h-4 w-4" />新建
          </button>
        }
      />

      {/* 编辑模型 */}
      <Modal open={editItem !== null || showCreate} onClose={() => { setEditItem(null); setShowCreate(false); }} title={editItem ? "编辑模型" : "新建模型"}>
        {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <div className="space-y-4">
          {showCreate && (
            <>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">模型名称 (model name)</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="deepseek-chat" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">所属 Provider</label>
                <select value={form.providerId} onChange={(e) => setForm({ ...form, providerId: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]">
                  <option value="">请选择</option>
                  {providers.map((p) => <option key={p.id} value={p.id}>{p.displayName} ({p.name})</option>)}
                </select>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">显示名称</label>
            <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="DeepSeek Chat" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">最大上下文长度</label>
            <input type="number" min={1} value={form.maxContext} onChange={(e) => setForm({ ...form, maxContext: Number(e.target.value) })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">能力</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.supportsStreaming} onChange={(e) => setForm({ ...form, supportsStreaming: e.target.checked })} className="rounded border-[var(--line)]" /><span className="text-sm">流式输出</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.supportsTools} onChange={(e) => setForm({ ...form, supportsTools: e.target.checked })} className="rounded border-[var(--line)]" /><span className="text-sm">工具调用</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.supportsVision} onChange={(e) => setForm({ ...form, supportsVision: e.target.checked })} className="rounded border-[var(--line)]" /><span className="text-sm">视觉识别</span></label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setEditItem(null); setShowCreate(false); }} className="rounded-md border border-[var(--line)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-soft)]">取消</button>
            <button onClick={handleSave} disabled={saving || !form.displayName || (showCreate && (!form.name || !form.providerId))} className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent)]/90 disabled:opacity-50">
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </div>
      </Modal>

      {/* 定价管理 */}
      <Modal open={pricingItem !== null} onClose={() => setPricingItem(null)} title={`定价设置 - ${pricingItem?.displayName ?? ""}`}>
        {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <div className="space-y-4">
          <p className="text-xs text-[var(--text-muted)]">价格单位：元/百万 token</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">输入价格</label>
              <input type="number" step="0.01" min={0} value={pricingForm.inputPrice} onChange={(e) => setPricingForm({ ...pricingForm, inputPrice: Number(e.target.value) })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">输出价格</label>
              <input type="number" step="0.01" min={0} value={pricingForm.outputPrice} onChange={(e) => setPricingForm({ ...pricingForm, outputPrice: Number(e.target.value) })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">缓存输入价格</label>
              <input type="number" step="0.01" min={0} value={pricingForm.cachedPrice} onChange={(e) => setPricingForm({ ...pricingForm, cachedPrice: Number(e.target.value) })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">推理价格</label>
              <input type="number" step="0.01" min={0} value={pricingForm.reasoningPrice} onChange={(e) => setPricingForm({ ...pricingForm, reasoningPrice: Number(e.target.value) })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">倍率</label>
            <input type="number" step="0.1" min={0} value={pricingForm.multiplier} onChange={(e) => setPricingForm({ ...pricingForm, multiplier: Number(e.target.value) })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setPricingItem(null)} className="rounded-md border border-[var(--line)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-soft)]">取消</button>
            <button onClick={handleSavePricing} disabled={saving} className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent)]/90 disabled:opacity-50">
              {saving ? "保存中..." : "保存定价"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
