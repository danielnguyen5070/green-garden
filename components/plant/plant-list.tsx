"use client";

import type { MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeftIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlantCard } from "@/components/plant/plant-card";
import { PlantFilters } from "@/components/plant/plant-filters";
import { PlantListFrame } from "@/components/plant/plant-list-frame";
import { PlantSort } from "@/components/plant/plant-sort";
import { useStorefrontPlants } from "@/hooks/use-storefront-plants";
import { Link } from "@/i18n/navigation";
import { getCatalogHref } from "@/lib/storefront/catalog";
import type {
  StorefrontCategory,
  StorefrontPlantListResponse,
} from "@/types/storefront";
import { cn } from "@/lib/utils";

function isPlainLeftClick(event: MouseEvent): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

function PlantList({
  initial,
  categories,
  category = null,
  initialPage = 1,
  title,
  description,
  className,
  frameId = "products",
  headingAs = "h2",
}: {
  /** Page `initialPage` of `GET /storefront/plants`, fetched on the server. */
  initial: StorefrontPlantListResponse;
  categories: StorefrontCategory[];
  /** Category the URL is scoped to (`/categories/{slug}`), if any. */
  category?: StorefrontCategory | null;
  /** `?page=` the server rendered. */
  initialPage?: number;
  /** Section heading; defaults to `home.products.title`. */
  title?: string;
  description?: string | null;
  className?: string;
  frameId?: string;
  headingAs?: "h1" | "h2";
}) {
  const t = useTranslations("home.products");
  const categorySlug = category?.slug ?? null;
  const {
    plants,
    total,
    searchInput,
    sortOption,
    page,
    firstPage,
    isSearching,
    isLoading,
    hasError,
    hasMore,
    setSearchInput,
    setSortOption,
    loadMore,
    clearFilters,
    retry,
  } = useStorefrontPlants({
    initial,
    categoryId: category?.id,
    initialPage,
  });

  const isEmpty = plants.length === 0;

  // The href keeps every page crawlable; a plain click appends in place.
  function handleLoadMoreClick(event: MouseEvent) {
    if (!isPlainLeftClick(event)) return;
    event.preventDefault();
    if (!isLoading) loadMore();
  }

  return (
    <PlantListFrame
      title={title ?? t("title")}
      description={description}
      className={className}
      id={frameId}
      headingAs={headingAs}
    >
      <div className="mt-4 flex flex-col gap-4 lg:mt-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="relative w-full max-w-md">
          <SearchIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t("search")}
            aria-label={t("search")}
            className="h-10 rounded-full border-border bg-card pr-3 pl-9 font-sans text-sm shadow-subtle"
          />
        </div>

        <PlantSort value={sortOption} onChange={setSortOption} />
      </div>

      <div className="mt-5">
        <PlantFilters categories={categories} selected={categorySlug} />
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-3">
        <p
          className="font-sans text-small text-muted-foreground"
          aria-live="polite"
        >
          {t("resultsCount", { count: total })}
        </p>

        {firstPage > 1 && !isSearching ? (
          <Link
            href={getCatalogHref(categorySlug, firstPage - 1)}
            rel="prev"
            className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-primary outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeftIcon className="size-4 stroke-[1.5]" aria-hidden="true" />
            {t("previousPage")}
          </Link>
        ) : null}
      </div>

      <div
        className={cn(
          "mt-4 transition-opacity duration-200",
          isLoading && "opacity-70"
        )}
      >
        {hasError && isEmpty ? (
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-card px-6 py-10 shadow-subtle">
            <p className="font-sans text-body text-foreground">
              {t("loadError")}
            </p>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={retry}
            >
              {t("retry")}
            </Button>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-card px-6 py-10 shadow-subtle">
            <p className="font-sans text-body text-foreground">{t("empty")}</p>
            {isSearching || !categorySlug ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={clearFilters}
              >
                {t("clearFilters")}
              </Button>
            ) : (
              <Button
                variant="outline"
                className="rounded-full"
                render={<Link href={getCatalogHref(null, 1)} />}
                nativeButton={false}
              >
                {t("viewAllPlants")}
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {plants.map((plant) => (
                <PlantCard key={plant.id} plant={plant} />
              ))}
            </div>

            {hasError ? (
              <p
                className="mt-8 text-center font-sans text-small text-muted-foreground"
                role="status"
              >
                {t("loadError")}
              </p>
            ) : null}

            {hasError ? (
              <div className="mt-12 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-11 rounded-full border-border bg-card px-6 font-sans text-sm shadow-subtle"
                  disabled={isLoading}
                  onClick={retry}
                >
                  {t("retry")}
                </Button>
              </div>
            ) : hasMore ? (
              <div className="mt-12 flex justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  className={cn(
                    "h-11 rounded-full border-border bg-card px-6 font-sans text-sm shadow-subtle",
                    isLoading && "pointer-events-none opacity-50"
                  )}
                  aria-disabled={isLoading || undefined}
                  render={
                    <Link
                      href={getCatalogHref(categorySlug, page + 1)}
                      rel="next"
                      scroll={false}
                    />
                  }
                  nativeButton={false}
                  onClick={handleLoadMoreClick}
                >
                  {t("loadMore")}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </PlantListFrame>
  );
}

export { PlantList };
