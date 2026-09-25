/**
 * Public analytics payload for the footer visits counter.
 *
 * `pageviews` comes from Vercel Web Analytics
 * `GET /v1/query/web-analytics/visits/count` (production page views).
 * Without `since`/`until`, the count is lifetime since Web Analytics
 * was enabled on the project.
 */
export type VisitsCountResponse = {
  /** Total production page views, or null when unavailable. */
  pageviews: number | null;
  available: boolean;
  /** Always `pageviews` — not unique visitors. */
  metric: "pageviews";
  /**
   * `lifetime` = all production page views since Web Analytics
   * was enabled (no since/until filter).
   */
  period: "lifetime";
};
