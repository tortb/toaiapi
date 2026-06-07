"use client";

import * as React from "react";
import { Check, Calendar as CalendarIcon, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/dashboard/ui/Toast";

export function CheckInCalendar() {
  const { toast } = useToast();
  const [checkedInDays, setCheckedInDays] = React.useState<number[]>([1, 2, 5]); // Mock data
  const [isCheckingIn, setIsCheckingIn] = React.useState(false);

  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const handleCheckIn = () => {
    setIsCheckingIn(true);
    setTimeout(() => {
      setCheckedInDays([...checkedInDays, currentDay]);
      setIsCheckingIn(false);
      toast("success", "签到成功！获得 ¥0.05 额度");
    }, 1000);
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">累计签到</h3>
            <p className="text-xs text-neutral-500">坚持签到，领取每日随机奖励</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-400">本月获得</p>
          <p className="text-sm font-bold text-emerald-600">¥0.15</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
        {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {blanks.map((i) => (
          <div key={`blank-${i}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const isToday = day === currentDay;
          const isChecked = checkedInDays.includes(day);
          return (
            <div
              key={day}
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-lg text-xs font-medium transition-all",
                isChecked ? "bg-emerald-500 text-white" : isToday ? "border-2 border-emerald-500 text-emerald-600" : "bg-neutral-50 text-neutral-400 hover:bg-neutral-100"
              )}
            >
              {isChecked ? <Check className="h-3 w-3" /> : day}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          <span className="text-xs text-neutral-600">
            已连续签到 <strong className="text-neutral-900">3</strong> 天
          </span>
        </div>
        <Button
          onClick={handleCheckIn}
          disabled={checkedInDays.includes(currentDay) || isCheckingIn}
          loading={isCheckingIn}
          className="h-9 px-6"
        >
          {checkedInDays.includes(currentDay) ? "今日已签到" : "立即签到"}
        </Button>
      </div>

      <ul className="mt-6 space-y-2 border-t border-neutral-100 pt-4 text-[10px] text-neutral-400 leading-relaxed">
        <li className="flex gap-2">• 每日仅可签到一次，奖励直接存入余额。</li>
        <li className="flex gap-2">• 连续签到可解锁更高级别的随机奖励。</li>
      </ul>
    </div>
  );
}
