"use client";

/**
 * 充值记录页（Admin）
 *
 * /admin/recharges — 查看所有充值订单
 */

import * as React from "react";
import {
  getOrders,
  formatAmount,
  formatDate,
  getOrderStatusLabel,
  getPaymentMethodLabel,
  type OrderAdminData,
} from "@/lib/admin-api";
import { IconSearch } from "@/components/PixelIcons";
import { AdminShell } from "@/components/admin/AdminShell";

export default function RechargesPage() {
  const [orders, setOrders] = React.useState<OrderAdminData[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchOrders = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getOrders({ page, pageSize: 20, search: search || undefined, status: filterStatus || undefined });
      setOrders(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, filterStatus]);

  React.useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <AdminShell title="充值记录">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative w-72">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="搜索订单号/用户..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
            <option value="">全部状态</option>
            <option value="PENDING">待支付</option>
            <option value="PAID">已支付</option>
            <option value="FAILED">支付失败</option>
            <option value="CANCELLED">已取消</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchOrders} className="text-sm text-primary hover:underline">重试</button>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
              <th className="font-normal text-left px-4 py-3 text-[13px]">订单号</th>
              <th className="font-normal text-left px-4 py-3 text-[13px]">用户</th>
              <th className="font-normal text-right px-4 py-3 text-[13px]">金额</th>
              <th className="font-normal text-left px-4 py-3 text-[13px]">支付方式</th>
              <th className="font-normal text-left px-4 py-3 text-[13px]">状态</th>
              <th className="font-normal text-left px-4 py-3 text-[13px]">创建时间</th>
              <th className="font-normal text-left px-4 py-3 text-[13px]">支付时间</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-sm text-gray-500">加载中...</p></td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">暂无数据</td></tr>
            ) : orders.map((o) => {
              const s = getOrderStatusLabel(o.status);
              return (
                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-[13px] font-mono text-gray-800">{o.orderNo}</td>
                  <td className="px-4 py-3 text-[13px]">
                    <div className="text-gray-800">{o.userName || "-"}</div>
                    <div className="text-xs text-gray-400">{o.userEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-right text-gray-800 font-mono">¥{formatAmount(o.amount)}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-600">{getPaymentMethodLabel(o.paymentMethod)}</td>
                  <td className="px-4 py-3 text-[13px]">
                    <span className={`inline-flex items-center gap-1.5 ${s.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dotColor}`} />{s.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-500 font-mono">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-500 font-mono">{o.paidAt ? formatDate(o.paidAt) : "-"}</td>
                </tr>
              );
            })}
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
    </AdminShell>
  );
}
