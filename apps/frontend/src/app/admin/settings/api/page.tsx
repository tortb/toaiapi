"use client";

import * as React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button, Input, useToast } from "@/components/ui";
import { Plus, Trash2, Edit2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiShortcut {
  id: string;
  url: string;
  name: string;
  description: string;
  color: string;
}

const PRESET_COLORS = [
  { key: "blue", label: "蓝", class: "bg-blue-500" },
  { key: "red", label: "红", class: "bg-red-500" },
  { key: "green", label: "绿", class: "bg-emerald-500" },
  { key: "yellow", label: "黄", class: "bg-amber-500" },
  { key: "purple", label: "紫", class: "bg-purple-500" },
  { key: "orange", label: "橙", class: "bg-orange-500" },
  { key: "teal", label: "青", class: "bg-teal-500" },
  { key: "indigo", label: "靛", class: "bg-indigo-500" },
];

export default function ApiShortcutsPage() {
  const toast = useToast();
  const [shortcuts, setShortcuts] = React.useState<ApiShortcut[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const [formUrl, setFormUrl] = React.useState("");
  const [formName, setFormName] = React.useState("");
  const [formDesc, setFormDesc] = React.useState("");
  const [formColor, setFormColor] = React.useState("blue");
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setIsLoading(false);
  }, []);

  const resetForm = () => {
    setFormUrl("");
    setFormName("");
    setFormDesc("");
    setFormColor("blue");
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (shortcut: ApiShortcut) => {
    setFormUrl(shortcut.url);
    setFormName(shortcut.name);
    setFormDesc(shortcut.description);
    setFormColor(shortcut.color);
    setEditingId(shortcut.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formUrl.trim() || !formName.trim()) {
      toast.error("请填写 URL 和名称");
      return;
    }
    setIsSaving(true);
    try {
      if (editingId) {
        setShortcuts((prev) =>
          prev.map((s) =>
            s.id === editingId
              ? { ...s, url: formUrl, name: formName, description: formDesc, color: formColor }
              : s
          )
        );
        toast.success("快捷方式已更新");
      } else {
        const newShortcut: ApiShortcut = {
          id: Date.now().toString(),
          url: formUrl,
          name: formName,
          description: formDesc,
          color: formColor,
        };
        setShortcuts((prev) => [...prev, newShortcut]);
        toast.success("快捷方式已添加");
      }
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "保存失败");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    setShortcuts((prev) => prev.filter((s) => s.id !== id));
    toast.success("已删除");
  };

  return (
    <AdminShell title="API 快捷方式">
      <div className="mb-6">
        <h1 className="text-[20px] font-bold text-gray-900">API 快捷方式</h1>
        <p className="text-sm text-gray-500 mt-1">
          配置仪表板的 API 文档链接，方便用户快速访问
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h3 className="text-sm font-semibold text-neutral-900">现有快捷方式</h3>
        </div>

        {shortcuts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-neutral-400">暂无快捷方式</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50 transition"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "h-3 w-3 rounded-full shrink-0",
                      PRESET_COLORS.find((c) => c.key === shortcut.color)?.class || "bg-blue-500"
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{shortcut.name}</p>
                    <p className="text-xs text-neutral-500">{shortcut.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-neutral-400 max-w-[200px] truncate">
                    {shortcut.url}
                  </span>
                  <a
                    href={shortcut.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md p-1.5 text-neutral-400 hover:text-blue-500 hover:bg-blue-50 transition"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => handleEdit(shortcut)}
                    className="rounded-md p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(shortcut.id)}
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

      {showForm ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-900 mb-4">
            {editingId ? "编辑快捷方式" : "添加新快捷方式"}
          </h3>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="URL"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://api.example.com"
                required
              />
              <Input
                label="名称"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="CN2 GIA"
                required
              />
            </div>
            <Input
              label="描述"
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="推荐给中国大陆用户"
            />
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                颜色指示器
              </label>
              <div className="flex items-center gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.key}
                    onClick={() => setFormColor(color.key)}
                    className={cn(
                      "h-8 w-8 rounded-full transition-all",
                      color.class,
                      formColor === color.key
                        ? "ring-2 ring-offset-2 ring-neutral-900 scale-110"
                        : "hover:scale-105"
                    )}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
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
          添加快捷方式
        </Button>
      )}
    </AdminShell>
  );
}
