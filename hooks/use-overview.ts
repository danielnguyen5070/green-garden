"use client";

import { useCallback, useEffect, useState } from "react";
import { adminCopy } from "@/lib/admin-copy";
import { ApiError, getErrorMessage } from "@/lib/api/errors";
import { getOverview } from "@/lib/api/overview";
import { toast } from "@/lib/toast";
import type { OverviewResponse } from "@/types/overview";

const copy = adminCopy.dashboard;

export type UseOverviewResult = {
  data: OverviewResponse | null;
  loading: boolean;
  /** User-facing message, already stripped of technical detail. */
  error: string | null;
  refetch: () => void;
};

/**
 * Only the backend's own messages are shown; transport failures fall back to
 * generic copy so the dashboard never surfaces fetch or parser text.
 */
function toUserMessage(error: unknown): string {
  return error instanceof ApiError
    ? getErrorMessage(error, copy.loadError)
    : copy.loadError;
}

/**
 * Loads `GET /overview` on mount, so returning to the dashboard after editing
 * plants, customers or orders always shows current statistics.
 */
export function useOverview(): UseOverviewResult {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchOverview() {
      try {
        const response = await getOverview({ signal: controller.signal });
        if (controller.signal.aborted) return;
        setData(response);
        setError(null);
      } catch (err) {
        if (controller.signal.aborted) return;
        const message = toUserMessage(err);
        setError(message);
        toast.error(message);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchOverview();
    return () => controller.abort();
  }, [reloadToken]);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadToken((token) => token + 1);
  }, []);

  return { data, loading, error, refetch };
}
