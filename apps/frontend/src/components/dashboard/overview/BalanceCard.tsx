"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface BalanceCardProps {
  amount: number;
  available: number;
  isLoading?: boolean;
  className?: string;
}

export function BalanceCard({
  amount,
  available,
  isLoading,
  className,
}: BalanceCardProps) {
  if (isLoading) {
    return <Skeleton className={cn("h-[160px] w-full rounded-2xl", className)} />;
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-500/30",
        className
      )}
    >
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-50/80">账户余额 (元)</p>
          <h2 className="mt-1 text-4xl font-bold tracking-tight">
            ¥{amount.toFixed(2)}
          </h2>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
          <div>
            <p className="text-xs text-emerald-50/60">可用额度</p>
            <p className="text-sm font-semibold">¥{available.toFixed(2)}</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-right">
            <p className="text-xs text-emerald-50/60">账户状态</p>
            <p className="text-sm font-semibold">正常</p>
          </div>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-teal-400/20 blur-3xl" />
    </div>
  );
}
