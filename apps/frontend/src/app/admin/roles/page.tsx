"use client";

/**
 * 角色管理页面
 *
 * 展示所有角色及其权限配置。
 */

import * as React from "react";
import {
  getRoles,
  getRole,
  getPermissions,
  type RoleData,
  type RoleDetailData,
  type PermissionData,
} from "@/lib/admin-api";
import { AdminShell } from "@/components/admin/AdminShell";

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
  const [roles, setRoles] = React.useState<RoleData[]>([]);
  const [selectedRole, setSelectedRole] = React.useState<RoleDetailData | null>(null);
  const [allPermissions, setAllPermissions] = React.useState<PermissionData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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

  // 按资源分组的权限
  const groupedPermissions = groupPermissionsByResource(allPermissions);

  return (
    <AdminShell title="角色管理">
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
    </AdminShell>
  );
}
