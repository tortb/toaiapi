'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Link2, Copy, Gift, TrendingUp, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface InviteStats {
  totalInvites: number;
  totalReward: number;
  pendingReward: number;
}

interface InviteRecord {
  id: string;
  reward: number;
  pending_reward: number;
  recharge_count: number;
  created_at: string;
  invitee: {
    email: string;
    display_name: string | null;
    created_at: string;
  };
}

export default function InvitePage() {
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [stats, setStats] = useState<InviteStats | null>(null);
  const [records, setRecords] = useState<InviteRecord[]>([]);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [codeRes, statsRes, recordsRes] = await Promise.all([
        api.get('/invite/code'),
        api.get('/invite/stats'),
        api.get('/invite/records'),
      ]);

      setInviteCode(codeRes.data.inviteCode);
      setInviteLink(codeRes.data.inviteLink);
      setStats(statsRes.data);
      setRecords(recordsRes.data);
    } catch (error: any) {
      toast({
        title: '加载失败',
        description: error.response?.data?.message || '无法加载邀请数据',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: '已复制',
      description: `${label}已复制到剪贴板`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="container max-w-6xl py-8 space-y-6">
        <Skeleton className="h-12 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">邀请好友</h1>
        <p className="text-muted-foreground mt-2">
          邀请好友注册，双方获得奖励。好友每次充值，您还能获得 10% 返现！
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">邀请人数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalInvites || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              成功邀请的用户数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">已获奖励</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{((stats?.totalReward || 0) / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              累计邀请奖励
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">待确认奖励</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{((stats?.pendingReward || 0) / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              等待确认的奖励
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 邀请码 */}
      <Card>
        <CardHeader>
          <CardTitle>我的邀请码</CardTitle>
          <CardDescription>
            分享邀请码或邀请链接给好友，好友注册后双方各获得奖励
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-code">邀请码</Label>
            <div className="flex gap-2">
              <Input
                id="invite-code"
                value={inviteCode}
                readOnly
                className="font-mono text-lg font-bold"
              />
              <Button
                variant="outline"
                onClick={() => handleCopy(inviteCode, '邀请码')}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-link">邀请链接</Label>
            <div className="flex gap-2">
              <Input
                id="invite-link"
                value={inviteLink}
                readOnly
                className="text-sm"
              />
              <Button
                variant="outline"
                onClick={() => handleCopy(inviteLink, '邀请链接')}
              >
                <Link2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">邀请奖励规则</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 新用户通过您的邀请码注册，双方各获得 ¥50 奖励</li>
              <li>• 被邀请人每次充值，您可获得充值金额 10% 的返现</li>
              <li>• 奖励实时到账，可立即使用</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 邀请记录 */}
      <Card>
        <CardHeader>
          <CardTitle>邀请记录</CardTitle>
          <CardDescription>您邀请的用户及获得的奖励</CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无邀请记录，快去邀请好友吧！
            </div>
          ) : (
            <div className="space-y-2">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {record.invitee.display_name || record.invitee.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        注册于 {new Date(record.invitee.created_at).toLocaleDateString('zh-CN')} · 充值 {record.recharge_count} 次
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      +¥{(record.reward / 100).toFixed(2)}
                    </p>
                    {record.pending_reward > 0 && (
                      <p className="text-xs text-muted-foreground">
                        待确认 ¥{(record.pending_reward / 100).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
