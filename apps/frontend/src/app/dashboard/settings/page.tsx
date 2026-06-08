"use client";

import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, IdCard, LogOut, Mail, Phone, Shield, Trash2, User, X, type LucideIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";
import { changePassword, deleteCurrentUser, getUserProfile, updateUserProfile, type RealNameVerification, type UserProfile } from "@/lib/user-api";

function maskEmail(value?: string | null) {
  if (!value) return "未绑定";
  const [local, domain] = value.split("@");
  if (!domain) return "****";
  const start = local.slice(0, Math.min(2, local.length));
  const end = local.length > 3 ? local.slice(-2) : local.slice(-1);
  return `${start}****${end}@${domain}`;
}

function maskPhone(value?: string | null) {
  if (!value) return "未绑定";
  if (value.length <= 5) return `${value.slice(0, 1)}****`;
  return `${value.slice(0, 3)}******${value.slice(-2)}`;
}

function maskName(value?: string | null) {
  if (!value) return "-";
  return `${value.slice(0, 1)}**`;
}

function maskIdCard(value?: string | null) {
  if (!value) return "-";
  if (value.length <= 8) return `${value.slice(0, 2)}****${value.slice(-2)}`;
  return `${value.slice(0, 4)}**********${value.slice(-4)}`;
}

function verificationLabel(status?: string | null) {
  const normalized = status?.toUpperCase();
  if (normalized === "APPROVED" || normalized === "VERIFIED") return "已认证";
  if (normalized === "PENDING") return "审核中";
  if (normalized === "REJECTED") return "未通过";
  return "未认证";
}

function verificationTone(status?: string | null) {
  const normalized = status?.toUpperCase();
  if (normalized === "APPROVED" || normalized === "VERIFIED") return "text-green-700 bg-green-50 border-green-200";
  if (normalized === "PENDING") return "text-amber-700 bg-amber-50 border-amber-200";
  if (normalized === "REJECTED") return "text-red-600 bg-red-50 border-red-200";
  return "text-gray-500 bg-gray-50 border-gray-200";
}

function verificationName(verification?: RealNameVerification | null) {
  return verification?.realName ?? verification?.name ?? null;
}

function verificationId(verification?: RealNameVerification | null) {
  return verification?.idCard ?? verification?.idCardNumber ?? null;
}

