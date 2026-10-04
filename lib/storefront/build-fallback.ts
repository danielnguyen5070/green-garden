import { PHASE_PRODUCTION_BUILD } from "next/constants";

/** True while `next build` prerenders pages, before any cached copy exists. */
function isProductionBuild(): boolean {
  return process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;
}

/**
 * Resolves `promise`, or `fallback` if it rejects during `next build`.
 *
 * Anywhere else the error is rethrown. On a prerendered page, a background
 * regeneration that throws keeps serving the last good copy; a caught error
 * would count as a successful render and replace it with degraded content.
 * Use plain `.catch()` only for data the page is genuinely fine without.
 */
async function withBuildFallback<T, F>(
  promise: Promise<T>,
  fallback: F
): Promise<T | F> {
  try {
    return await promise;
  } catch (error) {
    if (!isProductionBuild()) throw error;
    return fallback;
  }
}

export { withBuildFallback };
