const DEFAULT_API_URL = "http://localhost:8000";
const API_PREFIX = "/api/v1";

export function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_URL;
  return base.replace(/\/+$/, "");
}

export function getApiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${API_PREFIX}${normalized}`;
}
