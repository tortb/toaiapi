"use client";

/**
 * 充值中心（用户端）
 *
 * /recharge — 快捷金额、赠送活动、支付方式选择
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import {
  getBalance,
  getBalanceStats,
  getPaymentMethods,
  getActivePromotions,
  createOrder,
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
  const [orderResult, setOrderResult] = React.useState<{ orderNo: string; payUrl: string | null } | null>(null);

  // 计算赠送金额
  const getBonus = (promo: ActivePromotion, amount: number): number => {
    if (promo.bonusType === "FIXED") return promo.bonusValue;
    let bonus = Math.floor(amount * promo.bonusValue / 10000);
    if (promo.maxBonus && bonus > promo.maxBonus) bonus = promo.maxBonus;
    return bonus;
  };

  // 找到最佳赠送活动
  const bestPromotion = promotions.length > 0 ? promotions.reduce((best, p) => {
    if (selectedAmount < p.minAmount) return best;
    const bonus = getBonus(p, selectedAmount);
    const bestBonus = best ? getBonus(best, selectedAmount) : 0;
    return bonus > bestBonus ? p : best;
  }, null as ActivePromotion | null) : null;

  const currentAmount = isCustom ? (parseFloat(customAmount) || 0) : selectedAmount;
  const bonusAmount = bestPromotion ? getBonus(bestPromotion, currentAmount) : 0;

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
      setOrderResult({ orderNo: result.orderNo, payUrl: result.payUrl });
      if (result.payUrl) {
        window.open(result.payUrl, "_blank");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建订单失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <h1 className="text-base font-semibold text-gray-800">充值中心</h1>
          <a href="/" className="text-sm text-primary hover:underline">返回首页</a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
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

        {/* 订单结果 */}
        {orderResult && (
          <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-success font-medium">订单已创建</p>
            <p className="text-xs text-gray-600 mt-1">订单号: {orderResult.orderNo}</p>
            {orderResult.payUrl && (
              <a href={orderResult.payUrl} target="_blank" rel="noopener noreferrer"
                className="inline-block mt-2 px-4 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-600">
                前往支付
              </a>
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
                onClick={() => { setSelectedAmount(amount); setIsCustom(false); }}
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
                  placeholder="0.01"
                  min={0.01}
                  step={0.01}
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

        {/* 提交 */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || currentAmount < 0.01 || !selectedMethod}
          className="w-full py-3 bg-primary text-white text-base font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "创建订单中..." : `确认充值 ¥${formatAmount(currentAmount)}${bonusAmount > 0 ? ` (含赠送 ¥${formatAmount(bonusAmount)})` : ""}`}
        </button>
      </main>
    </div>
  );
}
