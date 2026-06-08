"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Check, CreditCard, Gift, Wallet } from "lucide-react";
import alipayLogo from "../../../../../../assets/payment/AliPay.svg";
import wechatPayLogo from "../../../../../../assets/payment/WeChatPay.svg";
import { createOrder, getActivePromotions, getBalance, getPaymentMethods, redeemCode, type ActivePromotion, type BalanceInfo, type PaymentMethod } from "@/lib/payment-api";

const PRESET_AMOUNTS = [10, 20, 50, 100, 300, 500] as const;

type AmountPreset = number | "custom";

function imageSrc(asset: string | { src: string }) {
  return typeof asset === "string" ? asset : asset.src;
}

const METHOD_LOGOS = {
  alipay: imageSrc(alipayLogo),
  wechat: imageSrc(wechatPayLogo),
};

function yuan(value?: number, digits = 2) {
  return `¥${(value ?? 0).toLocaleString("zh-CN", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

function methodMeta(method: PaymentMethod) {
  const key = method.name.toLowerCase();
  if (key.includes("alipay")) return { label: method.displayName || "支付宝", logo: METHOD_LOGOS.alipay };
  if (key.includes("wechat") || key.includes("weixin")) return { label: method.displayName || "微信支付", logo: METHOD_LOGOS.wechat };
  return { label: method.displayName || method.name, logo: "" };
}

export default function RechargePage() {
  const [balance, setBalance] = useState<BalanceInfo | null>(null);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [promotions, setPromotions] = useState<ActivePromotion[]>([]);
  const [amount, setAmount] = useState(50);
  const [preset, setPreset] = useState<AmountPreset>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [method, setMethod] = useState("");
  const [redeem, setRedeem] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const selectedMethod = useMemo(() => methods.find((item) => item.name === method), [method, methods]);

  async function loadBase() {
    setLoading(true);
    setError("");
    try {
      const [balanceData, methodData] = await Promise.all([getBalance(), getPaymentMethods()]);
      setBalance(balanceData);
      setMethods(methodData);
      setMethod((current) => current || methodData[0]?.name || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadBase(); }, []);

  useEffect(() => {
    let cancelled = false;
    if (!Number.isFinite(amount) || amount <= 0) {
      setPromotions([]);
      return;
    }
    getActivePromotions(amount).then((data) => {
      if (!cancelled) setPromotions(data);
    }).catch(() => {
      if (!cancelled) setPromotions([]);
    });
    return () => { cancelled = true; };
  }, [amount]);

  function selectPreset(value: AmountPreset) {
    setPreset(value);
    setError("");
    if (value === "custom") {
      const nextAmount = Number(customAmount);
      setAmount(Number.isFinite(nextAmount) && nextAmount > 0 ? nextAmount : 0);
      return;
    }
    setAmount(value);
  }

  function handleCustomAmount(value: string) {
    setCustomAmount(value);
    setPreset("custom");
    const nextAmount = Number(value);
    setAmount(Number.isFinite(nextAmount) && nextAmount > 0 ? nextAmount : 0);
  }

  async function handleOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!method) return;
    if (!Number.isFinite(amount) || amount < 0.01) {
      setError("请输入有效的充值金额");
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      const order = await createOrder(amount, method);
      if (order.payUrl) window.location.href = order.payUrl;
      else setMessage(`订单已创建：${order.orderNo}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建订单失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRedeem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!redeem.trim()) return;
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      const result = await redeemCode(redeem.trim());
      setMessage(`兑换成功，到账 ${yuan(result.amount / 100)}`);
      setRedeem("");
      await loadBase();
    } catch (err) {
      setError(err instanceof Error ? err.message : "兑换失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="page-title">充值中心</h1>
        <p className="page-subtitle">充值余额或使用兑换码</p>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {message && <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <section className="bg-white border border-[var(--line)] rounded-lg p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-[var(--text-secondary)]">可用余额</div>
            <Wallet className="w-4 h-4 text-[var(--text-secondary)]" />
          </div>
          <div className="mt-2 text-3xl font-bold">{yuan(balance?.available)}</div>
          <div className="mt-1 text-xs text-[var(--text-muted)]">冻结 {yuan(balance?.frozen)}</div>
        </section>

        <form onSubmit={handleOrder} className="xl:col-span-2 bg-white border border-[var(--line)] rounded-lg p-5 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">在线充值</h2>
            {selectedMethod && <span className="text-xs text-[var(--text-secondary)]">当前方式：{methodMeta(selectedMethod).label}</span>}
          </div>

          <div>
            <div className="mb-2 text-sm text-[var(--text-secondary)]">充值金额</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2">
              {PRESET_AMOUNTS.map((value) => (
                <button type="button" key={value} onClick={() => selectPreset(value)} className={`h-12 rounded-md border text-sm font-medium transition-colors ${preset === value ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]" : "border-[var(--line)] bg-white text-[var(--foreground)] hover:bg-[var(--surface-soft)]"}`}>
                  ¥{value}
                </button>
              ))}
              <button type="button" onClick={() => selectPreset("custom")} className={`h-12 rounded-md border text-sm font-medium transition-colors ${preset === "custom" ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]" : "border-[var(--line)] bg-white text-[var(--foreground)] hover:bg-[var(--surface-soft)]"}`}>自定义</button>
            </div>
            {preset === "custom" && (
              <label className="mt-3 block">
                <span className="text-sm text-[var(--text-secondary)]">自定义金额（元）</span>
                <input type="number" min="0.01" step="0.01" value={customAmount} onChange={(event) => handleCustomAmount(event.target.value)} className="mt-1 w-full px-3 py-2.5 border border-[var(--line)] rounded-md text-sm outline-none focus:border-[var(--accent)]" placeholder="请输入充值金额" />
              </label>
            )}
          </div>

          <div>
            <div className="mb-2 text-sm text-[var(--text-secondary)]">支付方式</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {loading ? <div className="text-sm text-[var(--text-secondary)]">加载中...</div> : methods.length === 0 ? <div className="text-sm text-[var(--text-secondary)]">暂无可用支付方式</div> : methods.map((item) => {
                const meta = methodMeta(item);
                const active = method === item.name;
                return (
                  <button type="button" key={item.name} onClick={() => setMethod(item.name)} className={`flex h-16 items-center gap-3 rounded-md border px-4 text-left transition-colors ${active ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]" : "border-[var(--line)] bg-white hover:bg-[var(--surface-soft)]"}`}>
                    {meta.logo ? <img src={meta.logo} alt={meta.label} className="h-8 w-8 object-contain" /> : <CreditCard className="h-8 w-8 text-[var(--text-secondary)]" />}
                    <span className="flex-1 text-sm font-medium">{meta.label}</span>
                    {active && <Check className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </div>

          {promotions.length > 0 && (
            <div className="rounded-md bg-[var(--surface-soft)] p-3 text-sm text-[var(--text-secondary)]">
              <div className="mb-1 flex items-center gap-2 font-medium text-[var(--foreground)]"><Gift className="w-4 h-4" />当前可用活动</div>
              {promotions.map((item) => item.name).join("、")}
            </div>
          )}

          <button disabled={submitting || !method || amount < 0.01} className="notion-btn-primary px-4 py-2.5 text-sm disabled:opacity-60">{submitting ? "创建中" : `创建 ${yuan(amount, 2)} 支付订单`}</button>
        </form>
      </div>

      <form onSubmit={handleRedeem} className="bg-white border border-[var(--line)] rounded-lg p-5 flex flex-col md:flex-row gap-3">
        <input value={redeem} onChange={(event) => setRedeem(event.target.value)} className="flex-1 px-3 py-2.5 border border-[var(--line)] rounded-md text-sm outline-none focus:border-[var(--accent)]" placeholder="输入兑换码" />
        <button disabled={submitting || !redeem.trim()} className="notion-btn-secondary px-4 py-2.5 text-sm disabled:opacity-60">兑换</button>
      </form>
    </div>
  );
}
