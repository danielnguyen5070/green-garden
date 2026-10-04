import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import {
  PlantListSection,
  PlantListSkeleton,
} from "@/components/plant/plant-list-section";
import { JsonLd } from "@/components/seo/json-ld";
import { buildCatalogMetadata } from "@/lib/seo/catalog-metadata";
import { buildCategoryJsonLd } from "@/lib/seo/category-json-ld";
import {
  localizeOptionalText,
  localizeText,
  localizeTextStrict,
} from "@/lib/storefront";
import type { StorefrontCategory } from "@/types/storefront";

/** Shared by `/categories/{slug}` and `/categories/{slug}/page/N`. */

async function getCategoryCopy(category: StorefrontCategory, locale: string) {
  const t = await getTranslations({ locale, namespace: "plants" });
  const name = localizeText(category.name, category.name_vi, locale);

  return {
    name,
    description: localizeOptionalText(
      category.description,
      category.description_vi,
      locale
    ),
    /** Never the other language's copy: metadata and schema declare `locale`. */
    metaDescription:
      localizeTextStrict(
        category.description,
        category.description_vi,
        locale
      ) ?? t("category.metadataDescription", { category: name }),
  };
}

async function buildCategoryCatalogMetadata(
  category: StorefrontCategory,
  locale: string,
  page: number
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "plants" });
  const { name, metaDescription } = await getCategoryCopy(category, locale);

  return buildCatalogMetadata({
    locale,
    title: page > 1 ? t("pageTitle", { title: name, page }) : name,
    description: metaDescription,
    categorySlug: category.slug,
    page,
    ogImageAlt: name,
    ogImageUrl: category.image_url,
  });
}

async function CategoryCatalog({
  category,
  locale,
  page,
}: {
  category: StorefrontCategory;
  locale: string;
  page: number;
}) {
  const t = await getTranslations({ locale, namespace: "plants" });
  const tDetail = await getTranslations({ locale, namespace: "plantDetail" });
  const { name, description, metaDescription } = await getCategoryCopy(
    category,
    locale
  );
  const sectionClassName = "pb-16 md:pb-20 lg:pb-24";

  const jsonLd = buildCategoryJsonLd({
    locale,
    slug: category.slug,
    name,
    description: metaDescription,
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

export { CategoryCatalog, buildCategoryCatalogMetadata };
