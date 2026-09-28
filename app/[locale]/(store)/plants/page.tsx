import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  PlantListSection,
  PlantListSkeleton,
} from "@/components/plant/plant-list-section";
import { buildCatalogMetadata } from "@/lib/seo/catalog-metadata";
import { parseCatalogPage } from "@/lib/storefront/catalog";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  const page = parseCatalogPage((await searchParams).page);
  const t = await getTranslations({ locale, namespace: "plants" });

  if (page === null) {
    return {};
  }

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

export default async function PlantsPage({ searchParams }: Props) {
  const page = parseCatalogPage((await searchParams).page);

  if (page === null) {
    notFound();
  }

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
