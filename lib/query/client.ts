import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/errors";

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false;

  if (error instanceof ApiError) {
    // Client errors are usually permanent; only retry rate limits and timeouts.
    if (error.status === 408 || error.status === 429) return true;
    if (error.status >= 400 && error.status < 500) return false;
  }

  return true;
}

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Browser singleton so client navigations share one cache. Never reuse this
 * across server requests — call `makeQueryClient()` per request if SSR
 * prefetching is added later.
 */
export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }

  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
