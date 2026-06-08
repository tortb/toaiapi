"use client";

import { useCallback, useState } from "react";
import { Plus } from "lucide-react";
import { AdminResourceList, type AdminResourceColumn } from "@/components/admin/AdminResourceList";
import { Modal } from "@/components/ui/modal";
import { getBonusTypeLabel, getPromotions, updatePromotion, createPromotion, togglePromotion, deletePromotion, type PromotionData, type UpdatePromotionPayload, type CreatePromotionPayload } from "@/lib/admin-api";
import { formatTableDate, formatYuan } from "@/lib/utils";

export default function AdminPromotionsPage() {
  const [editItem, setEditItem] = useState<PromotionData | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", minAmount: 10000, bonusType: "FIXED" as "FIXED" | "PERCENTAGE",
    bonusValue: 1000, maxBonus: 0, startAt: "", endAt: "",
  });
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");

  const loadData = useCallback((params: { page: number; pageSize: number; search?: string }) => getPromotions({ page: params.page, pageSize: params.pageSize }), []);

  function openEdit(item: PromotionData) {
    setEditItem(item);
    setForm({
      name: item.name, description: item.description ?? "",
      minAmount: item.minAmount, bonusType: item.bonusType,
      bonusValue: item.bonusValue, maxBonus: item.maxBonus ?? 0,
      startAt: item.startAt ? new Date(item.startAt).toISOString().slice(0, 16) : "",
      endAt: item.endAt ? new Date(item.endAt).toISOString().slice(0, 16) : "",
    });
    setError("");
  }

  function openCreate() {
    setShowCreate(true);
    const now = new Date();
    setForm({
      name: "", description: "", minAmount: 10000, bonusType: "FIXED",
      bonusValue: 1000, maxBonus: 0,
      startAt: now.toISOString().slice(0, 16),
      endAt: "",
    });
    setError("");
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      if (editItem) {
        const payload: UpdatePromotionPayload = {};
        if (form.name !== editItem.name) payload.name = form.name;
        if (form.description !== (editItem.description ?? "")) payload.description = form.description || undefined;
        if (form.minAmount !== editItem.minAmount) payload.min_amount = form.minAmount;
        if (form.bonusType !== editItem.bonusType) payload.bonus_type = form.bonusType;
        if (form.bonusValue !== editItem.bonusValue) payload.bonus_value = form.bonusValue;
        if (form.maxBonus !== (editItem.maxBonus ?? 0)) payload.max_bonus = form.maxBonus || undefined;
        if (form.startAt !== (editItem.startAt ? new Date(editItem.startAt).toISOString().slice(0, 16) : "")) payload.start_at = new Date(form.startAt).toISOString();
        if (form.endAt !== (editItem.endAt ? new Date(editItem.endAt).toISOString().slice(0, 16) : "")) payload.end_at = form.endAt ? new Date(form.endAt).toISOString() : undefined;
        await updatePromotion(editItem.id, payload);
      } else {
        const payload: CreatePromotionPayload = {
          name: form.name,
          description: form.description || undefined,
          min_amount: form.minAmount,
          bonus_type: form.bonusType,
          bonus_value: form.bonusValue,
          max_bonus: form.maxBonus || undefined,
          start_at: new Date(form.startAt).toISOString(),
          end_at: form.endAt ? new Date(form.endAt).toISOString() : undefined,
        };
        await createPromotion(payload);
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

  async function handleToggle(item: PromotionData) {
    try { await togglePromotion(item.id); setRefreshKey((k) => k + 1); } catch (err) { alert(err instanceof Error ? err.message : "操作失败"); }
  }

  async function handleDelete(item: PromotionData) {
    if (!confirm(`确定删除活动「${item.name}」吗？`)) return;
    try { await deletePromotion(item.id); setRefreshKey((k) => k + 1); } catch (err) { alert(err instanceof Error ? err.message : "删除失败"); }
  }

  const actions = useCallback((item: PromotionData) => (
    <div className="flex items-center justify-end gap-1">
      <button onClick={() => openEdit(item)} className="rounded px-2 py-1 text-xs text-primary hover:bg-primary/10 transition-colors">编辑</button>
      <button onClick={() => handleToggle(item)} className="rounded px-2 py-1 text-xs text-orange-600 hover:bg-orange-50 transition-colors">{item.isActive ? "停用" : "启用"}</button>
      <button onClick={() => handleDelete(item)} className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 transition-colors">删除</button>
    </div>
  ), []);

  const columns: AdminResourceColumn<PromotionData>[] = [
    { header: "活动", render: (item) => <div><div className="font-medium">{item.name}</div><div className="text-xs text-[var(--text-muted)]">{item.description || "-"}</div></div> },
    { header: "门槛", width: "110px", render: (item) => formatYuan(item.minAmount) },
    { header: "赠送", render: (item) => `${getBonusTypeLabel(item.bonusType)} · ${item.bonusType === "FIXED" ? formatYuan(item.bonusValue) : item.bonusValue + "%"}` },
    { header: "封顶", width: "110px", render: (item) => item.maxBonus == null ? "无" : formatYuan(item.maxBonus) },
    { header: "状态", width: "90px", render: (item) => <span className={item.isActive ? "text-green-600" : "text-gray-400"}>{item.isActive ? "启用" : "停用"}</span> },
    { header: "开始时间", width: "160px", render: (item) => formatTableDate(item.startAt) },
  ];

  return (
    <>
      <AdminResourceList
        key={refreshKey}
        title="充值活动"
        description="管理在线充值赠送活动"
        enableSearch={false}
        loadData={loadData}
        columns={columns}
        actions={actions}
        toolbarExtra={
          <button onClick={openCreate} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[var(--accent)] px-3 text-sm font-medium text-white hover:bg-[var(--accent)]/90">
            <Plus className="h-4 w-4" />新建
          </button>
        }
      />

      <Modal open={editItem !== null || showCreate} onClose={() => { setEditItem(null); setShowCreate(false); }} title={editItem ? "编辑活动" : "新建活动"} width="520px">
        {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">活动名称</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="充100送10" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">活动描述</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="可选" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">最低充值金额（元）</label>
              <input type="number" step="0.01" min={0} value={form.minAmount / 100} onChange={(e) => setForm({ ...form, minAmount: Math.round(Number(e.target.value) * 100) })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">赠送类型</label>
              <select value={form.bonusType} onChange={(e) => setForm({ ...form, bonusType: e.target.value as "FIXED" | "PERCENTAGE" })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]">
                <option value="FIXED">固定金额</option>
                <option value="PERCENTAGE">百分比</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">{form.bonusType === "FIXED" ? "赠送金额（元）" : "赠送百分比（%）"}</label>
              <input type="number" step="0.01" min={0} value={form.bonusType === "FIXED" ? form.bonusValue / 100 : form.bonusValue} onChange={(e) => setForm({ ...form, bonusValue: form.bonusType === "FIXED" ? Math.round(Number(e.target.value) * 100) : Number(e.target.value) })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">封顶金额（元，0 表示无上限）</label>
              <input type="number" step="0.01" min={0} value={form.maxBonus / 100} onChange={(e) => setForm({ ...form, maxBonus: Math.round(Number(e.target.value) * 100) })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">开始时间</label>
              <input type="datetime-local" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">结束时间（可选）</label>
              <input type="datetime-local" value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setEditItem(null); setShowCreate(false); }} className="rounded-md border border-[var(--line)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-soft)]">取消</button>
            <button onClick={handleSave} disabled={saving || !form.name || !form.startAt} className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent)]/90 disabled:opacity-50">
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
