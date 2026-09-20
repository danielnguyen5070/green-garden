"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  STOREFRONT_PLANTS_MAX_PAGE_SIZE,
  STOREFRONT_PLANTS_PAGE_SIZE,
  getStorefrontPlants,
} from "@/lib/api/storefront";
import { plantMatchesSearch } from "@/lib/plant-search";
import type {
  StorefrontCategory,
  StorefrontPlantListItem,
  StorefrontPlantListResponse,
  StorefrontPlantSort,
  StorefrontPlantSortOption,
  StorefrontSortOrder,
} from "@/types/storefront";

export const ALL_CATEGORIES = "all";

const SEARCH_DEBOUNCE_MS = 350;

const DEFAULT_SORT: StorefrontPlantSortOption = "featured";

/**
 * The API sorts by `created_at`, `name`, `price` or `stock`. There is no
 * featured sort, so that option keeps the default ordering and lifts featured
 * plants within the rows already loaded.
 */
const SORT_PARAMS: Record<
  StorefrontPlantSortOption,
  { sort: StorefrontPlantSort; order: StorefrontSortOrder }
> = {
  featured: { sort: "created_at", order: "desc" },
  newest: { sort: "created_at", order: "desc" },
  "price-asc": { sort: "price", order: "asc" },
  "price-desc": { sort: "price", order: "desc" },
};

export type UseStorefrontPlantsResult = {
  plants: StorefrontPlantListItem[];
  total: number;
  searchInput: string;
  categorySlug: string;
  sortOption: StorefrontPlantSortOption;
  isLoading: boolean;
  hasError: boolean;
  hasMore: boolean;
  setSearchInput: (value: string) => void;
  setCategorySlug: (slug: string) => void;
  setSortOption: (option: StorefrontPlantSortOption) => void;
  loadMore: () => void;
  clearFilters: () => void;
  retry: () => void;
};

/**
 * Loads every catalogue page for the active category/sort so accent-insensitive
 * search can run on the full result set without a backend change.
 */
async function fetchAllPlantsForSearch(params: {
  category_id?: string;
  sort: StorefrontPlantSort;
  order: StorefrontSortOrder;
  signal: AbortSignal;
}): Promise<StorefrontPlantListItem[]> {
  const first = await getStorefrontPlants(
    {
      page: 1,
      page_size: STOREFRONT_PLANTS_MAX_PAGE_SIZE,
      category_id: params.category_id,
      sort: params.sort,
      order: params.order,
    },
    { signal: params.signal }
  );

  const items = [...first.items];
  const totalPages = Math.max(
    1,
    Math.ceil(first.total / STOREFRONT_PLANTS_MAX_PAGE_SIZE)
  );

  for (let page = 2; page <= totalPages; page += 1) {
    const response = await getStorefrontPlants(
      {
        page,
        page_size: STOREFRONT_PLANTS_MAX_PAGE_SIZE,
        category_id: params.category_id,
        sort: params.sort,
        order: params.order,
      },
      { signal: params.signal }
    );
    items.push(...response.items);
  }

  return items;
}

/**
 * Keeps the Homepage grid in sync with `GET /storefront/plants`. The first page
 * is rendered on the server and reused as-is, so the default view costs no
 * browser request; category, sort and "load more" stay on the API. Text search
 * is matched on the client with diacritic folding so queries like `lan` hit
 * `Lan Hồ Điệp`.
 */
export function useStorefrontPlants({
  initial,
  categories,
}: {
  initial: StorefrontPlantListResponse;
  categories: StorefrontCategory[];
}): UseStorefrontPlantsResult {
  const initialResponse = useRef(initial);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categorySlug, setCategorySlug] = useState(ALL_CATEGORIES);
  const [sortOption, setSortOption] = useState(DEFAULT_SORT);
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);

  const [items, setItems] = useState(initial.items);
  const [total, setTotal] = useState(initial.total);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const categoryId = useMemo(
    () => categories.find((category) => category.slug === categorySlug)?.id,
    [categories, categorySlug]
  );

  // Typing should not turn every keystroke into a request.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const isSearching = search.length > 0;

  const isServerRenderedQuery =
    page === 1 &&
    !isSearching &&
    categorySlug === ALL_CATEGORIES &&
    sortOption === DEFAULT_SORT &&
    reloadToken === 0;

  useEffect(() => {
    if (isServerRenderedQuery) {
      setItems(initialResponse.current.items);
      setTotal(initialResponse.current.total);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    const controller = new AbortController();
    const { sort, order } = SORT_PARAMS[sortOption];

    setIsLoading(true);
    setHasError(false);

    const request = isSearching
      ? fetchAllPlantsForSearch({
          category_id: categoryId,
          sort,
          order,
          signal: controller.signal,
        }).then((allItems) => {
          const matched = allItems.filter((plant) =>
            plantMatchesSearch(plant, search)
          );
          setItems(matched);
          setTotal(matched.length);
        })
      : getStorefrontPlants(
          {
            page,
            page_size: STOREFRONT_PLANTS_PAGE_SIZE,
            category_id: categoryId,
            sort,
            order,
          },
          { signal: controller.signal }
        ).then((response) => {
          setItems((current) =>
            page > 1 ? [...current, ...response.items] : response.items
          );
          setTotal(response.total);
        });

    request
      .catch(() => {
        if (controller.signal.aborted) return;
        setHasError(true);
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [
    isServerRenderedQuery,
    isSearching,
    page,
    search,
    categoryId,
    sortOption,
    reloadToken,
  ]);

  const plants = useMemo(() => {
    if (sortOption !== "featured") return items;
    // Stable sort, so the API's ordering is preserved within each group.
    return [...items].sort(
      (a, b) => Number(b.is_featured) - Number(a.is_featured)
    );
  }, [items, sortOption]);

  const handleSearchInput = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const handleCategoryChange = useCallback((slug: string) => {
    setCategorySlug(slug);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((option: StorefrontPlantSortOption) => {
    setSortOption(option);
    setPage(1);
  }, []);

  const loadMore = useCallback(() => {
    if (isSearching) return;
    setPage((current) => current + 1);
  }, [isSearching]);

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setSearch("");
    setCategorySlug(ALL_CATEGORIES);
    setSortOption(DEFAULT_SORT);
    setPage(1);
  }, []);

  const retry = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  return {
    plants,
    total,
    searchInput,
    categorySlug,
    sortOption,
    isLoading,
    hasError,
    // Search loads the full filtered set in one pass; pagination stays for browse.
    hasMore: !isSearching && items.length < total,
    setSearchInput: handleSearchInput,
    setCategorySlug: handleCategoryChange,
    setSortOption: handleSortChange,
    loadMore,
    clearFilters,
    retry,
  };
}
