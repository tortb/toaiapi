'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/services/api';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/error-alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Ban, ShieldCheck, UserCheck } from 'lucide-react';
import { formatDate, formatAmount } from '@/lib/utils';
import type { AdminUserListItem } from '@/types';

/** 用户管理页面 */
export default function UsersPage() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 状态修改确认
  const [statusTarget, setStatusTarget] = useState<{ id: string; status: string } | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.users.list(page);
      setUsers(data.items);
      setTotalPages(data.totalPages);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载用户列表失败');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleStatusChange = async () => {
    if (!statusTarget) return;
    setStatusLoading(true);
    try {
      await api.users.updateStatus(statusTarget.id, { status: statusTarget.status });
      setStatusTarget(null);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : '修改用户状态失败');
    } finally {
      setStatusLoading(false);
    }
  };

  const roleVariant = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'destructive' as const;
      case 'ADMIN': return 'warning' as const;
      case 'VIP': return 'success' as const;
      default: return 'secondary' as const;
    }
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success' as const;
      case 'SUSPENDED': return 'warning' as const;
      case 'BANNED': return 'destructive' as const;
      default: return 'secondary' as const;
    }
  };

  const columns: DataTableColumn<AdminUserListItem>[] = [
    { key: 'email', header: '邮箱' },
    { key: 'displayName', header: '显示名称', render: (u) => u.displayName || '-' },
    {
      key: 'role',
      header: '角色',
      render: (u) => <Badge variant={roleVariant(u.role)}>{u.role}</Badge>,
    },
    {
      key: 'status',
      header: '状态',
      render: (u) => <Badge variant={statusVariant(u.status)}>{u.status}</Badge>,
    },
    { key: 'createdAt', header: '注册时间', render: (u) => formatDate(u.createdAt) },
    {
      key: 'actions',
      header: '操作',
      render: (u) => {
        const isActive = u.status === 'ACTIVE';
        return (
          <div className="flex gap-1">
            {isActive ? (
              <Button variant="ghost" size="sm" onClick={() => setStatusTarget({ id: u.id, status: 'SUSPENDED' })} title="封禁">
                <Ban className="h-4 w-4 text-amber-400" />
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setStatusTarget({ id: u.id, status: 'ACTIVE' })} title="解封">
                <UserCheck className="h-4 w-4 text-emerald-400" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const statusDialogDesc = statusTarget?.status === 'SUSPENDED'
    ? '确定要封禁此用户吗？封禁后该用户将无法使用 API。'
    : '确定要解封此用户吗？';

  return (
    <div className="space-y-4">
      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">用户列表</h3>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyText="暂无用户"
        pagination={{ page, totalPages, onPageChange: setPage }}
      />

      {/* 状态修改确认 */}
      <ConfirmDialog
        open={statusTarget !== null}
        onOpenChange={(open) => !open && setStatusTarget(null)}
        title={statusTarget?.status === 'SUSPENDED' ? '封禁用户' : '解封用户'}
        description={statusDialogDesc}
        confirmLabel={statusTarget?.status === 'SUSPENDED' ? '封禁' : '解封'}
        variant={statusTarget?.status === 'SUSPENDED' ? 'destructive' : 'default'}
        loading={statusLoading}
        onConfirm={handleStatusChange}
      />
    </div>
  );
}
