import { SITE_URL } from "@/config/site";

/** Resolve relative site paths to absolute URLs for JSON-LD. */
export function toAbsoluteUrl(pathOrUrl: string): string {
  if (
    pathOrUrl.startsWith("http://") ||
    pathOrUrl.startsWith("https://") ||
    pathOrUrl.startsWith("//")
  ) {
    return pathOrUrl.startsWith("//") ? `https:${pathOrUrl}` : pathOrUrl;
  }

  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}

export function toIsoDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}
