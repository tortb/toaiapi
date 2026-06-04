'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Save, CreditCard } from 'lucide-react';

interface PaymentConfig {
  id: string;
  name: string;
  display_name: string;
  is_enabled: boolean;
  merchant_id: string | null;
  merchant_key: string | null;
  merchant_secret: string | null;
  api_endpoint: string | null;
  notify_url: string | null;
  return_url: string | null;
  extra_config: any;
}

/**
 * 支付配置管理页面
 *
 * 支持配置易支付、支付宝、微信支付三种支付方式。
 * 敏感字段（密钥、私钥）脱敏显示，更新时才加密存储。
 */
export default function PaymentConfigPage() {
  const [configs, setConfigs] = useState<PaymentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('epay');

  // 表单状态
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const data = await api.paymentConfigs.list();
      setConfigs(data);

      // 初始化表单数据
      const initialData: Record<string, any> = {};
      data.forEach((config: PaymentConfig) => {
        initialData[config.name] = {
          display_name: config.display_name,
          is_enabled: config.is_enabled,
          merchant_id: config.merchant_id || '',
          merchant_key: '', // 不回显密钥
          merchant_secret: '', // 不回显私钥
          api_endpoint: config.api_endpoint || '',
          notify_url: config.notify_url || '',
          return_url: config.return_url || '',
          extra_config: config.extra_config || {},
        };
      });
      setFormData(initialData);
    } catch (error) {
      toast.error('获取支付配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (name: string) => {
    try {
      setSaving(name);
      const data = formData[name];

      // 只提交非空字段
      const updateData: any = {};
      if (data.display_name) updateData.display_name = data.display_name;
      if (data.is_enabled !== undefined) updateData.is_enabled = data.is_enabled;
      if (data.merchant_id) updateData.merchant_id = data.merchant_id;
      if (data.merchant_key) updateData.merchant_key = data.merchant_key;
      if (data.merchant_secret) updateData.merchant_secret = data.merchant_secret;
      if (data.api_endpoint) updateData.api_endpoint = data.api_endpoint;
      if (data.notify_url) updateData.notify_url = data.notify_url;
      if (data.return_url) updateData.return_url = data.return_url;
      if (data.extra_config && Object.keys(data.extra_config).length > 0) {
        updateData.extra_config = data.extra_config;
      }

      await api.paymentConfigs.update(name, updateData);
      toast.success('支付配置已更新');
      fetchConfigs();
    } catch (error) {
      toast.error('更新支付配置失败');
    } finally {
      setSaving(null);
    }
  };

  const handleToggle = async (name: string) => {
    try {
      await api.paymentConfigs.toggle(name);
      toast.success('支付配置状态已切换');
      fetchConfigs();
    } catch (error) {
      toast.error('切换支付配置状态失败');
    }
  };

  const updateFormField = (name: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const configTabs = [
    { id: 'epay', label: '易支付 (EPay)' },
    { id: 'alipay', label: '支付宝' },
    { id: 'wechatpay', label: '微信支付' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">支付配置</h1>
          <p className="text-sm text-muted-foreground">配置支付渠道的商户信息和回调地址</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {configTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {configTabs.map((tab) => {
          const config = configs.find((c) => c.name === tab.id);
          const form = formData[tab.id] || {};

          return (
            <TabsContent key={tab.id} value={tab.id}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{config?.display_name || tab.label}</CardTitle>
                      <CardDescription>配置{tab.label}支付的商户信息</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`${tab.id}-enabled`}>启用</Label>
                      <Switch
                        id={`${tab.id}-enabled`}
                        checked={form.is_enabled || false}
                        onCheckedChange={(checked) => handleToggle(tab.id)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 易支付特有字段 */}
                  {tab.id === 'epay' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="epay-api-endpoint">API网关地址</Label>
                        <Input
                          id="epay-api-endpoint"
                          placeholder="https://pay.example.com"
                          value={form.api_endpoint || ''}
                          onChange={(e) => updateFormField(tab.id, 'api_endpoint', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="epay-merchant-id">商户ID (PID)</Label>
                        <Input
                          id="epay-merchant-id"
                          placeholder="10001"
                          value={form.merchant_id || ''}
                          onChange={(e) => updateFormField(tab.id, 'merchant_id', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="epay-merchant-key">商户密钥 (Key)</Label>
                        <Input
                          id="epay-merchant-key"
                          type="password"
                          placeholder="输入新的密钥（留空不修改）"
                          value={form.merchant_key || ''}
                          onChange={(e) => updateFormField(tab.id, 'merchant_key', e.target.value)}
                        />
                        {config?.merchant_key && (
                          <p className="text-xs text-muted-foreground">当前: {config.merchant_key}</p>
                        )}
                      </div>
                    </>
                  )}

                  {/* 支付宝特有字段 */}
                  {tab.id === 'alipay' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="alipay-app-id">应用ID (APPID)</Label>
                        <Input
                          id="alipay-app-id"
                          placeholder="2021000000000000"
                          value={form.merchant_id || ''}
                          onChange={(e) => updateFormField(tab.id, 'merchant_id', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="alipay-public-key">支付宝公钥</Label>
                        <Input
                          id="alipay-public-key"
                          type="password"
                          placeholder="输入支付宝公钥（留空不修改）"
                          value={form.merchant_key || ''}
                          onChange={(e) => updateFormField(tab.id, 'merchant_key', e.target.value)}
                        />
                        {config?.merchant_key && (
                          <p className="text-xs text-muted-foreground">当前: {config.merchant_key}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="alipay-private-key">应用私钥</Label>
                        <Input
                          id="alipay-private-key"
                          type="password"
                          placeholder="输入应用私钥（留空不修改）"
                          value={form.merchant_secret || ''}
                          onChange={(e) => updateFormField(tab.id, 'merchant_secret', e.target.value)}
                        />
                        {config?.merchant_secret && (
                          <p className="text-xs text-muted-foreground">当前: {config.merchant_secret}</p>
                        )}
                      </div>
                    </>
                  )}

                  {/* 微信支付特有字段 */}
                  {tab.id === 'wechatpay' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="wechatpay-appid">公众号/小程序APPID</Label>
                        <Input
                          id="wechatpay-appid"
                          placeholder="wx1234567890abcdef"
                          value={form.extra_config?.appId || ''}
                          onChange={(e) =>
                            updateFormField(tab.id, 'extra_config', {
                              ...form.extra_config,
                              appId: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wechatpay-mchid">商户号 (MCHID)</Label>
                        <Input
                          id="wechatpay-mchid"
                          placeholder="1234567890"
                          value={form.merchant_id || ''}
                          onChange={(e) => updateFormField(tab.id, 'merchant_id', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wechatpay-apiv3-key">APIv3密钥</Label>
                        <Input
                          id="wechatpay-apiv3-key"
                          type="password"
                          placeholder="输入APIv3密钥（留空不修改）"
                          value={form.merchant_key || ''}
                          onChange={(e) => updateFormField(tab.id, 'merchant_key', e.target.value)}
                        />
                        {config?.merchant_key && (
                          <p className="text-xs text-muted-foreground">当前: {config.merchant_key}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wechatpay-private-key">商户私钥</Label>
                        <Input
                          id="wechatpay-private-key"
                          type="password"
                          placeholder="输入商户私钥（留空不修改）"
                          value={form.merchant_secret || ''}
                          onChange={(e) => updateFormField(tab.id, 'merchant_secret', e.target.value)}
                        />
                        {config?.merchant_secret && (
                          <p className="text-xs text-muted-foreground">当前: {config.merchant_secret}</p>
                        )}
                      </div>
                    </>
                  )}

                  {/* 通用回调地址 */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`${tab.id}-notify-url`}>异步通知地址</Label>
                      <Input
                        id={`${tab.id}-notify-url`}
                        placeholder="https://api.example.com/payment/notify/{name}"
                        value={form.notify_url || ''}
                        onChange={(e) => updateFormField(tab.id, 'notify_url', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${tab.id}-return-url`}>同步跳转地址</Label>
                      <Input
                        id={`${tab.id}-return-url`}
                        placeholder="https://example.com/payment/success"
                        value={form.return_url || ''}
                        onChange={(e) => updateFormField(tab.id, 'return_url', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => handleSave(tab.id)} disabled={saving === tab.id}>
                      {saving === tab.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          保存中...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          保存配置
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
