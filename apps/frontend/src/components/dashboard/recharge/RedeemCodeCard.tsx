'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Gift, Check, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function RedeemCodeCard() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; amount?: number } | null>(null);
  const { toast } = useToast();

  const handleRedeem = async () => {
    if (!code.trim()) {
      toast({
        title: '请输入兑换码',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await api.post('/redeem', { code: code.toUpperCase().trim() });
      const { rewardYuan } = res.data;

      setResult({
        success: true,
        message: `兑换成功！获得 ¥${rewardYuan.toFixed(2)} 余额`,
        amount: rewardYuan,
      });

      toast({
        title: '兑换成功',
        description: `获得 ¥${rewardYuan.toFixed(2)} 余额`,
      });

      setCode('');

      // 3秒后清除结果
      setTimeout(() => {
        setResult(null);
      }, 3000);
    } catch (error: any) {
      const message = error.response?.data?.message || '兑换失败';
      setResult({
        success: false,
        message,
      });

      toast({
        title: '兑换失败',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          <CardTitle>兑换码充值</CardTitle>
        </div>
        <CardDescription>使用兑换码为账户充值</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="redeem-code">兑换码</Label>
          <div className="flex gap-2">
            <Input
              id="redeem-code"
              placeholder="请输入8位兑换码"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={8}
              className="font-mono"
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRedeem();
                }
              }}
            />
            <Button onClick={handleRedeem} disabled={loading || !code.trim()}>
              {loading ? '兑换中...' : '兑换'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            兑换码不区分大小写，通常为8位字母和数字组合
          </p>
        </div>

        {result && (
          <Alert variant={result.success ? 'default' : 'destructive'}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
              <AlertDescription>{result.message}</AlertDescription>
            </div>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
