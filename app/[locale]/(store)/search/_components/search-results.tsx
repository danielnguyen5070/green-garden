import { getTranslations } from "next-intl/server";
import { BlogCard } from "@/components/blog/blog-card";
import { PlantCard } from "@/components/plant/plant-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  STOREFRONT_PLANTS_SEARCH_LIMIT,
  searchStorefrontPlants,
} from "@/lib/api/storefront";
import type { AppLocale } from "@/i18n/routing";
import type { BlogPostMeta } from "@/types/blog";

const PRODUCT_SKELETON_COUNT = 4;

function ProductSearchSkeleton() {
  return (
    <section className="mt-10" aria-busy="true" aria-live="polite">
      <Skeleton className="h-7 w-28 rounded-md" />
      <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: PRODUCT_SKELETON_COUNT }, (_, index) => (
          <div key={index} className="flex flex-col">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <Skeleton className="mt-4 h-5 w-3/4 rounded-md" />
            <Skeleton className="mt-2 h-4 w-full rounded-md" />
            <Skeleton className="mt-1.5 h-4 w-2/3 rounded-md" />
            <Skeleton className="mt-4 h-5 w-20 rounded-md" />
          </div>
        ))}
      </div>
    </section>
  );
}

async function SearchEmptyState({ query }: { query: string }) {
  const t = await getTranslations("search");

  return (
    <div className="mt-10 rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-subtle">
      <p className="font-heading text-xl font-bold tracking-tight text-foreground md:text-2xl">
        {t("emptyTitle", { query })}
      </p>
      <p className="mx-auto mt-3 max-w-md font-sans text-body text-muted-foreground">
        {t("emptyDescription")}
      </p>
    </div>
  );
}

async function ProductSearchResults({
  query,
  locale,
  hasBlogResults,
}: {
  query: string;
  locale: AppLocale;
  hasBlogResults: boolean;
}) {
  const t = await getTranslations("search");

  try {
    const response = await searchStorefrontPlants({
      q: query,
      locale,
      limit: STOREFRONT_PLANTS_SEARCH_LIMIT,
    });

    if (response.items.length === 0) {
      if (hasBlogResults) return null;

      return <SearchEmptyState query={query} />;
    }

    return (
      <section aria-labelledby="search-products-heading" className="mt-10">
        <h2
          id="search-products-heading"
          className="font-heading text-xl font-bold tracking-tight text-foreground md:text-2xl"
        >
          {t("products")}
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {response.items.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      </section>
    );
  } catch {
    return (
      <section
        aria-labelledby="search-products-error-heading"
        className="mt-10 rounded-2xl border border-border bg-card px-6 py-8 shadow-subtle"
      >
        <h2
          id="search-products-error-heading"
          className="font-heading text-xl font-bold tracking-tight text-foreground"
        >
          {t("products")}
        </h2>
        <p className="mt-3 font-sans text-body text-muted-foreground">
          {t("productsError")}
        </p>
      </section>
    );
  }
}

async function BlogSearchResults({
  locale,
  posts,
}: {
  locale: AppLocale;
  posts: BlogPostMeta[];
}) {
  if (posts.length === 0) return null;

  const t = await getTranslations("search");
  const tBlog = await getTranslations("blog");

  return (
    <section aria-labelledby="search-blog-heading" className="mt-12">
      <h2
        id="search-blog-heading"
        className="font-heading text-xl font-bold tracking-tight text-foreground md:text-2xl"
      >
        {t("blog")}
      </h2>
      <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard
            key={post.slug}
            post={post}
            locale={locale}
            readMoreLabel={tBlog("readMore")}
          />
        ))}
      </div>
    </section>
  );
}

export {
  BlogSearchResults,
  ProductSearchResults,
  ProductSearchSkeleton,
};
