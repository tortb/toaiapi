"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/components/dashboard/ui/Toast";
import UserConsoleLayout from "@/components/dashboard/layout/UserConsoleLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import {
  Mail,
  Webhook,
  MessageSquare,
  Send,
  ArrowLeft,
  Bell,
} from "lucide-react";
import {
  getNotificationConfig,
  updateNotificationConfig,
  sendTestNotification,
  type NotificationConfig,
  type NotificationChannel,
} from "@/lib/user-api";

const CHANNEL_TABS = [
  { key: "email", label: "邮箱", icon: Mail },
  { key: "webhook", label: "Webhook", icon: Webhook },
  { key: "wxpusher", label: "WxPusher", icon: MessageSquare },
  { key: "wechatWork", label: "企微", icon: MessageSquare },
  { key: "dingtalk", label: "钉钉", icon: MessageSquare },
  { key: "feishu", label: "飞书", icon: MessageSquare },
];

const SUBSCRIPTION_LABELS: Record<string, string> = {
  lowBalance: "余额不足预警",
  promotions: "促销活动通知",
  periodic: "防失联-定期通知",
  announcements: "系统公告通知",
  priceChanges: "模型调价通知",
};

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  const [config, setConfig] = React.useState<NotificationConfig | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [activeChannel, setActiveChannel] = React.useState("email");
  const [testingChannel, setTestingChannel] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    getNotificationConfig()
      .then(setConfig)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, router]);

  const handleSave = async () => {
    if (!config) return;
    setIsSaving(true);
    try {
      await updateNotificationConfig(config);
      toast("success", "通知配置已保存");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "保存失败";
      toast("error", message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async (channel: string) => {
    setTestingChannel(channel);
    try {
      await sendTestNotification(channel);
      toast("success", "测试通知已发送");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "发送失败";
      toast("error", message);
    } finally {
      setTestingChannel(null);
    }
  };

  const updateChannel = (channel: string, updates: Record<string, unknown>) => {
    if (!config) return;
    setConfig({
      ...config,
      channels: {
        ...config.channels,
        [channel]: { ...config.channels[channel as keyof typeof config.channels], ...updates },
      },
    });
  };

  if (!isAuthenticated) return null;

  return (
    <UserConsoleLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => router.push("/dashboard/settings")}
          className="mb-6 flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          返回设置
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-3">
            <Bell className="h-6 w-6" />
            通知方式
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            配置您希望接收的通知类型和通知渠道。
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-[200px] rounded-2xl" />
            <Skeleton className="h-[300px] rounded-2xl" />
          </div>
        ) : config ? (
          <div className="space-y-8">
            {/* Notification Email */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-900 mb-2">
                通知邮箱
              </h3>
              <p className="text-xs text-neutral-500 mb-4">
                设置用于接收额度预警的邮箱地址，不填则使用账号绑定的邮箱
              </p>
              <Input
                value={config.email || ""}
                onChange={(e) => setConfig({ ...config, email: e.target.value || null })}
                placeholder="留空使用账号绑定邮箱"
                className="max-w-md"
              />
            </div>

            {/* Subscriptions */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-900 mb-2">
                订阅事件
              </h3>
              <p className="text-xs text-neutral-500 mb-4">
                选择您希望接收的通知类型
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Object.entries(SUBSCRIPTION_LABELS).map(([key, label]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3"
                  >
                    <span className="text-sm text-neutral-700">{label}</span>
                    <Switch
                      checked={config.subscriptions[key as keyof typeof config.subscriptions]}
                      onCheckedChange={(checked) =>
                        setConfig({
                          ...config,
                          subscriptions: {
                            ...config.subscriptions,
                            [key]: checked,
                          },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Low Balance Threshold */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-900 mb-2">
                预警额度
              </h3>
              <p className="text-xs text-neutral-500 mb-4">
                当余额低于设定值时，将收到预警通知（30分钟最多1次）
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-500">$</span>
                <Input
                  type="number"
                  value={config.lowBalanceThreshold / 100}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      lowBalanceThreshold: Math.round(parseFloat(e.target.value || "0") * 100),
                    })
                  }
                  className="w-32"
                  min={0}
                  step={0.01}
                />
              </div>
            </div>

            {/* Channel Configuration */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-900 mb-4">
                通知渠道
              </h3>

              {/* Channel Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {CHANNEL_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isEnabled = config.channels[tab.key as keyof typeof config.channels]?.enabled;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveChannel(tab.key)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all border",
                        activeChannel === tab.key
                          ? "bg-neutral-900 text-white border-neutral-900"
                          : isEnabled
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Channel Config */}
              <ChannelConfig
                channel={activeChannel}
                config={config.channels[activeChannel as keyof typeof config.channels]}
                onUpdate={(updates) => updateChannel(activeChannel, updates)}
                onTest={() => handleTest(activeChannel)}
                isTesting={testingChannel === activeChannel}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button onClick={handleSave} loading={isSaving}>
                保存配置
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleTest(activeChannel)}
                loading={testingChannel === activeChannel}
              >
                发送测试通知
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </UserConsoleLayout>
  );
}

function ChannelConfig({
  channel,
  config,
  onUpdate,
  onTest,
  isTesting,
}: {
  channel: string;
  config: NotificationChannel;
  onUpdate: (updates: Record<string, unknown>) => void;
  onTest: () => void;
  isTesting: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3">
        <span className="text-sm text-neutral-700">启用此渠道</span>
        <Switch
          checked={config.enabled}
          onCheckedChange={(checked) => onUpdate({ enabled: checked })}
        />
      </div>

      {channel === "email" && (
        <p className="text-xs text-neutral-500">
          邮箱渠道使用通知邮箱或账号绑定邮箱发送通知，无需额外配置。
        </p>
      )}

      {channel === "webhook" && (
        <div className="space-y-3">
          <Input
            label="Webhook URL"
            value={(config.url as string) || ""}
            onChange={(e) => onUpdate({ url: e.target.value })}
            placeholder="https://your-webhook-url.com/notify"
          />
          <Input
            label="Secret（可选）"
            value={(config.secret as string) || ""}
            onChange={(e) => onUpdate({ secret: e.target.value })}
            placeholder="用于签名验证"
            type="password"
          />
        </div>
      )}

      {channel === "wxpusher" && (
        <div className="space-y-3">
          <Input
            label="AppToken"
            value={(config.appToken as string) || ""}
            onChange={(e) => onUpdate({ appToken: e.target.value })}
            placeholder="AT_xxx"
          />
          <Input
            label="UID"
            value={(config.uid as string) || ""}
            onChange={(e) => onUpdate({ uid: e.target.value })}
            placeholder="UID_xxx"
          />
        </div>
      )}

      {channel === "wechatWork" && (
        <Input
          label="Webhook URL"
          value={(config.webhookUrl as string) || ""}
          onChange={(e) => onUpdate({ webhookUrl: e.target.value })}
          placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx"
        />
      )}

      {channel === "dingtalk" && (
        <div className="space-y-3">
          <Input
            label="Webhook URL"
            value={(config.webhookUrl as string) || ""}
            onChange={(e) => onUpdate({ webhookUrl: e.target.value })}
            placeholder="https://oapi.dingtalk.com/robot/send?access_token=xxx"
          />
          <Input
            label="Secret（可选）"
            value={(config.secret as string) || ""}
            onChange={(e) => onUpdate({ secret: e.target.value })}
            placeholder="加签密钥"
            type="password"
          />
        </div>
      )}

      {channel === "feishu" && (
        <div className="space-y-3">
          <Input
            label="Webhook URL"
            value={(config.webhookUrl as string) || ""}
            onChange={(e) => onUpdate({ webhookUrl: e.target.value })}
            placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/xxx"
          />
          <Input
            label="Secret（可选）"
            value={(config.secret as string) || ""}
            onChange={(e) => onUpdate({ secret: e.target.value })}
            placeholder="签名密钥"
            type="password"
          />
        </div>
      )}

      {config.enabled && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onTest}
          loading={isTesting}
          className="mt-2"
        >
          <Send className="h-3.5 w-3.5 mr-1.5" />
          发送测试
        </Button>
      )}
    </div>
  );
}
