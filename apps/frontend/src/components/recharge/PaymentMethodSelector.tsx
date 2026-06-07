"use client";

import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function PaymentMethodSelector({
  methods,
  selectedId,
  onSelect,
}: PaymentMethodSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {methods.map((method) => {
        const isSelected = selectedId === method.id;
        return (
          <button
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={cn(
              "flex items-center gap-4 rounded-2xl border-2 p-4 transition-all",
              isSelected
                ? "border-neutral-900 bg-neutral-950 text-white"
                : "border-neutral-100 bg-white hover:border-neutral-200"
            )}
          >
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              isSelected ? "bg-white/10" : "bg-neutral-50"
            )}>
              {method.icon}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold">{method.name}</p>
              <p className={cn("text-[10px]", isSelected ? "text-neutral-400" : "text-neutral-500")}>
                立即到账 • 安全加密
              </p>
            </div>
            <div className={cn(
              "h-5 w-5 rounded-full border-2 flex items-center justify-center",
              isSelected ? "border-emerald-500 bg-emerald-500" : "border-neutral-200"
            )}>
              {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}
