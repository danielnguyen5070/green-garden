/** Admin uses a single locale for number/date formatting. */
const ADMIN_LOCALE = "en-US";

/** English/default prices are USD; the `*_vi` fields are VND. */
export type AdminCurrency = "USD" | "VND";

/**
 * Accepts the exact decimal strings the API returns for money. Parsing happens
 * here, at the display boundary, so amounts are never carried as floats.
 */
export function formatAdminCurrency(
  value: number | string,
  currency: AdminCurrency = "VND"
): string {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) return "—";

  return new Intl.NumberFormat(ADMIN_LOCALE, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(amount);
}

/** Strips padding so "5.00", "5." and "05" all compare equal to "5". */
export function normalizeDecimal(value: string): string {
  const trimmed = value.trim();
  if (trimmed === "") return "";

  const [whole = "", fraction = ""] = trimmed.split(".");
  const sign = whole.startsWith("-") ? "-" : "";
  const digits = whole.replace(/^[+-]/, "").replace(/^0+(?=\d)/, "") || "0";
  const decimals = fraction.replace(/0+$/, "");

  return decimals ? `${sign}${digits}.${decimals}` : `${sign}${digits}`;
}

/** Value equality for decimal strings, without going through floating point. */
export function isSameDecimal(a: string | null, b: string | null): boolean {
  if (a === null || b === null) return a === b;
  return normalizeDecimal(a) === normalizeDecimal(b);
}

export function formatAdminNumber(value: number): string {
  return new Intl.NumberFormat(ADMIN_LOCALE).format(value);
}

export function formatAdminDate(value: string): string {
  const date = value.includes("T") ? new Date(value) : new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat(ADMIN_LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/** Relative time for recent activity (notifications, etc.). */
export function formatAdminRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSeconds);
  const rtf = new Intl.RelativeTimeFormat(ADMIN_LOCALE, { numeric: "auto" });

  if (abs < 60) return rtf.format(diffSeconds, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSeconds / 60), "minute");
  if (abs < 86_400) return rtf.format(Math.round(diffSeconds / 3600), "hour");
  if (abs < 86_400 * 30) {
    return rtf.format(Math.round(diffSeconds / 86_400), "day");
  }
  if (abs < 86_400 * 365) {
    return rtf.format(Math.round(diffSeconds / (86_400 * 30)), "month");
  }
  return rtf.format(Math.round(diffSeconds / (86_400 * 365)), "year");
}
