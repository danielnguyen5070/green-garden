import { getLocale } from "next-intl/server";

/**
 * Current UI locale from the URL (`/vi/...`, `/en/...`).
 * Pass this to the backend later, e.g. `GET /plants?locale=${locale}`.
 */
export async function getCurrentLocale() {
  return getLocale();
}
