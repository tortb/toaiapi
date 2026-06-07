"use client";

import * as React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button, Input, useToast } from "@/components/ui";
import { Plus, Trash2, Edit2, ExternalLink, Activity } from "lucide-react";

interface UptimeGroup {
  id: string;
  name: string;
  baseUrl: string;
  alias: string;
  enabled: boolean;
}

export default function UptimeSettingsPage() {
  const toast = useToast();
  const [groups, setGroups] = React.useState<UptimeGroup[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const [formName, setFormName] = React.useState("");
  const [formBaseUrl, setFormBaseUrl] = React.useState("");
  const [formAlias, setFormAlias] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setIsLoading(false);
  }, []);

  const resetForm = () => {
    setFormName("");
    setFormBaseUrl("");
    setFormAlias("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (group: UptimeGroup) => {
    setFormName(group.name);
    setFormBaseUrl(group.baseUrl);
    setFormAlias(group.alias);
    setEditingId(group.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formBaseUrl.trim()) {
      toast.error("请填写名称和 Base URL");
      return;
    }
    setIsSaving(true);
    try {
      if (editingId) {
        setGroups((prev) =>
          prev.map((g) =>
            g.id === editingId
              ? { ...g, name: formName, baseUrl: formBaseUrl, alias: formAlias }
              : g
          )
        );
        toast.success("分组已更新");
      } else {
        const newGroup: UptimeGroup = {
          id: Date.now().toString(),
          name: formName,
          baseUrl: formBaseUrl,
          alias: formAlias,
          enabled: true,
        };
        setGroups((prev) => [...prev, newGroup]);
        toast.success("分组已添加");
      }
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "保存失败");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
    toast.success("已删除");
  };

  const handleToggle = (id: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, enabled: !g.enabled } : g))
    );
  };

  return (
    <AdminShell title="Uptime Kuma">
      <div className="mb-6">
        <h1 className="text-[20px] font-bold text-gray-900">Uptime Kuma 监控</h1>
        <p className="text-sm text-gray-500 mt-1">
          配置用于仪表板的监控状态页面分组
        </p>
      </div>

      {/* 分组列表 */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h3 className="text-sm font-semibold text-neutral-900">监控分组</h3>
        </div>

        {groups.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Activity className="mx-auto h-8 w-8 text-neutral-300" />
            <p className="mt-2 text-sm text-neutral-400">暂无监控分组</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {groups.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      group.enabled ? "bg-emerald-500" : "bg-neutral-300"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {group.name}
                    </p>
                    <p className="text-xs text-neutral-500 font-mono">
                      {group.baseUrl}
                    </p>
                    {group.alias && (
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        别名: {group.alias} → {group.baseUrl}/status/{group.alias}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(group.id)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      group.enabled ? "bg-emerald-500" : "bg-neutral-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        group.enabled ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                  <a
                    href={`${group.baseUrl}/status/${group.alias || group.name.toLowerCase().replace(/\s+/g, "-")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md p-1.5 text-neutral-400 hover:text-blue-500 hover:bg-blue-50 transition"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => handleEdit(group)}
                    className="rounded-md p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(group.id)}
                    className="rounded-md p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 添加/编辑表单 */}
      {showForm ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-900 mb-4">
            {editingId ? "编辑分组" : "添加分组"}
          </h3>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="名称"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="核心 API / OpenAI / Claude"
                required
              />
              <Input
                label="Base URL"
                value={formBaseUrl}
                onChange={(e) => setFormBaseUrl(e.target.value)}
                placeholder="https://status.example.com"
                required
              />
            </div>
            <Input
              label="别名"
              value={formAlias}
              onChange={(e) => setFormAlias(e.target.value)}
              placeholder="my-status"
              hint="URL: {baseUrl}/status/{alias}"
            />
            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleSave} loading={isSaving}>
                {editingId ? "更新" : "添加"}
              </Button>
              <Button variant="secondary" onClick={resetForm}>
                取消
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          添加分组
        </Button>
      )}
    </AdminShell>
  );
}
