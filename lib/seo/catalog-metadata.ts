import type { Metadata } from "next";
import { SITE_NAME } from "@/config/site";
import { routing } from "@/i18n/routing";
import { getCatalogPath } from "@/lib/storefront/catalog";

const DEFAULT_OG_IMAGE = "/images/og-home.jpg";

type CatalogMetadataInput = {
  locale: string;
  /** Already includes the page number when `page > 1`. */
  title: string;
  description: string;
  keywords?: string;
  categorySlug?: string | null;
  page: number;
  ogImageAlt: string;
  ogImageUrl?: string | null;
};

/**
 * Metadata for `/plants` and `/categories/{slug}`. Each `?page=N` is its own
 * canonical URL (not page 1) so paginated products stay indexable.
 */
export function buildCatalogMetadata({
  locale,
  title,
  description,
  keywords,
  categorySlug,
  page,
  ogImageAlt,
  ogImageUrl,
}: CatalogMetadataInput): Metadata {
  const ogTitle = `${title} | ${SITE_NAME}`;
  const path = getCatalogPath(locale, categorySlug, page);
  const languages = {
    vi: getCatalogPath("vi", categorySlug, page),
    en: getCatalogPath("en", categorySlug, page),
    "x-default": getCatalogPath(routing.defaultLocale, categorySlug, page),
  };
  const image = ogImageUrl?.trim() || DEFAULT_OG_IMAGE;
  const isDefaultImage = image === DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: {
      canonical: path,
      languages,
    },
    openGraph: {
      title: ogTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      alternateLocale: locale === "vi" ? ["en_US"] : ["vi_VN"],
      type: "website",
      images: [
        isDefaultImage
          ? { url: image, width: 1200, height: 630, alt: ogImageAlt }
          : { url: image, alt: ogImageAlt },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [image],
    },
  };
}
