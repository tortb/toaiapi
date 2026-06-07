"use client";

import * as React from "react";
import { Check, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface RechargeOption {
  amount: number;
  discount?: string;
  popular?: boolean;
}

interface RechargeTypeSelectorProps {
  options: RechargeOption[];
  selectedAmount: number;
  onSelect: (amount: number) => void;
}

export function RechargeTypeSelector({
  options,
  selectedAmount,
  onSelect,
}: RechargeTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {options.map((option) => {
        const isSelected = selectedAmount === option.amount;
        return (
          <button
            key={option.amount}
            onClick={() => onSelect(option.amount)}
            className={cn(
              "group relative flex flex-col items-center justify-center rounded-2xl border-2 p-5 transition-all duration-200",
              isSelected
                ? "border-blue-600 bg-blue-50/50 shadow-md shadow-blue-500/10"
                : "border-neutral-100 bg-white hover:border-neutral-200 hover:shadow-sm"
            )}
          >
            {option.popular && (
              <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
                <Flame className="h-3 w-3" />
                最热门
              </div>
            )}

            <div className="text-2xl font-black text-neutral-900">
              <span className="mr-0.5 text-sm font-medium">¥</span>
              {option.amount}
            </div>

            {option.discount && (
              <div className={cn(
                "mt-2 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-tight",
                isSelected ? "bg-blue-600 text-white" : "bg-emerald-50 text-emerald-600"
              )}>
                {option.discount}
              </div>
            )}

            {isSelected && (
              <div className="absolute right-2 top-2 rounded-full bg-blue-600 p-0.5 text-white">
                <Check className="h-3 w-3" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
