"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "./auth-provider";
import { PublicConfigProvider } from "./public-config-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <PublicConfigProvider>{children}</PublicConfigProvider>
    </AuthProvider>
  );
}
