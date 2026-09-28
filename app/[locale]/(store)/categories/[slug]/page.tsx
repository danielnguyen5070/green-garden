import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import {
  PlantListSection,
  PlantListSkeleton,
} from "@/components/plant/plant-list-section";
import { JsonLd } from "@/components/seo/json-ld";
import { buildCatalogMetadata } from "@/lib/seo/catalog-metadata";
import { buildCategoryJsonLd } from "@/lib/seo/category-json-ld";
import { localizeOptionalText, localizeText } from "@/lib/storefront";
import { parseCatalogPage } from "@/lib/storefront/catalog";
import { getCategoryBySlugOrNull } from "@/lib/storefront/get-category-by-slug";
import type { StorefrontCategory } from "@/types/storefront";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

function getCategoryCopy(category: StorefrontCategory, locale: string) {
  return {
    name: localizeText(category.name, category.name_vi, locale),
    description: localizeOptionalText(
      category.description,
      category.description_vi,
      locale
    ),
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = parseCatalogPage((await searchParams).page);
  const category = await getCategoryBySlugOrNull(slug);

  if (!category || page === null) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: "plants" });
  const { name, description } = getCategoryCopy(category, locale);

  return buildCatalogMetadata({
    locale,
    title: page > 1 ? t("pageTitle", { title: name, page }) : name,
    description:
      description ?? t("category.metadataDescription", { category: name }),
    categorySlug: category.slug,
    page,
    ogImageAlt: name,
    ogImageUrl: category.image_url,
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const page = parseCatalogPage((await searchParams).page);
  const category = await getCategoryBySlugOrNull(slug);

  if (!category || page === null) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "plants" });
  const tDetail = await getTranslations({ locale, namespace: "plantDetail" });
  const { name, description } = getCategoryCopy(category, locale);
  const sectionClassName = "pb-16 md:pb-20 lg:pb-24";

  const jsonLd = buildCategoryJsonLd({
    locale,
    slug: category.slug,
    name,
    description:
      description ?? t("category.metadataDescription", { category: name }),
    homeLabel: tDetail("home"),
    plantsLabel: t("title"),
  });

  const breadcrumb = (
    <Breadcrumbs
      label={tDetail("breadcrumb")}
      className="mb-6 md:mb-8"
      items={[
        { label: tDetail("home"), href: "/" },
        { label: t("title"), href: "/plants" },
        { label: name },
      ]}
    />
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <Suspense
        fallback={
          <PlantListSkeleton
            title={name}
            breadcrumb={breadcrumb}
            headingAs="h1"
            frameId="plants"
            className={sectionClassName}
          />
        }
      >
        <PlantListSection
          title={name}
          description={description}
          breadcrumb={breadcrumb}
          category={category}
          page={page}
          headingAs="h1"
          frameId="plants"
          className={sectionClassName}
        />
      </Suspense>
    </>
  );
}
