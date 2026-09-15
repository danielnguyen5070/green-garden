/** Admin uses a single locale for number/date formatting. */
const ADMIN_LOCALE = "vi-VN";

export function formatAdminCurrency(value: number): string {
  return new Intl.NumberFormat(ADMIN_LOCALE, {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
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
