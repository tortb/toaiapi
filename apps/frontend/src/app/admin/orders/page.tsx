"use client";

/**
 * 订单管理页面
 *
 * 展示所有订单，支持搜索、筛选、分页。
 */

import * as React from "react";
import {
  getOrders,
  formatDate,
  formatAmount,
  getOrderStatusLabel,
  getPaymentMethodLabel,
  type OrderAdminData,
  type PaginatedResponse,
} from "@/lib/admin-api";
import { IconSearch } from "@/components/PixelIcons";
import { AdminShell } from "@/components/admin/AdminShell";

export default function OrdersPage() {
  const [data, setData] = React.useState<PaginatedResponse<OrderAdminData> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // 筛选状态
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(20);

  // 加载订单列表
  const fetchOrders = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getOrders({
        page,
        pageSize,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, statusFilter]);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // 搜索防抖
  const [searchInput, setSearchInput] = React.useState("");
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <AdminShell title="订单管理">
      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchOrders} className="text-sm text-primary hover:underline">
            重试
          </button>
        </div>
      )}

      {/* 筛选区 */}
      <div className="bg-white rounded-lg border border-gray-100 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* 搜索框 */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="搜索订单号 / 产品名 / 用户邮箱..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* 状态筛选 */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">所有状态</option>
            <option value="PENDING">待支付</option>
            <option value="PAID">已支付</option>
            <option value="FAILED">支付失败</option>
            <option value="REFUNDED">已退款</option>
            <option value="CANCELLED">已取消</option>
          </select>

          {/* 刷新按钮 */}
          <button
            onClick={fetchOrders}
            disabled={isLoading}
            className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-600 disabled:opacity-50"
          >
            刷新
          </button>
        </div>
      </div>

      {/* 订单表格 */}
      <div className="bg-white rounded-lg border border-gray-100">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">加载中...</p>
          </div>
        ) : data && data.items.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="text-left font-normal px-4 py-3">订单号</th>
                    <th className="text-left font-normal px-4 py-3">用户</th>
                    <th className="text-left font-normal px-4 py-3">产品</th>
                    <th className="text-right font-normal px-4 py-3">金额</th>
                    <th className="text-left font-normal px-4 py-3">支付方式</th>
                    <th className="text-left font-normal px-4 py-3">状态</th>
                    <th className="text-left font-normal px-4 py-3">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((o) => {
                    const statusInfo = getOrderStatusLabel(o.status);
                    return (
                      <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-mono text-gray-900 text-[12px]">{o.orderNo}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-900">{o.userEmail}</div>
                          {o.userName && (
                            <div className="text-[11px] text-gray-500">{o.userName}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-900">{o.productName}</div>
                          <div className="text-[11px] text-gray-500">{o.productType}</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="font-medium text-gray-900">¥ {formatAmount(o.amount)}</div>
                          {o.paidAmount && o.paidAmount !== o.amount && (
                            <div className="text-[11px] text-gray-500">
                              实付: ¥ {formatAmount(o.paidAmount)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {getPaymentMethodLabel(o.paymentMethod)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 ${statusInfo.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`} />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-[12px]">
                          {formatDate(o.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {data.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  共 {data.total} 条，第 {data.page}/{data.totalPages} 页
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一页
                  </button>
                  <button
                    onClick={() => setPage(Math.min(data.totalPages, page + 1))}
                    disabled={page === data.totalPages}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center text-gray-400">
            <p className="text-sm">暂无订单数据</p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
