"use client";

import { useEffect, useState } from "react";
import { getRoles, type RoleData } from "@/lib/admin-api";
import { formatTableDate } from "@/lib/utils";
import { useErrorToast } from "@/lib/feedback/use-error-toast";

export default function AdminRolesPage() {
  const [items, setItems] = useState<RoleData[]>([]);
  const [, setError] = useErrorToast();
  const [loading, setLoading] = useState(true);
  useEffect(() => { getRoles().then(setItems).catch((err) => setError(err instanceof Error ? err.message : "加载失败")).finally(() => setLoading(false)); }, []);
  return <div className="space-y-5"><div><h1 className="text-2xl font-bold text-[var(--foreground)]">角色权限</h1><p className="mt-1 text-sm text-[var(--text-secondary)]">查看系统角色和权限数量</p></div><div className="bg-white border border-[var(--line)] rounded-lg overflow-hidden"><div className="grid grid-cols-6 px-4 py-3 bg-[var(--surface-soft)] text-xs font-semibold text-[var(--text-muted)]"><div>编码</div><div>名称</div><div>级别</div><div>权限数</div><div>用户数</div><div>更新时间</div></div>{loading ? <div className="p-8 text-center text-sm text-[var(--text-secondary)]">加载中...</div> : items.length === 0 ? <div className="p-8 text-center text-sm text-[var(--text-secondary)]">暂无角色</div> : items.map((item) => <div key={item.id} className="grid grid-cols-6 px-4 py-3 text-sm border-t border-[var(--line)]"><div className="font-mono text-xs">{item.code}</div><div>{item.name}</div><div>{item.level}</div><div>{item.permissionCount}</div><div>{item.userCount}</div><div>{formatTableDate(item.updatedAt)}</div></div>)}</div></div>;
}
