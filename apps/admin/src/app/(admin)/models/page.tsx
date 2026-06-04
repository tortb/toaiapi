'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/services/api';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorAlert } from '@/components/error-alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Plus, Pencil, Trash2, DollarSign } from 'lucide-react';
import { formatDate, formatAmount } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Model, CreateModelInput, UpdateModelInput, UpsertPricingInput } from '@/types';

/** 模型管理页面 */
export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 创建对话框
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateModelInput>({
    name: '', displayName: '', providerId: '', maxContext: 128000,
  });
  const [createLoading, setCreateLoading] = useState(false);

  // 编辑对话框
  const [editModel, setEditModel] = useState<Model | null>(null);
  const [editForm, setEditForm] = useState<UpdateModelInput>({});
  const [editLoading, setEditLoading] = useState(false);

  // 定价对话框
  const [pricingModelId, setPricingModelId] = useState<string | null>(null);
  const [pricingForm, setPricingForm] = useState<UpsertPricingInput>({
    inputPrice: 0, outputPrice: 0,
  });
  const [pricingLoading, setPricingLoading] = useState(false);

  // 删除确认
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadModels = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.models.list(page);
      setModels(data.items);
      setTotalPages(data.totalPages);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载模型列表失败');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  const handleCreate = async () => {
    setCreateLoading(true);
    try {
      await api.models.create(createForm);
      setShowCreate(false);
      setCreateForm({ name: '', displayName: '', providerId: '', maxContext: 128000 });
      loadModels();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建模型失败');
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditDialog = (model: Model) => {
    setEditModel(model);
    setEditForm({
      displayName: model.displayName,
      maxContext: model.maxContext,
      supportsStreaming: model.supportsStreaming,
      supportsTools: model.supportsTools,
      supportsVision: model.supportsVision,
      isActive: model.isActive,
    });
  };

  const handleEdit = async () => {
    if (!editModel) return;
    setEditLoading(true);
    try {
      await api.models.update(editModel.id, editForm);
      setEditModel(null);
      loadModels();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新模型失败');
    } finally {
      setEditLoading(false);
    }
  };

  const handlePricing = async () => {
    if (!pricingModelId) return;
    setPricingLoading(true);
    try {
      await api.models.upsertPricing(pricingModelId, pricingForm);
      setPricingModelId(null);
      loadModels();
    } catch (err) {
      setError(err instanceof Error ? err.message : '设置定价失败');
    } finally {
      setPricingLoading(false);
    }
  };

  const openPricingDialog = (model: Model) => {
    setPricingModelId(model.id);
    setPricingForm({
      inputPrice: model.pricing?.inputPrice ?? 0,
      outputPrice: model.pricing?.outputPrice ?? 0,
      cachedPrice: model.pricing?.cachedPrice ?? undefined,
      reasoningPrice: model.pricing?.reasoningPrice ?? undefined,
      multiplier: model.pricing?.multiplier ?? 1.0,
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await api.models.delete(deleteId);
      setDeleteId(null);
      loadModels();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除模型失败');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: DataTableColumn<Model>[] = [
    { key: 'name', header: '名称', render: (m) => <span className="font-mono text-sm">{m.name}</span> },
    { key: 'displayName', header: '显示名称' },
    { key: 'providerId', header: 'Provider' },
    { key: 'maxContext', header: '上下文', render: (m) => `${(m.maxContext / 1000).toFixed(0)}K` },
    {
      key: 'capabilities',
      header: '能力',
      render: (m) => (
        <div className="flex gap-1">
          {m.supportsStreaming && <Badge variant="secondary">流式</Badge>}
          {m.supportsTools && <Badge variant="secondary">工具</Badge>}
          {m.supportsVision && <Badge variant="secondary">视觉</Badge>}
        </div>
      ),
    },
    {
      key: 'pricing',
      header: '定价（分/百万token）',
      render: (m) => m.pricing
        ? `入${m.pricing.inputPrice} / 出${m.pricing.outputPrice}`
        : <span className="text-muted-foreground">未设置</span>,
    },
    {
      key: 'isActive',
      header: '状态',
      render: (m) => (
        <Badge variant={m.isActive ? 'success' : 'destructive'}>
          {m.isActive ? '启用' : '禁用'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '操作',
      render: (m) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEditDialog(m)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openPricingDialog(m)}>
            <DollarSign className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteId(m.id)}>
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
        <h3 className="text-lg font-semibold text-foreground">模型列表</h3>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          添加模型
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={models}
        loading={loading}
        emptyText="暂无模型"
        pagination={{ page, totalPages, onPageChange: setPage }}
      />

      {/* 创建模型对话框 */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加模型</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">模型名称（唯一）</label>
              <Input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="deepseek-chat" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">显示名称</label>
              <Input value={createForm.displayName} onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })} placeholder="DeepSeek Chat" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Provider 名称</label>
              <Input value={createForm.providerId} onChange={(e) => setCreateForm({ ...createForm, providerId: e.target.value })} placeholder="deepseek" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">最大上下文</label>
              <Input type="number" value={createForm.maxContext} onChange={(e) => setCreateForm({ ...createForm, maxContext: Number(e.target.value) })} />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreate(false)}>取消</Button>
              <Button onClick={handleCreate} disabled={createLoading}>{createLoading ? '创建中...' : '创建'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 编辑模型对话框 */}
      <Dialog open={editModel !== null} onOpenChange={(open) => !open && setEditModel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑模型</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">显示名称</label>
              <Input value={editForm.displayName ?? ''} onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })} placeholder="DeepSeek Chat" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">最大上下文</label>
              <Input type="number" value={editForm.maxContext ?? 0} onChange={(e) => setEditForm({ ...editForm, maxContext: Number(e.target.value) })} />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground">能力</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editForm.supportsStreaming ?? false} onChange={(e) => setEditForm({ ...editForm, supportsStreaming: e.target.checked })} className="rounded border-border" />
                  流式输出
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editForm.supportsTools ?? false} onChange={(e) => setEditForm({ ...editForm, supportsTools: e.target.checked })} className="rounded border-border" />
                  工具调用
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editForm.supportsVision ?? false} onChange={(e) => setEditForm({ ...editForm, supportsVision: e.target.checked })} className="rounded border-border" />
                  视觉
                </label>
              </div>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editForm.isActive ?? true} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} className="rounded border-border" />
                启用
              </label>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditModel(null)}>取消</Button>
              <Button onClick={handleEdit} disabled={editLoading}>{editLoading ? '保存中...' : '保存'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 定价对话框 */}
      <Dialog open={pricingModelId !== null} onOpenChange={(open) => !open && setPricingModelId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>设置模型定价</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">价格单位：分/百万 token</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">输入价格</label>
                <Input type="number" value={pricingForm.inputPrice} onChange={(e) => setPricingForm({ ...pricingForm, inputPrice: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">输出价格</label>
                <Input type="number" value={pricingForm.outputPrice} onChange={(e) => setPricingForm({ ...pricingForm, outputPrice: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setPricingModelId(null)}>取消</Button>
              <Button onClick={handlePricing} disabled={pricingLoading}>{pricingLoading ? '保存中...' : '保存'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="删除模型"
        description="确定要删除此模型吗？历史请求日志中的模型名称将保留。"
        confirmLabel="删除"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
