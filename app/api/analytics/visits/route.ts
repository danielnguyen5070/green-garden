import { NextResponse } from "next/server";
import {
  getVisitsPageviews,
  VISITS_COUNT_REVALIDATE_SECONDS,
} from "@/lib/vercel-web-analytics";

/**
 * Public page-view count for the storefront footer.
 * Proxies Vercel Web Analytics on the server so the access token
 * never reaches the browser.
 *
 * Metric: production `pageviews` (not unique visitors).
 * Period: lifetime since Web Analytics was enabled (no since/until).
 */
export const revalidate = 3600;

export async function GET() {
  const result = await getVisitsPageviews();

  return NextResponse.json(result, {
    status: 200,
    headers: {
      "Cache-Control": `public, s-maxage=${VISITS_COUNT_REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
    },
  });
}
