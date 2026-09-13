"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/layout/container";
import { PlantCard } from "@/components/plant/plant-card";
import { PlantFilters } from "@/components/plant/plant-filters";
import { PlantSort } from "@/components/plant/plant-sort";
import { filterPlants, sortPlants } from "@/lib/plant-query";
import type { Plant, PlantSortOption } from "@/types/plant";
import { cn } from "@/lib/utils";

const INITIAL_VISIBLE_COUNT = 8;
const LOAD_MORE_STEP = 8;

function PlantList({
  plants,
  categories,
  className,
}: {
  plants: Plant[];
  categories: string[];
  className?: string;
}) {
  const t = useTranslations("home.products");
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<PlantSortOption>("featured");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const filteredPlants = useMemo(() => {
    const filtered = filterPlants(plants, { search, category });
    return sortPlants(filtered, sort);
  }, [plants, search, category, sort]);

  const visiblePlants = filteredPlants.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPlants.length;

  function resetVisibleCount() {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }

  function handleSearchChange(value: string) {
    startTransition(() => {
      setSearch(value);
      resetVisibleCount();
    });
  }

  function handleCategoryChange(next: string) {
    startTransition(() => {
      setCategory(next);
      resetVisibleCount();
    });
  }

  function handleSortChange(next: PlantSortOption) {
    startTransition(() => {
      setSort(next);
      resetVisibleCount();
    });
  }

  function handleClearFilters() {
    startTransition(() => {
      setSearch("");
      setCategory("all");
      setSort("featured");
      resetVisibleCount();
    });
  }

  return (
    <section
      id="products"
      data-slot="plant-list"
      aria-labelledby="plant-list-heading"
      className={cn("bg-background py-8", className)}
    >
      <Container>
        <header className="max-w-2xl">
          <h2
            id="plant-list-heading"
            className="font-heading text-h3 font-bold tracking-tight text-foreground md:text-h2"
          >
            {t("title")}
          </h2>
        </header>

        <div className="mt-4 flex flex-col gap-4 lg:mt-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div className="relative w-full max-w-md">
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder={t("search")}
              aria-label={t("search")}
              className="h-10 rounded-full border-border bg-card pr-3 pl-9 font-sans text-sm shadow-subtle"
            />
          </div>

          <PlantSort value={sort} onChange={handleSortChange} />
        </div>

        <div className="mt-5">
          <PlantFilters
            categories={categories}
            selected={category}
            onSelect={handleCategoryChange}
          />
        </div>

        <p
          className="mt-12 font-sans text-small text-muted-foreground"
          aria-live="polite"
        >
          {t("resultsCount", { count: filteredPlants.length })}
        </p>

        <div
          className={cn(
            "mt-4 transition-opacity duration-200",
            isPending && "opacity-70"
          )}
        >
          {visiblePlants.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visiblePlants.map((plant) => (
                  <PlantCard key={plant.id} plant={plant} />
                ))}
              </div>

              {hasMore ? (
                <div className="mt-12 flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-11 rounded-full border-border bg-card px-6 font-sans text-sm shadow-subtle"
                    onClick={() =>
                      setVisibleCount((count) => count + LOAD_MORE_STEP)
                    }
                  >
                    {t("loadMore")}
                  </Button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-card px-6 py-10 shadow-subtle">
              <p className="font-sans text-body text-foreground">
                {t("empty")}
              </p>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={handleClearFilters}
              >
                {t("clearFilters")}
              </Button>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

export { PlantList };
