"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/components/dashboard/ui/Toast";
import UserConsoleLayout from "@/components/dashboard/layout/UserConsoleLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  CreditCard,
  History,
  Ticket,
  ChevronRight,
} from "lucide-react";
import {
  getBalanceStats,
  getPaymentMethods,
  getDiscounts,
  getInviteStats,
  createOrder,
  redeemCode,
  type BalanceStats,
  type PaymentMethod,
  type DiscountTier,
  type InviteStats,
} from "@/lib/payment-api";

import { BalanceDisplay } from "@/components/recharge/BalanceDisplay";
import { RechargeTypeSelector } from "@/components/recharge/RechargeTypeSelector";
import { PaymentMethodSelector } from "@/components/recharge/PaymentMethodSelector";
import { InviteRewards } from "@/components/recharge/InviteRewards";

export default function RechargePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { toast } = useToast();

  const [stats, setStats] = React.useState<BalanceStats | null>(null);
  const [methods, setMethods] = React.useState<PaymentMethod[]>([]);
  const [discounts, setDiscounts] = React.useState<DiscountTier[]>([]);
  const [inviteStats, setInviteStats] = React.useState<InviteStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedAmount, setSelectedAmount] = React.useState(100);
  const [customAmount, setCustomAmount] = React.useState("");
  const [selectedMethod, setSelectedMethod] = React.useState("ALIPAY");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [redeemCodeValue, setRedeemCodeValue] = React.useState("");
  const [isRedeeming, setIsRedeeming] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [statsData, methodsData, discountsData, inviteData] =
          await Promise.all([
            getBalanceStats(),
            getPaymentMethods(),
            getDiscounts().catch(() => []),
            getInviteStats().catch(() => null),
          ]);
        setStats(statsData);
        setMethods(methodsData);
        setDiscounts(discountsData);
        setInviteStats(inviteData);
        if (methodsData.length > 0) setSelectedMethod(methodsData[0].name);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "加载数据失败";
        toast("error", message);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated, router, toast]);

  const handleSubmit = async () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (amount < 0.01) {
      toast("error", "金额无效");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createOrder(amount, selectedMethod);
      if (result.payUrl) {
        window.open(result.payUrl, "_blank");
        toast("info", "请在打开的窗口中完成支付");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "创建订单失败";
      toast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRedeem = async () => {
    if (!redeemCodeValue.trim()) return;
    setIsRedeeming(true);
    try {
      const result = await redeemCode(redeemCodeValue.trim());
      toast("success", `兑换成功！获得 ¥${(result.amount / 100).toFixed(2)}`);
      setRedeemCodeValue("");
      // 刷新余额
      const statsData = await getBalanceStats();
      setStats(statsData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "兑换失败";
      toast("error", message);
    } finally {
      setIsRedeeming(false);
    }
  };

  // 构建折扣选项
  const rechargeOptions = React.useMemo(() => {
    if (discounts.length > 0) {
      return discounts.map((d) => ({
        amount: d.amount,
        discount: d.label || `${(d.discount * 100).toFixed(1)}折`,
      }));
    }
    // 默认选项
    return [
      { amount: 50, discount: "9.9折" },
      { amount: 100, discount: "9.8折", popular: true },
      { amount: 200, discount: "9.7折" },
      { amount: 500, discount: "9.5折" },
      { amount: 1000, discount: "9.2折" },
      { amount: 2000, discount: "9.0折" },
      { amount: 5000, discount: "8.5折" },
      { amount: 10000, discount: "8.0折" },
    ];
  }, [discounts]);

  if (isLoading) {
    return (
      <UserConsoleLayout>
        <div className="mx-auto max-w-5xl px-4 py-12">
          <Skeleton className="h-[200px] w-full rounded-3xl mb-8" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      </UserConsoleLayout>
    );
  }

  return (
    <UserConsoleLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            账户充值
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            为您的账户充值额度，即刻开启 AI 生产力之旅。
          </p>
        </div>

        <div className="space-y-8">
          {/* Balance Section */}
          <BalanceDisplay
            balance={stats?.balance.available || 0}
            monthlyRecharge={stats?.monthlyRecharge || 0}
            monthlySpend={stats?.monthlySpend || 0}
          />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Main Recharge Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Amount Selection */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-semibold text-neutral-900">
                    1. 选择充值金额
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400">
                      自定义金额
                    </span>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          if (e.target.value) setSelectedAmount(0);
                        }}
                        className="h-8 w-24 pl-6 text-xs"
                      />
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400">
                        ¥
                      </span>
                    </div>
                  </div>
                </div>

                <RechargeTypeSelector
                  options={rechargeOptions}
                  selectedAmount={selectedAmount}
                  onSelect={(amt) => {
                    setSelectedAmount(amt);
                    setCustomAmount("");
                  }}
                />
              </div>

              {/* Payment Method */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-neutral-900 mb-6">
                  2. 选择支付方式
                </h3>
                <PaymentMethodSelector
                  methods={[
                    {
                      id: "ALIPAY",
                      name: "支付宝支付",
                      icon: (
                        <div className="text-blue-500 font-bold">支</div>
                      ),
                      color: "blue",
                    },
                    {
                      id: "WECHAT_PAY",
                      name: "微信支付",
                      icon: (
                        <div className="text-emerald-500 font-bold">微</div>
                      ),
                      color: "emerald",
                    },
                  ]}
                  selectedId={selectedMethod}
                  onSelect={setSelectedMethod}
                />
              </div>

              {/* Summary & Submit */}
              <div className="rounded-2xl border-2 border-blue-600 bg-blue-50/30 p-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-blue-600 uppercase tracking-widest">
                      支付详情摘要
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-neutral-900">
                        ¥
                        {(
                          customAmount
                            ? parseFloat(customAmount)
                            : selectedAmount
                        ).toFixed(2)}
                      </span>
                      <span className="text-sm text-neutral-500 font-medium">
                        实付总额
                      </span>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className="h-14 px-12 rounded-xl bg-blue-600 text-base font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                    onClick={handleSubmit}
                    loading={isSubmitting}
                  >
                    立即去支付
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar Tools */}
            <div className="space-y-8">
              {/* Redeem Code */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <Ticket className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900">
                    使用兑换码
                  </h3>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="输入充值卡密..."
                    value={redeemCodeValue}
                    onChange={(e) => setRedeemCodeValue(e.target.value)}
                    className="h-10 text-xs"
                  />
                  <Button
                    variant="secondary"
                    className="h-10 px-4"
                    onClick={handleRedeem}
                    loading={isRedeeming}
                  >
                    兑换
                  </Button>
                </div>
              </div>

              {/* Invite Rewards */}
              <InviteRewards
                stats={{
                  pendingReward: inviteStats
                    ? inviteStats.pendingReward / 100
                    : 0,
                  totalReward: inviteStats
                    ? inviteStats.totalReward / 100
                    : 0,
                  inviteCount: inviteStats?.inviteCount || 0,
                  rewardRatio: inviteStats?.rewardRatio || 10,
                }}
                inviteUrl={
                  inviteStats?.inviteUrl ||
                  `https://toaiapi.com/register?aff=${user?.id || "default"}`
                }
              />

              {/* Recharge History Link */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50 text-neutral-500">
                      <History className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-neutral-900">
                      充值记录
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/dashboard/billing")}
                  >
                    查看全部
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserConsoleLayout>
  );
}
