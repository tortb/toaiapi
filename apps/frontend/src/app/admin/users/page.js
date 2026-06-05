"use client";
/**
 * 用户列表页面
 *
 * 展示所有用户，支持搜索、筛选、分页、状态变更。
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { getUsers, updateUserStatus, formatDate, getRoleLabel, getUserStatusLabel, } from "@/lib/admin-api";
import { ToAiAPILogo, IconMenu, IconSearch, IconBell, IconSettings, IconChevronDown, IconDashboard, IconUserList, IconUserGroup, IconKey, IconOrders, IconRecharge, IconBill, IconInvoice, IconModel, IconChannel, IconPrice, IconSystem, IconLog, IconMonitor, IconBack, } from "@/components/PixelIcons";
const sidebarSections = [
    {
        title: "控制台",
        items: [{ icon: <IconDashboard size={18}/>, label: "控制台", href: "/admin" }],
    },
    {
        title: "用户管理",
        items: [
            { icon: <IconUserList size={18}/>, label: "用户列表", href: "/admin/users", active: true },
            { icon: <IconUserGroup size={18}/>, label: "用户分组", href: "#" },
            { icon: <IconKey size={18}/>, label: "API Key 管理", href: "#" },
        ],
    },
    {
        title: "订单与财务",
        items: [
            { icon: <IconOrders size={18}/>, label: "订单管理", href: "#" },
            { icon: <IconRecharge size={18}/>, label: "充值记录", href: "#" },
            { icon: <IconBill size={18}/>, label: "账单管理", href: "#" },
            { icon: <IconInvoice size={18}/>, label: "发票管理", href: "#" },
        ],
    },
    {
        title: "模型与通道",
        items: [
            { icon: <IconModel size={18}/>, label: "模型管理", href: "#" },
            { icon: <IconChannel size={18}/>, label: "通道管理", href: "#" },
            { icon: <IconPrice size={18}/>, label: "模型价格", href: "#" },
        ],
    },
    {
        title: "系统与监控",
        items: [
            { icon: <IconSystem size={18}/>, label: "系统设置", href: "#" },
            { icon: <IconLog size={18}/>, label: "操作日志", href: "#" },
            { icon: <IconLog size={18}/>, label: "调用日志", href: "#" },
            { icon: <IconMonitor size={18}/>, label: "系统监控", href: "#" },
        ],
    },
];
/* ============== 状态确认弹窗 ============== */
function ConfirmModal({ title, message, onConfirm, onCancel, }) {
    return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-gray-600">{message}</p>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            取消
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700">
            确认
          </button>
        </div>
      </div>
    </div>);
}
export default function UsersPage() {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [showUserMenu, setShowUserMenu] = React.useState(false);
    const [data, setData] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    // 筛选状态
    const [search, setSearch] = React.useState("");
    const [roleFilter, setRoleFilter] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("");
    const [page, setPage] = React.useState(1);
    const [pageSize] = React.useState(20);
    // 确认弹窗
    const [confirmAction, setConfirmAction] = React.useState(null);
    const displayName = user?.displayName || user?.email?.split("@")[0] || "Admin";
    const initial = displayName.charAt(0).toUpperCase();
    // 加载用户列表
    const fetchUsers = React.useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getUsers({
                page,
                pageSize,
                role: roleFilter || undefined,
                status: statusFilter || undefined,
                search: search || undefined,
            });
            setData(result);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "加载失败");
        }
        finally {
            setIsLoading(false);
        }
    }, [page, pageSize, roleFilter, statusFilter, search]);
    React.useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    // 搜索防抖
    const [searchInput, setSearchInput] = React.useState("");
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);
    const handleLogout = async () => {
        await logout();
        router.replace("/admin/login");
    };
    // 修改用户状态
    const handleStatusChange = (userId, newStatus, userName) => {
        const statusLabels = {
            ACTIVE: "解冻/解封",
            SUSPENDED: "冻结",
            BANNED: "封禁",
        };
        setConfirmAction({
            title: `确认${statusLabels[newStatus]}用户`,
            message: `确定要${statusLabels[newStatus]}用户 "${userName}" 吗？`,
            onConfirm: async () => {
                try {
                    await updateUserStatus(userId, newStatus);
                    fetchUsers();
                }
                catch (err) {
                    alert(err instanceof Error ? err.message : "操作失败");
                }
                setConfirmAction(null);
            },
        });
    };
    return (<div className="min-h-screen bg-[#F5F7FA] text-gray-900 flex">
      {/* 确认弹窗 */}
      {confirmAction && (<ConfirmModal title={confirmAction.title} message={confirmAction.message} onConfirm={confirmAction.onConfirm} onCancel={() => setConfirmAction(null)}/>)}

      {/* ============== 左侧导航 ============== */}
      <aside className="w-[220px] bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        <div className="h-16 px-5 flex items-center border-b border-gray-100">
          <ToAiAPILogo size={28}/>
          <span className="ml-2 text-[16px] font-bold text-gray-900">
            ToAi<span className="text-primary">API</span>
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {sidebarSections.map((section) => (<div key={section.title} className="mb-3">
              <div className="px-5 py-1.5 text-[11px] text-gray-400 font-medium">
                {section.title}
              </div>
              <ul>
                {section.items.map((item) => (<li key={item.label}>
                    <a href={item.href} className={`flex items-center gap-2.5 px-5 py-2 text-[13px] transition ${item.active
                    ? "bg-primary-50 text-primary border-r-2 border-primary font-medium"
                    : "text-gray-600 hover:bg-gray-50"}`}>
                      <span className={item.active ? "text-primary" : "text-gray-500"}>
                        {item.icon}
                      </span>
                      {item.label}
                    </a>
                  </li>))}
              </ul>
            </div>))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <a href="/" className="flex items-center justify-center gap-2 w-full py-2 text-[13px] text-gray-600 border border-gray-200 rounded hover:border-primary hover:text-primary transition">
            <IconBack size={14}/>
            返回前台
          </a>
        </div>
      </aside>

      {/* ============== 主内容区 ============== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部标题栏 */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 flex-shrink-0">
          <button className="mr-4 text-gray-500 hover:text-primary">
            <IconMenu size={20}/>
          </button>
          <h1 className="text-[16px] font-medium text-gray-900 mr-auto">用户列表</h1>
          <div className="flex items-center gap-5">
            <button className="text-gray-500 hover:text-primary">
              <IconSearch size={18}/>
            </button>
            <button className="relative text-gray-500 hover:text-primary">
              <IconBell size={18}/>
            </button>
            <button className="text-gray-500 hover:text-primary">
              <IconSettings size={18}/>
            </button>
            <div className="relative pl-5 border-l border-gray-100">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition">
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
                <IconChevronDown size={12} className="text-gray-400"/>
              </button>

              {showUserMenu && (<>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}/>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      退出登录
                    </button>
                  </div>
                </>)}
            </div>
          </div>
        </header>

        {/* 内容区 */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* 错误提示 */}
          {error && (<div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
              <span className="text-sm text-red-600">{error}</span>
              <button onClick={fetchUsers} className="text-sm text-primary hover:underline">
                重试
              </button>
            </div>)}

          {/* 筛选区 */}
          <div className="bg-white rounded-lg border border-gray-100 p-4 mb-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* 搜索框 */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="搜索 ID / 用户名 / 邮箱..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"/>
                </div>
              </div>

              {/* 角色筛选 */}
              <select value={roleFilter} onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
        }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="">所有角色</option>
                <option value="USER">普通用户</option>
                <option value="VIP">VIP</option>
                <option value="ENTERPRISE">企业</option>
                <option value="AGENT">代理</option>
                <option value="ADMIN">管理员</option>
                <option value="SUPER_ADMIN">超级管理员</option>
              </select>

              {/* 状态筛选 */}
              <select value={statusFilter} onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
        }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="">所有状态</option>
                <option value="ACTIVE">正常</option>
                <option value="SUSPENDED">已冻结</option>
                <option value="BANNED">已封禁</option>
              </select>

              {/* 刷新按钮 */}
              <button onClick={fetchUsers} disabled={isLoading} className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-600 disabled:opacity-50">
                刷新
              </button>
            </div>
          </div>

          {/* 用户表格 */}
          <div className="bg-white rounded-lg border border-gray-100">
            {isLoading ? (<div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
                <p className="text-sm text-gray-500">加载中...</p>
              </div>) : data && data.items.length > 0 ? (<>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-500">
                        <th className="text-left font-normal px-4 py-3">用户</th>
                        <th className="text-left font-normal px-4 py-3">邮箱</th>
                        <th className="text-left font-normal px-4 py-3">角色</th>
                        <th className="text-left font-normal px-4 py-3">状态</th>
                        <th className="text-left font-normal px-4 py-3">注册时间</th>
                        <th className="text-right font-normal px-4 py-3">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((u) => {
                const roleInfo = getRoleLabel(u.role);
                const statusInfo = getUserStatusLabel(u.status);
                return (<tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                  {(u.displayName || u.email).charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {u.displayName || "-"}
                                  </div>
                                  <div className="text-[11px] text-gray-400 font-mono">
                                    {u.id.slice(0, 8)}...
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{u.email}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${roleInfo.color}`}>
                                {roleInfo.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 ${statusInfo.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`}/>
                                {statusInfo.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-[12px]">
                              {formatDate(u.createdAt)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {u.status === "ACTIVE" ? (<button onClick={() => handleStatusChange(u.id, "SUSPENDED", u.displayName || u.email)} className="px-2 py-1 text-[11px] text-warning hover:bg-warning/10 rounded">
                                    冻结
                                  </button>) : (<button onClick={() => handleStatusChange(u.id, "ACTIVE", u.displayName || u.email)} className="px-2 py-1 text-[11px] text-success hover:bg-success/10 rounded">
                                    解冻
                                  </button>)}
                              </div>
                            </td>
                          </tr>);
            })}
                    </tbody>
                  </table>
                </div>

                {/* 分页 */}
                {data.totalPages > 1 && (<div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      共 {data.total} 条，第 {data.page}/{data.totalPages} 页
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        上一页
                      </button>
                      <button onClick={() => setPage(Math.min(data.totalPages, page + 1))} disabled={page === data.totalPages} className="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        下一页
                      </button>
                    </div>
                  </div>)}
              </>) : (<div className="p-8 text-center text-gray-400">
                <p className="text-sm">暂无用户数据</p>
              </div>)}
          </div>
        </main>
      </div>
    </div>);
}
//# sourceMappingURL=page.js.map