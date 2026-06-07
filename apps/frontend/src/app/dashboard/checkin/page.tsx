'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Gift, Calendar, TrendingUp, Coins } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CheckinStats {
  totalDays: number;
  totalReward: number;
  consecutiveDays: number;
}

interface CheckinConfig {
  is_enabled: boolean;
  min_reward: number;
  max_reward: number;
}

interface CheckinHistory {
  id: string;
  check_date: string;
  reward: number;
  created_at: string;
}

export default function CheckinPage() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [stats, setStats] = useState<CheckinStats | null>(null);
  const [config, setConfig] = useState<CheckinConfig | null>(null);
  const [history, setHistory] = useState<CheckinHistory[]>([]);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, configRes, historyRes] = await Promise.all([
        api.get('/checkin/stats'),
        api.get('/checkin/config'),
        api.get('/checkin/history?limit=7'),
      ]);

      setStats(statsRes.data);
      setConfig(configRes.data);
      setHistory(historyRes.data);

      // 检查今天是否已签到
      if (historyRes.data.length > 0) {
        const today = new Date().toISOString().slice(0, 10);
        const lastCheckDate = new Date(historyRes.data[0].check_date).toISOString().slice(0, 10);
        setHasCheckedInToday(today === lastCheckDate);
      }
    } catch (error: any) {
      toast({
        title: '加载失败',
        description: error.response?.data?.message || '无法加载签到数据',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async () => {
    setChecking(true);
    try {
      const res = await api.post('/checkin');
      const { reward, consecutiveDays } = res.data;

      toast({
        title: '签到成功！',
        description: `获得 ¥${(reward / 100).toFixed(2)} 奖励，已连续签到 ${consecutiveDays} 天`,
      });

      // 刷新数据
      await loadData();
    } catch (error: any) {
      toast({
        title: '签到失败',
        description: error.response?.data?.message || '签到失败，请稍后再试',
        variant: 'destructive',
      });
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-6xl py-8 space-y-6">
        <Skeleton className="h-12 w-48" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!config?.is_enabled) {
    return (
      <div className="container max-w-6xl py-8">
        <Alert>
          <AlertDescription>签到功能暂未开放</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">每日签到</h1>
        <p className="text-muted-foreground mt-2">
          每天签到可获得 ¥{(config.min_reward / 100).toFixed(2)} ~ ¥{(config.max_reward / 100).toFixed(2)} 随机奖励
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">累计签到</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDays || 0} 天</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">连续签到</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.consecutiveDays || 0} 天</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">累计奖励</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{((stats?.totalReward || 0) / 100).toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* 签到按钮 */}
      <Card>
        <CardHeader>
          <CardTitle>今日签到</CardTitle>
          <CardDescription>点击按钮完成今日签到，获得随机奖励</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-8">
          {hasCheckedInToday ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                <Gift className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">今日已签到</p>
                <p className="text-sm text-muted-foreground mt-1">明天再来吧！</p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <Button
                size="lg"
                onClick={handleCheckin}
                disabled={checking}
                className="h-16 px-12 text-lg"
              >
                {checking ? '签到中...' : '立即签到'}
              </Button>
              <p className="text-sm text-muted-foreground">
                点击签到，获得 ¥{(config.min_reward / 100).toFixed(2)} ~ ¥{(config.max_reward / 100).toFixed(2)} 奖励
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 签到历史 */}
      <Card>
        <CardHeader>
          <CardTitle>最近签到记录</CardTitle>
          <CardDescription>最近 7 天的签到历史</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">暂无签到记录</div>
          ) : (
            <div className="space-y-2">
              {history.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Gift className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {new Date(record.check_date).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(record.created_at).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      +¥{(record.reward / 100).toFixed(2)}
                    </p>
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
