/** The API's `normalize_slug` output: `a-z0-9` words joined by single dashes. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Plant and category slug columns are `String(255)`. */
const MAX_SLUG_LENGTH = 255;

function isStorefrontSlug(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= MAX_SLUG_LENGTH &&
    SLUG_PATTERN.test(value)
  );
}

export { isStorefrontSlug };
