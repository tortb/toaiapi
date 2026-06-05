"use client";

/**
 * 充值赠送活动管理页
 *
 * CRUD + 启停。
 * 后端 API：GET/POST/PATCH/DELETE /admin/promotions
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  togglePromotion,
  deletePromotion,
  formatDate,
  formatAmount,
  getBonusTypeLabel,
  type PromotionData,
  type CreatePromotionPayload,
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

/* ============== 侧边栏 ============== */
interface SidebarItem { icon: React.ReactNode; label: string; href: string; active?: boolean; }
interface SidebarSection { title: string; items: SidebarItem[]; }

const sidebarSections: SidebarSection[] = [
  { title: "控制台", items: [{ icon: <IconDashboard size={18} />, label: "控制台", href: "/admin" }] },
  { title: "用户管理", items: [
    { icon: <IconUserList size={18} />, label: "用户列表", href: "/admin/users" },
    { icon: <IconUserGroup size={18} />, label: "用户分组", href: "/admin/users/groups" },
    { icon: <IconKey size={18} />, label: "API Key 管理", href: "/admin/apikeys" },
  ]},
  { title: "权限管理", items: [{ icon: <IconUserGroup size={18} />, label: "角色管理", href: "/admin/roles" }] },
  { title: "订单与财务", items: [
    { icon: <IconOrders size={18} />, label: "订单管理", href: "/admin/orders" },
    { icon: <IconRecharge size={18} />, label: "充值记录", href: "/admin/recharges" },
    { icon: <IconBill size={18} />, label: "账单管理", href: "/admin/bills" },
    { icon: <IconInvoice size={18} />, label: "发票管理", href: "/admin/invoices" },
    { icon: <IconRecharge size={18} />, label: "赠送活动", href: "/admin/promotions", active: true },
  ]},
  { title: "模型与通道", items: [
    { icon: <IconModel size={18} />, label: "模型管理", href: "/admin/models" },
    { icon: <IconChannel size={18} />, label: "通道管理", href: "/admin/channels" },
    { icon: <IconPrice size={18} />, label: "模型价格", href: "/admin/pricing" },
    { icon: <IconUsers size={18} />, label: "服务商管理", href: "/admin/providers" },
  ]},
  { title: "系统与监控", items: [
    { icon: <IconSystem size={18} />, label: "系统设置", href: "/admin/settings" },
    { icon: <IconLog size={18} />, label: "操作日志", href: "/admin/logs/operations" },
    { icon: <IconLog size={18} />, label: "调用日志", href: "/admin/logs/requests" },
    { icon: <IconMonitor size={18} />, label: "系统监控", href: "/admin/monitor" },
  ]},
];

/* ============== 确认弹窗 ============== */
interface ConfirmAction { title: string; message: string; onConfirm: () => void; confirmText?: string; confirmColor?: string; }

