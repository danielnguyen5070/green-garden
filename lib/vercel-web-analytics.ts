import "server-only";
import type {
  PathVisitsCountResponse,
  VisitsCountResponse,
} from "@/types/analytics";

const VERCEL_VISITS_COUNT_URL =
  "https://api.vercel.com/v1/query/web-analytics/visits/count";

/** Cache the Vercel response so page navigations do not hit the API every time. */
export const VISITS_COUNT_REVALIDATE_SECONDS = 3600;

/** Longest pathname we will ever build for a storefront page. */
const MAX_PATH_LENGTH = 512;

type VercelVisitsCountPayload = {
  data?: {
    pageviews?: unknown;
    visitors?: unknown;
  };
};

function buildVisitsCountUrl(
  projectId: string,
  teamId?: string,
  filter?: string
): string {
  const url = new URL(VERCEL_VISITS_COUNT_URL);
  url.searchParams.set("projectId", projectId);
  if (teamId) {
    url.searchParams.set("teamId", teamId);
  }
  if (filter) {
    url.searchParams.set("filter", filter);
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
 * Lifetime production page views, optionally narrowed by an OData `filter`.
 * Each distinct filter is a distinct URL, so the Data Cache keeps one entry
 * per filter. Returns null when env vars are missing or the request fails.
 */
async function fetchVisitsPageviews(filter?: string): Promise<number | null> {
  const token = process.env.VERCEL_ACCESS_TOKEN?.trim();
  const projectId = process.env.VERCEL_PROJECT_ID?.trim();
  const teamId = process.env.VERCEL_TEAM_ID?.trim();

  if (!token || !projectId) {
    return null;
  }

  try {
    const response = await fetch(buildVisitsCountUrl(projectId, teamId, filter), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      next: { revalidate: VISITS_COUNT_REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as VercelVisitsCountPayload;
    const pageviews = payload.data?.pageviews;

    if (typeof pageviews !== "number" || !Number.isFinite(pageviews)) {
      return null;
    }

    return pageviews;
  } catch {
    return null;
  }
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
  const pageviews = await fetchVisitsPageviews();

  if (pageviews === null) {
    return unavailable();
  }

  return {
    pageviews,
    available: true,
    metric: "pageviews",
    period: "lifetime",
  };
}

/** A bare pathname: leading slash, no query, fragment, whitespace or control chars. */
function isQueryablePath(path: string): boolean {
  return (
    path.length > 1 &&
    path.length <= MAX_PATH_LENGTH &&
    path.startsWith("/") &&
    !/[\s?#\u0000-\u001f\u007f]/.test(path)
  );
}

/** OData string literal: single quotes are escaped by doubling them. */
function toODataString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

/**
 * Lifetime production page views for one exact pathname, filtered on the
 * `requestPath` dimension (never `route`, which would merge every page that
 * shares a dynamic route). Callers must build `path` on the server from
 * trusted data, e.g. a canonical plant slug — never from request input.
 */
export async function getPathPageviews(
  path: string
): Promise<PathVisitsCountResponse> {
  if (!isQueryablePath(path)) {
    return { ...unavailable(), path };
  }

  const pageviews = await fetchVisitsPageviews(
    `requestPath eq ${toODataString(path)}`
  );

  if (pageviews === null) {
    return { ...unavailable(), path };
  }

  return {
    pageviews,
    available: true,
    metric: "pageviews",
    period: "lifetime",
    path,
  };
}
