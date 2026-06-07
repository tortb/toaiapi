"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  formatAmount,
  formatDate,
  formatNumber,
  getOrderStatusLabel,
  getPaymentMethodLabel,
  getRoleLabel,
  getTransactionTypeLabel,
  getUser,
  getUserStatusLabel,
  type UserDetailData,
} from "@/lib/admin-api";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/data";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, EmptyState, Skeleton, StatCard, Table, Tabs, type TableColumn } from "@/components/ui";

function statusTone(status: string) {
  if (status === "ACTIVE") return "success" as const;
  if (status === "SUSPENDED") return "warning" as const;
  if (status === "BANNED") return "error" as const;
  if (["PAID", "SUCCESS", "COMPLETED", "RECHARGE", "REWARD"].includes(status)) return "success" as const;
  if (["PENDING", "PROCESSING"].includes(status)) return "warning" as const;
  if (["FAILED", "CANCELLED", "EXPIRED", "DEDUCT"].includes(status)) return "error" as const;
  if (["REFUND", "REFUNDED"].includes(status)) return "info" as const;
  return "neutral" as const;
}

function RoleBadge({ role }: { role: string }) {
  const meta = getRoleLabel(role);
  const tone = role.includes("ADMIN") ? "purple" : role === "ENTERPRISE" ? "info" : role === "VIP" ? "warning" : "neutral";
  return <Badge variant={tone} size="sm">{meta.label}</Badge>;
}

function UserStatus({ status }: { status: string }) {
  const meta = getUserStatusLabel(status);
  return <StatusBadge tone={statusTone(status)}>{meta.label}</StatusBadge>;
}

function OrderStatus({ status }: { status: string }) {
  const meta = getOrderStatusLabel(status);
  return <StatusBadge tone={statusTone(status)}>{meta.label}</StatusBadge>;
}

function TransactionBadge({ type }: { type: string }) {
  const meta = getTransactionTypeLabel(type);
  return <StatusBadge tone={statusTone(type)} dot={false}>{meta.label}</StatusBadge>;
}

function ApiKeyStatus({ active }: { active: boolean }) {
  return <StatusBadge tone={active ? "success" : "neutral"}>{active ? "启用" : "禁用"}</StatusBadge>;
}

