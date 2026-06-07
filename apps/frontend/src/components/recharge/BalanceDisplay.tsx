"use client";

import * as React from "react";
import { CreditCard, Wallet, Activity, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BalanceDisplayProps {
  balance: number;
  monthlySpend: number;
  monthlyRecharge: number;
  isLoading?: boolean;
}

export function BalanceDisplay({
  balance,
  monthlySpend,
  monthlyRecharge,
  isLoading,
}: BalanceDisplayProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-neutral-950 p-8 text-white shadow-2xl">
      <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-neutral-400">
            <Wallet className="h-4 w-4" />
            <span className="text-sm font-medium">当前可用余额</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-extrabold tracking-tighter">¥{balance.toFixed(2)}</span>
            <span className="text-lg font-medium text-emerald-400">CNY</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8 md:border-l md:border-t-0 md:pl-12 md:pt-0">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">本月累计充值</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">¥{monthlyRecharge.toFixed(2)}</span>
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <ArrowUpRight className="h-3 w-3" />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">本 month 累计消耗</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-rose-400">¥{monthlySpend.toFixed(2)}</span>
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 rotate-90">
                <ArrowUpRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Circles */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/20 blur-[100px]" />
      <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-emerald-600/10 blur-[120px]" />
    </div>
  );
}
