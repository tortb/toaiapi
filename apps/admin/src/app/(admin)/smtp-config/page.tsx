'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Save, Mail, Send, Wifi } from 'lucide-react';

interface SmtpConfig {
  id: string;
  name: string;
  is_enabled: boolean;
  host: string | null;
  port: number;
  secure: boolean;
  username: string | null;
  password: string | null;
  from_name: string | null;
  from_address: string | null;
}

/**
 * SMTP配置管理页面
 *
 * 配置邮件服务器信息，支持测试连接和发送测试邮件。
 * 密码字段脱敏显示，更新时才加密存储。
 */
export default function SmtpConfigPage() {
  const [config, setConfig] = useState<SmtpConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [sending, setSending] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState({
    is_enabled: false,
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    from_name: '',
    from_address: '',
  });

  // 测试邮件地址
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await api.smtpConfig.get();
      setConfig(response.data);

      // 初始化表单（密码不回显）
      setFormData({
        is_enabled: response.data?.is_enabled || false,
        host: response.data?.host || '',
        port: response.data?.port || 587,
        secure: response.data?.secure || false,
        username: response.data?.username || '',
        password: '', // 不回显密码
        from_name: response.data?.from_name || '',
        from_address: response.data?.from_address || '',
      });
    } catch (error) {
      toast.error('获取SMTP配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // 只提交非空字段
      const updateData: any = {
        is_enabled: formData.is_enabled,
        host: formData.host,
        port: formData.port,
        secure: formData.secure,
      };

      if (formData.username) updateData.username = formData.username;
      if (formData.password) updateData.password = formData.password;
      if (formData.from_name) updateData.from_name = formData.from_name;
      if (formData.from_address) updateData.from_address = formData.from_address;

      await api.smtpConfig.update(updateData);
      toast.success('SMTP配置已更新');
      fetchConfig();
    } catch (error) {
      toast.error('更新SMTP配置失败');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    try {
      await api.smtpConfig.toggle();
      toast.success('SMTP配置状态已切换');
      fetchConfig();
    } catch (error) {
      toast.error('切换SMTP配置状态失败');
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      const result = await api.smtpConfig.testConnection();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || '连接测试失败');
      }
    } catch (error) {
      toast.error('连接测试失败');
    } finally {
      setTesting(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      toast.error('请输入测试邮箱地址');
      return;
    }

    try {
      setSending(true);
      const result = await api.smtpConfig.sendTest(testEmail);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || '发送测试邮件失败');
      }
    } catch (error) {
      toast.error('发送测试邮件失败');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Mail className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">邮件配置</h1>
          <p className="text-sm text-muted-foreground">配置SMTP邮件服务器，用于发送通知邮件</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>SMTP 服务器配置</CardTitle>
              <CardDescription>配置邮件服务器的连接信息</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="smtp-enabled">启用</Label>
              <Switch
                id="smtp-enabled"
                checked={formData.is_enabled}
                onCheckedChange={(checked) => {
                  setFormData((prev) => ({ ...prev, is_enabled: checked }));
                  handleToggle();
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smtp-host">SMTP服务器地址</Label>
              <Input
                id="smtp-host"
                placeholder="smtp.example.com"
                value={formData.host}
                onChange={(e) => setFormData((prev) => ({ ...prev, host: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-port">端口</Label>
              <Input
                id="smtp-port"
                type="number"
                placeholder="587"
                value={formData.port}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, port: parseInt(e.target.value) || 587 }))
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="smtp-secure"
              checked={formData.secure}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, secure: checked }))
              }
            />
            <Label htmlFor="smtp-secure">使用SSL/TLS</Label>
            <span className="text-xs text-muted-foreground">
              (端口465使用SSL，端口587使用STARTTLS)
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smtp-username">用户名</Label>
              <Input
                id="smtp-username"
                placeholder="user@example.com"
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-password">密码</Label>
              <Input
                id="smtp-password"
                type="password"
                placeholder="输入密码（留空不修改）"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              />
              {config?.password && (
                <p className="text-xs text-muted-foreground">当前: {config.password}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smtp-from-name">发件人名称</Label>
              <Input
                id="smtp-from-name"
                placeholder="ToAIAPI"
                value={formData.from_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, from_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-from-address">发件人邮箱</Label>
              <Input
                id="smtp-from-address"
                type="email"
                placeholder="noreply@example.com"
                value={formData.from_address}
                onChange={(e) => setFormData((prev) => ({ ...prev, from_address: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleTestConnection} disabled={testing}>
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  测试中...
                </>
              ) : (
                <>
                  <Wifi className="mr-2 h-4 w-4" />
                  测试连接
                </>
              )}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
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

      {/* 测试邮件发送 */}
      <Card>
        <CardHeader>
          <CardTitle>发送测试邮件</CardTitle>
          <CardDescription>发送一封测试邮件以验证SMTP配置是否正确</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              type="email"
              placeholder="输入测试邮箱地址"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSendTest} disabled={sending || !testEmail}>
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  发送中...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  发送测试
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
