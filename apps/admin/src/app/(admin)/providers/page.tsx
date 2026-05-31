'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/services/api';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorAlert } from '@/components/error-alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Provider, CreateProviderInput } from '@/types';

/** Provider 管理页面 */
export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 创建对话框
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateProviderInput>({
    name: '', displayName: '', baseUrl: '',
  });
  const [createLoading, setCreateLoading] = useState(false);

  // 删除确认
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadProviders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.providers.list(page);
      setProviders(data.items);
      setTotalPages(data.totalPages);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载 Provider 列表失败');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  const handleCreate = async () => {
    setCreateLoading(true);
    try {
      await api.providers.create(createForm);
      setShowCreate(false);
      setCreateForm({ name: '', displayName: '', baseUrl: '' });
      loadProviders();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建 Provider 失败');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await api.providers.delete(deleteId);
      setDeleteId(null);
      loadProviders();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除 Provider 失败');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: DataTableColumn<Provider>[] = [
    { key: 'name', header: '名称', render: (p) => <span className="font-mono text-sm">{p.name}</span> },
    { key: 'displayName', header: '显示名称' },
    { key: 'baseUrl', header: 'Base URL', render: (p) => <span className="text-xs text-muted-foreground">{p.baseUrl}</span> },
    {
      key: 'isActive',
      header: '状态',
      render: (p) => (
        <Badge variant={p.isActive ? 'success' : 'destructive'}>
          {p.isActive ? '启用' : '禁用'}
        </Badge>
      ),
    },
    { key: 'channelCount', header: '渠道数', render: (p) => p.channelCount ?? 0 },
    { key: 'createdAt', header: '创建时间', render: (p) => formatDate(p.createdAt) },
    {
      key: 'actions',
      header: '操作',
      render: (p) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setDeleteId(p.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Provider 列表</h3>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          添加 Provider
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={providers}
        loading={loading}
        emptyText="暂无 Provider"
        pagination={{ page, totalPages, onPageChange: setPage }}
      />

      {/* 创建 Provider 对话框 */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加 Provider</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">名称（唯一标识）</label>
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="deepseek"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">显示名称</label>
              <Input
                value={createForm.displayName}
                onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })}
                placeholder="DeepSeek"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">API 基础 URL</label>
              <Input
                value={createForm.baseUrl}
                onChange={(e) => setCreateForm({ ...createForm, baseUrl: e.target.value })}
                placeholder="https://api.deepseek.com"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreate(false)}>取消</Button>
              <Button onClick={handleCreate} disabled={createLoading}>
                {createLoading ? '创建中...' : '创建'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="删除 Provider"
        description="确定要删除此 Provider 吗？有关联渠道时将无法删除。"
        confirmLabel="删除"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
