'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/services/api';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorAlert } from '@/components/error-alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Plus, Pencil, Trash2, Power, PowerOff } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Provider, CreateProviderInput, UpdateProviderInput } from '@/types';

/**
 * Provider 管理页面
 *
 * 功能：创建/编辑/删除/启用禁用 Provider
 */
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

  // 编辑对话框
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UpdateProviderInput>({});
  const [editLoading, setEditLoading] = useState(false);

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

  /** 创建 Provider */
  const handleCreate = async () => {
    if (!createForm.name || !createForm.displayName || !createForm.baseUrl) {
      setError('请填写所有必填字段');
      return;
    }
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

  /** 打开编辑对话框 */
  const openEdit = (p: Provider) => {
    setEditId(p.id);
    setEditForm({ displayName: p.displayName, baseUrl: p.baseUrl });
  };

  /** 提交编辑 */
  const handleEdit = async () => {
    if (!editId) return;
    setEditLoading(true);
    try {
      await api.providers.update(editId, editForm);
      setEditId(null);
      loadProviders();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新 Provider 失败');
    } finally {
      setEditLoading(false);
    }
  };

  /** 切换启用/禁用 */
  const handleToggle = async (p: Provider) => {
    try {
      await api.providers.update(p.id, { isActive: !p.isActive });
      loadProviders();
    } catch (err) {
      setError(err instanceof Error ? err.message : '切换状态失败');
    }
  };

  /** 删除 Provider */
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
    {
      key: 'name',
      header: '名称',
      render: (p) => <span className="font-mono text-sm text-primary">{p.name}</span>,
    },
    { key: 'displayName', header: '显示名称' },
    {
      key: 'baseUrl',
      header: 'Base URL',
      render: (p) => <span className="max-w-[200px] truncate text-xs text-muted-foreground">{p.baseUrl}</span>,
    },
    {
      key: 'isActive',
      header: '状态',
      render: (p) => (
        <Badge variant={p.isActive ? 'success' : 'destructive'}>
          {p.isActive ? '启用' : '禁用'}
        </Badge>
      ),
    },
    {
      key: 'channelCount',
      header: '渠道数',
      render: (p) => <span className="text-muted-foreground">{p.channelCount ?? 0}</span>,
    },
    {
      key: 'createdAt',
      header: '创建时间',
      render: (p) => <span className="text-xs text-muted-foreground">{formatDate(p.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '操作',
      className: 'w-[140px]',
      render: (p) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(p)} title="编辑">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggle(p)}
            title={p.isActive ? '禁用' : '启用'}
          >
            {p.isActive
              ? <PowerOff className="h-4 w-4 text-warning" />
              : <Power className="h-4 w-4 text-success" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteId(p.id)} title="删除">
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
        <div>
          <h3 className="text-lg font-semibold text-foreground">Provider 列表</h3>
          <p className="text-sm text-muted-foreground">管理 AI 服务商配置</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          添加 Provider
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={providers}
        loading={loading}
        emptyText="暂无 Provider，点击右上角添加"
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
              <label htmlFor="create-name" className="text-sm font-medium text-foreground">
                名称 <span className="text-destructive">*</span>
              </label>
              <Input
                id="create-name"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="deepseek"
              />
              <p className="text-xs text-muted-foreground">唯一标识，如 openai、anthropic</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="create-display" className="text-sm font-medium text-foreground">
                显示名称 <span className="text-destructive">*</span>
              </label>
              <Input
                id="create-display"
                value={createForm.displayName}
                onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })}
                placeholder="DeepSeek"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="create-url" className="text-sm font-medium text-foreground">
                API 基础 URL <span className="text-destructive">*</span>
              </label>
              <Input
                id="create-url"
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

      {/* 编辑 Provider 对话框 */}
      <Dialog open={editId !== null} onOpenChange={(open) => !open && setEditId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑 Provider</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="edit-display" className="text-sm font-medium text-foreground">显示名称</label>
              <Input
                id="edit-display"
                value={editForm.displayName ?? ''}
                onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-url" className="text-sm font-medium text-foreground">API 基础 URL</label>
              <Input
                id="edit-url"
                value={editForm.baseUrl ?? ''}
                onChange={(e) => setEditForm({ ...editForm, baseUrl: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditId(null)}>取消</Button>
              <Button onClick={handleEdit} disabled={editLoading}>
                {editLoading ? '保存中...' : '保存'}
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
        description="确定要删除此 Provider 吗？有关联渠道时将无法删除。此操作不可恢复。"
        confirmLabel="删除"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
