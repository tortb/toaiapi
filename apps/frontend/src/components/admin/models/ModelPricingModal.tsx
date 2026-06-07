"use client";

import * as React from "react";
import { upsertModelPricing, type ModelData, type UpsertPricingPayload } from "@/lib/admin-api";
import { Button, Input, Modal, useToast } from "@/components/ui";

export function formatFenPrice(fenPerMillion: number): string {
  const yuan = fenPerMillion / 100;
  if (yuan === 0) return "免费";
  if (yuan < 0.01) return "<0.01";
  return yuan.toFixed(2);
}

export function OptionalPriceText({ value, muted = false }: { value: number | null | undefined; muted?: boolean }) {
  if (value == null) return <span className="text-neutral-300">-</span>;
  return <span className={muted ? "text-neutral-600" : "text-neutral-900"}>¥{formatFenPrice(value)}</span>;
}

function optionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return Number(trimmed);
}

export interface ModelPricingModalProps {
  model: ModelData | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ModelPricingModal({ model, open, onClose, onSaved }: ModelPricingModalProps) {
  const toast = useToast();
  const pricing = model?.pricing;
  const [inputPrice, setInputPrice] = React.useState("0");
  const [outputPrice, setOutputPrice] = React.useState("0");
  const [cachedPrice, setCachedPrice] = React.useState("");
  const [reasoningPrice, setReasoningPrice] = React.useState("");
  const [multiplier, setMultiplier] = React.useState("1");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setInputPrice(String(pricing?.inputPrice ?? 0));
    setOutputPrice(String(pricing?.outputPrice ?? 0));
    setCachedPrice(pricing?.cachedPrice == null ? "" : String(pricing.cachedPrice));
    setReasoningPrice(pricing?.reasoningPrice == null ? "" : String(pricing.reasoningPrice));
    setMultiplier(String(pricing?.multiplier ?? 1));
    setError(null);
  }, [open, pricing]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!model) return;

    const payload: UpsertPricingPayload = {
      inputPrice: Number(inputPrice),
      outputPrice: Number(outputPrice),
      multiplier: Number(multiplier),
    };
    const cached = optionalNumber(cachedPrice);
    const reasoning = optionalNumber(reasoningPrice);
    if (cached !== undefined) payload.cachedPrice = cached;
    if (reasoning !== undefined) payload.reasoningPrice = reasoning;

    setSaving(true);
    setError(null);
    try {
      await upsertModelPricing(model.id, payload);
      toast.success("模型定价已保存");
      onSaved();
    } catch (err) {
      const message = err instanceof Error ? err.message : "保存失败";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={model ? "编辑定价 - " + model.displayName : "编辑定价"}
      description="输入框单位为分/百万 Token，列表按元/百万 Token 展示。"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            取消
          </Button>
          <Button type="submit" form="model-pricing-form" loading={saving}>
            保存
          </Button>
        </div>
      }
    >
      <form id="model-pricing-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="rounded-lg border border-error/20 bg-error-bg px-4 py-3 text-sm text-error">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="输入价格"
            type="number"
            min={0}
            value={inputPrice}
            onChange={(event) => setInputPrice(event.target.value)}
            required
            endAdornment={<span className="text-xs">分/百万</span>}
            hint={"约 ¥" + formatFenPrice(Number(inputPrice || 0)) + "/百万"}
          />
          <Input
            label="输出价格"
            type="number"
            min={0}
            value={outputPrice}
            onChange={(event) => setOutputPrice(event.target.value)}
            required
            endAdornment={<span className="text-xs">分/百万</span>}
            hint={"约 ¥" + formatFenPrice(Number(outputPrice || 0)) + "/百万"}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="缓存价格"
            type="number"
            min={0}
            value={cachedPrice}
            onChange={(event) => setCachedPrice(event.target.value)}
            placeholder="可选"
            endAdornment={<span className="text-xs">分/百万</span>}
          />
          <Input
            label="推理价格"
            type="number"
            min={0}
            value={reasoningPrice}
            onChange={(event) => setReasoningPrice(event.target.value)}
            placeholder="可选"
            endAdornment={<span className="text-xs">分/百万</span>}
          />
        </div>

        <Input
          label="价格倍率"
          type="number"
          min={0.1}
          max={10}
          step={0.1}
          value={multiplier}
          onChange={(event) => setMultiplier(event.target.value)}
          hint="最终价格等于基础价格乘以倍率。"
        />
      </form>
    </Modal>
  );
}