export default function SettingsPage() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getUserProfile().then((data) => {
      if (cancelled) return;
      setProfile(data);
      setDisplayName(data.displayName ?? "");
      setAvatarUrl(data.avatarUrl ?? "");
    }).catch((err) => {
      if (!cancelled) setError(err instanceof Error ? err.message : "加载失败");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  async function handleProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      const updated = await updateUserProfile({ displayName: displayName.trim() || undefined, avatarUrl: avatarUrl.trim() || undefined });
      setProfile(updated);
      setMessage("资料已更新");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      await changePassword({ oldPassword, newPassword });
      setOldPassword("");
      setNewPassword("");
      setMessage("密码已修改");
    } catch (err) {
      setError(err instanceof Error ? err.message : "修改失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  async function handleDeleteAccount() {
    if (!window.confirm("确认提交注销申请？账号注销后将进入删除流程，7 天后删除用户数据。")) return;
    setDeleteSubmitting(true);
    setError("");
    setMessage("");
    try {
      await deleteCurrentUser();
      await logout().catch(() => undefined);
      router.replace("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "注销失败");
      setDeleteSubmitting(false);
    }
  }

  const verification = profile?.realNameVerification ?? null;
  const verificationStatus = verification?.status;
  const currentName = profile?.displayName || profile?.email || "用户";

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl">
      <div>
        <h1 className="page-title">个人设置</h1>
        <p className="page-subtitle">管理账户资料、安全信息和账号状态</p>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {message && <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>}

      {/* 个人信息卡片 */}
      <section className="bg-white border border-[var(--line)] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--line)] bg-[var(--surface-soft)]">
          <h2 className="text-base font-semibold text-[var(--foreground)]">个人信息</h2>
        </div>
        {loading ? (
          <div className="py-12 text-center text-sm text-[var(--text-secondary)]">加载中...</div>
        ) : (
          <div className="px-6 py-5 space-y-0">
            <InfoRow icon={Camera} label="用户头像" value={<Avatar name={currentName} src={profile?.avatarUrl ?? undefined} size="lg" />} />
            <InfoRow icon={User} label="用户名" value={profile?.displayName || "未设置"} />
            <InfoRow icon={Mail} label="邮箱" value={<span className="font-mono">{maskEmail(profile?.email)}</span>} />
            <InfoRow icon={Phone} label="手机号码" value={<span className="font-mono">{maskPhone(profile?.phone)}</span>} />
            <InfoRow icon={IdCard} label="实名认证" value={
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${verificationTone(verificationStatus)}`}>
                  <Shield className="w-3 h-3" />
                  {verificationLabel(verificationStatus)}
                </span>
                <button type="button" onClick={() => setDetailsOpen(true)} className="notion-btn-secondary px-3 py-1.5 text-xs">查看详情</button>
              </div>
            } />
          </div>
        )}
      </section>

      {/* 基础资料编辑 */}
      <form onSubmit={handleProfile} className="bg-white border border-[var(--line)] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--line)] bg-[var(--surface-soft)]">
          <h2 className="text-base font-semibold text-[var(--foreground)]">基础资料</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-[var(--foreground)]">用户名</span>
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="mt-1.5 w-full px-3 py-2.5 border border-[var(--line)] rounded-md text-sm outline-none focus:border-[var(--accent)] transition-colors" placeholder="设置显示名称" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[var(--foreground)]">头像 URL</span>
            <input value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} className="mt-1.5 w-full px-3 py-2.5 border border-[var(--line)] rounded-md text-sm outline-none focus:border-[var(--accent)] transition-colors" placeholder="https://example.com/avatar.jpg" />
          </label>
          <button disabled={submitting || loading} className="notion-btn-primary px-5 py-2.5 text-sm disabled:opacity-60">{submitting ? "保存中..." : "保存资料"}</button>
        </div>
      </form>

      {/* 账号安全 */}
      <form onSubmit={handlePassword} className="bg-white border border-[var(--line)] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--line)] bg-[var(--surface-soft)]">
          <h2 className="text-base font-semibold text-[var(--foreground)]">账号安全</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-[var(--foreground)]">当前密码</span>
              <input type="password" value={oldPassword} onChange={(event) => setOldPassword(event.target.value)} className="mt-1.5 w-full px-3 py-2.5 border border-[var(--line)] rounded-md text-sm outline-none focus:border-[var(--accent)] transition-colors" placeholder="输入当前密码" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--foreground)]">新密码</span>
              <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1.5 w-full px-3 py-2.5 border border-[var(--line)] rounded-md text-sm outline-none focus:border-[var(--accent)] transition-colors" placeholder="输入新密码" />
            </label>
          </div>
          <button disabled={submitting || !oldPassword || !newPassword} className="notion-btn-secondary px-5 py-2.5 text-sm disabled:opacity-60">{submitting ? "修改中..." : "修改密码"}</button>
        </div>
      </form>

      {/* 账号操作 */}
      <section className="bg-white border border-[var(--line)] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--line)] bg-[var(--surface-soft)]">
          <h2 className="text-base font-semibold text-[var(--foreground)]">账号操作</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <button type="button" onClick={handleLogout} className="notion-btn-secondary px-5 py-2.5 text-sm w-full sm:w-auto justify-center"><LogOut className="w-4 h-4 mr-2" />退出登录</button>
          <div className="border-t border-[var(--line)] pt-4">
            <button type="button" onClick={handleDeleteAccount} disabled={deleteSubmitting} className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md border-2 border-red-200 text-red-600 bg-white hover:bg-red-50 transition-colors disabled:opacity-60 w-full sm:w-auto">
              <Trash2 className="w-4 h-4" />
              {deleteSubmitting ? "提交中..." : "注销账号"}
            </button>
            <p className="mt-2 text-xs text-[var(--text-secondary)]">注销后账号会进入删除流程，7 天后删除用户数据，此操作不可撤销。</p>
          </div>
        </div>
      </section>

      {/* 实名认证详情弹窗 */}
      {detailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-xl border border-[var(--line)] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <IdCard className="w-5 h-5 text-[var(--accent)]" />
                <h2 className="text-base font-semibold text-[var(--foreground)]">实名认证详情</h2>
              </div>
              <button type="button" onClick={() => setDetailsOpen(false)} className="notion-btn-ghost p-2 rounded-lg hover:bg-[var(--surface-soft)]" title="关闭"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <DetailRow label="认证状态" value={
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${verificationTone(verificationStatus)}`}>
                  {verificationLabel(verificationStatus)}
                </span>
              } />
              <DetailRow label="类型" value={verification?.type || "个人"} />
              <DetailRow label="姓名" value={maskName(verificationName(verification))} />
              <DetailRow label="证件号码" value={maskIdCard(verificationId(verification))} />
              {verification?.verifiedAt && <DetailRow label="认证时间" value={new Date(verification.verifiedAt).toLocaleString("zh-CN")} />}
              {verification?.rejectReason && <DetailRow label="未通过原因" value={<span className="text-red-600">{verification.rejectReason}</span>} />}
            </div>
            <div className="mt-6 flex justify-end">
              <button type="button" onClick={() => setDetailsOpen(false)} className="notion-btn-primary px-5 py-2 text-sm">关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: ReactNode }) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-[var(--line)] last:border-b-0">
      <div className="flex items-center gap-2 w-28 shrink-0">
        <Icon className="w-4 h-4 text-[var(--text-secondary)]" />
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      </div>
      <div className="flex-1 min-w-0 text-sm font-medium text-[var(--foreground)]">{value}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-[var(--surface-soft)] px-4 py-3">
      <span className="w-20 shrink-0 text-[var(--text-secondary)]">{label}</span>
      <span className="flex-1 font-medium text-[var(--foreground)]">{value || "-"}</span>
    </div>
  );
}
