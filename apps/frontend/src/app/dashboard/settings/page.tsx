'use client';

/**
 * 个人设置（用户端）
 *
 * /dashboard/settings — 个人信息、修改密码
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import UserConsoleLayout from "@/components/dashboard/layout/UserConsoleLayout";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  type UserProfile,
} from "@/lib/user-api";

/* ============== 个人信息卡片 ============== */
function ProfileCard() {
  const { user } = useAuthStore();
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getUserProfile()
      .then((p) => {
        setProfile(p);
        setDisplayName(p.displayName || "");
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateUserProfile({ displayName: displayName.trim() || undefined });
      setProfile(updated);
      setSuccess("保存成功");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-6">
      <h3 className="text-sm font-medium text-gray-800 mb-4">个人信息</h3>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-600">{success}</div>}
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-500 mb-1.5">邮箱</label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1.5">显示名称</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="设置一个显示名称"
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1.5">角色</label>
          <input
            type="text"
            value={profile?.role || user?.role || ""}
            disabled
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1.5">注册时间</label>
          <input
            type="text"
            value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" }) : ""}
            disabled
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
          />
        </div>
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-600 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            保存修改
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============== 修改密码卡片 ============== */
function PasswordCard() {
  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!oldPassword || !newPassword) {
      setError("请填写当前密码和新密码");
      return;
    }
    if (newPassword.length < 8) {
      setError("新密码长度至少 8 位");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("两次输入的新密码不一致");
      return;
    }

    setIsSaving(true);
    try {
      await changePassword({ oldPassword, newPassword });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("密码修改成功");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "修改失败");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-6">
      <h3 className="text-sm font-medium text-gray-800 mb-4">修改密码</h3>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-600">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-500 mb-1.5">当前密码</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="输入当前密码"
            autoComplete="current-password"
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1.5">新密码</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="至少 8 位"
            autoComplete="new-password"
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1.5">确认新密码</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="再次输入新密码"
            autoComplete="new-password"
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-600 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            修改密码
          </button>
        </div>
      </form>
    </div>
  );
}

/* ============== 主页面 ============== */
export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <UserConsoleLayout>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-gray-900">个人设置</h1>
          <p className="text-sm text-gray-500 mt-1">管理您的个人信息和账户安全</p>
        </div>

        <div className="space-y-6">
          <ProfileCard />
          <PasswordCard />
        </div>
      </div>
    </UserConsoleLayout>
  );
}
