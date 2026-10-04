import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  PlantListSection,
  PlantListSkeleton,
} from "@/components/plant/plant-list-section";
import { buildCatalogMetadata } from "@/lib/seo/catalog-metadata";

/** Shared by `/plants` and `/plants/page/N`. */
async function buildPlantsCatalogMetadata(
  locale: string,
  page: number
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "plants" });
  const title = t("metadata.title");

  return buildCatalogMetadata({
    locale,
    title: page > 1 ? t("pageTitle", { title, page }) : title,
    description: t("metadata.description"),
    keywords: t("metadata.keywords"),
    page,
    ogImageAlt: t("metadata.ogImageAlt"),
  });
}

async function PlantsCatalog({ page }: { page: number }) {
  const t = await getTranslations("plants");
  const sectionClassName = "pb-16 md:pb-20 lg:pb-24";

  return (
    <Suspense
      fallback={
        <PlantListSkeleton
          title={t("title")}
          headingAs="h1"
          frameId="plants"
          className={sectionClassName}
        />
      }
    >
      <PlantListSection
        title={t("title")}
        page={page}
        headingAs="h1"
        frameId="plants"
        className={sectionClassName}
      />
    </Suspense>
  );
}

export { PlantsCatalog, buildPlantsCatalogMetadata };
