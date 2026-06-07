"use client";

import * as React from "react";
import { Gift, Copy, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/dashboard/ui/Toast";

interface InviteRewardsProps {
  stats: {
    pendingReward: number;
    totalReward: number;
    inviteCount: number;
    rewardRatio: number;
  };
  inviteUrl: string;
}

export function InviteRewards({ stats, inviteUrl }: InviteRewardsProps) {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast("success", "邀请链接已复制");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">邀请奖励</h3>
          <p className="text-xs text-neutral-500">推荐好友使用，赚取永久佣金返利</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl bg-neutral-50 p-4">
          <p className="text-[10px] font-bold text-neutral-400 uppercase">待使用收益</p>
          <p className="mt-1 text-lg font-bold text-neutral-900">¥{stats.pendingReward.toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-neutral-50 p-4">
          <p className="text-[10px] font-bold text-neutral-400 uppercase">累计邀请</p>
          <p className="mt-1 text-lg font-bold text-neutral-900">{stats.inviteCount} 人</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-neutral-500">您的专用邀请链接</p>
          <div className="flex gap-2">
            <div className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600 font-mono truncate">
              {inviteUrl}
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="shrink-0"
              onClick={handleCopy}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4">
          <p className="text-[10px] font-semibold text-purple-700 leading-relaxed">
            <strong>规则：</strong> 每成功邀请一位用户，您将获得该用户后续所有消费的 <span className="font-bold">{stats.rewardRatio}%</span> 作为佣金。奖励实时计入收益，满额可抵扣充值。
          </p>
        </div>
      </div>
    </div>
  );
}
