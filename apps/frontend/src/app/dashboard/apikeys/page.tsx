"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import UserConsoleLayout from "@/components/dashboard/layout/UserConsoleLayout";
import { Table, type TableColumn } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { IconButton } from "@/components/ui/IconButton";
import { useToast } from "@/components/dashboard/ui/Toast";
import { cn } from "@/lib/utils";
import {
  Plus,
  Copy,
  Trash2,
  Power,
  RefreshCw,
  Terminal,
  MoreHorizontal,
  Clock,
  Shield,
  Activity,
  Layers,
  Calendar,
  Users
} from "lucide-react";
import {
  getUserApiKeys,
  enableApiKey,
  disableApiKey,
  deleteApiKey,
  rotateApiKey,
  type UserApiKey,
  type CreateApiKeyResult,
} from "@/lib/user-api";

import { CreateApiKeyModal } from "@/components/dashboard/apikeys/CreateApiKeyModal";
import { UseApiKeyModal } from "@/components/dashboard/apikeys/UseApiKeyModal";

export default function ApiKeysPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  const [keys, setKeys] = React.useState<UserApiKey[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showCreate, setShowCreate] = React.useState(false);
  const [selectedKeyForUse, setSelectedKeyForUse] = React.useState<UserApiKey | null>(null);

  const loadKeys = React.useCallback(async () => {
    try {
      const data = await getUserApiKeys();
      setKeys(data);
    } catch (err: any) {
      toast("error", err.message || "加载失败");
    }
  }, [toast]);

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    setIsLoading(true);
    loadKeys().finally(() => setIsLoading(false));
  }, [isAuthenticated, router, loadKeys]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast("success", "已复制 API 密钥前缀");
  };

  const handleToggle = async (key: UserApiKey) => {
    try {
      if (key.isActive) {
        await disableApiKey(key.id);
        toast("success", "已禁用 API 密钥");
      } else {
        await enableApiKey(key.id);
        toast("success", "已启用 API 密钥");
      }
      loadKeys();
    } catch (err: any) {
      toast("error", err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除此 API 密钥吗？此操作不可撤销。")) return;
    try {
      await deleteApiKey(id);
      toast("success", "已删除 API 密钥");
      loadKeys();
    } catch (err: any) {
      toast("error", err.message);
    }
  };

  const handleRotate = async (id: string) => {
    if (!confirm("确定要轮换此 API 密钥吗？旧密钥将立即失效。")) return;
    try {
      const result = await rotateApiKey(id);
      toast("success", "密钥轮换成功，请保存新密钥");
      // TODO: 显示新密钥揭示弹窗
      loadKeys();
    } catch (err: any) {
      toast("error", err.message);
    }
  };

  const columns: TableColumn<UserApiKey>[] = [
    {
      key: "name",
      title: "名称",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-neutral-900">{row.name || "未命名密钥"}</span>
          <span className="text-[10px] text-neutral-400">ID: {row.id}</span>
        </div>
      ),
    },
    {
      key: "key",
      title: "API 密钥",
      render: (row) => (
        <div className="group flex items-center gap-2">
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs text-neutral-600">
            {row.keyPrefix}••••••••
          </code>
          <IconButton
            size="sm"
            aria-label="复制"
            icon={<Copy className="h-3 w-3" />}
            onClick={() => handleCopy(row.keyPrefix)}
            className="opacity-0 transition-opacity group-hover:opacity-100"
          />
        </div>
      ),
    },
    {
      key: "group",
      title: "分组",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-neutral-600">
          <Users className="h-3 w-3 text-neutral-400" />
          <span>{row.group?.name || "—"}</span>
        </div>
      ),
    },
    {
      key: "usage",
      title: "用量",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-xs text-neutral-600">
            <Activity className="h-3 w-3 text-neutral-400" />
            <span>今日: ${((row.usageToday || 0) / 100).toFixed(2)}</span>
          </div>
          <div className="text-[10px] text-neutral-400 pl-[18px]">
            近30天: ${((row.usage30d || 0) / 100).toFixed(2)}
          </div>
        </div>
      ),
    },
    {
      key: "rateLimit",
      title: "速率限制",
      render: (row) => (
        <div className="flex flex-col gap-0.5 text-xs text-neutral-600">
          <span>RPM: {row.rpmLimit || "—"}</span>
          <span className="text-[10px] text-neutral-400">TPM: {row.tpmLimit || "—"}</span>
        </div>
      ),
    },
    {
      key: "expiresAt",
      title: "过期时间",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <Calendar className="h-3 w-3 text-neutral-400" />
          <span>
            {row.expiresAt
              ? new Date(row.expiresAt).toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "永久有效"}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      title: "状态",
      render: (row) => (
        <Badge variant={row.isActive ? "success" : "neutral"} className="gap-1.5">
          <span className={cn("h-1.5 w-1.5 rounded-full", row.isActive ? "bg-emerald-500" : "bg-neutral-400")} />
          {row.isActive ? "活动" : "禁用"}
        </Badge>
      ),
    },
    {
      key: "time",
      title: "使用/创建",
      render: (row) => (
        <div className="flex flex-col text-xs text-neutral-500">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{new Date(row.createdAt).toLocaleDateString()}</span>
          </div>
          <span className="mt-0.5 text-[10px]">
            最后使用: {row.lastUsedAt ? new Date(row.lastUsedAt).toLocaleDateString() : "从未"}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      title: "操作",
      headerClassName: "text-right",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => setSelectedKeyForUse(row)}
          >
            <Terminal className="h-3 w-3" />
            使用
          </Button>
          <div className="h-4 w-px bg-neutral-200 mx-1" />
          <IconButton
            size="sm"
            aria-label={row.isActive ? "禁用" : "启用"}
            icon={<Power className="h-3.5 w-3.5" />}
            onClick={() => handleToggle(row)}
            className={row.isActive ? "text-neutral-400 hover:text-amber-500" : "text-emerald-500 hover:bg-emerald-50"}
          />
          <IconButton
            size="sm"
            aria-label="删除"
            icon={<Trash2 className="h-3.5 w-3.5" />}
            onClick={() => handleDelete(row.id)}
            className="text-neutral-400 hover:text-red-500 hover:bg-red-50"
          />
        </div>
      ),
    },
  ];

  return (
    <UserConsoleLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              API 密钥
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              管理您的 API 密钥，用于在第三方工具或代码中调用 ToAIAPI。
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            创建密钥
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <Table
              columns={columns}
              data={keys}
              rowKey="id"
              loading={isLoading}
              empty={
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="rounded-full bg-neutral-100 p-4">
                    <Layers className="h-8 w-8 text-neutral-400" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-neutral-900">暂无 API 密钥</h3>
                  <p className="mt-1 text-xs text-neutral-500 max-w-[200px]">
                    您还没有创建过 API 密钥，点击右上角按钮开始创建。
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                    onClick={() => setShowCreate(true)}
                  >
                    创建第一个密钥
                  </Button>
                </div>
              }
            />
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                <Shield className="h-4 w-4 text-emerald-500" />
                安全建议
              </h3>
              <ul className="mt-4 space-y-3 text-xs text-neutral-500 leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  定期轮换您的 API 密钥以降低泄露风险。
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  通过 IP 白名单限制仅允许您的服务器访问。
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  切勿在客户端浏览器代码或公共代码库中暴露密钥。
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                <Terminal className="h-4 w-4 text-blue-500" />
                快速集成
              </h3>
              <p className="mt-2 text-xs text-blue-700 leading-relaxed">
                ToAIAPI 完美兼容 OpenAI 协议。您只需将 Base URL 设置为：
              </p>
              <div className="mt-3 rounded bg-blue-100 px-2 py-1.5 font-mono text-[10px] text-blue-800 break-all">
                https://api.toaiapi.com/v1
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateApiKeyModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => {
          setShowCreate(false);
          loadKeys();
        }}
      />

      {selectedKeyForUse && (
        <UseApiKeyModal
          open={!!selectedKeyForUse}
          onClose={() => setSelectedKeyForUse(null)}
          apiKey={selectedKeyForUse.keyPrefix + "••••••••"}
          baseUrl="https://api.toaiapi.com/v1"
          model="gpt-4o"
        />
      )}
    </UserConsoleLayout>
  );
}
