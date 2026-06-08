"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "./auth-provider";
import { PublicConfigProvider } from "./public-config-provider";
import { FeedbackProvider } from "@/components/feedback/feedback-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <FeedbackProvider>
      <AuthProvider>
        <PublicConfigProvider>{children}</PublicConfigProvider>
      </AuthProvider>
    </FeedbackProvider>
  );
}
