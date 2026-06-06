"use client";

/**
 * 发票管理页（Admin）
 *
 * /admin/invoices — 发票列表、审核、开具
 */

import * as React from "react";
import {
  getInvoices,
  reviewInvoice,
  issueInvoice,
  deleteInvoice,
  formatAmount,
  formatDate,
  getInvoiceStatusLabel,
  getInvoiceTypeLabel,
  type InvoiceData,
  type ReviewInvoicePayload,
} from "@/lib/admin-api";
import { IconSearch } from "@/components/PixelIcons";
import { AdminShell } from "@/components/admin/AdminShell";

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

/* ============== 审核弹窗 ============== */
function ReviewModal({ invoice, onClose, onReviewed }: { invoice: InvoiceData; onClose: () => void; onReviewed: () => void }) {
  const [remark, setRemark] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleReview = async (status: "APPROVED" | "REJECTED") => {
    setSubmitting(true);
    setError(null);
    try {
      const payload: ReviewInvoicePayload = { status };
      if (remark) payload.review_remark = remark;
      await reviewInvoice(invoice.id, payload);
      onReviewed();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-medium text-gray-900">审核发票 {invoice.invoiceNo}</h3>
        </div>
        <div className="px-6 py-4 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>}
          <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-500">类型</span><span>{getInvoiceTypeLabel(invoice.type)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">金额</span><span className="font-medium">¥{formatAmount(invoice.amount)}</span></div>
            {invoice.companyName && <div className="flex justify-between"><span className="text-gray-500">公司</span><span>{invoice.companyName}</span></div>}
            {invoice.taxId && <div className="flex justify-between"><span className="text-gray-500">税号</span><span>{invoice.taxId}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">申请人</span><span>{invoice.applicantEmail}</span></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">审核备注</label>
            <textarea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="可选" rows={3} maxLength={500}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">取消</button>
          <button onClick={() => handleReview("REJECTED")} disabled={submitting}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
            {submitting ? "处理中..." : "驳回"}
          </button>
          <button onClick={() => handleReview("APPROVED")} disabled={submitting}
            className="px-4 py-2 text-sm text-white bg-success rounded-lg hover:bg-success/90 disabled:opacity-50">
            {submitting ? "处理中..." : "通过"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============== 主页面 ============== */
export default function InvoicesPage() {
  const [invoices, setInvoices] = React.useState<InvoiceData[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("");

  const [reviewInvoice_, setReviewInvoice] = React.useState<InvoiceData | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<ConfirmAction | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchInvoices = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getInvoices({ page, pageSize: 20, status: filterStatus || undefined, search: search || undefined });
      setInvoices(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, filterStatus]);

  React.useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const handleIssue = (inv: InvoiceData) => {
    setConfirmAction({
      title: "开具发票",
      message: `确认已为发票 ${inv.invoiceNo} 开具完成？`,
      confirmText: "确认开具",
      confirmColor: "bg-primary hover:bg-primary-600",
      onConfirm: async () => {
        try { await issueInvoice(inv.id); fetchInvoices(); }
        catch (err) { alert(err instanceof Error ? err.message : "操作失败"); }
      },
    });
  };

  const handleDelete = (inv: InvoiceData) => {
    setConfirmAction({
      title: "删除发票",
      message: `确定要删除发票 ${inv.invoiceNo} 吗？`,
      onConfirm: async () => {
        try { await deleteInvoice(inv.id); fetchInvoices(); }
        catch (err) { alert(err instanceof Error ? err.message : "删除失败"); }
      },
    });
  };

  return (
    <AdminShell title="发票管理">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative w-72">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="搜索发票号/公司/用户..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
            <option value="">全部状态</option>
            <option value="PENDING">待审核</option>
            <option value="APPROVED">已通过</option>
            <option value="REJECTED">已驳回</option>
            <option value="ISSUED">已开具</option>
            <option value="CANCELLED">已取消</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchInvoices} className="text-sm text-primary hover:underline">重试</button>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
              <th className="font-normal text-left px-4 py-3 text-[13px]">发票号</th>
              <th className="font-normal text-left px-4 py-3 text-[13px]">用户</th>
              <th className="font-normal text-left px-4 py-3 text-[13px]">类型</th>
              <th className="font-normal text-left px-4 py-3 text-[13px]">公司/抬头</th>
              <th className="font-normal text-right px-4 py-3 text-[13px]">金额</th>
              <th className="font-normal text-left px-4 py-3 text-[13px]">状态</th>
              <th className="font-normal text-left px-4 py-3 text-[13px]">申请时间</th>
              <th className="font-normal text-right px-4 py-3 text-[13px]">操作</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-sm text-gray-500">加载中...</p></td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">暂无发票</td></tr>
            ) : invoices.map((inv) => {
              const s = getInvoiceStatusLabel(inv.status);
              return (
                <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-[13px] font-mono text-gray-800">{inv.invoiceNo}</td>
                  <td className="px-4 py-3 text-[13px]">
                    <div className="text-gray-800">{inv.userName || "-"}</div>
                    <div className="text-xs text-gray-400">{inv.userEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-600">{getInvoiceTypeLabel(inv.type)}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-600 truncate max-w-[150px]">{inv.companyName || inv.applicantEmail}</td>
                  <td className="px-4 py-3 text-[13px] text-right text-gray-800 font-mono">¥{formatAmount(inv.amount)}</td>
                  <td className="px-4 py-3 text-[13px]">
                    <span className={`inline-flex items-center gap-1.5 ${s.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dotColor}`} />{s.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-500 font-mono">{formatDate(inv.createdAt)}</td>
                  <td className="px-4 py-3 text-[13px] text-right">
                    <div className="flex items-center justify-end gap-1">
                      {inv.status === "PENDING" && (
                        <button onClick={() => setReviewInvoice(inv)} className="px-2 py-1 text-xs text-primary hover:bg-primary-50 rounded">审核</button>
                      )}
                      {inv.status === "APPROVED" && (
                        <button onClick={() => handleIssue(inv)} className="px-2 py-1 text-xs text-success hover:bg-success/10 rounded">开具</button>
                      )}
                      {inv.status !== "ISSUED" && (
                        <button onClick={() => handleDelete(inv)} className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded">删除</button>
                      )}
                    </div>
                  </td>
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

      {reviewInvoice_ && <ReviewModal invoice={reviewInvoice_} onClose={() => setReviewInvoice(null)} onReviewed={() => { setReviewInvoice(null); fetchInvoices(); }} />}
      {confirmAction && <ConfirmModal action={confirmAction} onClose={() => setConfirmAction(null)} />}
    </AdminShell>
  );
}
