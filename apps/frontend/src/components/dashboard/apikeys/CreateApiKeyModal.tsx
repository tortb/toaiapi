"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { createApiKey, type CreateApiKeyResult } from "@/lib/user-api";
import { useToast } from "@/components/dashboard/ui/Toast";

interface CreateApiKeyModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (result: CreateApiKeyResult) => void;
}

export function CreateApiKeyModal({
  open,
  onClose,
  onCreated,
}: CreateApiKeyModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    count: 1,
    unlimited_quota: false,
    rpm_limit: 0,
    tpm_limit: 0,
    expires_at: "",
    group_id: "",
    ip_whitelist: "",
    model_limit: "",
  });

  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name || formData.name.length < 2 || formData.name.length > 50) {
      errors.name = "名称需要 2-50 个字符";
    }
    if (formData.count < 1 || formData.count > 100) {
      errors.count = "数量需要在 1-100 之间";
    }
    if (formData.expires_at) {
      const expDate = new Date(formData.expires_at);
      if (expDate <= new Date()) {
        errors.expires_at = "过期时间必须晚于当前时间";
      }
    }
    if (formData.ip_whitelist) {
      try {
        const parsed = JSON.parse(formData.ip_whitelist);
        if (!Array.isArray(parsed)) errors.ip_whitelist = "请输入 JSON 数组格式";
      } catch {
        errors.ip_whitelist = "JSON 格式不正确";
      }
    }
    if (formData.model_limit) {
      try {
        const parsed = JSON.parse(formData.model_limit);
        if (!Array.isArray(parsed)) errors.model_limit = "请输入 JSON 数组格式";
      } catch {
        errors.model_limit = "JSON 格式不正确";
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const result = await createApiKey({
        name: formData.name,
        count: formData.count,
        unlimitedQuota: formData.unlimited_quota,
        rpmLimit: formData.rpm_limit,
        tpmLimit: formData.tpm_limit,
        expiresAt: formData.expires_at || undefined,
        groupId: formData.group_id || undefined,
        ipWhitelist: formData.ip_whitelist || undefined,
        modelLimit: formData.model_limit || undefined,
      });
      onCreated(result);
      toast("success", "API 密钥创建成功");
    } catch (error: any) {
      toast("error", error.message || "创建失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="创建 API 密钥"
      description="通过提供必要信息添加新的 API 密钥"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            取消
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting}>
            保存
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-neutral-900 border-l-2 border-blue-500 pl-2">基本信息</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="密钥名称"
              placeholder="例如：生产环境"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="批量创建数量"
              type="number"
              min={1}
              max={100}
              value={formData.count}
              onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) || 1 })}
              hint="将为名称添加随机后缀"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-neutral-900 border-l-2 border-emerald-500 pl-2">额度设置</h4>
          <div className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-neutral-900">无限配额</p>
              <p className="text-xs text-neutral-500">为此 API 密钥启用无限配额（不计入用户余额）</p>
            </div>
            <Switch
              checked={formData.unlimited_quota}
              onCheckedChange={(checked) => setFormData({ ...formData, unlimited_quota: checked })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-neutral-900 border-l-2 border-amber-500 pl-2">高级限制</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="RPM 限制"
              type="number"
              min={0}
              placeholder="0 表示无限制"
              value={formData.rpm_limit}
              onChange={(e) => setFormData({ ...formData, rpm_limit: parseInt(e.target.value) || 0 })}
              hint="每分钟最大请求数"
            />
            <Input
              label="TPM 限制"
              type="number"
              min={0}
              placeholder="0 表示无限制"
              value={formData.tpm_limit}
              onChange={(e) => setFormData({ ...formData, tpm_limit: parseInt(e.target.value) || 0 })}
              hint="每分钟最大 Token 数"
            />
            <Input
              label="过期时间"
              type="datetime-local"
              value={formData.expires_at}
              onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              hint="留空表示永久有效"
            />
            <Select
              label="用户分组"
              value={formData.group_id}
              onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
              options={[
                { label: "默认分组", value: "default" },
                { label: "VIP 分组", value: "vip" },
              ]}
              placeholder="请选择分组"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-neutral-900 border-l-2 border-purple-500 pl-2">访问控制</h4>
          <div className="grid grid-cols-1 gap-4">
            <Textarea
              label="IP 白名单"
              placeholder='例如：["127.0.0.1", "192.168.1.1"]'
              value={formData.ip_whitelist}
              onChange={(e) => setFormData({ ...formData, ip_whitelist: e.target.value })}
              hint="请输入 JSON 数组格式的 IP 列表"
            />
            <Textarea
              label="模型限制"
              placeholder='例如：["gpt-4", "claude-3-opus"]'
              value={formData.model_limit}
              onChange={(e) => setFormData({ ...formData, model_limit: e.target.value })}
              hint="请输入 JSON 数组格式的模型列表，留空表示不限制"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
