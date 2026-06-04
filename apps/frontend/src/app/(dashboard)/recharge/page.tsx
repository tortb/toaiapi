'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import type { Balance, PaymentMethod, RechargeOrder, OrderDetail } from '@/types';
import { formatAmount, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  CreditCard,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Loader2,
  ExternalLink,
} from 'lucide-react';

/** 预设充值金额（元） */
const PRESET_AMOUNTS = [10, 20, 50, 100, 200, 500, 1000];

/** 支付方式图标映射 */
const METHOD_ICONS: Record<string, string> = {
  EPAY_ALIPAY: '支付宝',
  EPAY_WECHAT: '微信支付',
  EPAY_QQ: 'QQ 钱包',
  ALIPAY: '支付宝',
  WECHAT_PAY: '微信支付',
};

/** 订单状态 → Badge variant */
const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  PAID: 'success',
  PENDING: 'warning',
  FAILED: 'destructive',
  CANCELLED: 'secondary',
  REFUNDED: 'secondary',
};

/** 订单状态中文 */
const STATUS_LABEL: Record<string, string> = {
  PAID: '已支付',
  PENDING: '待支付',
  FAILED: '失败',
  CANCELLED: '已取消',
  REFUNDED: '已退款',
};

export default function RechargePage() {
  // ── 余额 ──
  const [balance, setBalance] = useState<Balance | null>(null);

  // ── 充值表单 ──
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  // ── 提交状态 ──
  const [submitting, setSubmitting] = useState(false);
  const [payingOrder, setPayingOrder] = useState<RechargeOrder | null>(null);
  const [pollTimer, setPollTimer] = useState<ReturnType<typeof setInterval> | null>(null);

  // ── 订单列表 ──
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);

  // ── 加载状态 ──
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── 加载数据 ──
  useEffect(() => {
    loadData();
    return () => {
      if (pollTimer) clearInterval(pollTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const [balanceData, methodsData, ordersData] = await Promise.all([
        api.balance.get(),
        api.payment.getMethods(),
        api.payment.getOrders(1, 5),
      ]);
      setBalance(balanceData);
      const methodList = methodsData ?? [];
      setMethods(methodList);
      if (methodList.length > 0 && !selectedMethod) {
        const firstMethod = methodList[0];
        if (firstMethod) setSelectedMethod(firstMethod.name);
      }
      setOrders(ordersData.items ?? []);
      setOrdersTotal(ordersData.total ?? 0);
      setOrdersPage(ordersData.page ?? 1);
      setOrdersTotalPages(ordersData.totalPages ?? 1);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // ── 加载订单列表（翻页） ──
  const loadOrders = useCallback(async (page: number) => {
    try {
      const data = await api.payment.getOrders(page, 5);
      setOrders(data.items);
      setOrdersTotal(data.total);
      setOrdersPage(data.page);
      setOrdersTotalPages(data.totalPages);
    } catch {
      // 静默失败
    }
  }, []);

  // ── 轮询订单状态 ──
  const startPolling = useCallback((orderNo: string) => {
    let elapsed = 0;
    const timer = setInterval(async () => {
      elapsed += 3000;
      if (elapsed > 300000) {
        clearInterval(timer);
        setPollTimer(null);
        setPayingOrder(null);
        return;
      }
      try {
        const order = await api.payment.getOrder(orderNo);
        if (order.status === 'PAID') {
          clearInterval(timer);
          setPollTimer(null);
          setPayingOrder(null);
          // 刷新余额和订单列表
          loadData();
        } else if (order.status === 'FAILED' || order.status === 'CANCELLED') {
          clearInterval(timer);
          setPollTimer(null);
          setPayingOrder(null);
          loadData();
        }
      } catch {
        // 静默失败，继续轮询
      }
    }, 3000);
    setPollTimer(timer);
  }, [loadData]);

  // ── 获取当前充值金额（分） ──
  const getAmountInFen = (): number => {
    if (isCustom) {
      const yuan = parseFloat(customAmount);
      return isNaN(yuan) ? 0 : Math.round(yuan * 100);
    }
    return selectedAmount * 100;
  };

  // ── 提交充值 ──
  const handleRecharge = async () => {
    const amountFen = getAmountInFen();
    if (amountFen < 100) {
      setError('充值金额最低 1 元');
      return;
    }
    if (!selectedMethod) {
      setError('请选择支付方式');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const order = await api.payment.createOrder({
        amount: amountFen,
        paymentMethod: selectedMethod,
      });

      setPayingOrder(order);

      // 处理支付跳转
      if (order.payUrl) {
        if (order.payUrl.trim().startsWith('<')) {
          // HTML form（支付宝页面支付）— 新窗口渲染
          const win = window.open('', '_blank');
          if (win) {
            win.document.write(order.payUrl);
            win.document.close();
          }
        } else {
          // URL 跳转
          window.open(order.payUrl, '_blank');
        }
      }

      // 开始轮询订单状态
      startPolling(order.orderNo);
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建订单失败');
    } finally {
      setSubmitting(false);
    }
  };

  // ── 选择预设金额 ──
  const selectPreset = (yuan: number) => {
    setSelectedAmount(yuan);
    setIsCustom(false);
    setCustomAmount('');
  };

  // ── 切换自定义金额 ──
  const toggleCustom = () => {
    setIsCustom(true);
    setSelectedAmount(0);
  };

  // ── Loading Skeleton ──
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="mb-2 h-7 w-32 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="h-28 animate-pulse rounded-xl border border-border bg-card" />
        <div className="h-48 animate-pulse rounded-xl border border-border bg-card" />
        <div className="h-32 animate-pulse rounded-xl border border-border bg-card" />
        <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    );
  }

  const amountFen = getAmountInFen();
  const canSubmit = amountFen >= 100 && selectedMethod && !submitting && !payingOrder;

  return (
    <div className="space-y-6">
      {/* 错误提示 */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-1 text-xs text-destructive/70 hover:text-destructive"
          >
            关闭
          </button>
        </div>
      )}

      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">充值中心</h1>
        <p className="text-muted-foreground">为账户充值以使用 API 服务</p>
      </div>

      {/* 余额卡片 */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">当前可用余额</p>
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {balance ? formatAmount(balance.available) : '¥0.00'}
            </p>
          </div>
        </div>
      </div>

      {/* 充值金额选择 */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">充值金额</h2>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
          {PRESET_AMOUNTS.map((yuan) => (
            <button
              key={yuan}
              onClick={() => selectPreset(yuan)}
              className={`rounded-lg border px-4 py-3 text-center transition-all duration-150 ${
                !isCustom && selectedAmount === yuan
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-muted/50 text-foreground hover:border-primary/30 hover:bg-primary/5'
              }`}
            >
              <span className="text-lg font-semibold">¥{yuan}</span>
            </button>
          ))}
          {/* 自定义金额按钮 */}
          <button
            onClick={toggleCustom}
            className={`rounded-lg border px-4 py-3 text-center transition-all duration-150 ${
              isCustom
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-muted/50 text-foreground hover:border-primary/30 hover:bg-primary/5'
            }`}
          >
            <span className="text-lg font-semibold">自定义</span>
          </button>
        </div>

        {/* 自定义金额输入 */}
        {isCustom && (
          <div className="mt-4">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">¥</span>
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="输入金额"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-muted/50 pl-8 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">最低充值 1 元</p>
          </div>
        )}
      </div>

      {/* 支付方式 */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">支付方式</h2>
        {methods.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无可用支付方式</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {methods.map((method) => (
              <button
                key={method.name}
                onClick={() => setSelectedMethod(method.name)}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-all duration-150 ${
                  selectedMethod === method.name
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-muted/50 hover:border-primary/30 hover:bg-primary/5'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    selectedMethod === method.name ? 'bg-primary/20' : 'bg-muted'
                  }`}
                >
                  <CreditCard
                    className={`h-4 w-4 ${
                      selectedMethod === method.name ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                </div>
                <span
                  className={`text-sm font-medium ${
                    selectedMethod === method.name ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {method.displayName || METHOD_ICONS[method.name] || method.name}
                </span>
                {selectedMethod === method.name && (
                  <Check className="ml-auto h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 确认支付 */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">充值金额</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {amountFen >= 100 ? formatAmount(amountFen) : '¥0.00'}
            </p>
          </div>
          <Button
            onClick={handleRecharge}
            disabled={!canSubmit}
            className="h-11 px-8"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                创建订单中...
              </>
            ) : payingOrder ? (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                等待支付完成...
              </>
            ) : (
              '确认支付'
            )}
          </Button>
        </div>
        {payingOrder && (
          <p className="mt-2 text-xs text-muted-foreground">
            订单号: {payingOrder.orderNo} — 支付窗口已打开，完成支付后页面将自动更新
          </p>
        )}
      </div>

      {/* 充值记录 */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">充值记录</h3>
            <span className="text-xs text-muted-foreground">共 {ordersTotal} 条</span>
          </div>
          <Link
            href="/orders"
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
          >
            查看全部
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                  订单号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                  金额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                  支付方式
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                  创建时间
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.order_no} className="hover:bg-muted/50">
                  <td className="px-6 py-3 text-sm font-mono text-foreground">
                    {order.order_no}
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-foreground">
                    {formatAmount(order.amount)}
                  </td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">
                    {METHOD_ICONS[order.payment_method] || order.payment_method}
                  </td>
                  <td className="px-6 py-3">
                    <Badge variant={STATUS_VARIANT[order.status] || 'secondary'}>
                      {STATUS_LABEL[order.status] || order.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">
                    {formatDate(order.created_at)}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-muted-foreground"
                  >
                    暂无充值记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {ordersTotalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-6 py-3">
            <p className="text-xs text-muted-foreground">
              第 {ordersPage} / {ordersTotalPages} 页
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => loadOrders(ordersPage - 1)}
                disabled={ordersPage <= 1}
                className="rounded-lg bg-muted px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted/80 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => loadOrders(ordersPage + 1)}
                disabled={ordersPage >= ordersTotalPages}
                className="rounded-lg bg-muted px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted/80 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
