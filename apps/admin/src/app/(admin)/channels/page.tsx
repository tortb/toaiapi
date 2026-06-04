'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/services/api';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorAlert } from '@/components/error-alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { formatDate, formatPercent } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Channel, CreateChannelInput, UpdateChannelInput } from '@/types';

/** 渠道管理页面 */
export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 创建对话框
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateChannelInput>({
    providerId: '', name: '', baseUrl: '', apiKey: '',
  });
  const [createLoading, setCreateLoading] = useState(false);

  // 编辑对话框
  const [editChannel, setEditChannel] = useState<Channel | null>(null);
  const [editForm, setEditForm] = useState<UpdateChannelInput>({});
  const [editLoading, setEditLoading] = useState(false);

  // 删除确认
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadChannels = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.channels.list(page);
      setChannels(data.items);
      setTotalPages(data.totalPages);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载渠道列表失败');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  const handleToggle = async (id: string, enable: boolean) => {
    try {
      if (enable) {
        await api.channels.enable(id);
      } else {
        await api.channels.disable(id);
      }
      loadChannels();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    }
  };

  const handleCreate = async () => {
    setCreateLoading(true);
    try {
      await api.channels.create(createForm);
      setShowCreate(false);
      setCreateForm({ providerId: '', name: '', baseUrl: '', apiKey: '' });
      loadChannels();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建渠道失败');
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditDialog = (channel: Channel) => {
    setEditChannel(channel);
    setEditForm({
      name: channel.name,
      baseUrl: channel.baseUrl,
      weight: channel.weight,
      priority: channel.priority,
    });
  };

  const handleEdit = async () => {
    if (!editChannel) return;
    setEditLoading(true);
    try {
      // 过滤掉空值，apiKey 为空时不更新
      const payload: UpdateChannelInput = {};
      if (editForm.name) payload.name = editForm.name;
      if (editForm.baseUrl) payload.baseUrl = editForm.baseUrl;
      if (editForm.apiKey) payload.apiKey = editForm.apiKey;
      if (editForm.weight !== undefined) payload.weight = editForm.weight;
      if (editForm.priority !== undefined) payload.priority = editForm.priority;

      await api.channels.update(editChannel.id, payload);
      setEditChannel(null);
      loadChannels();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新渠道失败');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await api.channels.delete(deleteId);
      setDeleteId(null);
      loadChannels();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除渠道失败');
    } finally {
      setDeleteLoading(false);
    }
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success' as const;
      case 'ERROR': return 'destructive' as const;
      case 'RATE_LIMITED': return 'warning' as const;
      default: return 'secondary' as const;
    }
  };

  const columns: DataTableColumn<Channel>[] = [
    { key: 'name', header: '名称' },
    {
      key: 'provider',
      header: 'Provider',
      render: (c) => c.provider?.displayName ?? '-',
    },
    { key: 'keyPrefix', header: 'API Key', render: (c) => <span className="font-mono text-xs">{c.keyPrefix}</span> },
    { key: 'weight', header: '权重' },
    { key: 'priority', header: '优先级' },
    {
      key: 'status',
      header: '状态',
      render: (c) => (
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
          {!c.isActive && <Badge variant="secondary">已禁用</Badge>}
        </div>
      ),
    },
    {
      key: 'stats',
      header: '请求/失败率',
      render: (c) => (
        <span className="text-xs text-muted-foreground">
          {c.totalRequests} / {formatPercent(c.failedRequests, c.totalRequests)}
        </span>
      ),
    },
    { key: 'avgLatencyMs', header: '延迟', render: (c) => `${c.avgLatencyMs}ms` },
    {
      key: 'actions',
      header: '操作',
      render: (c) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEditDialog(c)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleToggle(c.id, !c.isActive)}>
            {c.isActive
              ? <ToggleRight className="h-4 w-4 text-emerald-400" />
              : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteId(c.id)}>
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
        <h3 className="text-lg font-semibold text-foreground">渠道列表</h3>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          添加渠道
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={channels}
        loading={loading}
        emptyText="暂无渠道"
        pagination={{ page, totalPages, onPageChange: setPage }}
      />

      {/* 创建渠道对话框 */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加渠道</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Provider ID</label>
              <Input
                value={createForm.providerId}
                onChange={(e) => setCreateForm({ ...createForm, providerId: e.target.value })}
                placeholder="Provider ID"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">渠道名称</label>
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="DeepSeek Main"
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
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">上游 API Key</label>
              <Input
                type="password"
                value={createForm.apiKey}
                onChange={(e) => setCreateForm({ ...createForm, apiKey: e.target.value })}
                placeholder="sk-..."
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

      {/* 编辑渠道对话框 */}
      <Dialog open={editChannel !== null} onOpenChange={(open) => !open && setEditChannel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑渠道</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">渠道名称</label>
              <Input
                value={editForm.name ?? ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="DeepSeek Main"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">API 基础 URL</label>
              <Input
                value={editForm.baseUrl ?? ''}
                onChange={(e) => setEditForm({ ...editForm, baseUrl: e.target.value })}
                placeholder="https://api.deepseek.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">上游 API Key（留空不更新）</label>
              <Input
                type="password"
                value={editForm.apiKey ?? ''}
                onChange={(e) => setEditForm({ ...editForm, apiKey: e.target.value })}
                placeholder="留空则保持原有 Key"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">权重（1-100）</label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={editForm.weight ?? 50}
                  onChange={(e) => setEditForm({ ...editForm, weight: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">优先级</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={editForm.priority ?? 0}
                  onChange={(e) => setEditForm({ ...editForm, priority: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditChannel(null)}>取消</Button>
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
        title="删除渠道"
        description="确定要删除此渠道吗？此操作不可撤销。"
        confirmLabel="删除"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
