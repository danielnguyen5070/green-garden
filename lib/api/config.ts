import { z } from "zod";

const DEFAULT_API_URL = "http://localhost:8000";
const API_PREFIX = "/api/v1";

const apiBaseUrlSchema = z
  .string()
  .trim()
  .min(1)
  .catch(DEFAULT_API_URL)
  .transform((base) => base.replace(/\/+$/, ""));

export function getApiBaseUrl(): string {
  return apiBaseUrlSchema.parse(process.env.NEXT_PUBLIC_API_URL ?? "");
}

export function getApiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${API_PREFIX}${normalized}`;
}
