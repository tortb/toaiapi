"use client";

import { useEffect, useState } from "react";
import { Copy, Key, Plus, Trash2, X } from "lucide-react";
import { createApiKey, deleteApiKey, disableApiKey, enableApiKey, getUserApiKeys, type UserApiKey } from "@/lib/user-api";
import { confirmAction, notifyError } from "@/lib/feedback/events";
import { useErrorToast } from "@/lib/feedback/use-error-toast";

function formatDate(value: string | null) {
  if (!value) return "永不过期";
  return new Date(value).toLocaleString("zh-CN");
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<UserApiKey[]>([]);
  const [secret, setSecret] = useState("");
  const [draftName, setDraftName] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [, setError] = useErrorToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      setKeys(await getUserApiKeys());
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draftName.trim()) {
      setError("请输入密钥名称");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const result = await createApiKey({ name: draftName.trim() });
      setSecret(result.key || result.keys?.[0]?.key || "");
      setDraftName("");
      setCreateOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleKey(item: UserApiKey) {
    setError("");
    try {
      item.isActive ? await disableApiKey(item.id) : await enableApiKey(item.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    }
  }

  async function remove(item: UserApiKey) {
    if (!(await confirmAction({ title: "删除 API 密钥", message: `确认删除 ${item.name || item.keyPrefix}？`, confirmText: "删除", variant: "danger" }))) return;
    setError("");
    try {
      await deleteApiKey(item.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">API 密钥</h1>
          <p className="page-subtitle">创建、禁用和删除您的调用密钥</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="notion-btn-primary px-4 py-2.5 text-sm self-start sm:self-auto"><Plus className="w-4 h-4 mr-2" />创建密钥</button>
      </div>
      {secret && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="text-sm font-medium text-green-800">新密钥仅显示一次</div>
          <div className="mt-2 flex gap-2"><code className="flex-1 overflow-x-auto rounded bg-white px-3 py-2 text-xs">{secret}</code><button onClick={() => navigator.clipboard.writeText(secret)} className="notion-btn-secondary px-3" title="复制密钥"><Copy className="w-4 h-4" /></button></div>
        </div>
      )}
      <div className="bg-white border border-[var(--line)] rounded-lg overflow-x-auto">
        <div className="min-w-[860px]">
          <div className="grid grid-cols-6 px-4 py-3 bg-[var(--surface-soft)] text-xs font-semibold text-[var(--text-muted)]">
            <div>名称</div><div>前缀</div><div>状态</div><div>请求数</div><div>过期时间</div><div>操作</div>
          </div>
          {loading ? <div className="p-8 text-center text-sm text-[var(--text-secondary)]">加载中...</div> : keys.length === 0 ? <div className="p-8 text-center text-sm text-[var(--text-secondary)]">暂无 API Key</div> : keys.map((item) => (
            <div key={item.id} className="grid grid-cols-6 px-4 py-3 text-sm border-t border-[var(--line)] items-center">
              <div className="font-medium truncate pr-3"><Key className="w-4 h-4 inline mr-2" />{item.name || "未命名"}</div>
              <code className="text-xs text-[var(--text-secondary)]">{item.keyPrefix}</code>
              <button onClick={() => toggleKey(item)} className={item.isActive ? "text-green-600 text-left" : "text-gray-500 text-left"}>{item.isActive ? "启用" : "禁用"}</button>
              <div>{item.totalRequests.toLocaleString("zh-CN")}</div>
              <div className="text-[var(--text-secondary)]">{formatDate(item.expiresAt)}</div>
              <div><button onClick={() => remove(item)} title="删除" className="notion-btn-secondary p-2"><Trash2 className="w-4 h-4" /></button></div>
            </div>
          ))}
        </div>
      </div>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <form onSubmit={handleCreate} className="w-full max-w-md rounded-lg border border-[var(--line)] bg-white p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div><h2 className="text-base font-semibold text-[var(--foreground)]">创建 API 密钥</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">输入一个便于识别的名称。</p></div>
              <button type="button" onClick={() => setCreateOpen(false)} className="notion-btn-secondary p-2" title="关闭"><X className="w-4 h-4" /></button>
            </div>
            <label className="block">
              <span className="text-sm text-[var(--text-secondary)]">密钥名称</span>
              <input autoFocus required value={draftName} onChange={(event) => setDraftName(event.target.value)} className="mt-1 w-full px-3 py-2.5 border border-[var(--line)] rounded-md text-sm outline-none focus:border-[var(--accent)]" placeholder="例如 production" />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setCreateOpen(false)} className="notion-btn-secondary px-4 py-2.5 text-sm">取消</button>
              <button disabled={submitting || !draftName.trim()} className="notion-btn-primary px-4 py-2.5 text-sm disabled:opacity-60">{submitting ? "创建中" : "确定创建"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
