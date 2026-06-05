"use client";

/**
 * 服务商管理页
 *
 * Provider CRUD：列表、新建、编辑、删除。
 * 后端 API：GET/POST/PATCH/DELETE /admin/providers
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import {
  getProviders,
  createProvider,
  updateProvider,
  deleteProvider,
  formatDate,
  getProviderStatusLabel,
  type ProviderData,
  type CreateProviderPayload,
} from "@/lib/admin-api";
import {
  ToAiAPILogo,
  IconMenu,
  IconSearch,
  IconBell,
  IconSettings,
  IconChevronDown,
  IconDashboard,
  IconUserList,
  IconUserGroup,
  IconKey,
  IconOrders,
  IconRecharge,
  IconBill,
  IconInvoice,
  IconModel,
  IconChannel,
  IconPrice,
  IconSystem,
  IconLog,
  IconMonitor,
  IconUsers,
} from "@/components/PixelIcons";

/* ============== 侧边栏导航数据 ============== */
interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const sidebarSections: SidebarSection[] = [
  {
    title: "控制台",
    items: [{ icon: <IconDashboard size={18} />, label: "控制台", href: "/admin" }],
  },
  {
    title: "用户管理",
    items: [
      { icon: <IconUserList size={18} />, label: "用户列表", href: "/admin/users" },
      { icon: <IconUserGroup size={18} />, label: "用户分组", href: "/admin/users/groups" },
      { icon: <IconKey size={18} />, label: "API Key 管理", href: "/admin/apikeys" },
    ],
  },
  {
    title: "权限管理",
    items: [{ icon: <IconUserGroup size={18} />, label: "角色管理", href: "/admin/roles" }],
  },
  {
    title: "订单与财务",
    items: [
      { icon: <IconOrders size={18} />, label: "订单管理", href: "/admin/orders" },
      { icon: <IconRecharge size={18} />, label: "充值记录", href: "/admin/recharges" },
      { icon: <IconBill size={18} />, label: "账单管理", href: "/admin/bills" },
      { icon: <IconInvoice size={18} />, label: "发票管理", href: "/admin/invoices" },
    ],
  },
  {
    title: "模型与通道",
    items: [
      { icon: <IconModel size={18} />, label: "模型管理", href: "/admin/models" },
      { icon: <IconChannel size={18} />, label: "通道管理", href: "/admin/channels" },
      { icon: <IconPrice size={18} />, label: "模型价格", href: "/admin/pricing" },
      { icon: <IconUsers size={18} />, label: "服务商管理", href: "/admin/providers", active: true },
    ],
  },
  {
    title: "系统与监控",
    items: [
      { icon: <IconSystem size={18} />, label: "系统设置", href: "/admin/settings" },
      { icon: <IconLog size={18} />, label: "操作日志", href: "/admin/logs/operations" },
      { icon: <IconLog size={18} />, label: "调用日志", href: "/admin/logs/requests" },
      { icon: <IconMonitor size={18} />, label: "系统监控", href: "/admin/monitor" },
    ],
  },
];

/* ============== 确认弹窗 ============== */
interface ConfirmAction {
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  confirmColor?: string;
}

