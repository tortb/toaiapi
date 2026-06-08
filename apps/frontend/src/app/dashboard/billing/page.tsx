"use client";

import { useEffect, useState } from "react";
import { getUserOrders, getOrderStatusLabel, getPaymentMethodLabel, type OrderInfo } from "@/lib/payment-api";
import { useErrorToast } from "@/lib/feedback/use-error-toast";

function yuan(value: number) {
  return `¥${value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function BillingPage() {
  const [orders, setOrders] = useState<OrderInfo[]>([]);
  const [, setError] = useErrorToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getUserOrders(1, 20).then((data) => {
      if (!cancelled) setOrders(data.items);
    }).catch((err) => {
      if (!cancelled) setError(err instanceof Error ? err.message : "加载失败");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div><h1 className="page-title">账单中心</h1><p className="page-subtitle">查看充值订单和支付状态</p></div>
      <div className="bg-white border border-[var(--line)] rounded-lg overflow-x-auto">
        <div className="min-w-[860px]">
          <div className="grid grid-cols-6 px-4 py-3 bg-[var(--surface-soft)] text-xs font-semibold text-[var(--text-muted)]"><div>订单号</div><div>金额</div><div>支付方式</div><div>状态</div><div>支付时间</div><div>创建时间</div></div>
          {loading ? <div className="p-8 text-center text-sm text-[var(--text-secondary)]">加载中...</div> : orders.length === 0 ? <div className="p-8 text-center text-sm text-[var(--text-secondary)]">暂无订单</div> : orders.map((order) => {
            const status = getOrderStatusLabel(order.status);
            return <div key={order.id} className="grid grid-cols-6 px-4 py-3 text-sm border-t border-[var(--line)]"><div className="font-mono text-xs truncate pr-3">{order.orderNo}</div><div>{yuan(order.amount)}</div><div>{getPaymentMethodLabel(order.paymentMethod)}</div><div className={status.color}>{status.label}</div><div className="text-[var(--text-secondary)]">{order.paidAt ? new Date(order.paidAt).toLocaleString("zh-CN") : "-"}</div><div className="text-[var(--text-secondary)]">{new Date(order.createdAt).toLocaleString("zh-CN")}</div></div>;
          })}
        </div>
      </div>
    </div>
  );
}
