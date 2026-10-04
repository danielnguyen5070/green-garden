import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllCategorySlugs } from "@/lib/storefront/catalog-slugs";
import { getCategoryBySlugOrNull } from "@/lib/storefront/get-category-by-slug";
import {
  CategoryCatalog,
  buildCategoryCatalogMetadata,
} from "./category-catalog";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

/** Categories added after the build render on their first visit, then stay cached. */
export async function generateStaticParams() {
  const categories = await getAllCategorySlugs();
  return categories.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = await getCategoryBySlugOrNull(slug);

  if (!category) {
    return {};
  }

  return buildCategoryCatalogMetadata(category, locale, 1);
}

export default async function CategoryPage({ params }: Props) {
  const { locale, slug } = await params;
  const category = await getCategoryBySlugOrNull(slug);

  if (!category) {
    notFound();
  }

  return <CategoryCatalog category={category} locale={locale} page={1} />;
}
