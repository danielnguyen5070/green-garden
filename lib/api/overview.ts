import { api } from "@/lib/api/client";
import type { OverviewResponse } from "@/types/overview";

/**
 * Every dashboard statistic in one admin-only request. The endpoint is
 * read-only and uncached, so each call reflects the current data.
 */
export async function getOverview(
  options: { signal?: AbortSignal } = {}
): Promise<OverviewResponse> {
  return api.get<OverviewResponse>("/overview", { signal: options.signal });
}