function initials(data: UserDetailData) {
  return (data.displayName || data.email || "U").slice(0, 1).toUpperCase();
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [data, setData] = React.useState<UserDetailData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState("overview");

  const fetchUser = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getUser(userId);
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const orderColumns = React.useMemo<TableColumn<UserDetailData["recentOrders"][number]>[]>(
    () => [
      { key: "orderNo", title: "订单号", className: "font-mono text-neutral-900", render: (order) => order.orderNo },
      { key: "amount", title: "金额", headerClassName: "text-right", className: "text-right font-mono", render: (order) => "¥" + formatAmount(order.amount) },
      { key: "paymentMethod", title: "支付方式", render: (order) => getPaymentMethodLabel(order.paymentMethod) },
      { key: "status", title: "状态", render: (order) => <OrderStatus status={order.status} /> },
      { key: "createdAt", title: "创建时间", render: (order) => <span className="font-mono text-xs text-neutral-500">{formatDate(order.createdAt)}</span> },
    ],
    [],
  );

  const transactionColumns = React.useMemo<TableColumn<UserDetailData["recentTransactions"][number]>[]>(
    () => [
      { key: "type", title: "类型", render: (item) => <TransactionBadge type={item.type} /> },
      {
        key: "amount",
        title: "金额",
        headerClassName: "text-right",
        className: "text-right font-mono",
        render: (item) => <span className={item.amount >= 0 ? "text-success" : "text-error"}>{item.amount >= 0 ? "+" : ""}{formatAmount(item.amount)}</span>,
      },
      { key: "balanceAfter", title: "余额", headerClassName: "text-right", className: "text-right font-mono text-neutral-700", render: (item) => "¥" + formatAmount(item.balanceAfter) },
      { key: "remark", title: "备注", className: "max-w-[260px]", render: (item) => <span className="block truncate text-neutral-600">{item.remark || "-"}</span> },
      { key: "createdAt", title: "时间", render: (item) => <span className="font-mono text-xs text-neutral-500">{formatDate(item.createdAt)}</span> },
    ],
    [],
  );

  const apiKeyColumns = React.useMemo<TableColumn<UserDetailData["recentApiKeys"][number]>[]>(
    () => [
      { key: "name", title: "名称", render: (key) => <span className="text-neutral-900">{key.name || "-"}</span> },
      { key: "keyPrefix", title: "Key 前缀", render: (key) => <span className="font-mono text-neutral-600">{key.keyPrefix}</span> },
      { key: "status", title: "状态", render: (key) => <ApiKeyStatus active={key.isActive} /> },
      { key: "totalRequests", title: "调用次数", headerClassName: "text-right", className: "text-right font-mono text-neutral-700", render: (key) => formatNumber(key.totalRequests) },
      { key: "lastUsedAt", title: "最后使用", render: (key) => <span className="font-mono text-xs text-neutral-500">{key.lastUsedAt ? formatDate(key.lastUsedAt) : "-"}</span> },
      { key: "createdAt", title: "创建时间", render: (key) => <span className="font-mono text-xs text-neutral-500">{formatDate(key.createdAt)}</span> },
    ],
    [],
  );

  if (isLoading) {
    return (
      <AdminShell title="用户详情">
        <Skeleton variant="card" lines={10} />
      </AdminShell>
    );
  }

  if (error || !data) {
    return (
      <AdminShell title="用户详情">
        <EmptyState
          title={error || "用户不存在"}
          description="返回用户列表后可以重新选择用户。"
          action={<Button type="button" variant="secondary" onClick={() => router.push("/admin/users")}>返回用户列表</Button>}
        />
      </AdminShell>
    );
  }

  return (
    <AdminShell title="用户详情">
      <div className="space-y-6">
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-neutral-950 text-xl font-semibold text-white">
                {initials(data)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-neutral-950">{data.displayName || "-"}</h2>
                  <RoleBadge role={data.role} />
                  <UserStatus status={data.status} />
                </div>
                <div className="mt-2 grid gap-1 text-sm text-neutral-500">
                  <span>{data.email}</span>
                  {data.phone && <span>{data.phone}</span>}
                  <span className="font-mono text-xs">ID: {data.id}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-500">
                  <span className="rounded-md bg-neutral-100 px-2 py-1">注册 {formatDate(data.createdAt)}</span>
                  {data.githubId && <span className="rounded-md bg-neutral-100 px-2 py-1">GitHub</span>}
                  {data.googleId && <span className="rounded-md bg-neutral-100 px-2 py-1">Google</span>}
                  {data.wechatId && <span className="rounded-md bg-neutral-100 px-2 py-1">微信</span>}
                </div>
              </div>
              <Button type="button" variant="secondary" onClick={() => router.push("/admin/users")}>返回列表</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="可用余额" value={"¥" + formatAmount(data.balance?.available ?? 0)} />
          <StatCard title="本月消费" value={"¥" + formatAmount(data.stats.monthlySpend)} subtitle={formatNumber(data.stats.monthlyRequests) + " 次调用"} />
          <StatCard title="本月充值" value={"¥" + formatAmount(data.stats.monthlyRecharge)} />
          <StatCard title="本月 Token" value={formatNumber(data.stats.monthlyTotalTokens)} subtitle={"输入 " + formatNumber(data.stats.monthlyPromptTokens) + " / 输出 " + formatNumber(data.stats.monthlyCompletionTokens)} />
        </div>

        <div className="flex overflow-x-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            items={[
              { label: "概览", value: "overview" },
              { label: "订单", value: "orders" },
              { label: "交易", value: "transactions" },
              { label: "API Key", value: "apikeys" },
            ]}
          />
        </div>

        {activeTab === "overview" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>消费统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0 text-sm">
                <div className="flex justify-between"><span className="text-neutral-500">总消费</span><span className="font-mono text-neutral-900">¥{formatAmount(data.stats.totalSpend)}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">总充值</span><span className="font-mono text-neutral-900">¥{formatAmount(data.stats.totalRecharge)}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">API Key 数</span><span className="font-mono text-neutral-900">{data.stats.apiKeyCount}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">总调用次数</span><span className="font-mono text-neutral-900">{formatNumber(data.stats.requestCount)}</span></div>
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>余额详情</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0 text-sm">
                <div className="flex justify-between"><span className="text-neutral-500">总余额</span><span className="font-mono text-neutral-900">¥{formatAmount(data.balance?.amount ?? 0)}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">冻结金额</span><span className="font-mono text-neutral-900">¥{formatAmount(data.balance?.frozen ?? 0)}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">可用余额</span><span className="font-mono font-semibold text-neutral-950">¥{formatAmount(data.balance?.available ?? 0)}</span></div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "orders" && (
          <Table
            columns={orderColumns}
            data={data.recentOrders}
            rowKey="id"
            empty={<EmptyState title="暂无订单" />}
          />
        )}

        {activeTab === "transactions" && (
          <Table
            columns={transactionColumns}
            data={data.recentTransactions}
            rowKey="id"
            empty={<EmptyState title="暂无交易" />}
          />
        )}

        {activeTab === "apikeys" && (
          <Table
            columns={apiKeyColumns}
            data={data.recentApiKeys}
            rowKey="id"
            empty={<EmptyState title="暂无 API Key" />}
          />
        )}
      </div>
    </AdminShell>
  );
}
