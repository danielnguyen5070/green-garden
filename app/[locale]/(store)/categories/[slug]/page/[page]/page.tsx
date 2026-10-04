import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllPlantSlugs,
  getExtraCatalogPages,
} from "@/lib/storefront/catalog-slugs";
import { parseCatalogPageSegment } from "@/lib/storefront/catalog";
import { getCategoryBySlugOrNull } from "@/lib/storefront/get-category-by-slug";
import { requireCatalogPage } from "@/lib/storefront/require-catalog-page";
import {
  CategoryCatalog,
  buildCategoryCatalogMetadata,
} from "../../category-catalog";

type Props = {
  params: Promise<{ locale: string; slug: string; page: string }>;
};

export async function generateStaticParams({
  params,
}: {
  params: { slug: string };
}) {
  const plants = await getAllPlantSlugs();
  const count = plants.filter(
    (plant) => plant.categorySlug === params.slug
  ).length;
  return getExtraCatalogPages(count).map((page) => ({ page }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug, page: segment } = await params;
  const page = parseCatalogPageSegment(segment);
  const category = await getCategoryBySlugOrNull(slug);

  if (!category || page === null || page === 1) {
    return {};
  }

  return buildCategoryCatalogMetadata(category, locale, page);
}

export default async function CategoryCatalogPage({ params }: Props) {
  const { locale, slug, page: segment } = await params;
  const category = await getCategoryBySlugOrNull(slug);

  if (!category) {
    notFound();
  }

  const page = await requireCatalogPage(locale, segment, category);

  return <CategoryCatalog category={category} locale={locale} page={page} />;
}
