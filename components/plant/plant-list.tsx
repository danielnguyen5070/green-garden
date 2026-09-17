"use client";

import { useTranslations } from "next-intl";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlantCard } from "@/components/plant/plant-card";
import { PlantFilters } from "@/components/plant/plant-filters";
import { PlantListFrame } from "@/components/plant/plant-list-frame";
import { PlantSort } from "@/components/plant/plant-sort";
import { useStorefrontPlants } from "@/hooks/use-storefront-plants";
import type {
  StorefrontCategory,
  StorefrontPlantListResponse,
} from "@/types/storefront";
import { cn } from "@/lib/utils";

function PlantList({
  initial,
  categories,
  className,
}: {
  /** First page of `GET /storefront/plants`, already fetched on the server. */
  initial: StorefrontPlantListResponse;
  categories: StorefrontCategory[];
  className?: string;
}) {
  const t = useTranslations("home.products");
  const {
    plants,
    total,
    searchInput,
    categorySlug,
    sortOption,
    isLoading,
    hasError,
    hasMore,
    setSearchInput,
    setCategorySlug,
    setSortOption,
    loadMore,
    clearFilters,
    retry,
  } = useStorefrontPlants({ initial, categories });

  const isEmpty = plants.length === 0;

  return (
    <PlantListFrame title={t("title")} className={className}>
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
        <PlantFilters
          categories={categories}
          selected={categorySlug}
          onSelect={setCategorySlug}
        />
      </div>

      <p
        className="mt-12 font-sans text-small text-muted-foreground"
        aria-live="polite"
      >
        {t("resultsCount", { count: total })}
      </p>

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
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={clearFilters}
            >
              {t("clearFilters")}
            </Button>
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

            {hasMore || hasError ? (
              <div className="mt-12 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-11 rounded-full border-border bg-card px-6 font-sans text-sm shadow-subtle"
                  disabled={isLoading}
                  onClick={hasError ? retry : loadMore}
                >
                  {hasError ? t("retry") : t("loadMore")}
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
