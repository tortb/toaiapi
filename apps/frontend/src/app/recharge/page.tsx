"use client";

/**
 * 充值中心（用户端）
 *
 * /recharge — 快捷金额、赠送活动、支付方式选择
 * 支持订单状态轮询，支付成功后自动刷新余额
 */

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import UserConsoleLayout from "@/components/dashboard/layout/UserConsoleLayout";
import {
  getBalanceStats,
  getPaymentMethods,
  getActivePromotions,
  createOrder,
  getOrderStatus,
  formatAmount,
  formatNumber,
  type BalanceStats,
  type PaymentMethod,
  type ActivePromotion,
} from "@/lib/payment-api";

/* ============== 快捷金额 ============== */
const QUICK_AMOUNTS = [10, 20, 30, 50, 100, 200, 300, 500, 1000];

/* ============== 支付方式图标 ============== */
function PaymentIcon({ method }: { method: string }) {
  const icons: Record<string, string> = {
    EPAY_ALIPAY: "💙",
    EPAY_WECHAT: "💚",
    ALIPAY: "💙",
    WECHAT_PAY: "💚",
  };
  return <span className="text-lg">{icons[method] ?? "💳"}</span>;
}

/* ============== 订单状态显示 ============== */
function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: "待支付", color: "text-warning", bg: "bg-warning/10" },
    PAID: { label: "已支付", color: "text-success", bg: "bg-success/10" },
    FAILED: { label: "支付失败", color: "text-red-600", bg: "bg-red-50" },
    CANCELLED: { label: "已取消", color: "text-gray-500", bg: "bg-gray-100" },
    EXPIRED: { label: "已过期", color: "text-gray-400", bg: "bg-gray-100" },
  };
  const s = map[status] ?? { label: status, color: "text-gray-500", bg: "bg-gray-100" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${s.bg} ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "PAID" ? "bg-success" : status === "PENDING" ? "bg-warning" : "bg-gray-400"}`} />
      {s.label}
    </span>
  );
}

/* ============== 主页面 ============== */
export default function RechargePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [stats, setStats] = React.useState<BalanceStats | null>(null);
  const [methods, setMethods] = React.useState<PaymentMethod[]>([]);
  const [promotions, setPromotions] = React.useState<ActivePromotion[]>([]);
  const [selectedAmount, setSelectedAmount] = React.useState<number>(100);
  const [customAmount, setCustomAmount] = React.useState("");
  const [isCustom, setIsCustom] = React.useState(false);
  const [selectedMethod, setSelectedMethod] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // 订单状态
  const [orderNo, setOrderNo] = React.useState<string | null>(null);
  const [orderStatus, setOrderStatus] = React.useState<string | null>(null);
  const [payUrl, setPayUrl] = React.useState<string | null>(null);
  const [pollCount, setPollCount] = React.useState(0);

  // 计算赠送金额
  const getBonus = (promo: ActivePromotion, amount: number): number => {
    if (promo.bonusType === "FIXED") return promo.bonusValue;
    let bonus = Math.floor(amount * promo.bonusValue / 10000);
    if (promo.maxBonus && bonus > promo.maxBonus) bonus = promo.maxBonus;
    return bonus;
  };

  const currentAmount = isCustom ? (parseFloat(customAmount) || 0) : selectedAmount;

  // 找到最佳赠送活动（基于 currentAmount）
  const bestPromotion = promotions.length > 0 ? promotions.reduce((best, p) => {
    if (currentAmount < p.minAmount) return best;
    const bonus = getBonus(p, currentAmount);
    const bestBonus = best ? getBonus(best, currentAmount) : 0;
    return bonus > bestBonus ? p : best;
  }, null as ActivePromotion | null) : null;

  const bonusAmount = bestPromotion ? getBonus(bestPromotion, currentAmount) : 0;

  // 加载初始数据
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [statsData, methodsData, promosData] = await Promise.all([
          getBalanceStats(),
          getPaymentMethods(),
          getActivePromotions(),
        ]);
        setStats(statsData);
        setMethods(methodsData);
        setPromotions(promosData);
        if (methodsData.length > 0 && !selectedMethod) {
          setSelectedMethod(methodsData[0].name);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated, router]);

  // 订单状态轮询
  React.useEffect(() => {
    if (!orderNo || orderStatus === "PAID" || orderStatus === "FAILED" || orderStatus === "CANCELLED") {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const order = await getOrderStatus(orderNo);
        setOrderStatus(order.status);
        setPollCount((c) => c + 1);

        if (order.status === "PAID") {
          // 支付成功，刷新余额
          const newStats = await getBalanceStats();
          setStats(newStats);
          clearInterval(pollInterval);
        }

        // 轮询 60 次（约 3 分钟）后停止
        if (pollCount > 60) {
          clearInterval(pollInterval);
        }
      } catch {
        // 静默失败，继续轮询
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [orderNo, orderStatus, pollCount]);

  const handleSubmit = async () => {
    if (currentAmount < 0.01) {
      setError("充值金额最低 0.01 元");
      return;
    }
    if (!selectedMethod) {
      setError("请选择支付方式");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await createOrder(currentAmount, selectedMethod);
      setOrderNo(result.orderNo);
      setOrderStatus("PENDING");
      setPayUrl(result.payUrl);
      setPollCount(0);
      if (result.payUrl) {
        window.open(result.payUrl, "_blank");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建订单失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 重新充值（重置订单状态）
  const handleNewOrder = () => {
    setOrderNo(null);
    setOrderStatus(null);
    setPayUrl(null);
    setPollCount(0);
    setError(null);
  };

  if (isLoading) {
    return (
      <UserConsoleLayout>
        <div className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </UserConsoleLayout>
    );
  }

  return (
    <UserConsoleLayout>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 余额卡片 */}
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-6 text-white mb-6">
          <p className="text-sm opacity-80 mb-1">当前余额</p>
          <p className="text-3xl font-bold">¥{formatAmount(stats?.balance.available ?? 0)}</p>
          <div className="flex gap-6 mt-4 text-sm opacity-80">
            <span>本月消费: ¥{formatAmount(stats?.monthlySpend ?? 0)}</span>
            <span>本月充值: ¥{formatAmount(stats?.monthlyRecharge ?? 0)}</span>
            <span>本月调用: {formatNumber(stats?.monthlyRequests ?? 0)} 次</span>
          </div>
        </div>

        {/* 订单状态面板 */}
        {orderNo && (
          <div className={`border rounded-lg p-5 mb-6 ${
            orderStatus === "PAID"
              ? "bg-success/5 border-success/20"
              : orderStatus === "PENDING"
              ? "bg-warning/5 border-warning/20"
              : "bg-red-50 border-red-200"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-medium text-gray-900">订单状态</h3>
                <OrderStatusBadge status={orderStatus || "PENDING"} />
              </div>
              {orderStatus === "PENDING" && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-3 h-3 border-2 border-warning border-t-transparent rounded-full animate-spin" />
                  等待支付结果...
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div>
                <span className="text-gray-500">订单号</span>
                <p className="font-mono text-gray-800">{orderNo}</p>
              </div>
              <div>
                <span className="text-gray-500">充值金额</span>
                <p className="text-gray-800 font-medium">¥{formatAmount(currentAmount)}</p>
              </div>
            </div>

            {orderStatus === "PAID" && (
              <div className="p-3 bg-success/10 rounded-lg text-sm text-success font-medium mb-3">
                ✅ 支付成功！余额已更新为 ¥{formatAmount(stats?.balance.available ?? 0)}
              </div>
            )}

            {orderStatus === "PENDING" && payUrl && (
              <div className="flex items-center gap-3">
                <a
                  href={payUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-600 transition"
                >
                  前往支付
                </a>
                <button
                  onClick={handleNewOrder}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  取消订单
                </button>
              </div>
            )}

            {(orderStatus === "FAILED" || orderStatus === "CANCELLED" || orderStatus === "EXPIRED") && (
              <button
                onClick={handleNewOrder}
                className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-600 transition"
              >
                重新充值
              </button>
            )}

            {orderStatus === "PAID" && (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/billing"
                  className="px-4 py-2 text-sm text-primary border border-primary rounded-lg hover:bg-primary-50 transition"
                >
                  查看账单
                </Link>
                <button
                  onClick={handleNewOrder}
                  className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-600 transition"
                >
                  继续充值
                </button>
              </div>
            )}
          </div>
        )}

        {/* 赠送活动 */}
        {promotions.length > 0 && (
          <div className="bg-orange/5 border border-orange/20 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-orange mb-2">🎁 充值赠送活动</h3>
            <div className="space-y-1">
              {promotions.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">
                    {p.name}
                    {p.description && <span className="text-gray-400 ml-1">({p.description})</span>}
                  </span>
                  <span className="text-orange font-medium">
                    充 ≥ ¥{formatAmount(p.minAmount)} 送 {p.bonusType === "FIXED" ? `¥${formatAmount(p.bonusValue)}` : `${(p.bonusValue / 100).toFixed(0)}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 选择金额 */}
        <div className="bg-white rounded-lg border border-gray-100 p-6 mb-6">
          <h3 className="text-sm font-medium text-gray-800 mb-4">选择充值金额</h3>
          <div className="grid grid-cols-5 gap-3 mb-4">
            {QUICK_AMOUNTS.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount);
                  setIsCustom(false);
                  setCustomAmount("");
                }}
                className={`py-3 rounded-lg text-center transition-colors ${
                  !isCustom && selectedAmount === amount
                    ? "bg-primary text-white"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="text-lg font-semibold">¥{amount}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCustom(true)}
              className={`px-4 py-2 rounded-lg text-sm ${isCustom ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}
            >
              自定义
            </button>
            {isCustom && (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-gray-500">¥</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="输入金额，如 150"
                  min={0.01}
                  step={0.01}
                  autoFocus
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            )}
          </div>

          {/* 赠送预览 */}
          {bestPromotion && currentAmount >= bestPromotion.minAmount && (
            <div className="mt-4 p-3 bg-orange/5 rounded-lg text-sm">
              <span className="text-orange font-medium">
                🎁 充值 ¥{formatAmount(currentAmount)} 可获赠 ¥{formatAmount(bonusAmount)}
              </span>
              <span className="text-gray-500 ml-1">({bestPromotion.name})</span>
            </div>
          )}
        </div>

        {/* 选择支付方式 */}
        <div className="bg-white rounded-lg border border-gray-100 p-6 mb-6">
          <h3 className="text-sm font-medium text-gray-800 mb-4">选择支付方式</h3>
          <div className="space-y-3">
            {methods.map((m) => (
              <label
                key={m.name}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedMethod === m.name ? "border-primary bg-primary-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={m.name}
                  checked={selectedMethod === m.name}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-4 h-4 text-primary"
                />
                <PaymentIcon method={m.name} />
                <span className="text-sm text-gray-700">{m.displayName}</span>
              </label>
            ))}
            {methods.length === 0 && (
              <p className="text-sm text-gray-400">暂无可用支付方式</p>
            )}
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* 提交按钮（仅在没有活跃订单时显示） */}
        {!orderNo && (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || currentAmount < 0.01 || !selectedMethod}
            className="w-full py-3 bg-primary text-white text-base font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "创建订单中..." : `确认充值 ¥${formatAmount(currentAmount)}${bonusAmount > 0 ? ` (含赠送 ¥${formatAmount(bonusAmount)})` : ""}`}
          </button>
        )}
      </div>
    </UserConsoleLayout>
  );
}
