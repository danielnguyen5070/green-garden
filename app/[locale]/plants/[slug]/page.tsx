import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { PlantDetail } from "@/components/plant/plant-detail";
import { RelatedPlants } from "@/components/plant/related-plants";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_NAME } from "@/config/site";
import { routing } from "@/i18n/routing";
import { getStorefrontShippingPolicy } from "@/lib/api/storefront";
import {
  getPlantBySlugOrNull,
  redirectToCanonicalPlantSlug,
} from "@/lib/storefront/get-plant-by-slug";
import { resolveOgImage } from "@/lib/seo/og-image";
import { buildPlantJsonLd } from "@/lib/seo/plant-json-ld";
import {
  getPrimaryPlantImage,
  localizeOptionalText,
  localizeText,
} from "@/lib/storefront";
import type { StorefrontPlantDetail } from "@/types/storefront";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

/** Admin-set OG image, then the first product photo, then the site default. */
function resolvePlantOgImage(plant: StorefrontPlantDetail, name: string) {
  if (plant.og_image_url?.trim()) {
    return resolveOgImage(plant.og_image_url, name);
  }

  const primary = getPrimaryPlantImage(plant.images);
  const photo = primary?.type === "image" ? primary : null;
  return resolveOgImage(photo?.url, photo?.alt_text?.trim() || name);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const plant = await getPlantBySlugOrNull(slug);

  if (!plant) {
    return {};
  }

  const name = localizeText(plant.name, plant.name_vi, locale);
  const description = localizeOptionalText(
    plant.description,
    plant.description_vi,
    locale
  );
  const ogTitle = `${name} | ${SITE_NAME}`;
  const path = `/${locale}/plants/${plant.slug}`;
  const languages = {
    vi: `/vi/plants/${plant.slug}`,
    en: `/en/plants/${plant.slug}`,
    "x-default": `/${routing.defaultLocale}/plants/${plant.slug}`,
  };
  const ogImage = resolvePlantOgImage(plant, name);

  return {
    title: name,
    description: description ?? undefined,
    alternates: {
      canonical: path,
      languages,
    },
    openGraph: {
      title: ogTitle,
      description: description ?? undefined,
      url: path,
      siteName: SITE_NAME,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      alternateLocale: locale === "vi" ? ["en_US"] : ["vi_VN"],
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: description ?? undefined,
      images: [ogImage.url],
    },
  };
}

export default async function PlantDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const plant = await getPlantBySlugOrNull(slug);

  if (!plant) {
    notFound();
  }

  redirectToCanonicalPlantSlug(locale, slug, plant);

  const [t, tPlants, shippingPolicy] = await Promise.all([
    getTranslations({ locale, namespace: "plantDetail" }),
    getTranslations({ locale, namespace: "plants" }),
    // Structured data can go without shipping details; the page cannot fail.
    getStorefrontShippingPolicy().catch(() => null),
  ]);
  const jsonLd = buildPlantJsonLd({
    locale,
    plant,
    homeLabel: t("home"),
    plantsLabel: tPlants("title"),
    shippingPolicy,
  });

  return (
    <>
      <JsonLd data={jsonLd} />
      <PlantDetail plant={plant} />
      <Suspense fallback={null}>
        <RelatedPlants plant={plant} />
      </Suspense>
    </>
  );
}
