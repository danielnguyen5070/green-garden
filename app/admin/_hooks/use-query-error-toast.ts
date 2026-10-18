"use client";

import { useEffect, useRef } from "react";
import { getErrorMessage } from "@/lib/api/errors";
import { toast } from "@/lib/toast";

/**
 * Toasts a query error once per distinct error instance (avoids repeat toasts
 * while the same failure stays in the query cache).
 */
export function useQueryErrorToast(
  error: unknown,
  fallbackMessage?: string
): void {
  const toastedErrorRef = useRef<unknown>(null);

  useEffect(() => {
    if (!error) {
      toastedErrorRef.current = null;
      return;
    }
    if (toastedErrorRef.current === error) return;
    toastedErrorRef.current = error;
    toast.error(getErrorMessage(error, fallbackMessage));
  }, [error, fallbackMessage]);
}
