"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminCopy } from "@/lib/admin-copy";
import { ApiError, getErrorMessage } from "@/lib/api/errors";
import { getOverview } from "@/lib/api/overview";
import { queryKeys } from "@/lib/query/keys";
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
  const toastedErrorRef = useRef<unknown>(null);

  const query = useQuery({
    queryKey: queryKeys.admin.overview,
    queryFn: ({ signal }) => getOverview({ signal }),
  });

  useEffect(() => {
    if (!query.error) {
      toastedErrorRef.current = null;
      return;
    }
    if (toastedErrorRef.current === query.error) return;
    toastedErrorRef.current = query.error;
    toast.error(toUserMessage(query.error));
  }, [query.error]);

  return {
    data: query.data ?? null,
    loading: query.isFetching,
    error: query.error ? toUserMessage(query.error) : null,
    refetch: () => {
      void query.refetch();
    },
  };
}
