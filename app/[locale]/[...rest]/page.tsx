import { notFound } from "next/navigation";

/**
 * Catch unmatched paths under a valid locale so `notFound()` renders the
 * standalone `[locale]/not-found` (with i18n) instead of the root fallback.
 */
export default function LocaleCatchAll() {
  notFound();
}
