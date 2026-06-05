"use client";

/**
 * 模型价格总览页
 *
 * 展示所有模型的定价信息，支持编辑。
 * 后端 API：GET /admin/models, PUT /admin/models/:id/pricing
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import {
  getModels,
  upsertModelPricing,
  getProviders,
  getModelStatusLabel,
  type ModelData,
  type ProviderData,
  type UpsertPricingPayload,
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
      { icon: <IconPrice size={18} />, label: "模型价格", href: "/admin/pricing", active: true },
      { icon: <IconUsers size={18} />, label: "服务商管理", href: "/admin/providers" },
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

/* ============== 格式化价格 ============== */
function formatPrice(fenPerMillion: number): string {
  const yuan = fenPerMillion / 100;
  if (yuan === 0) return "免费";
  if (yuan < 0.01) return "<0.01";
  return yuan.toFixed(2);
}

/* ============== 编辑定价弹窗 ============== */
interface PricingFormProps {
  model: ModelData;
  onClose: () => void;
  onSaved: () => void;
}

function PricingFormModal({ model, onClose, onSaved }: PricingFormProps) {
  const p = model.pricing;
  const [inputPrice, setInputPrice] = React.useState(String(p?.inputPrice ?? 0));
  const [outputPrice, setOutputPrice] = React.useState(String(p?.outputPrice ?? 0));
  const [cachedPrice, setCachedPrice] = React.useState(String(p?.cachedPrice ?? ""));
  const [reasoningPrice, setReasoningPrice] = React.useState(String(p?.reasoningPrice ?? ""));
  const [multiplier, setMultiplier] = React.useState(String(p?.multiplier ?? 1.0));
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: UpsertPricingPayload = {
        inputPrice: Number(inputPrice),
        outputPrice: Number(outputPrice),
        multiplier: Number(multiplier),
      };
      if (cachedPrice) payload.cachedPrice = Number(cachedPrice);
      if (reasoningPrice) payload.reasoningPrice = Number(reasoningPrice);
      await upsertModelPricing(model.id, payload);
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
          <h3 className="text-base font-medium text-gray-900">编辑定价 - {model.displayName}</h3>
          <p className="text-xs text-gray-400 mt-1">价格单位：元/百万 Token（输入为分，自动转换）</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  输入价格 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputPrice}
                    onChange={(e) => setInputPrice(e.target.value)}
                    min={0}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">分/百万</span>
                </div>
                <p className="mt-1 text-xs text-gray-400">≈ ¥{formatPrice(Number(inputPrice))}/百万</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  输出价格 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={outputPrice}
                    onChange={(e) => setOutputPrice(e.target.value)}
                    min={0}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">分/百万</span>
                </div>
                <p className="mt-1 text-xs text-gray-400">≈ ¥{formatPrice(Number(outputPrice))}/百万</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">缓存价格</label>
                <div className="relative">
                  <input
                    type="number"
                    value={cachedPrice}
                    onChange={(e) => setCachedPrice(e.target.value)}
                    min={0}
                    placeholder="可选"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">分/百万</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">推理价格</label>
                <div className="relative">
                  <input
                    type="number"
                    value={reasoningPrice}
                    onChange={(e) => setReasoningPrice(e.target.value)}
                    min={0}
                    placeholder="可选"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">分/百万</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">价格倍率</label>
              <input
                type="number"
                value={multiplier}
                onChange={(e) => setMultiplier(e.target.value)}
                min={0.1}
                max={10}
                step={0.1}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p className="mt-1 text-xs text-gray-400">最终价格 = 基础价格 × 倍率</p>
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
export default function PricingPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  // 数据状态
  const [models, setModels] = React.useState<ModelData[]>([]);
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
  const [pricingModel, setPricingModel] = React.useState<ModelData | null>(null);

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

  // 加载服务商列表
  const fetchProviders = React.useCallback(async () => {
    try {
      const res = await getProviders({ pageSize: 100 });
      setProviders(res.items);
    } catch {
      // 静默失败
    }
  }, []);

  // 加载模型数据
  const fetchModels = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getModels({ page, pageSize: 50, search: search || undefined });
      setModels(res.items);
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

  React.useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  // 获取 Provider 显示名
  const getProviderName = (providerId: string): string => {
    const p = providers.find((x) => x.id === providerId);
    return p?.displayName ?? providerId;
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
            <h1 className="text-base font-semibold text-gray-800">模型价格</h1>
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
          {/* 搜索栏 */}
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-72">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索模型..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <p className="text-sm text-gray-400">价格单位：元/百万 Token</p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
              <span className="text-sm text-red-600">{error}</span>
              <button onClick={fetchModels} className="text-sm text-primary hover:underline">
                重试
              </button>
            </div>
          )}

          {/* 表格 */}
          <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="font-normal text-left px-4 py-3 text-[13px]">模型</th>
                  <th className="font-normal text-left px-4 py-3 text-[13px]">服务商</th>
                  <th className="font-normal text-right px-4 py-3 text-[13px]">输入价</th>
                  <th className="font-normal text-right px-4 py-3 text-[13px]">输出价</th>
                  <th className="font-normal text-right px-4 py-3 text-[13px]">缓存价</th>
                  <th className="font-normal text-right px-4 py-3 text-[13px]">推理价</th>
                  <th className="font-normal text-right px-4 py-3 text-[13px]">倍率</th>
                  <th className="font-normal text-left px-4 py-3 text-[13px]">状态</th>
                  <th className="font-normal text-right px-4 py-3 text-[13px]">操作</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm text-gray-500">加载中...</p>
                    </td>
                  </tr>
                ) : models.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  models.map((m) => {
                    const status = getModelStatusLabel(m.isActive);
                    const p = m.pricing;
                    return (
                      <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3 text-[13px]">
                          <div>
                            <span className="text-gray-800 font-medium">{m.displayName}</span>
                            <span className="ml-2 text-gray-400 font-mono text-xs">{m.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-600">{getProviderName(m.providerId)}</td>
                        <td className="px-4 py-3 text-[13px] text-right font-mono">
                          {p ? (
                            <span className="text-gray-800">¥{formatPrice(p.inputPrice)}</span>
                          ) : (
                            <span className="text-gray-400">未设置</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-right font-mono">
                          {p ? (
                            <span className="text-gray-800">¥{formatPrice(p.outputPrice)}</span>
                          ) : (
                            <span className="text-gray-400">未设置</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-right font-mono">
                          {p?.cachedPrice != null ? (
                            <span className="text-gray-600">¥{formatPrice(p.cachedPrice)}</span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-right font-mono">
                          {p?.reasoningPrice != null ? (
                            <span className="text-gray-600">¥{formatPrice(p.reasoningPrice)}</span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-right font-mono">
                          {p ? (
                            <span className="text-gray-600">{p.multiplier}x</span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[13px]">
                          <span className={`inline-flex items-center gap-1.5 ${status.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-right">
                          <button
                            onClick={() => setPricingModel(m)}
                            className="px-3 py-1 text-xs text-primary hover:bg-primary-50 rounded border border-primary/20"
                          >
                            编辑定价
                          </button>
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
      {pricingModel && (
        <PricingFormModal
          model={pricingModel}
          onClose={() => setPricingModel(null)}
          onSaved={() => {
            setPricingModel(null);
            fetchModels();
          }}
        />
      )}
    </div>
  );
}