function ConfirmModal({
  action,
  onClose,
}: {
  action: ConfirmAction;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-medium text-gray-900">{action.title}</h3>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-gray-600">{action.message}</p>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={() => {
              action.onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm text-white rounded-lg ${action.confirmColor ?? "bg-red-600 hover:bg-red-700"}`}
          >
            {action.confirmText ?? "确认"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============== 新建/编辑弹窗 ============== */
interface ProviderFormProps {
  provider?: ProviderData | null;
  onClose: () => void;
  onSaved: () => void;
}

function ProviderFormModal({ provider, onClose, onSaved }: ProviderFormProps) {
  const [name, setName] = React.useState(provider?.name ?? "");
  const [displayName, setDisplayName] = React.useState(provider?.displayName ?? "");
  const [baseUrl, setBaseUrl] = React.useState(provider?.baseUrl ?? "");
  const [isActive, setIsActive] = React.useState(provider?.isActive ?? true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isEdit = !!provider;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isEdit && provider) {
        await updateProvider(provider.id, { displayName, baseUrl, isActive });
      } else {
        await createProvider({ name, displayName, baseUrl, isActive });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-medium text-gray-900">
            {isEdit ? "编辑服务商" : "新建服务商"}
          </h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}
            {!isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  标识名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：openai, deepseek"
                  required
                  maxLength={50}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                显示名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="例如：OpenAI, DeepSeek"
                required
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.openai.com"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                启用
              </label>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============== 主页面 ============== */
export default function ProvidersPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  // 数据状态
  const [providers, setProviders] = React.useState<ProviderData[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // 搜索
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");

  // 弹窗状态
  const [formProvider, setFormProvider] = React.useState<ProviderData | null | undefined>(undefined);
  const [confirmAction, setConfirmAction] = React.useState<ConfirmAction | null>(null);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Admin";
  const initial = displayName.charAt(0).toUpperCase();

  // 搜索防抖
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // 加载数据
  const fetchProviders = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getProviders({ page, pageSize: 20, search: search || undefined });
      setProviders(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  React.useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // 删除
  const handleDelete = (provider: ProviderData) => {
    setConfirmAction({
      title: "删除服务商",
      message: `确定要删除服务商「${provider.displayName}」吗？如果该服务商下有关联渠道，删除将被拒绝。此操作不可撤销。`,
      onConfirm: async () => {
        try {
          await deleteProvider(provider.id);
          fetchProviders();
        } catch (err) {
          alert(err instanceof Error ? err.message : "删除失败");
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex">
      {/* ── 侧边栏 ── */}
      <aside className="w-[220px] bg-white border-r border-gray-100 flex flex-col fixed top-0 left-0 bottom-0 z-30">
        <div className="h-16 flex items-center px-5 border-b border-gray-100">
          <ToAiAPILogo size={28} />
          <span className="ml-2.5 text-[15px] font-semibold text-gray-800">ToAIAPI</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {sidebarSections.map((section) => (
            <div key={section.title} className="mb-2">
              <div className="px-5 py-1.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                {section.title}
              </div>
              {section.items.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-5 py-2 text-[13px] transition-colors ${
                    item.active
                      ? "text-primary bg-primary-50 font-medium"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </a>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* ── 主内容区 ── */}
      <div className="flex-1 ml-[220px]">
        {/* 顶部栏 */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button className="p-1.5 hover:bg-gray-100 rounded-lg lg:hidden">
              <IconMenu size={20} className="text-gray-500" />
            </button>
            <h1 className="text-base font-semibold text-gray-800">服务商管理</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <IconSearch size={18} className="text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <IconBell size={18} className="text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <IconSettings size={18} className="text-gray-400" />
            </button>
            <div className="relative ml-1">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {initial}
                </div>
                <IconChevronDown size={14} className="text-gray-400" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">{displayName}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 内容区 */}
        <main className="p-6">
          {/* 搜索 + 操作栏 */}
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-72">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索服务商..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <button
              onClick={() => setFormProvider(null)}
              className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-600"
            >
              + 新建服务商
            </button>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
              <span className="text-sm text-red-600">{error}</span>
              <button onClick={fetchProviders} className="text-sm text-primary hover:underline">
                重试
              </button>
            </div>
          )}

          {/* 表格 */}
          <div className="bg-white rounded-lg border border-gray-100">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="font-normal text-left px-4 py-3 text-[13px]">标识名</th>
                  <th className="font-normal text-left px-4 py-3 text-[13px]">显示名称</th>
                  <th className="font-normal text-left px-4 py-3 text-[13px]">Base URL</th>
                  <th className="font-normal text-left px-4 py-3 text-[13px]">状态</th>
                  <th className="font-normal text-left px-4 py-3 text-[13px]">渠道数</th>
                  <th className="font-normal text-left px-4 py-3 text-[13px]">创建时间</th>
                  <th className="font-normal text-right px-4 py-3 text-[13px]">操作</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm text-gray-500">加载中...</p>
                    </td>
                  </tr>
                ) : providers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  providers.map((p) => {
                    const status = getProviderStatusLabel(p.isActive);
                    return (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3 text-[13px] font-mono text-gray-800">{p.name}</td>
                        <td className="px-4 py-3 text-[13px] text-gray-800">{p.displayName}</td>
                        <td className="px-4 py-3 text-[13px] text-gray-500 font-mono truncate max-w-[240px]">
                          {p.baseUrl}
                        </td>
                        <td className="px-4 py-3 text-[13px]">
                          <span className={`inline-flex items-center gap-1.5 ${status.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-600">{p.channelCount}</td>
                        <td className="px-4 py-3 text-[13px] text-gray-500 font-mono">{formatDate(p.createdAt)}</td>
                        <td className="px-4 py-3 text-[13px] text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setFormProvider(p)}
                              className="px-2.5 py-1 text-xs text-primary hover:bg-primary-50 rounded"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDelete(p)}
                              className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span>
                共 {total} 条，第 {page}/{totalPages} 页
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  上一页
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 弹窗 */}
      {formProvider !== undefined && (
        <ProviderFormModal
          provider={formProvider}
          onClose={() => setFormProvider(undefined)}
          onSaved={() => {
            setFormProvider(undefined);
            fetchProviders();
          }}
        />
      )}
      {confirmAction && <ConfirmModal action={confirmAction} onClose={() => setConfirmAction(null)} />}
    </div>
  );
}
