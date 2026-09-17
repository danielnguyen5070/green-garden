import { formatCartMoney } from "@/lib/cart";
import type {
  StorefrontPlantImage,
  StorefrontPlantPotSize,
} from "@/types/storefront";

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

/** Number/currency formatting locale for the active UI locale. */
export function getMoneyLocale(locale: string): string {
  return isVietnamese(locale) ? "vi-VN" : "en-US";
}

/** Money is carried as decimal strings and only parsed at the display edge. */
function parseMoney(value: string | null | undefined): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

/**
 * `price_vi` is already VND as stored by the backend — it is selected, never
 * calculated from `price`.
 */
export function localizePrice(
  price: string,
  priceVi: string | null | undefined,
  locale: string
): number {
  if (!isVietnamese(locale)) return parseMoney(price);
  return priceVi?.trim() ? parseMoney(priceVi) : parseMoney(price);
}

export function formatStorefrontPrice(amount: number, locale: string): string {
  return formatCartMoney(amount, getMoneyLocale(locale));
}

/** Fields the listing and detail responses share for localization. */
type LocalizablePlant = {
  name: string;
  name_vi: string | null;
  description: string | null;
  description_vi: string | null;
  price: string;
  price_vi: string | null;
};

/**
 * Resolves the copy and price for the active locale in one call, so components
 * don't repeat the fallback rules field by field. `slug` is shared across
 * locales and is therefore never localized.
 */
export function getLocalizedPlant(plant: LocalizablePlant, locale: string) {
  return {
    name: localizeText(plant.name, plant.name_vi, locale),
    description: localizeOptionalText(
      plant.description,
      plant.description_vi,
      locale
    ),
    price: localizePrice(plant.price, plant.price_vi, locale),
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

export function getActivePotSizes(
  potSizes: StorefrontPlantPotSize[] | undefined
): StorefrontPlantPotSize[] {
  return (potSizes ?? [])
    .filter((size) => size.is_active)
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
}
