"use client";

/**
 * 用户组管理页面
 *
 * 展示所有用户组，支持创建、编辑、启用/禁用、删除。
 */

import * as React from "react";
import {
  getUserGroups,
  createUserGroup,
  updateUserGroup,
  toggleUserGroup,
  deleteUserGroup,
  type UserGroupData,
  type PaginatedResponse,
} from "@/lib/admin-api";
import { IconSearch } from "@/components/PixelIcons";
import { AdminShell } from "@/components/admin/AdminShell";

/* ============== 确认弹窗 ============== */
function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-gray-600">{message}</p>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============== 编辑弹窗 ============== */
function GroupFormModal({
  group,
  onSave,
  onCancel,
}: {
  group?: UserGroupData | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [name, setName] = React.useState(group?.name ?? "");
  const [displayName, setDisplayName] = React.useState(group?.displayName ?? "");
  const [description, setDescription] = React.useState(group?.description ?? "");
  const [priceMultiplier, setPriceMultiplier] = React.useState(String(group?.priceMultiplier ?? "1.0"));
  const [rpmLimit, setRpmLimit] = React.useState(String(group?.rpmLimit ?? "60"));
  const [tpmLimit, setTpmLimit] = React.useState(String(group?.tpmLimit ?? "60000"));
  const [maxApiKeys, setMaxApiKeys] = React.useState(String(group?.maxApiKeys ?? "10"));

  const isEdit = !!group;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Record<string, any> = {
      displayName: displayName.trim(),
      description: description.trim() || undefined,
      priceMultiplier: parseFloat(priceMultiplier),
      rpmLimit: parseInt(rpmLimit),
      tpmLimit: parseInt(tpmLimit),
      maxApiKeys: parseInt(maxApiKeys),
    };
    // 创建时才发送 name
    if (!isEdit) {
      data.name = name.trim();
    }
    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? "编辑用户组" : "创建用户组"}
          </h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {/* 名称 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">组名（英文）</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isEdit}
                required
                placeholder="vip"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* 显示名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">显示名（中文）</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                placeholder="VIP 用户"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* 描述 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="用户组描述..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* 价格倍率 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">价格倍率</label>
              <input
                type="number"
                value={priceMultiplier}
                onChange={(e) => setPriceMultiplier(e.target.value)}
                min="0.1"
                max="10"
                step="0.1"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* 限额配置 */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RPM</label>
                <input
                  type="number"
                  value={rpmLimit}
                  onChange={(e) => setRpmLimit(e.target.value)}
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">TPM</label>
                <input
                  type="number"
                  value={tpmLimit}
                  onChange={(e) => setTpmLimit(e.target.value)}
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">最大 Key 数</label>
                <input
                  type="number"
                  value={maxApiKeys}
                  onChange={(e) => setMaxApiKeys(e.target.value)}
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-600"
            >
              {isEdit ? "保存" : "创建"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserGroupsPage() {
  const [data, setData] = React.useState<PaginatedResponse<UserGroupData> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // 筛选状态
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(20);

  // 弹窗状态
  const [confirmAction, setConfirmAction] = React.useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [editingGroup, setEditingGroup] = React.useState<UserGroupData | null | undefined>(undefined);

  // 加载用户组列表
  const fetchGroups = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getUserGroups({
        page,
        pageSize,
        search: search || undefined,
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search]);

  React.useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // 搜索防抖
  const [searchInput, setSearchInput] = React.useState("");
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // 创建/编辑用户组
  const handleSave = async (formData: any) => {
    try {
      if (editingGroup) {
        await updateUserGroup(editingGroup.id, formData);
      } else {
        await createUserGroup(formData);
      }
      setEditingGroup(undefined);
      fetchGroups();
    } catch (err) {
      alert(err instanceof Error ? err.message : "操作失败");
    }
  };

  // 切换状态
  const handleToggle = (group: UserGroupData) => {
    setConfirmAction({
      title: `${group.isActive ? "禁用" : "启用"}用户组`,
      message: `确定要${group.isActive ? "禁用" : "启用"}用户组 "${group.displayName}" 吗？`,
      onConfirm: async () => {
        try {
          await toggleUserGroup(group.id);
          fetchGroups();
        } catch (err) {
          alert(err instanceof Error ? err.message : "操作失败");
        }
        setConfirmAction(null);
      },
    });
  };

  // 删除用户组
  const handleDelete = (group: UserGroupData) => {
    setConfirmAction({
      title: "删除用户组",
      message: `确定要删除用户组 "${group.displayName}" 吗？此操作不可撤销。`,
      onConfirm: async () => {
        try {
          await deleteUserGroup(group.id);
          fetchGroups();
        } catch (err) {
          alert(err instanceof Error ? err.message : "删除失败");
        }
        setConfirmAction(null);
      },
    });
  };

  return (
    <AdminShell title="用户分组">
      {/* 确认弹窗 */}
      {confirmAction && (
        <ConfirmModal
          title={confirmAction.title}
          message={confirmAction.message}
          onConfirm={confirmAction.onConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* 编辑弹窗 */}
      {editingGroup !== undefined && (
        <GroupFormModal
          group={editingGroup}
          onSave={handleSave}
          onCancel={() => setEditingGroup(undefined)}
        />
      )}

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchGroups} className="text-sm text-primary hover:underline">
            重试
          </button>
        </div>
      )}

      {/* 操作栏 */}
      <div className="bg-white rounded-lg border border-gray-100 p-4 mb-4">
        <div className="flex items-center justify-between gap-4">
          {/* 搜索框 */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="搜索组名/显示名..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-3">
            <button
              onClick={fetchGroups}
              disabled={isLoading}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              刷新
            </button>
            <button
              onClick={() => setEditingGroup(null)}
              className="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-600"
            >
              新建分组
            </button>
          </div>
        </div>
      </div>

      {/* 用户组表格 */}
      <div className="bg-white rounded-lg border border-gray-100">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">加载中...</p>
          </div>
        ) : data && data.items.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="text-left font-normal px-4 py-3">分组</th>
                    <th className="text-left font-normal px-4 py-3">价格倍率</th>
                    <th className="text-left font-normal px-4 py-3">RPM / TPM</th>
                    <th className="text-left font-normal px-4 py-3">最大 Key</th>
                    <th className="text-left font-normal px-4 py-3">用户数</th>
                    <th className="text-left font-normal px-4 py-3">状态</th>
                    <th className="text-right font-normal px-4 py-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((g) => (
                    <tr key={g.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">{g.displayName}</div>
                          <div className="text-[11px] text-gray-400 font-mono">{g.name}</div>
                          {g.description && (
                            <div className="text-[11px] text-gray-500 mt-0.5">{g.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-gray-900">{g.priceMultiplier}x</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-[12px]">
                        {g.rpmLimit} / {g.tpmLimit.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{g.maxApiKeys}</td>
                      <td className="px-4 py-3">
                        <span className="text-gray-900 font-medium">{g.userCount}</span>
                      </td>
                      <td className="px-4 py-3">
                        {g.isBuiltin ? (
                          <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600">
                            内置
                          </span>
                        ) : g.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-success">
                            <span className="w-1.5 h-1.5 rounded-full bg-success" />
                            启用
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            禁用
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingGroup(g)}
                            className="px-2 py-1 text-[11px] text-primary hover:bg-primary-50 rounded"
                          >
                            编辑
                          </button>
                          {!g.isBuiltin && (
                            <>
                              <button
                                onClick={() => handleToggle(g)}
                                className={`px-2 py-1 text-[11px] rounded ${
                                  g.isActive
                                    ? "text-warning hover:bg-warning/10"
                                    : "text-success hover:bg-success/10"
                                }`}
                              >
                                {g.isActive ? "禁用" : "启用"}
                              </button>
                              <button
                                onClick={() => handleDelete(g)}
                                className="px-2 py-1 text-[11px] text-red-500 hover:bg-red-50 rounded"
                              >
                                删除
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {data.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  共 {data.total} 条，第 {data.page}/{data.totalPages} 页
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一页
                  </button>
                  <button
                    onClick={() => setPage(Math.min(data.totalPages, page + 1))}
                    disabled={page === data.totalPages}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center text-gray-400">
            <p className="text-sm">暂无用户组数据</p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
