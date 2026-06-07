"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui";

interface CheckInConfig {
  enabled: boolean;
  minReward: number;
  maxReward: number;
}

interface CheckInRewardsTabProps {
  config: CheckInConfig;
  onSave: (config: CheckInConfig) => Promise<void>;
  isSaving?: boolean;
}

export function CheckInRewardsTab({ config, onSave, isSaving }: CheckInRewardsTabProps) {
  const toast = useToast();
  const [form, setForm] = React.useState(config);

  React.useEffect(() => {
    setForm(config);
  }, [config]);

  const handleSave = async () => {
    try {
      await onSave(form);
      toast.success("签到奖励设置已保存");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "保存失败");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3">
        <div>
          <p className="text-sm text-neutral-700">启用每日签到</p>
          <p className="text-xs text-neutral-400 mt-0.5">
            用户每日签到可获得随机额度奖励
          </p>
        </div>
        <Switch
          checked={form.enabled}
          onCheckedChange={(checked) => setForm({ ...form, enabled: checked })}
        />
      </div>

      {form.enabled && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="最小奖励额度 (分)"
            type="number"
            value={form.minReward}
            onChange={(e) => setForm({ ...form, minReward: Number(e.target.value) })}
            hint="每日签到可获得的最小额度"
            min={0}
          />
          <Input
            label="最大奖励额度 (分)"
            type="number"
            value={form.maxReward}
            onChange={(e) => setForm({ ...form, maxReward: Number(e.target.value) })}
            hint="每日签到可获得的最大额度"
            min={0}
          />
        </div>
      )}

      <Button onClick={handleSave} loading={isSaving}>
        保存签到设置
      </Button>
    </div>
  );
}
