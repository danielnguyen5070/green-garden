import type { VisitsCountResponse } from "@/types/analytics";

const VERCEL_VISITS_COUNT_URL =
  "https://api.vercel.com/v1/query/web-analytics/visits/count";

/** Cache the Vercel response so page navigations do not hit the API every time. */
export const VISITS_COUNT_REVALIDATE_SECONDS = 3600;

type VercelVisitsCountPayload = {
  data?: {
    pageviews?: unknown;
    visitors?: unknown;
  };
};

function buildVisitsCountUrl(projectId: string, teamId?: string): string {
  const url = new URL(VERCEL_VISITS_COUNT_URL);
  url.searchParams.set("projectId", projectId);
  if (teamId) {
    url.searchParams.set("teamId", teamId);
  }
  return url.toString();
}

function unavailable(): VisitsCountResponse {
  return {
    pageviews: null,
    available: false,
    metric: "pageviews",
    period: "lifetime",
  };
}

/**
 * Fetches lifetime production page views from Vercel Web Analytics.
 * Returns a null `pageviews` value when env vars are missing or the
 * upstream request fails — callers should hide the counter.
 *
 * Env (server-only; never expose the token to the client):
 * - VERCEL_ACCESS_TOKEN (required)
 * - VERCEL_PROJECT_ID (required)
 * - VERCEL_TEAM_ID (optional; team-owned projects)
 */
export async function getVisitsPageviews(): Promise<VisitsCountResponse> {
  const token = process.env.VERCEL_ACCESS_TOKEN?.trim();
  const projectId = process.env.VERCEL_PROJECT_ID?.trim();
  const teamId = process.env.VERCEL_TEAM_ID?.trim();

  if (!token || !projectId) {
    return unavailable();
  }

  try {
    const response = await fetch(buildVisitsCountUrl(projectId, teamId), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      next: { revalidate: VISITS_COUNT_REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      return unavailable();
    }

    const payload = (await response.json()) as VercelVisitsCountPayload;
    const pageviews = payload.data?.pageviews;

    if (typeof pageviews !== "number" || !Number.isFinite(pageviews)) {
      return unavailable();
    }

    return {
      pageviews,
      available: true,
      metric: "pageviews",
      period: "lifetime",
    };
  } catch {
    return unavailable();
  }
}
