"use client";

import * as React from "react";
import Link from "next/link";
import { PlusCircle, History, Gift, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionProps) {
  const actions = [
    {
      title: "创建 API 密钥",
      desc: "生成新的访问令牌开始集成",
      icon: <PlusCircle className="h-5 w-5 text-blue-500" />,
      href: "/dashboard/apikeys",
      bg: "bg-blue-50",
    },
    {
      title: "查看使用日志",
      desc: "追踪详细的模型调用记录",
      icon: <History className="h-5 w-5 text-purple-500" />,
      href: "/dashboard/logs",
      bg: "bg-purple-50",
    },
    {
      title: "兑换码充值",
      desc: "使用兑换码增加账户余额",
      icon: <Gift className="h-5 w-5 text-rose-500" />,
      href: "/recharge",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1", className)}>
      {actions.map((action) => (
        <Link
          key={action.title}
          href={action.href}
          className="group flex items-center gap-4 rounded-2xl border border-neutral-150 bg-white p-4 transition-all hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5"
        >
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
              action.bg
            )}
          >
            {action.icon}
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="text-sm font-semibold text-neutral-900 group-hover:text-blue-600">
              {action.title}
            </h4>
            <p className="mt-0.5 truncate text-xs text-neutral-400">
              {action.desc}
            </p>
          </div>
          <ExternalLink className="h-3 w-3 text-neutral-300 opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>
      ))}
    </div>
  );
}
