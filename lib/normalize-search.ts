/**
 * Fold text for accent-insensitive search: strip diacritics, lowercase, trim.
 * Vietnamese `đ` is not an NFD combining mark, so it is mapped to `d` explicitly.
 */
export function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .trim();
}
