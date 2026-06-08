"use client";

import { useCallback } from "react";
import { notifyError } from "./events";

export function useErrorToast(title = "操作失败"): [string, (message: string) => void] {
  const setError = useCallback((message: string) => {
    if (!message) return;
    notifyError(message, title);
  }, [title]);

  return ["", setError];
}
