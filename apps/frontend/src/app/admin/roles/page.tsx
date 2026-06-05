"use client";

/**
 * 角色管理页面
 *
 * 展示所有角色及其权限配置。
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import {
  getRoles,
  getRole,
  getPermissions,
  type RoleData,
  type RoleDetailData,
  type PermissionData,
} from "@/lib/admin-api";
import {
  ToAiAPILogo,
  IconMenu,
  IconSearch,
  IconBell,
  IconSettings,
  IconChevronDown,
  IconDashboard,
  IconUserList,
  IconUserGroup,
  IconKey,
  IconOrders,
  IconRecharge,
  IconBill,
  IconInvoice,
  IconModel,
  IconChannel,
  IconPrice,
  IconSystem,
  IconLog,
  IconMonitor,
  IconBack,
} from "@/components/PixelIcons";

/* ============== 侧边栏导航数据 ============== */
interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const sidebarSections: SidebarSection[] = [
  {
    title: "控制台",
    items: [{ icon: <IconDashboard size={18} />, label: "控制台", href: "/admin" }],
  },
  {
    title: "用户管理",
    items: [
      { icon: <IconUserList size={18} />, label: "用户列表", href: "/admin/users" },
      { icon: <IconUserGroup size={18} />, label: "用户分组", href: "/admin/users/groups" },
      { icon: <IconKey size={18} />, label: "API Key 管理", href: "/admin/apikeys" },
    ],
  },
  {
    title: "权限管理",
    items: [
      { icon: <IconUserGroup size={18} />, label: "角色管理", href: "/admin/roles", active: true },
    ],
  },
  {
    title: "订单与财务",
    items: [
      { icon: <IconOrders size={18} />, label: "订单管理", href: "/admin/orders" },
      { icon: <IconRecharge size={18} />, label: "充值记录", href: "/admin/recharges" },
      { icon: <IconBill size={18} />, label: "账单管理", href: "/admin/bills" },
      { icon: <IconInvoice size={18} />, label: "发票管理", href: "/admin/invoices" },
    ],
  },
  {
    title: "模型与通道",
    items: [
      { icon: <IconModel size={18} />, label: "模型管理", href: "/admin/models" },
      { icon: <IconChannel size={18} />, label: "通道管理", href: "/admin/channels" },
      { icon: <IconPrice size={18} />, label: "模型价格", href: "/admin/pricing" },
    ],
  },
  {
    title: "系统与监控",
    items: [
      { icon: <IconSystem size={18} />, label: "系统设置", href: "/admin/settings" },
      { icon: <IconLog size={18} />, label: "操作日志", href: "/admin/logs/operations" },
      { icon: <IconLog size={18} />, label: "调用日志", href: "/admin/logs/requests" },
      { icon: <IconMonitor size={18} />, label: "系统监控", href: "/admin/monitor" },
    ],
  },
];

/* ============== 权限分组 ============== */
function groupPermissionsByResource(permissions: PermissionData[]): Record<string, PermissionData[]> {
  const groups: Record<string, PermissionData[]> = {};
  for (const p of permissions) {
    if (!groups[p.resource]) {
      groups[p.resource] = [];
    }
    groups[p.resource].push(p);
  }
  return groups;
}

/* ============== 资源显示名 ============== */
const RESOURCE_LABELS: Record<string, string> = {
  user: "用户管理",
  "user-group": "用户组管理",
  apikey: "API Key",
  order: "订单管理",
  model: "模型管理",
  channel: "渠道管理",
  system: "系统设置",
  dashboard: "控制台",
};