function ConfirmModal({ action, onClose }: { action: ConfirmAction; onClose: () => void }) {
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
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">取消</button>
          <button onClick={() => { action.onConfirm(); onClose(); }} className={`px-4 py-2 text-sm text-white rounded-lg ${action.confirmColor ?? "bg-red-600 hover:bg-red-700"}`}>
            {action.confirmText ?? "确认"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============== 新建/编辑弹窗 ============== */
interface PromotionFormProps { promotion?: PromotionData | null; onClose: () => void; onSaved: () => void; }

function PromotionFormModal({ promotion, onClose, onSaved }: PromotionFormProps) {
  const [name, setName] = React.useState(promotion?.name ?? "");
  const [description, setDescription] = React.useState(promotion?.description ?? "");
  const [minAmount, setMinAmount] = React.useState(String((promotion?.minAmount ?? 1000) / 100));
  const [bonusType, setBonusType] = React.useState<"FIXED" | "PERCENTAGE">(promotion?.bonusType ?? "FIXED");
  const [bonusValue, setBonusValue] = React.useState(promotion?.bonusType === "FIXED" ? String((promotion?.bonusValue ?? 0) / 100) : String((promotion?.bonusValue ?? 0) / 100));
  const [maxBonus, setMaxBonus] = React.useState(promotion?.maxBonus ? String(promotion.maxBonus / 100) : "");
  const [startAt, setStartAt] = React.useState(promotion?.startAt ? new Date(promotion.startAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16));
  const [endAt, setEndAt] = React.useState(promotion?.endAt ? new Date(promotion.endAt).toISOString().slice(0, 16) : "");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isEdit = !!promotion;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: CreatePromotionPayload = {
        name,
        description: description || undefined,
        min_amount: Math.round(parseFloat(minAmount) * 100),
        bonus_type: bonusType,
        bonus_value: bonusType === "FIXED" ? Math.round(parseFloat(bonusValue) * 100) : Math.round(parseFloat(bonusValue) * 100),
        max_bonus: maxBonus ? Math.round(parseFloat(maxBonus) * 100) : undefined,
        start_at: new Date(startAt).toISOString(),
        end_at: endAt ? new Date(endAt).toISOString() : undefined,
      };
      if (isEdit && promotion) {
        await updatePromotion(promotion.id, payload);
      } else {
        await createPromotion(payload);
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-medium text-gray-900">{isEdit ? "编辑活动" : "新建活动"}</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {error && <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">活动名称 <span className="text-red-500">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：充100送10" required maxLength={100}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">活动描述</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="可选" rows={2} maxLength={500}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">最低充值金额（元） <span className="text-red-500">*</span></label>
                <input type="number" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} min={0.01} step={0.01} required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">赠送类型 <span className="text-red-500">*</span></label>
                <select value={bonusType} onChange={(e) => setBonusType(e.target.value as "FIXED" | "PERCENTAGE")}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="FIXED">固定金额</option>
                  <option value="PERCENTAGE">百分比</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {bonusType === "FIXED" ? "赠送金额（元）" : "赠送百分比（%）"} <span className="text-red-500">*</span>
                </label>
                <input type="number" value={bonusValue} onChange={(e) => setBonusValue(e.target.value)}
                  min={bonusType === "FIXED" ? 0.01 : 1} step={bonusType === "FIXED" ? 0.01 : 1} max={bonusType === "PERCENTAGE" ? 100 : undefined} required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              {bonusType === "PERCENTAGE" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">赠送上限（元）</label>
                  <input type="number" value={maxBonus} onChange={(e) => setMaxBonus(e.target.value)} min={0.01} step={0.01} placeholder="不限"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">生效时间 <span className="text-red-500">*</span></label>
                <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} placeholder="永久"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">取消</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-600 disabled:opacity-50">
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============== 主页面 ============== */
export default function PromotionsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const [promotions, setPromotions] = React.useState<PromotionData[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [formPromotion, setFormPromotion] = React.useState<PromotionData | null | undefined>(undefined);
  const [confirmAction, setConfirmAction] = React.useState<ConfirmAction | null>(null);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Admin";
  const initial = displayName.charAt(0).toUpperCase();

  const fetchPromotions = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getPromotions({ page, pageSize: 20 });
      setPromotions(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  React.useEffect(() => { fetchPromotions(); }, [fetchPromotions]);

  const handleToggle = (p: PromotionData) => {
    setConfirmAction({
      title: p.isActive ? "禁用活动" : "启用活动",
      message: `确定要${p.isActive ? "禁用" : "启用"}活动「${p.name}」吗？`,
      confirmText: p.isActive ? "禁用" : "启用",
      confirmColor: p.isActive ? undefined : "bg-success hover:bg-success/90",
      onConfirm: async () => {
        try { await togglePromotion(p.id); fetchPromotions(); }
        catch (err) { alert(err instanceof Error ? err.message : "操作失败"); }
      },
    });
  };

  const handleDelete = (p: PromotionData) => {
    setConfirmAction({
      title: "删除活动",
      message: `确定要删除活动「${p.name}」吗？此操作不可撤销。`,
      onConfirm: async () => {
        try { await deletePromotion(p.id); fetchPromotions(); }
        catch (err) { alert(err instanceof Error ? err.message : "删除失败"); }
      },
    });
  };

  const formatBonus = (p: PromotionData) => {
    if (p.bonusType === "FIXED") return `¥${formatAmount(p.bonusValue)}`;
    return `${(p.bonusValue / 100).toFixed(0)}%${p.maxBonus ? ` (上限¥${formatAmount(p.maxBonus)})` : ""}`;
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex">
      <aside className="w-[220px] bg-white border-r border-gray-100 flex flex-col fixed top-0 left-0 bottom-0 z-30">
        <div className="h-16 flex items-center px-5 border-b border-gray-100">
          <ToAiAPILogo size={28} /><span className="ml-2.5 text-[15px] font-semibold text-gray-800">ToAIAPI</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {sidebarSections.map((section) => (
            <div key={section.title} className="mb-2">
              <div className="px-5 py-1.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider">{section.title}</div>
              {section.items.map((item) => (
                <a key={item.href} href={item.href} className={`flex items-center gap-2.5 px-5 py-2 text-[13px] transition-colors ${item.active ? "text-primary bg-primary-50 font-medium" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}>
                  {item.icon}{item.label}
                </a>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex-1 ml-[220px]">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button className="p-1.5 hover:bg-gray-100 rounded-lg lg:hidden"><IconMenu size={20} className="text-gray-500" /></button>
            <h1 className="text-base font-semibold text-gray-800">赠送活动</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg"><IconSearch size={18} className="text-gray-400" /></button>
            <button className="p-2 hover:bg-gray-100 rounded-lg"><IconBell size={18} className="text-gray-400" /></button>
            <button className="p-2 hover:bg-gray-100 rounded-lg"><IconSettings size={18} className="text-gray-400" /></button>
            <div className="relative ml-1">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">{initial}</div>
                <IconChevronDown size={14} className="text-gray-400" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">{displayName}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                  <button onClick={() => logout()} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">退出登录</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div />
            <button onClick={() => setFormPromotion(null)} className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-600">+ 新建活动</button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
              <span className="text-sm text-red-600">{error}</span>
              <button onClick={fetchPromotions} className="text-sm text-primary hover:underline">重试</button>
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="font-normal text-left px-4 py-3 text-[13px]">活动名称</th>
                  <th className="font-normal text-left px-4 py-3 text-[13px]">条件</th>
                  <th className="font-normal text-left px-4 py-3 text-[13px]">赠送</th>
                  <th className="font-normal text-left px-4 py-3 text-[13px]">时间</th>
                  <th className="font-normal text-left px-4 py-3 text-[13px]">状态</th>
                  <th className="font-normal text-right px-4 py-3 text-[13px]">操作</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-sm text-gray-500">加载中...</p></td></tr>
                ) : promotions.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">暂无活动</td></tr>
                ) : promotions.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-[13px]">
                      <div className="text-gray-800 font-medium">{p.name}</div>
                      {p.description && <div className="text-xs text-gray-400 mt-0.5">{p.description}</div>}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-600">充值 ≥ ¥{formatAmount(p.minAmount)}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-800 font-medium">{formatBonus(p)}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-500 text-xs">
                      <div>{formatDate(p.startAt)}</div>
                      {p.endAt && <div>至 {formatDate(p.endAt)}</div>}
                      {!p.endAt && <div className="text-gray-400">永久</div>}
                    </td>
                    <td className="px-4 py-3 text-[13px]">
                      <span className={`inline-flex items-center gap-1.5 ${p.isActive ? "text-success" : "text-gray-400"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? "bg-success" : "bg-gray-400"}`} />
                        {p.isActive ? "启用" : "禁用"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleToggle(p)} className={`px-2 py-1 text-xs rounded ${p.isActive ? "text-warning hover:bg-warning/10" : "text-success hover:bg-success/10"}`}>
                          {p.isActive ? "禁用" : "启用"}
                        </button>
                        <button onClick={() => setFormPromotion(p)} className="px-2 py-1 text-xs text-primary hover:bg-primary-50 rounded">编辑</button>
                        <button onClick={() => handleDelete(p)} className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded">删除</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span>共 {total} 条，第 {page}/{totalPages} 页</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50">上一页</button>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50">下一页</button>
              </div>
            </div>
          )}
        </main>
      </div>

      {formPromotion !== undefined && (
        <PromotionFormModal promotion={formPromotion} onClose={() => setFormPromotion(undefined)} onSaved={() => { setFormPromotion(undefined); fetchPromotions(); }} />
      )}
      {confirmAction && <ConfirmModal action={confirmAction} onClose={() => setConfirmAction(null)} />}
    </div>
  );
}
