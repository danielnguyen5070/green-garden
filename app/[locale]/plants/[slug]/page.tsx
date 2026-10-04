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
import { getAllPlantSlugs } from "@/lib/storefront/catalog-slugs";
import {
  getPlantBySlugOrNull,
  redirectToCanonicalPlantSlug,
} from "@/lib/storefront/get-plant-by-slug";
import { loadPlantReviews } from "@/lib/reviews";
import { resolveOgImage } from "@/lib/seo/og-image";
import { buildPlantJsonLd } from "@/lib/seo/plant-json-ld";
import {
  getPrimaryPlantImage,
  localizeText,
  localizeTextStrict,
} from "@/lib/storefront";
import type { StorefrontPlantDetail } from "@/types/storefront";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

/** Generated in the page's language for plants missing a translated description. */
async function getFallbackDescription(
  plant: StorefrontPlantDetail,
  locale: string
): Promise<string> {
  const t = await getTranslations({ locale, namespace: "plantDetail" });
  const name = localizeText(plant.name, plant.name_vi, locale);
  const category = plant.category
    ? localizeText(plant.category.name, plant.category.name_vi, locale)
    : null;

  return category
    ? t("metadataDescription", { name, category })
    : t("metadataDescriptionNoCategory", { name });
}

/** Admin-set OG image, then the first product photo, then the site default. */
function resolvePlantOgImage(plant: StorefrontPlantDetail, name: string) {
  if (plant.og_image_url?.trim()) {
    return resolveOgImage(plant.og_image_url, name);
  }

  const primary = getPrimaryPlantImage(plant.images);
  const photo = primary?.type === "image" ? primary : null;
  return resolveOgImage(photo?.url, photo?.alt_text?.trim() || name);
}

/** Plants added after the build render on their first visit, then stay cached. */
export async function generateStaticParams() {
  const plants = await getAllPlantSlugs();
  return plants.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const plant = await getPlantBySlugOrNull(slug);

  if (!plant) {
    return {};
  }

  const name = localizeText(plant.name, plant.name_vi, locale);
  const description =
    localizeTextStrict(plant.description, plant.description_vi, locale) ??
    (await getFallbackDescription(plant, locale));
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
    description,
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
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
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

  const [t, tPlants, shippingPolicy, fallbackDescription, reviews] =
    await Promise.all([
      getTranslations({ locale, namespace: "plantDetail" }),
      getTranslations({ locale, namespace: "plants" }),
      // Structured data can go without shipping details; the page cannot fail.
      getStorefrontShippingPolicy().catch(() => null),
      getFallbackDescription(plant, locale),
      loadPlantReviews(plant.slug),
    ]);
  const jsonLd = buildPlantJsonLd({
    locale,
    plant,
    homeLabel: t("home"),
    plantsLabel: tPlants("title"),
    shippingPolicy,
    fallbackDescription,
    reviews,
  });

  return (
    <>
      <JsonLd data={jsonLd} />
      <PlantDetail plant={plant} reviews={reviews} />
      <Suspense fallback={null}>
        <RelatedPlants plant={plant} />
      </Suspense>
    </>
  );
}
