import { routing, type AppLocale } from "@/i18n/routing";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/IndexNow";
const HOST = "ngocnganbentre.vn";
const BASE_URL = `https://${HOST}`;
const INDEXNOW_KEY = "5d07f35298024c499a46e8cdc9ceb18e";
const KEY_LOCATION = `${BASE_URL}/${INDEXNOW_KEY}.txt`;

const BLOCKED_PATH_PREFIXES = ["/admin", "/api", "/cart", "/checkout"] as const;

export class IndexNowError extends Error {
  readonly status?: number;
  readonly body?: string;

  constructor(message: string, options?: { status?: number; body?: string }) {
    super(message);
    this.name = "IndexNowError";
    this.status = options?.status;
    this.body = options?.body;
  }
}

function localeUrl(locale: AppLocale, path: string): string {
  return path === "" ? `${BASE_URL}/${locale}` : `${BASE_URL}/${locale}${path}`;
}

function isBlockedPath(pathname: string): boolean {
  return BLOCKED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/** Only production public storefront URLs are eligible for IndexNow. */
export function isAllowedIndexNowUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    if (parsed.hostname !== HOST) return false;
    if (isBlockedPath(parsed.pathname)) return false;
    return true;
  } catch {
    return false;
  }
}

export function getPublicPlantUrls(slug: string): string[] {
  const normalized = slug.trim();
  if (!normalized) return [];

  return routing.locales.map((locale) =>
    localeUrl(locale, `/plants/${normalized}`)
  );
}

export function getPublicBlogPostUrls(slug: string): string[] {
  const normalized = slug.trim();
  if (!normalized) return [];

  return routing.locales.map((locale) =>
    localeUrl(locale, `/blog/${normalized}`)
  );
}

/**
 * Notify IndexNow that the given public URLs were created or updated.
 * Deduplicates, drops disallowed URLs, and no-ops on an empty list.
 */
export async function submitToIndexNow(urls: string[]): Promise<void> {
  const urlList = [...new Set(urls.map((url) => url.trim()).filter(Boolean))];
  const allowed = urlList.filter(isAllowedIndexNowUrl);
  const rejected = urlList.filter((url) => !isAllowedIndexNowUrl(url));

  if (rejected.length > 0) {
    throw new IndexNowError(
      `IndexNow rejected disallowed URLs: ${rejected.join(", ")}`
    );
  }

  if (allowed.length === 0) {
    return;
  }

  let response: Response;
  try {
    response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: KEY_LOCATION,
        urlList: allowed,
      }),
      cache: "no-store",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown network error";
    throw new IndexNowError(`IndexNow request failed: ${message}`);
  }

  if (response.ok) {
    return;
  }

  const body = await response.text().catch(() => "");
  throw new IndexNowError(
    `IndexNow responded with HTTP ${response.status}`,
    { status: response.status, body: body || undefined }
  );
}

export async function submitPlantToIndexNow(slug: string): Promise<void> {
  await submitToIndexNow(getPublicPlantUrls(slug));
}

export async function submitBlogPostToIndexNow(slug: string): Promise<void> {
  await submitToIndexNow(getPublicBlogPostUrls(slug));
}
