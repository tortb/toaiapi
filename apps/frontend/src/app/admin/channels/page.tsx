"use client";

import { useCallback, useState } from "react";
import { FlaskConical, Plus, Trash2 } from "lucide-react";
import { AdminResourceList, type AdminResourceColumn } from "@/components/admin/AdminResourceList";
import { Modal } from "@/components/ui/modal";
import { getChannelStatusLabel, getChannels, updateChannel, createChannel, enableChannel, disableChannel, deleteChannel, testChannel, getProviders, type ChannelData, type UpdateChannelPayload, type CreateChannelPayload, type ProviderData } from "@/lib/admin-api";
import { formatTableDate } from "@/lib/utils";

// 默认表单值
const defaultForm = {
  name: "", baseUrl: "", apiKey: "", weight: 1, priority: 0,
  tags: "", notes: "", proxy: "", groupId: "", systemPrompt: "",
  modelMapping: "", statusCodeMapping: "", paramOverrides: "", headerOverrides: "",
  autoDisableOnFailure: false,
  providerId: "", // 仅新建时需要
};

export default function AdminChannelsPage() {
  const [editItem, setEditItem] = useState<ChannelData | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const loadData = useCallback((params: { page: number; pageSize: number; search?: string }) => getChannels(params), []);

  async function openEdit(item: ChannelData) {
    setEditItem(item);
    setForm({
      name: item.name, baseUrl: item.baseUrl, apiKey: "",
      weight: item.weight, priority: item.priority,
      tags: "", notes: "", proxy: "", groupId: "", systemPrompt: "",
      modelMapping: "", statusCodeMapping: "", paramOverrides: "", headerOverrides: "",
      autoDisableOnFailure: false, providerId: "",
    });
    setError("");
    setShowAdvanced(false);
  }

  async function openCreate() {
    setShowCreate(true);
    setForm(defaultForm);
    setError("");
    setShowAdvanced(false);
    try {
      const res = await getProviders({ page: 1, pageSize: 100 });
      setProviders(res.items);
    } catch { /* ignore */ }
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      if (editItem) {
        const payload: UpdateChannelPayload = {};
        if (form.name !== editItem.name) payload.name = form.name;
        if (form.baseUrl !== editItem.baseUrl) payload.baseUrl = form.baseUrl;
        if (form.apiKey) payload.apiKey = form.apiKey;
        if (form.weight !== editItem.weight) payload.weight = form.weight;
        if (form.priority !== editItem.priority) payload.priority = form.priority;
        if (form.tags) payload.tags = form.tags;
        if (form.notes) payload.notes = form.notes;
        if (form.proxy) payload.proxy = form.proxy;
        if (form.groupId) payload.groupId = form.groupId;
        if (form.systemPrompt) payload.systemPrompt = form.systemPrompt;
        if (form.modelMapping) payload.modelMapping = form.modelMapping;
        if (form.statusCodeMapping) payload.statusCodeMapping = form.statusCodeMapping;
        if (form.paramOverrides) payload.paramOverrides = form.paramOverrides;
        if (form.headerOverrides) payload.headerOverrides = form.headerOverrides;
        payload.autoDisableOnFailure = form.autoDisableOnFailure;
        await updateChannel(editItem.id, payload);
      } else {
        if (!form.providerId) { setError("请选择所属 Provider"); setSaving(false); return; }
        await createChannel({
          providerId: form.providerId,
          name: form.name, baseUrl: form.baseUrl, apiKey: form.apiKey,
          weight: form.weight, priority: form.priority,
          tags: form.tags || undefined, notes: form.notes || undefined,
          proxy: form.proxy || undefined, groupId: form.groupId || undefined,
          systemPrompt: form.systemPrompt || undefined,
          modelMapping: form.modelMapping || undefined,
          statusCodeMapping: form.statusCodeMapping || undefined,
          paramOverrides: form.paramOverrides || undefined,
          headerOverrides: form.headerOverrides || undefined,
          autoDisableOnFailure: form.autoDisableOnFailure || undefined,
        } as CreateChannelPayload);
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

  async function handleEnable(item: ChannelData) {
    try { await enableChannel(item.id); setRefreshKey((k) => k + 1); } catch (err) { alert(err instanceof Error ? err.message : "操作失败"); }
  }
  async function handleDisable(item: ChannelData) {
    try { await disableChannel(item.id); setRefreshKey((k) => k + 1); } catch (err) { alert(err instanceof Error ? err.message : "操作失败"); }
  }
  async function handleTest(item: ChannelData) {
    setTesting(true);
    try {
      const result = await testChannel(item.id);
      alert(`测试结果: ${result.success ? "✅ 成功" : "❌ 失败"}\n延迟: ${result.latencyMs}ms\n消息: ${result.message}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "测试失败");
    } finally { setTesting(false); }
  }
  async function handleDelete(item: ChannelData) {
    if (!confirm(`确定删除通道「${item.name}」吗？`)) return;
    try { await deleteChannel(item.id); setRefreshKey((k) => k + 1); } catch (err) { alert(err instanceof Error ? err.message : "删除失败"); }
  }

  const actions = useCallback((item: ChannelData) => (
    <div className="flex items-center justify-end gap-1 flex-wrap">
      <button onClick={() => openEdit(item)} className="rounded px-2 py-1 text-xs text-primary hover:bg-primary/10 transition-colors">编辑</button>
      {item.status === "DISABLED" ? (
        <button onClick={() => handleEnable(item)} className="rounded px-2 py-1 text-xs text-green-600 hover:bg-green-50 transition-colors">启用</button>
      ) : (
        <button onClick={() => handleDisable(item)} className="rounded px-2 py-1 text-xs text-orange-600 hover:bg-orange-50 transition-colors">禁用</button>
      )}
      <button onClick={() => handleTest(item)} disabled={testing} className="rounded px-2 py-1 text-xs text-purple-600 hover:bg-purple-50 transition-colors">测试</button>
      <button onClick={() => handleDelete(item)} className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 transition-colors">删除</button>
    </div>
  ), [testing]);

  const columns: AdminResourceColumn<ChannelData>[] = [
    { header: "通道", render: (item) => <div><div className="font-medium">{item.name}</div><div className="text-xs text-[var(--text-muted)]">{item.provider?.displayName || item.provider?.name || item.providerId}</div></div> },
    { header: "Base URL", render: (item) => <span className="font-mono text-xs">{item.baseUrl}</span> },
    { header: "Key 前缀", width: "120px", render: (item) => <span className="font-mono text-xs">{item.keyPrefix || "-"}</span> },
    { header: "权重/优先级", width: "110px", render: (item) => `${item.weight}/${item.priority}` },
    { header: "状态", width: "100px", render: (item) => { const status = getChannelStatusLabel(item.status); return <span className={status.color}>{status.label}</span>; } },
    { header: "请求", width: "100px", render: (item) => item.totalRequests.toLocaleString("zh-CN") },
    { header: "创建时间", width: "160px", render: (item) => formatTableDate(item.createdAt) },
  ];

  const isOpen = editItem !== null || showCreate;

  return (
    <>
      <AdminResourceList
        key={refreshKey}
        title="通道管理"
        description="管理上游通道状态、权重和凭证（API Key 加密存储）"
        searchPlaceholder="搜索通道"
        loadData={loadData}
        columns={columns}
        actions={actions}
        toolbarExtra={
          <button onClick={openCreate} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[var(--accent)] px-3 text-sm font-medium text-white hover:bg-[var(--accent)]/90">
            <Plus className="h-4 w-4" />新建
          </button>
        }
      />

      <Modal open={isOpen} onClose={() => { setEditItem(null); setShowCreate(false); }} title={editItem ? "编辑通道" : "新建通道"} width="640px">
        {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
          {/* ===== 基本信息 ===== */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 pb-1 border-b border-[var(--line)]">基本信息</h3>
            {showCreate && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">所属 Provider</label>
                <select
                  value={form.providerId ?? ""}
                  onChange={(e) => setForm({ ...form, providerId: e.target.value })}
                  className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                >
                  <option value="">请选择</option>
                  {providers.map((p) => <option key={p.id} value={p.id}>{p.displayName} ({p.name})</option>)}
                </select>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">通道名称</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="DeepSeek Main" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">组织 ID（可选）</label>
                <input value={form.groupId} onChange={(e) => setForm({ ...form, groupId: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="org-xxx" />
              </div>
            </div>
          </div>

          {/* ===== 接口配置 ===== */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 pb-1 border-b border-[var(--line)]">接口配置</h3>
            <p className="text-xs text-[var(--text-muted)] mb-3">
              Base URL 包含完整路径。例如：OpenAI 兼容格式为 <code className="bg-gray-100 px-1 rounded">https://api.deepseek.com/v1</code>，Anthropic 格式为 <code className="bg-gray-100 px-1 rounded">https://api.deepseek.com/anthropic</code>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">API 基础 URL</label>
                <input value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="https://api.deepseek.com/v1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  API Key <span className="text-xs text-red-500">（AES-256-GCM 加密存储）</span>
                </label>
                <input value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder={editItem ? "留空则保持原值" : "sk-..."} type="password" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">代理地址（可选）</label>
                <input value={form.proxy} onChange={(e) => setForm({ ...form, proxy: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="http://127.0.0.1:7890" />
              </div>
            </div>
          </div>

          {/* ===== 路由配置 ===== */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 pb-1 border-b border-[var(--line)]">路由配置</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">权重 (1-100)</label>
                <input type="number" min={1} max={100} value={form.weight} onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" />
                <p className="text-xs text-[var(--text-muted)] mt-0.5">越高流量越多</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">优先级 (0-100)</label>
                <input type="number" min={0} max={100} value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" />
                <p className="text-xs text-[var(--text-muted)] mt-0.5">越高越优先选择</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">标签</label>
                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="主力,备用,海外" />
                <p className="text-xs text-[var(--text-muted)] mt-0.5">逗号分隔</p>
              </div>
            </div>
            <div className="mt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.autoDisableOnFailure} onChange={(e) => setForm({ ...form, autoDisableOnFailure: e.target.checked })} className="rounded border-[var(--line)]" />
                <span className="text-sm text-[var(--foreground)]">失败时自动禁用</span>
              </label>
            </div>
          </div>

          {/* ===== 高级配置（折叠） ===== */}
          <div>
            <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors">
              <span className={`transform transition-transform ${showAdvanced ? "rotate-90" : ""}`}>▶</span>
              高级配置（模型映射、参数覆盖等）
            </button>
            {showAdvanced && (
              <div className="mt-3 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">模型映射（JSON）</label>
                  <textarea value={form.modelMapping} onChange={(e) => setForm({ ...form, modelMapping: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm font-mono outline-none focus:border-[var(--accent)] min-h-[60px]" placeholder='{"gpt-4": "deepseek-chat"}' />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1">状态码映射（JSON）</label>
                    <textarea value={form.statusCodeMapping} onChange={(e) => setForm({ ...form, statusCodeMapping: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm font-mono outline-none focus:border-[var(--accent)] min-h-[60px]" placeholder='{"429": "503"}' />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1">参数覆盖（JSON）</label>
                    <textarea value={form.paramOverrides} onChange={(e) => setForm({ ...form, paramOverrides: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm font-mono outline-none focus:border-[var(--accent)] min-h-[60px]" placeholder='{"max_tokens": 4096}' />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1">请求头覆盖（JSON）</label>
                    <textarea value={form.headerOverrides} onChange={(e) => setForm({ ...form, headerOverrides: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm font-mono outline-none focus:border-[var(--accent)] min-h-[60px]" placeholder='{"X-Custom": "value"}' />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1">系统提示词</label>
                    <textarea value={form.systemPrompt} onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm font-mono outline-none focus:border-[var(--accent)] min-h-[60px]" placeholder="可选系统级 prompt 覆盖" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">内部备注</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)] min-h-[50px]" placeholder="仅内部可见的备注信息" />
                </div>
              </div>
            )}
          </div>

          {/* ===== 按钮 ===== */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--line)]">
            <button onClick={() => { setEditItem(null); setShowCreate(false); }} className="rounded-md border border-[var(--line)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-soft)]">取消</button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name || !form.baseUrl || (showCreate && (!form.providerId || !form.apiKey))}
              className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent)]/90 disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
