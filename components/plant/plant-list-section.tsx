import { getTranslations } from "next-intl/server";
import { PlantList } from "@/components/plant/plant-list";
import { PlantListFrame } from "@/components/plant/plant-list-frame";
import { Skeleton } from "@/components/ui/skeleton";
import {
  STOREFRONT_PLANTS_PAGE_SIZE,
  getStorefrontCategories,
  getStorefrontPlants,
} from "@/lib/api/storefront";

const SKELETON_CARDS = Array.from(
  { length: STOREFRONT_PLANTS_PAGE_SIZE },
  (_, index) => index
);

const SKELETON_CHIPS = [4.5, 6, 5.5, 7] as const;

async function PlantListSkeleton({
  title,
  headingAs = "h2",
  frameId = "products",
  className,
}: {
  title?: string;
  headingAs?: "h1" | "h2";
  frameId?: string;
  className?: string;
} = {}) {
  const t = await getTranslations("home.products");

  return (
    <PlantListFrame
      title={title ?? t("title")}
      headingAs={headingAs}
      id={frameId}
      className={className}
    >
      <div className="mt-4 flex flex-col gap-4 lg:mt-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <Skeleton className="h-10 w-full max-w-md rounded-full" />
        <Skeleton className="h-9 w-[11.5rem] rounded-full" />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {SKELETON_CHIPS.map((width) => (
          <Skeleton
            key={width}
            className="h-9 rounded-full"
            style={{ width: `${width}rem` }}
          />
        ))}
      </div>

      <Skeleton className="mt-12 h-4 w-24 rounded-md" />

      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {SKELETON_CARDS.map((index) => (
          <div key={index} className="flex flex-col">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <Skeleton className="mt-4 h-5 w-3/4 rounded-md" />
            <Skeleton className="mt-2 h-4 w-full rounded-md" />
            <Skeleton className="mt-1.5 h-4 w-2/3 rounded-md" />
            <Skeleton className="mt-4 h-5 w-20 rounded-md" />
          </div>
        ))}
      </div>
    </PlantListFrame>
  );
}

/**
 * Full storefront catalog with search, category filters, sort, and load more.
 */
async function PlantListSection({
  title,
  headingAs = "h2",
  frameId = "products",
  className,
}: {
  title?: string;
  headingAs?: "h1" | "h2";
  frameId?: string;
  className?: string;
} = {}) {
  const t = await getTranslations("home.products");
  const sectionTitle = title ?? t("title");

  const [plants, categories] = await Promise.all([
    getStorefrontPlants({
      page: 1,
      page_size: STOREFRONT_PLANTS_PAGE_SIZE,
      sort: "created_at",
      order: "desc",
    }).catch(() => null),
    getStorefrontCategories().catch(() => null),
  ]);

  if (!plants) {
    return (
      <PlantListFrame
        title={sectionTitle}
        headingAs={headingAs}
        id={frameId}
        className={className}
      >
        <div className="mt-8 rounded-2xl border border-border bg-card px-6 py-10 shadow-subtle">
          <p className="font-sans text-body text-foreground">
            {t("loadError")}
          </p>
        </div>
      </PlantListFrame>
    );
  }

  return (
    <PlantList
      initial={plants}
      categories={categories?.items ?? []}
      title={sectionTitle}
      headingAs={headingAs}
      frameId={frameId}
      className={className}
    />
  );
}

export { PlantListSection, PlantListSkeleton };
