"use client";

import * as React from "react";
import { User, Mail, Shield, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export function ProfileSection() {
  const { user } = useAuthStore();

  const initials = (user?.displayName || user?.email || "U")
    .slice(0, 1)
    .toUpperCase();

  return (
    <div className="flex items-center gap-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-3xl font-bold text-white shadow-inner">
        {initials}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-neutral-900">
            {user?.displayName || user?.email}
          </h2>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
            {user?.role}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Mail className="h-3.5 w-3.5" />
            {user?.email}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <User className="h-3.5 w-3.5" />
            {user?.email}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Shield className="h-3.5 w-3.5" />
            Default Group
          </div>
        </div>
      </div>
      <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900">
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
