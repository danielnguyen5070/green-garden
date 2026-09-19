import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlantDetail } from "@/components/plant/plant-detail";
import { RelatedPlants } from "@/components/plant/related-plants";
import { routing } from "@/i18n/routing";
import { ApiError } from "@/lib/api/errors";
import { getStorefrontPlantBySlug } from "@/lib/api/storefront";
import { localizeOptionalText, localizeText } from "@/lib/storefront";
import type { StorefrontPlantDetail } from "@/types/storefront";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;

/**
 * Resolves the public slug. `generateMetadata` and the page both call this, and
 * fetch memoization collapses them into the single request per render.
 */
async function loadPlant(slug: string): Promise<StorefrontPlantDetail | null> {
  try {
    return await getStorefrontPlantBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const plant = await loadPlant(slug);

  if (!plant) {
    return {};
  }

  const name = localizeText(plant.name, plant.name_vi, locale);
  const description = localizeOptionalText(
    plant.description,
    plant.description_vi,
    locale
  );
  const ogTitle = `${name} | Ngoc Ngan Ben Tre`;
  const path = `/${locale}/plants/${slug}`;
  const languages = {
    vi: `/vi/plants/${slug}`,
    en: `/en/plants/${slug}`,
    "x-default": `/${routing.defaultLocale}/plants/${slug}`,
  };
  const ogImageUrl = plant.og_image_url?.trim() || null;

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
      locale: locale === "vi" ? "vi_VN" : "en_US",
      alternateLocale: locale === "vi" ? ["en_US"] : ["vi_VN"],
      type: "website",
      ...(ogImageUrl
        ? {
            images: [
              {
                url: ogImageUrl,
                width: OG_IMAGE_WIDTH,
                height: OG_IMAGE_HEIGHT,
                alt: name,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: description ?? undefined,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
  };
}

export default async function PlantDetailPage({ params }: Props) {
  const { slug } = await params;
  const plant = await loadPlant(slug);

  if (!plant) {
    notFound();
  }

  return (
    <>
      <PlantDetail plant={plant} />
      <Suspense fallback={null}>
        <RelatedPlants plant={plant} />
      </Suspense>
    </>
  );
}
