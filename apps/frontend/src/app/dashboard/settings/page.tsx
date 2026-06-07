"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/components/dashboard/ui/Toast";
import UserConsoleLayout from "@/components/dashboard/layout/UserConsoleLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Key,
  Lock,
  Mail,
  Github,
  Trash2,
  ChevronRight,
  Smartphone,
  Globe,
  Wallet,
  Activity,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getBalanceStats,
  type BalanceStats,
} from "@/lib/payment-api";
import { changePassword } from "@/lib/user-api";

import { ProfileSection } from "@/components/dashboard/settings/ProfileSection";
import { CheckInCalendar } from "@/components/dashboard/settings/CheckInCalendar";

function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: React.ReactNode;
  variant?: "success" | "neutral";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        variant === "success"
          ? "bg-emerald-50 text-emerald-600"
          : "bg-neutral-100 text-neutral-500",
        className
      )}
    >
      {children}
    </span>
  );
}

function ChangePasswordModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!oldPassword || !newPassword) {
      setError("请填写所有字段");
      return;
    }
    if (newPassword.length < 8) {
      setError("新密码至少 8 个字符");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("两次密码不一致");
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({ oldPassword, newPassword });
      toast("success", "密码修改成功");
      onClose();
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "修改失败";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="更改密码"
      description="请输入当前密码和新密码"
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            取消
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting}>
            确认修改
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <Input
          label="当前密码"
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="输入当前密码"
        />
        <Input
          label="新密码"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="至少 8 个字符"
        />
        <Input
          label="确认新密码"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="再次输入新密码"
        />
      </div>
    </Modal>
  );
}

function DeleteAccountModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { toast } = useToast();
  const [confirmEmail, setConfirmEmail] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (confirmEmail !== user?.email) {
      toast("error", "邮箱不匹配");
      return;
    }
    setIsDeleting(true);
    try {
      // TODO: 调用删除账户 API
      toast("success", "账户已删除");
      logout();
      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "删除失败";
      toast("error", message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="删除账户"
      description="此操作不可撤销，将永久删除您的账户及所有数据。"
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={isDeleting}
            disabled={confirmEmail !== user?.email}
          >
            确认删除
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-neutral-600">
          请输入您的邮箱 <strong>{user?.email}</strong> 以确认删除。
        </p>
        <Input
          label="确认邮箱"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          placeholder={user?.email || ""}
        />
      </div>
    </Modal>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { toast } = useToast();

  const [stats, setStats] = React.useState<BalanceStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = React.useState(true);
  const [showChangePassword, setShowChangePassword] = React.useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    getBalanceStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setIsLoadingStats(false));
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <UserConsoleLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            个人设置
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            配置您的账户偏好、安全设置及集成选项。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* User Profile */}
            <ProfileSection />

            {/* Account Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  label: "当前余额",
                  value: isLoadingStats
                    ? "..."
                    : `$${((stats?.balance.available || 0) / 100).toFixed(2)}`,
                  sub: "可用额度",
                  icon: <Wallet className="h-4 w-4 text-blue-500" />,
                },
                {
                  label: "本月消费",
                  value: isLoadingStats
                    ? "..."
                    : `$${((stats?.monthlySpend || 0) / 100).toFixed(2)}`,
                  sub: "总消耗额度",
                  icon: <Activity className="h-4 w-4 text-purple-500" />,
                },
                {
                  label: "本月请求",
                  value: isLoadingStats
                    ? "..."
                    : (stats?.monthlyRequests || 0).toLocaleString(),
                  sub: "总请求数",
                  icon: <Zap className="h-4 w-4 text-amber-500" />,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-3">
                    {stat.icon}
                    <span className="text-xs font-medium text-neutral-500">
                      {stat.label}
                    </span>
                  </div>
                  <div className="text-xl font-bold text-neutral-900">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-[10px] text-neutral-400">
                    {stat.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* Settings Sections */}
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-neutral-100 px-6 py-4">
                <h3 className="text-sm font-semibold text-neutral-900">
                  常规设置
                </h3>
              </div>
              <div className="divide-y divide-neutral-100">
                {/* Email Binding */}
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50 text-neutral-500">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        邮箱绑定
                      </p>
                      <p className="text-xs text-neutral-500">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success">已绑定</Badge>
                </div>

                {/* Github Binding */}
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50 text-neutral-500">
                      <Github className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        GitHub 账号
                      </p>
                      <p className="text-xs text-neutral-500">
                        未绑定 GitHub 账户
                      </p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">
                    绑定
                  </Button>
                </div>

                {/* Language */}
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50 text-neutral-500">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        界面语言
                      </p>
                      <p className="text-xs text-neutral-500">
                        设置您的界面首选显示语言
                      </p>
                    </div>
                  </div>
                  <select className="bg-transparent text-sm font-medium text-neutral-900 focus:outline-none">
                    <option value="zh-CN">简体中文</option>
                    <option value="en-US">English</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-neutral-100 px-6 py-4">
                <h3 className="text-sm font-semibold text-neutral-900">
                  账户安全
                </h3>
              </div>
              <div className="divide-y divide-neutral-100">
                <button
                  className="flex w-full items-center justify-between px-6 py-4 transition hover:bg-neutral-50 text-left"
                  onClick={() => setShowChangePassword(true)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50 text-neutral-500">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        更改密码
                      </p>
                      <p className="text-xs text-neutral-500">
                        定期更新密码以确保账户安全
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-neutral-300" />
                </button>

                <button className="flex w-full items-center justify-between px-6 py-4 transition hover:bg-neutral-50 text-left">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50 text-neutral-500">
                      <Key className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        访问令牌 (Personal Access Tokens)
                      </p>
                      <p className="text-xs text-neutral-500">
                        管理用于访问 API 的个人令牌
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-neutral-300" />
                </button>

                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50 text-neutral-500">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        两步验证 (2FA)
                      </p>
                      <p className="text-xs text-neutral-500">
                        为您的账户添加额外的安全防护层
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  >
                    启用
                  </Button>
                </div>

                <div className="flex items-center justify-between px-6 py-4 bg-red-50/30">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                      <Trash2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-900">
                        删除账户
                      </p>
                      <p className="text-xs text-red-600/70">
                        永久删除您的账户及其所有数据
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => setShowDeleteAccount(true)}
                  >
                    立即删除
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Check In Calendar */}
            <CheckInCalendar />

            {/* Notification Subscription */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-900">
                订阅通知
              </h3>
              <p className="mt-1 text-xs text-neutral-500 leading-relaxed">
                接收有关额度、模型更新及平台公告的实时通知。
              </p>
              <Button
                variant="secondary"
                className="mt-6 w-full"
                onClick={() =>
                  router.push("/dashboard/settings/notifications")
                }
              >
                配置通知渠道
              </Button>
            </div>

            {/* Verification */}
            <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-amber-900">
                实名认证
              </h3>
              <p className="mt-1 text-xs text-amber-700/70 leading-relaxed">
                完成实名认证可提升您的额度限制，并解锁更多高级模型。
              </p>
              <Button
                variant="secondary"
                className="mt-6 w-full border-amber-200 bg-transparent text-amber-700 hover:bg-amber-100"
                onClick={() =>
                  router.push("/dashboard/settings/verification")
                }
              >
                前往认证
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordModal
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
      <DeleteAccountModal
        open={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
      />
    </UserConsoleLayout>
  );
}
