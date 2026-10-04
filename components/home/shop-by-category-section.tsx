import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRightIcon } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PlantCard } from "@/components/plant/plant-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { getStorefrontPlants } from "@/lib/api/storefront";
import { localizeOptionalText, localizeText } from "@/lib/storefront";
import { withBuildFallback } from "@/lib/storefront/build-fallback";
import { getCatalogHref } from "@/lib/storefront/catalog";
import { getCategoryBySlugOrNull } from "@/lib/storefront/get-category-by-slug";
import type {
  StorefrontCategory,
  StorefrontPlantListItem,
} from "@/types/storefront";
import { cn } from "@/lib/utils";

const FRUIT_TREES_SLUG = "fruit-trees";
const FRUIT_TREES_PRODUCT_LIMIT = 4;

const SKELETON_CARDS = Array.from(
  { length: FRUIT_TREES_PRODUCT_LIMIT },
  (_, index) => index
);

const sectionClassName = "bg-background py-8 md:py-10";
const headingClassName =
  "font-heading text-h3 font-bold tracking-tight text-foreground md:text-h2";
const productGridClassName =
  "mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4";

async function ShopByCategorySkeleton() {
  const t = await getTranslations("home.categories");

  return (
    <section
      data-slot="home-categories"
      aria-labelledby="home-categories-heading"
      className={sectionClassName}
    >
      <Container>
        <h2 id="home-categories-heading" className={headingClassName}>
          {t("title")}
        </h2>
        <Skeleton className="mt-4 h-5 w-full max-w-2xl rounded-md" />
        <Skeleton className="mt-4 h-4 w-24 rounded-md" />
        <div className={productGridClassName}>
          {SKELETON_CARDS.map((index) => (
            <div key={index} className="flex flex-col">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <Skeleton className="mt-4 h-5 w-3/4 rounded-md" />
              <Skeleton className="mt-2 h-4 w-full rounded-md" />
              <Skeleton className="mt-4 h-5 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

async function loadFruitTrees(): Promise<{
  category: StorefrontCategory;
  plants: StorefrontPlantListItem[];
} | null> {
  const category = await getCategoryBySlugOrNull(FRUIT_TREES_SLUG);
  if (!category) return null;

  const { items } = await getStorefrontPlants({
    category_id: category.id,
    page: 1,
    page_size: FRUIT_TREES_PRODUCT_LIMIT,
    sort: "created_at",
    order: "desc",
  });

  return {
    category,
    plants: items.slice(0, FRUIT_TREES_PRODUCT_LIMIT),
  };
}

/**
 * Homepage teaser for the Fruit Trees category: a description with a link to
 * `/categories/fruit-trees`, followed by a few of its newest plants.
 */
async function ShopByCategorySection({ className }: { className?: string }) {
  const [t, locale, data] = await Promise.all([
    getTranslations("home.categories"),
    getLocale(),
    withBuildFallback(loadFruitTrees(), null),
  ]);

  if (data === null) {
    return null;
  }

  const { category, plants } = data;
  const name = localizeText(category.name, category.name_vi, locale);
  const description =
    localizeOptionalText(
      category.description,
      category.description_vi,
      locale
    ) ?? t("description");

  return (
    <section
      data-slot="home-categories"
      aria-labelledby="home-categories-heading"
      className={cn(sectionClassName, className)}
    >
      <Container>
        <h2 id="home-categories-heading" className={headingClassName}>
          {name || t("title")}
        </h2>

        <div className="mt-4 flex flex-col gap-4">
          <p className="font-sans text-body text-muted-foreground">
            {description}
          </p>
          <Link
            href={getCatalogHref(category.slug, 1)}
            className="inline-flex w-fit items-center gap-1.5 rounded-sm font-sans text-sm font-medium text-primary outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {t("viewAll")}
            <ArrowRightIcon className="size-4 stroke-[1.5]" aria-hidden="true" />
          </Link>
        </div>

        {plants.length > 0 ? (
          <div className={productGridClassName}>
            {plants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        ) : null}
      </Container>
    </section>
  );
}

export { ShopByCategorySection, ShopByCategorySkeleton };
