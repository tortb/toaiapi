"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui";

interface QuotaSettings {
  initialQuota: number;
  deductionQuota: number;
  inviteQuota: number;
  invitedQuota: number;
  zeroCostPreDeduct: boolean;
  externalRechargeUrl: string;
  docsUrl: string;
}

interface QuotaSettingsTabProps {
  settings: QuotaSettings;
  onSave: (settings: QuotaSettings) => Promise<void>;
  isSaving?: boolean;
}

export function QuotaSettingsTab({ settings, onSave, isSaving }: QuotaSettingsTabProps) {
  const toast = useToast();
  const [form, setForm] = React.useState(settings);

  React.useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSave = async () => {
    try {
      await onSave(form);
      toast.success("额度设置已保存");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "保存失败");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="初始配额 (分)"
          type="number"
          value={form.initialQuota}
          onChange={(e) => setForm({ ...form, initialQuota: Number(e.target.value) })}
          hint="授予新用户的初始配额"
        />
        <Input
          label="扣费配额 (分)"
          type="number"
          value={form.deductionQuota}
          onChange={(e) => setForm({ ...form, deductionQuota: Number(e.target.value) })}
          hint="向用户收费前消耗的配额"
        />
        <Input
          label="邀请配额 (分)"
          type="number"
          value={form.inviteQuota}
          onChange={(e) => setForm({ ...form, inviteQuota: Number(e.target.value) })}
          hint="授予邀请其他用户的配额"
        />
        <Input
          label="被邀请配额 (分)"
          type="number"
          value={form.invitedQuota}
          onChange={(e) => setForm({ ...form, invitedQuota: Number(e.target.value) })}
          hint="授予被邀请用户的配额"
        />
      </div>

      <div className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3">
        <div>
          <p className="text-sm text-neutral-700">零成本模型预扣配额</p>
          <p className="text-xs text-neutral-400 mt-0.5">
            对于免费模型，是否预扣配额
          </p>
        </div>
        <Switch
          checked={form.zeroCostPreDeduct}
          onCheckedChange={(checked) => setForm({ ...form, zeroCostPreDeduct: checked })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="外部充值链接"
          value={form.externalRechargeUrl}
          onChange={(e) => setForm({ ...form, externalRechargeUrl: e.target.value })}
          placeholder="https://..."
        />
        <Input
          label="文档链接"
          value={form.docsUrl}
          onChange={(e) => setForm({ ...form, docsUrl: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <Button onClick={handleSave} loading={isSaving}>
        保存额度设置
      </Button>
    </div>
  );
}
