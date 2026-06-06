"use client";

/**
 * 账单管理页（Admin）
 *
 * /admin/bills — 查看所有交易流水
 */

import * as React from "react";
import {
  getBills,
  formatAmount,
  formatDate,
  getTransactionTypeLabel,
  type BillAdminData,
} from "@/lib/admin-api";
import { IconSearch } from "@/components/PixelIcons";
import { AdminShell } from "@/components/admin/AdminShell";

export default function BillsPage() {
  const [bills, setBills] = React.useState<BillAdminData[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [filterType, setFilterType] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchBills = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getBills({ page, pageSize: 20, search: search || undefined, type: filterType || undefined });
      setBills(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, filterType]);

  React.useEffect(() => { fetchBills(); }, [fetchBills]);

  return (
    <AdminShell title="账单管理">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative w-72">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="搜索用户..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
          <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
            <option value="">全部类型</option>
            <option value="RECHARGE">充值</option>
            <option value="DEDUCT">消费</option>
            <option value="GIFT">赠送</option>
            <option value="REFUND">退款</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchBills} className="text-sm text-primary hover:underline">重试</button>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
              <th className="font-normal text-left px-4 py-3 text-[13px]">用户</th>
              <th className="font-normal text-left px-4 py-3 text-[13px]">类型</th>
              <th className="font-normal text-right px-4 py-3 text-[13px]">金额</th>
              <th className="font-normal text-right px-4 py-3 text-[13px]">余额</th>
              <th className="font-normal text-left px-4 py-3 text-[13px]">备注</th>
              <th className="font-normal text-left px-4 py-3 text-[13px]">时间</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-sm text-gray-500">加载中...</p></td></tr>
            ) : bills.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">暂无数据</td></tr>
            ) : bills.map((b) => {
              const t = getTransactionTypeLabel(b.type);
              return (
                <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-[13px]">
                    <div className="text-gray-800">{b.userName || "-"}</div>
                    <div className="text-xs text-gray-400">{b.userEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-[13px]"><span className={`inline-block px-2 py-0.5 text-xs rounded ${t.color}`}>{t.label}</span></td>
                  <td className={`px-4 py-3 text-[13px] text-right font-mono ${b.amount >= 0 ? "text-success" : "text-red-600"}`}>
                    {b.amount >= 0 ? "+" : ""}{formatAmount(b.amount)}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-right text-gray-600 font-mono">¥{formatAmount(b.balanceAfter)}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-600 truncate max-w-[200px]">{b.remark || "-"}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-500 font-mono">{formatDate(b.createdAt)}</td>
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
