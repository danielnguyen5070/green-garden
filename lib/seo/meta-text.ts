/** Google cuts snippets at roughly this many characters. */
const META_DESCRIPTION_MAX_LENGTH = 160;

const VI_PLANT_PREFIX = /^cây(?:\s+giống)?\s+/i;
const EN_SEEDLING_WORD = /\b(?:seedlings?|saplings?)\b/i;

/**
 * The plant name as shoppers search for it: "Cây giống Mít Thái" on `/vi`
 * (without doubling a name that already starts with "Cây"), and
 * "Thai Jackfruit Seedlings" on `/en`.
 */
function getPlantSearchName(name: string, locale: string): string {
  const trimmed = name.trim();

  if (locale === "vi") {
    return `Cây giống ${trimmed.replace(VI_PLANT_PREFIX, "")}`;
  }

  return EN_SEEDLING_WORD.test(trimmed) ? trimmed : `${trimmed} Seedlings`;
}

/** Admin copy may be Markdown; snippets show only its text. */
function stripMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}(?:#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
    .replace(/(\*\*|__|\*|_|`|~~)(\S(?:.*?\S)?)\1/g, "$2");
}

/** Markdown flattened to single-line plain text, untruncated. */
function toPlainText(text: string): string {
  return stripMarkdown(text).replace(/\s+/g, " ").trim();
}

/**
 * Single-line plain-text meta description, cut at a word boundary so the
 * snippet never ends mid-word.
 */
function toMetaDescription(
  text: string,
  maxLength = META_DESCRIPTION_MAX_LENGTH
): string {
  const normalized = toPlainText(text);
  if (normalized.length <= maxLength) return normalized;

  const cut = normalized.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > maxLength / 2 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[\s,;:.–—-]+$/, "")}…`;
}

export { getPlantSearchName, toMetaDescription, toPlainText };
