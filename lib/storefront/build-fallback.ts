import { PHASE_PRODUCTION_BUILD } from "next/constants";

/**
 * True only for a `next build` explicitly allowed to run without the API
 * (`ALLOW_BUILD_WITHOUT_API=1`, e.g. a local build with no backend).
 */
function isOfflineBuildAllowed(): boolean {
  return (
    process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD &&
    process.env.ALLOW_BUILD_WITHOUT_API === "1"
  );
}

/**
 * Resolves `promise`, or `fallback` if it rejects during an offline build.
 *
 * Anywhere else the error is rethrown. A production build must fail instead:
 * a degraded prerender (empty sitemap, catalog showing a load error) would be
 * cached and served to crawlers, while a failed deploy keeps the previous one
 * live. On a prerendered page, a background regeneration that throws keeps
 * serving the last good copy; a caught error would count as a successful
 * render and replace it with degraded content.
 * Use plain `.catch()` only for data the page is genuinely fine without.
 */
async function withBuildFallback<T, F>(
  promise: Promise<T>,
  fallback: F
): Promise<T | F> {
  try {
    return await promise;
  } catch (error) {
    if (!isOfflineBuildAllowed()) throw error;
    return fallback;
  }
}

export { withBuildFallback };