export default function RolesPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const [roles, setRoles] = React.useState<RoleData[]>([]);
  const [selectedRole, setSelectedRole] = React.useState<RoleDetailData | null>(null);
  const [allPermissions, setAllPermissions] = React.useState<PermissionData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Admin";
  const initial = displayName.charAt(0).toUpperCase();

  // 加载数据
  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [rolesData, permsData] = await Promise.all([
          getRoles(),
          getPermissions(),
        ]);
        setRoles(rolesData);
        setAllPermissions(permsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // 加载角色详情
  const loadRoleDetail = async (roleId: string) => {
    try {
      const detail = await getRole(roleId);
      setSelectedRole(detail);
    } catch (err) {
      alert(err instanceof Error ? err.message : "加载失败");
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login");
  };

  // 按资源分组的权限
  const groupedPermissions = groupPermissionsByResource(allPermissions);

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-gray-900 flex">
      {/* ============== 左侧导航 ============== */}
      <aside className="w-[220px] bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        <div className="h-16 px-5 flex items-center border-b border-gray-100">
          <ToAiAPILogo size={28} />
          <span className="ml-2 text-[16px] font-bold text-gray-900">
            ToAi<span className="text-primary">API</span>
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {sidebarSections.map((section) => (
            <div key={section.title} className="mb-3">
              <div className="px-5 py-1.5 text-[11px] text-gray-400 font-medium">
                {section.title}
              </div>
              <ul>
                {section.items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className={`flex items-center gap-2.5 px-5 py-2 text-[13px] transition ${
                        item.active
                          ? "bg-primary-50 text-primary border-r-2 border-primary font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className={item.active ? "text-primary" : "text-gray-500"}>
                        {item.icon}
                      </span>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <a
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2 text-[13px] text-gray-600 border border-gray-200 rounded hover:border-primary hover:text-primary transition"
          >
            <IconBack size={14} />
            返回前台
          </a>
        </div>
      </aside>

      {/* ============== 主内容区 ============== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部标题栏 */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 flex-shrink-0">
          <button className="mr-4 text-gray-500 hover:text-primary">
            <IconMenu size={20} />
          </button>
          <h1 className="text-[16px] font-medium text-gray-900 mr-auto">角色管理</h1>
          <div className="flex items-center gap-5">
            <button className="text-gray-500 hover:text-primary">
              <IconSearch size={18} />
            </button>
            <button className="relative text-gray-500 hover:text-primary">
              <IconBell size={18} />
            </button>
            <button className="text-gray-500 hover:text-primary">
              <IconSettings size={18} />
            </button>
            <div className="relative pl-5 border-l border-gray-100">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple flex items-center justify-center text-white text-[11px] font-bold">
                  {initial}
                </div>
                <div className="text-left">
                  <div className="text-[12.5px] font-medium text-gray-900 leading-tight">
                    {displayName}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {user?.role === "super_admin" ? "超级管理员" : "管理员"}
                  </div>
                </div>
                <IconChevronDown size={12} className="text-gray-400" />
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      退出登录
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* 内容区 */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-lg">
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">加载中...</p>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-6">
              {/* 左侧：角色列表 */}
              <div className="col-span-4">
                <div className="bg-white rounded-lg border border-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">角色列表</h3>
                  </div>
                  <ul>
                    {roles.map((role) => (
                      <li key={role.id}>
                        <button
                          onClick={() => loadRoleDetail(role.id)}
                          className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${
                            selectedRole?.id === role.id ? "bg-primary-50" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{role.name}</div>
                              <div className="text-xs text-gray-400 font-mono">{role.code}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">{role.permissionCount} 权限</div>
                              <div className="text-xs text-gray-400">{role.userCount} 用户</div>
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 右侧：权限详情 */}
              <div className="col-span-8">
                {selectedRole ? (
                  <div className="bg-white rounded-lg border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{selectedRole.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{selectedRole.description || "暂无描述"}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            等级: {selectedRole.level}
                          </span>
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            {selectedRole.dataScope === "ALL" ? "全部数据" : "仅自己"}
                          </span>
                          {selectedRole.isSystem && (
                            <span className="px-2 py-1 text-xs bg-primary-50 text-primary rounded">
                              系统角色
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4">
                        权限列表 ({selectedRole.permissions.length})
                      </h4>

                      {selectedRole.permissions.length === 0 ? (
                        <p className="text-sm text-gray-500">该角色暂无权限</p>
                      ) : (
                        <div className="space-y-6">
                          {Object.entries(groupedPermissions).map(([resource, perms]) => {
                            const rolePermCodes = new Set(selectedRole.permissions.map((p) => p.code));
                            const hasAny = perms.some((p) => rolePermCodes.has(p.code));
                            if (!hasAny) return null;

                            return (
                              <div key={resource}>
                                <h5 className="text-xs font-medium text-gray-500 uppercase mb-2">
                                  {RESOURCE_LABELS[resource] || resource}
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                  {perms.map((perm) => {
                                    const hasPerm = rolePermCodes.has(perm.code);
                                    return (
                                      <span
                                        key={perm.code}
                                        className={`px-2 py-1 text-xs rounded ${
                                          hasPerm
                                            ? "bg-success/10 text-success"
                                            : "bg-gray-50 text-gray-400"
                                        }`}
                                      >
                                        {perm.name}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-100 p-8 text-center">
                    <p className="text-sm text-gray-500">请从左侧选择一个角色查看详情</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
