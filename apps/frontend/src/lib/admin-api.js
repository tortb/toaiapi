/**
 * Admin API 客户端
 *
 * 封装所有 Admin 后台 API 请求。
 * 自动附加 JWT Token。
 */
import { getAccessToken, refreshTokens, clearAuthData } from "./auth-api";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "";
const API_PREFIX = "/api/v1";
// ──────────────────────────────────────────────
// HTTP 请求封装
// ──────────────────────────────────────────────
function buildUrl(path) {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    // 优先使用环境变量配置的 API 地址
    if (API_BASE && API_BASE.length > 0) {
        return `${API_BASE.replace(/\/$/, "")}${cleanPath}`;
    }
    // 浏览器环境：使用当前域名的不同端口（后端默认 3001）
    if (typeof window !== "undefined") {
        const { protocol, hostname } = window.location;
        return `${protocol}//${hostname}:3001${cleanPath}`;
    }
    // 服务端环境
    return `http://localhost:3001${cleanPath}`;
}
async function adminFetch(path, init) {
    const url = buildUrl(path);
    let token = getAccessToken();
    if (!token) {
        throw new Error("未登录");
    }
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...init?.headers,
    };
    let res = await fetch(url, {
        ...init,
        headers,
        credentials: "include",
    });
    // Token 过期，尝试刷新
    if (res.status === 401) {
        try {
            const newTokens = await refreshTokens();
            token = newTokens.accessToken;
            headers["Authorization"] = `Bearer ${token}`;
            res = await fetch(url, {
                ...init,
                headers,
                credentials: "include",
            });
        }
        catch {
            clearAuthData();
            window.location.href = "/admin/login";
            throw new Error("登录已过期");
        }
    }
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API Error ${res.status}: ${text}`);
    }
    if (res.status === 204) {
        return undefined;
    }
    const json = await res.json();
    // 后端返回格式: { code, message, data }
    if (json && typeof json === "object" && "code" in json && "data" in json) {
        if (json.code !== 0) {
            throw new Error(json.message || "API Error");
        }
        return json.data;
    }
    return json;
}
// ──────────────────────────────────────────────
// Dashboard API
// ──────────────────────────────────────────────
/**
 * 获取 Dashboard 数据
 */
export async function getDashboard(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate)
        params.set("startDate", startDate);
    if (endDate)
        params.set("endDate", endDate);
    const query = params.toString();
    return adminFetch(`${API_PREFIX}/admin/dashboard${query ? `?${query}` : ""}`);
}
/**
 * 获取用户列表
 */
export async function getUsers(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.page)
        searchParams.set("page", String(params.page));
    if (params.pageSize)
        searchParams.set("pageSize", String(params.pageSize));
    if (params.role)
        searchParams.set("role", params.role);
    if (params.status)
        searchParams.set("status", params.status);
    if (params.search)
        searchParams.set("search", params.search);
    const query = searchParams.toString();
    return adminFetch(`${API_PREFIX}/admin/users${query ? `?${query}` : ""}`);
}
/**
 * 修改用户状态
 */
export async function updateUserStatus(userId, status, reason) {
    return adminFetch(`${API_PREFIX}/admin/users/${userId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, reason }),
    });
}
/**
 * 修改用户角色
 */
