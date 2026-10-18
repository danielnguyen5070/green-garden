import { formatVnd, parseMoney } from "@/lib/cart";
import type { StorefrontPlantImage } from "@/types/storefront";

/** Shown when a plant has no image of its own. */
export const PLANT_IMAGE_PLACEHOLDER = "/images/plants/placeholder.svg";

function isVietnamese(locale: string): boolean {
  return locale === "vi";
}

/**
 * Picks the Vietnamese value on `/vi` and falls back to English whenever the
 * backend leaves the translation empty. Translation is the backend's job —
 * nothing here rewrites catalog copy.
 */
export function localizeText(
  english: string,
  vietnamese: string | null | undefined,
  locale: string
): string {
  if (!isVietnamese(locale)) return english;
  return vietnamese?.trim() ? vietnamese : english;
}

/** Same fallback rule for fields the API may omit entirely. */
export function localizeOptionalText(
  english: string | null | undefined,
  vietnamese: string | null | undefined,
  locale: string
): string | null {
  const fallback = english?.trim() ? english : null;
  if (!isVietnamese(locale)) return fallback;
  return vietnamese?.trim() ? vietnamese : fallback;
}

/**
 * The active locale's own value, never the other language. Metadata and
 * structured data use this so `/vi` never ships English copy tagged as `vi`.
 */
export function localizeTextStrict(
  english: string | null | undefined,
  vietnamese: string | null | undefined,
  locale: string
): string | null {
  const value = isVietnamese(locale) ? vietnamese : english;
  return value?.trim() ? value : null;
}

/**
 * Locale-first optional text that falls back to the other language when the
 * preferred value is empty (used for long-form plant copy).
 */
export function localizeOptionalTextEither(
  english: string | null | undefined,
  vietnamese: string | null | undefined,
  locale: string
): string | null {
  const en = english?.trim() ? english : null;
  const vi = vietnamese?.trim() ? vietnamese : null;
  if (isVietnamese(locale)) return vi ?? en;
  return en ?? vi;
}

/** Digit-grouping locale for VND amounts on the active UI locale. */
export function getMoneyLocale(locale: string): string {
  return isVietnamese(locale) ? "vi-VN" : "en-US";
}

/**
 * The VND selling price on every locale. `null` means the plant has no VND
 * price and cannot be ordered — the legacy `price` column is never shown.
 */
export function getVndPrice(priceVi: string | null | undefined): number | null {
  return priceVi?.trim() ? parseMoney(priceVi) : null;
}

/**
 * The VND price shown on catalogue cards and used by "Add to cart".
 * Returns `null` when the plant has no VND price and cannot be ordered.
 */
export function getCardPrice(plant: {
  price_vi: string | null;
}): number | null {
  return getVndPrice(plant.price_vi);
}

/** Stock is tracked per plant. */
export function isPlantInStock(
  plant: { in_stock: boolean } | { stock: number }
): boolean {
  return "in_stock" in plant ? plant.in_stock : plant.stock > 0;
}

export function formatStorefrontPrice(
  amount: string | number,
  locale: string
): string {
  return formatVnd(amount, getMoneyLocale(locale));
}

/** Fields the listing and detail responses share for localization. */
type LocalizablePlant = {
  name: string;
  name_vi: string | null;
  description: string | null;
  description_vi: string | null;
  price_vi: string | null;
};

/**
 * Resolves the copy and VND price for the active locale in one call, so
 * components don't repeat the fallback rules field by field. `slug` is shared
 * across locales and is therefore never localized.
 */
export function getLocalizedPlant(plant: LocalizablePlant, locale: string) {
  return {
    name: localizeText(plant.name, plant.name_vi, locale),
    description: localizeOptionalText(
      plant.description,
      plant.description_vi,
      locale
    ),
    price: getVndPrice(plant.price_vi),
  };
}

/**
 * Generic over the image shape because the listing and detail endpoints return
 * the same media fields with different amounts of bookkeeping around them.
 */
export function sortPlantImages<T extends StorefrontPlantImage>(
  images: T[] | undefined
): T[] {
  return [...(images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id)
  );
}

/** Lowest `sort_order` still photo, falling back to whatever comes first. */
export function getPrimaryPlantImage<T extends StorefrontPlantImage>(
  images: T[] | undefined
): T | null {
  const sorted = sortPlantImages(images);
  return sorted.find((image) => image.type === "image") ?? sorted[0] ?? null;
}

/**
 * Card-ready `src`/`alt` for a plant, falling back to the bundled placeholder
 * when the plant has no media. `alt_text` is authored per image; the localized
 * plant name is the fallback.
 */
export function getPlantCardImage(
  images: StorefrontPlantImage[] | undefined,
  localizedName: string
): { src: string; alt: string } {
  const primary = getPrimaryPlantImage(images);

  return {
    src: primary?.url ?? PLANT_IMAGE_PLACEHOLDER,
    alt: primary?.alt_text?.trim() || localizedName,
  };
}
