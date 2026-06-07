'use client';

import React from 'react';
import { ToastProvider } from '@/components/dashboard/ui/Toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