export async function updateUserRole(userId, role) {
    return adminFetch(`${API_PREFIX}/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
    });
}
/**
 * 角色映射
 */
export function getRoleLabel(role) {
    const map = {
        SUPER_ADMIN: { label: "超级管理员", color: "text-red-600 bg-red-50" },
        ADMIN: { label: "管理员", color: "text-primary bg-primary-50" },
        OPERATOR: { label: "运营", color: "text-purple bg-purple/10" },
        FINANCE: { label: "财务", color: "text-orange bg-orange/10" },
        AUDITOR: { label: "审计", color: "text-info bg-info/10" },
        USER: { label: "普通用户", color: "text-gray-600 bg-gray-100" },
        VIP: { label: "VIP", color: "text-warning bg-warning/10" },
        ENTERPRISE: { label: "企业", color: "text-success bg-success/10" },
        AGENT: { label: "代理", color: "text-gray-600 bg-gray-100" },
    };
    return map[role] ?? { label: role, color: "text-gray-600 bg-gray-100" };
}
/**
 * 用户状态映射
 */
export function getUserStatusLabel(status) {
    const map = {
        ACTIVE: { label: "正常", color: "text-success", dotColor: "bg-success" },
        SUSPENDED: { label: "已冻结", color: "text-warning", dotColor: "bg-warning" },
        BANNED: { label: "已封禁", color: "text-red-500", dotColor: "bg-red-500" },
    };
    return map[status] ?? { label: status, color: "text-gray-500", dotColor: "bg-gray-400" };
}
/**
 * 获取用户组列表
 */
export async function getUserGroups(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.page)
        searchParams.set("page", String(params.page));
    if (params.pageSize)
        searchParams.set("pageSize", String(params.pageSize));
    if (params.search)
        searchParams.set("search", params.search);
    if (params.isActive !== undefined)
        searchParams.set("isActive", String(params.isActive));
    const query = searchParams.toString();
    return adminFetch(`${API_PREFIX}/admin/user-groups${query ? `?${query}` : ""}`);
}
/**
 * 获取用户组详情
 */
export async function getUserGroup(id) {
    return adminFetch(`${API_PREFIX}/admin/user-groups/${id}`);
}
/**
 * 创建用户组
 */
export async function createUserGroup(payload) {
    return adminFetch(`${API_PREFIX}/admin/user-groups`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
/**
 * 更新用户组
 */
export async function updateUserGroup(id, payload) {
    return adminFetch(`${API_PREFIX}/admin/user-groups/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}
/**
 * 切换用户组状态
 */
export async function toggleUserGroup(id) {
    return adminFetch(`${API_PREFIX}/admin/user-groups/${id}/toggle`, {
        method: "PATCH",
    });
}
/**
 * 删除用户组
 */
export async function deleteUserGroup(id) {
    return adminFetch(`${API_PREFIX}/admin/user-groups/${id}`, {
        method: "DELETE",
    });
}
/**
 * 获取角色列表
 */
export async function getRoles() {
    return adminFetch(`${API_PREFIX}/admin/roles`);
}
/**
 * 获取角色详情
 */
export async function getRole(id) {
    return adminFetch(`${API_PREFIX}/admin/roles/${id}`);
}
/**
 * 获取所有权限点
 */
export async function getPermissions() {
    return adminFetch(`${API_PREFIX}/admin/permissions`);
}
// ──────────────────────────────────────────────
// 工具函数
// ──────────────────────────────────────────────
/**
 * 格式化金额（分 → 元）
 */
export function formatAmount(fen) {
    return (fen / 100).toLocaleString("zh-CN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
/**
 * 格式化大数字
 */
export function formatNumber(num) {
    if (num >= 100000000) {
        return `${(num / 100000000).toFixed(1)}亿`;
    }
    if (num >= 10000) {
        return `${(num / 10000).toFixed(1)}万`;
    }
    return num.toLocaleString("zh-CN");
}
/**
 * 格式化日期
 */
export function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}
/**
 * 订单状态映射
 */
export function getOrderStatusLabel(status) {
    const map = {
        PENDING: { label: "待支付", color: "text-warning" },
        PAID: { label: "已支付", color: "text-success" },
        FAILED: { label: "支付失败", color: "text-red-500" },
        REFUNDED: { label: "已退款", color: "text-gray-500" },
        CANCELLED: { label: "已取消", color: "text-gray-400" },
    };
    return map[status] ?? { label: status, color: "text-gray-500" };
}
/**
 * 渠道状态映射
 */
export function getChannelStatusLabel(status) {
    const map = {
        ACTIVE: { label: "正常", color: "text-success" },
        RATE_LIMITED: { label: "限流", color: "text-warning" },
        ERROR: { label: "异常", color: "text-red-500" },
        DISABLED: { label: "已禁用", color: "text-gray-400" },
    };
    return map[status] ?? { label: status, color: "text-gray-500" };
}
//# sourceMappingURL=admin-api.js.map