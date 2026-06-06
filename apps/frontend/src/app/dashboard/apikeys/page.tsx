"use client";

/**
 * API Key 管理（用户端）
 *
 * /dashboard/apikeys — 列表、创建、启禁用、删除、轮换
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import DashboardShell from "@/components/DashboardShell";
import {
  getUserApiKeys,
  createApiKey,
  enableApiKey,
  disableApiKey,
  deleteApiKey,
  rotateApiKey,
  type UserApiKey,
  type CreateApiKeyResult,
} from "@/lib/user-api";

/* ============== 创建 Key 弹窗 ============== */
function CreateModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (result: CreateApiKeyResult) => void;
}) {
  const [name, setName] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await createApiKey(name || undefined);
      onCreated(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">创建 API Key</h3>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">名称（可选）</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：生产环境、测试用"
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">取消</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-600 disabled:opacity-50 flex items-center gap-2">
              {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              创建
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============== Key 创建成功弹窗 ============== */
function KeyRevealModal({
  result,
  onClose,
}: {
  result: CreateApiKeyResult;
  onClose: () => void;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">API Key 已创建</h3>
        <p className="text-sm text-gray-500 mb-4">请立即复制保存，此 Key 仅显示一次。</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-xs text-gray-500 mb-1">Key</p>
          <p className="font-mono text-sm text-gray-800 break-all">{result.key}</p>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">关闭</button>
          <button onClick={handleCopy} className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-600">
            {copied ? "✓ 已复制" : "复制 Key"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============== 确认弹窗 ============== */
function ConfirmModal({
  title,
  message,
  confirmLabel = "确认",
  danger = false,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">取消</button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`px-4 py-2 text-white text-sm rounded-lg disabled:opacity-50 flex items-center gap-2 ${
              danger ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary-600"
            }`}
          >
            {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============== 主页面 ============== */
export default function ApiKeysPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [keys, setKeys] = React.useState<UserApiKey[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showCreate, setShowCreate] = React.useState(false);
  const [newKeyResult, setNewKeyResult] = React.useState<CreateApiKeyResult | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    danger?: boolean;
    action: () => Promise<void>;
  } | null>(null);

  const loadKeys = React.useCallback(async () => {
    try {
      const data = await getUserApiKeys();
      setKeys(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    }
  }, []);

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    setIsLoading(true);
    loadKeys().finally(() => setIsLoading(false));
  }, [isAuthenticated, router, loadKeys]);

  const handleToggle = async (key: UserApiKey) => {
    setConfirmAction({
      title: key.isActive ? "禁用 API Key" : "启用 API Key",
      message: key.isActive
        ? `确定要禁用 "${key.name || key.keyPrefix}" 吗？禁用后使用此 Key 的请求将被拒绝。`
        : `确定要启用 "${key.name || key.keyPrefix}" 吗？`,
      confirmLabel: key.isActive ? "禁用" : "启用",
      danger: key.isActive,
      action: async () => {
        if (key.isActive) await disableApiKey(key.id);
        else await enableApiKey(key.id);
        await loadKeys();
      },
    });
  };

  const handleDelete = (key: UserApiKey) => {
    setConfirmAction({
      title: "删除 API Key",
      message: `确定要删除 "${key.name || key.keyPrefix}" 吗？此操作不可撤销，使用此 Key 的请求将立即失效。`,
      confirmLabel: "删除",
      danger: true,
      action: async () => {
        await deleteApiKey(key.id);
        await loadKeys();
      },
    });
  };

  const handleRotate = (key: UserApiKey) => {
    setConfirmAction({
      title: "轮换 API Key",
      message: `确定要轮换 "${key.name || key.keyPrefix}" 吗？旧 Key 将立即失效，新 Key 仅显示一次。`,
      confirmLabel: "轮换",
      action: async () => {
        const result = await rotateApiKey(key.id);
        setNewKeyResult(result);
        await loadKeys();
      },
    });
  };

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">API Keys</h1>
            <p className="text-sm text-gray-500 mt-1">管理您的 API 密钥，用于访问 ToAiAPI 服务</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-600 flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            创建 Key
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-100">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="font-normal text-left px-4 py-3 text-[13px]">名称</th>
                <th className="font-normal text-left px-4 py-3 text-[13px]">Key 前缀</th>
                <th className="font-normal text-left px-4 py-3 text-[13px]">状态</th>
                <th className="font-normal text-right px-4 py-3 text-[13px]">请求数</th>
                <th className="font-normal text-left px-4 py-3 text-[13px]">最后使用</th>
                <th className="font-normal text-left px-4 py-3 text-[13px]">创建时间</th>
                <th className="font-normal text-right px-4 py-3 text-[13px]">操作</th>
              </tr>
            </thead>
            <tbody>
              {keys.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">暂无 API Key，点击上方按钮创建</td></tr>
              ) : keys.map((k) => (
                <tr key={k.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-[13px] text-gray-800 font-medium">{k.name || "-"}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-600 font-mono">{k.keyPrefix}...</td>
                  <td className="px-4 py-3 text-[13px]">
                    <span className={`inline-flex items-center gap-1.5 ${k.isActive ? "text-success" : "text-gray-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${k.isActive ? "bg-success" : "bg-gray-300"}`} />
                      {k.isActive ? "启用" : "禁用"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-right text-gray-600 font-mono">{k.totalRequests.toLocaleString()}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-500">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString("zh-CN") : "-"}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-500">{new Date(k.createdAt).toLocaleDateString("zh-CN")}</td>
                  <td className="px-4 py-3 text-[13px] text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleToggle(k)} className="px-2 py-1 text-xs text-gray-600 hover:text-primary hover:bg-primary/5 rounded transition">
                        {k.isActive ? "禁用" : "启用"}
                      </button>
                      <button onClick={() => handleRotate(k)} className="px-2 py-1 text-xs text-gray-600 hover:text-warning hover:bg-warning/5 rounded transition">
                        轮换
                      </button>
                      <button onClick={() => handleDelete(k)} className="px-2 py-1 text-xs text-gray-600 hover:text-red-500 hover:bg-red-50 rounded transition">
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 弹窗 */}
      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={(result) => {
            setShowCreate(false);
            setNewKeyResult(result);
            loadKeys();
          }}
        />
      )}
      {newKeyResult && (
        <KeyRevealModal result={newKeyResult} onClose={() => setNewKeyResult(null)} />
      )}
      {confirmAction && (
        <ConfirmModal
          title={confirmAction.title}
          message={confirmAction.message}
          confirmLabel={confirmAction.confirmLabel}
          danger={confirmAction.danger}
          onConfirm={confirmAction.action}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </DashboardShell>
  );
}
