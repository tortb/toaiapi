"use client";

import * as React from "react";
import {
  getSystemSettingsByCategory,
  updateSystemSettings,
  type SystemSettingData,
} from "@/lib/admin-api";
import { Button, Card, CardContent, CardHeader, CardTitle, EmptyState, Input, Select, Skeleton, Switch, Textarea, useToast } from "@/components/ui";
import type { SettingCategory, SettingFieldDef } from "./settings-schema";

function settingsToValues(settings: SystemSettingData[]) {
  const values: Record<string, string> = {};
  for (const setting of settings) values[setting.key] = setting.value ?? "";
  return values;
}

function SettingField({ field, value, onChange }: { field: SettingFieldDef; value: string; onChange: (value: string) => void }) {
  if (field.type === "boolean") {
    const checked = value === "true" || value === "1";
    return (
      <div className="flex items-center justify-between gap-4 py-4">
        <div className="min-w-0">
          <div className="text-sm font-medium text-neutral-900">{field.label}</div>
          {field.tip && <div className="mt-1 text-sm text-neutral-500">{field.tip}</div>}
        </div>
        <Switch checked={checked} onCheckedChange={(next) => onChange(next ? "true" : "false")} />
      </div>
    );
  }

  if (field.type === "textarea" || field.type === "html") {
    return (
      <div className="py-4">
        <Textarea
          label={field.label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          hint={field.tip || (field.type === "html" ? "支持 HTML 内容；保存后由前台页面渲染。" : undefined)}
          rows={field.type === "html" ? 5 : 3}
        />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="py-4">
        <Select
          label={field.label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          options={field.options || []}
          hint={field.tip}
        />
      </div>
    );
  }

  return (
    <div className="py-4">
      <Input
        type={field.type === "number" ? "number" : field.type === "password" ? "password" : "text"}
        label={field.label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        hint={field.tip}
        endAdornment={field.suffix ? <span className="text-sm text-neutral-400">{field.suffix}</span> : undefined}
      />
    </div>
  );
}

export function SettingsForm({ category, fields }: { category: SettingCategory; fields: SettingFieldDef[] }) {
  const toast = useToast();
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [originalValues, setOriginalValues] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const settings = await getSystemSettingsByCategory(category.key);
        if (!mounted) return;
        const nextValues = settingsToValues(settings);
        setValues(nextValues);
        setOriginalValues(nextValues);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "加载设置失败");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [category.key]);

  const hasChanges = fields.some((field) => values[field.key] !== originalValues[field.key]);

  const updateValue = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await updateSystemSettings(category.key, fields.map((field) => ({ key: field.key, value: values[field.key] ?? "" })));
      setOriginalValues((prev) => {
        const next = { ...prev };
        for (const field of fields) next[field.key] = values[field.key] ?? "";
        return next;
      });
      toast.success(`${category.label}已保存`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "保存失败";
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Skeleton variant="card" lines={8} />;
  }

  return (
    <Card variant="elevated" className="overflow-hidden">
      <CardHeader className="flex items-center justify-between gap-4 border-b border-neutral-150">
        <div>
          <CardTitle>{category.label}</CardTitle>
          <p className="mt-1 text-sm text-neutral-500">{category.description}</p>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges || isSaving} loading={isSaving}>保存</Button>
      </CardHeader>
      <CardContent className="divide-y divide-neutral-100 py-0">
        {error && <div className="my-4 rounded-lg border border-error/20 bg-error-bg px-4 py-3 text-sm text-error">{error}</div>}
        {fields.length === 0 ? (
          <EmptyState title="暂无设置项" description="此分类还没有可配置字段。" />
        ) : (
          fields.map((field) => (
            <SettingField
              key={field.key}
              field={field}
              value={values[field.key] ?? ""}
              onChange={(value) => updateValue(field.key, value)}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
