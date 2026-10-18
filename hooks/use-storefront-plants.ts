"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  STOREFRONT_PLANTS_MAX_PAGE_SIZE,
  STOREFRONT_PLANTS_PAGE_SIZE,
  getStorefrontPlants,
} from "@/lib/api/storefront";
import { plantMatchesSearch } from "@/lib/plant-search";
import { queryKeys } from "@/lib/query/keys";
import type {
  StorefrontPlantListItem,
  StorefrontPlantListResponse,
  StorefrontPlantSort,
  StorefrontPlantSortOption,
  StorefrontSortOrder,
} from "@/types/storefront";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants/timing";


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
  sortOption: StorefrontPlantSortOption;
  /** Page of the last loaded batch; "Load more" links to `page + 1`. */
  page: number;
  /** First page shown in the grid; above 1 only on a `/page/N` landing. */
  firstPage: number;
  isSearching: boolean;
  isLoading: boolean;
  hasError: boolean;
  hasMore: boolean;
  setSearchInput: (value: string) => void;
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

function applyFeaturedSort(
  items: StorefrontPlantListItem[],
  sortOption: StorefrontPlantSortOption
): StorefrontPlantListItem[] {
  if (sortOption !== "featured") return items;
  // Stable sort, so the API's ordering is preserved within each group.
  return [...items].sort(
    (a, b) => Number(b.is_featured) - Number(a.is_featured)
  );
}

/**
 * Keeps the catalog grid in sync with `GET /storefront/plants`. The page named
 * in the URL (category + `/page/N`) is rendered on the server and reused as-is,
 * so the default view costs no browser request; sort and "load more" stay on
 * the API. Text search is matched on the client with diacritic folding so
 * queries like `lan` hit `Lan Hồ Điệp`.
 */
export function useStorefrontPlants({
  initial,
  categoryId,
  initialPage = 1,
}: {
  initial: StorefrontPlantListResponse;
  /** Category the URL is scoped to; category changes are page navigations. */
  categoryId?: string;
  initialPage?: number;
}): UseStorefrontPlantsResult {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortOption, setSortOptionState] = useState(DEFAULT_SORT);
  const [firstPage, setFirstPage] = useState(initialPage);

  // Typing should not turn every keystroke into a request.
  useEffect(() => {
    const next = searchInput.trim();
    if (next === search) return;

    const timer = setTimeout(() => {
      setSearch(next);
      setFirstPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput, search]);

  const isSearching = search.length > 0;
  const { sort, order } = SORT_PARAMS[sortOption];

  const isDefaultBrowse =
    !isSearching && sortOption === DEFAULT_SORT && firstPage === initialPage;

  const listKey = queryKeys.plants.list({
    categoryId,
    sortOption,
    startPage: firstPage,
  });

  const listQuery = useInfiniteQuery({
    queryKey: listKey,
    queryFn: ({ pageParam, signal }) =>
      getStorefrontPlants(
        {
          page: pageParam,
          page_size: STOREFRONT_PLANTS_PAGE_SIZE,
          category_id: categoryId,
          sort,
          order,
        },
        { signal }
      ),
    initialPageParam: firstPage,
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      const loaded = lastPageParam * STOREFRONT_PLANTS_PAGE_SIZE;
      return loaded < lastPage.total ? lastPageParam + 1 : undefined;
    },
    enabled: !isSearching,
    initialData: isDefaultBrowse
      ? {
          pages: [initial],
          pageParams: [initialPage],
        }
      : undefined,
    placeholderData: keepPreviousData,
  });

  const searchQuery = useQuery({
    queryKey: queryKeys.plants.search({
      categoryId,
      sortOption,
      q: search,
    }),
    queryFn: async ({ signal }) => {
      const allItems = await fetchAllPlantsForSearch({
        category_id: categoryId,
        sort,
        order,
        signal,
      });
      const matched = allItems.filter((plant) =>
        plantMatchesSearch(plant, search)
      );
      return { items: matched, total: matched.length };
    },
    enabled: isSearching,
    placeholderData: keepPreviousData,
  });

  const browseItems = useMemo(
    () => listQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [listQuery.data]
  );
  const browseTotal = listQuery.data?.pages.at(-1)?.total ?? initial.total;
  const browsePage =
    listQuery.data?.pageParams.at(-1) ?? firstPage;

  const total = isSearching ? (searchQuery.data?.total ?? 0) : browseTotal;
  const page = isSearching ? 1 : Number(browsePage);

  const activeQuery = isSearching ? searchQuery : listQuery;
  const isLoading = activeQuery.isFetching;
  const hasError = activeQuery.isError;

  const plants = useMemo(() => {
    const items = isSearching
      ? (searchQuery.data?.items ?? [])
      : browseItems;
    return applyFeaturedSort(items, sortOption);
  }, [browseItems, isSearching, searchQuery.data?.items, sortOption]);

  const handleSearchInput = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const handleSortChange = useCallback((option: StorefrontPlantSortOption) => {
    setSortOptionState(option);
    setFirstPage(1);
  }, []);

  const loadMore = useCallback(() => {
    if (isSearching || listQuery.isFetchingNextPage) return;
    void listQuery.fetchNextPage();
  }, [isSearching, listQuery]);

  /** Back to exactly what the URL server-rendered. */
  const clearFilters = useCallback(() => {
    setSearchInput("");
    setSearch("");
    setSortOptionState(DEFAULT_SORT);
    setFirstPage(initialPage);
    queryClient.setQueryData(
      queryKeys.plants.list({
        categoryId,
        sortOption: DEFAULT_SORT,
        startPage: initialPage,
      }),
      {
        pages: [initial],
        pageParams: [initialPage],
      }
    );
  }, [categoryId, initial, initialPage, queryClient]);

  const retry = useCallback(() => {
    void activeQuery.refetch();
  }, [activeQuery]);

  return {
    plants,
    total,
    searchInput,
    sortOption,
    page,
    firstPage,
    isSearching,
    isLoading,
    hasError,
    // Search loads the full filtered set in one pass; pagination stays for browse.
    hasMore:
      !isSearching &&
      (listQuery.hasNextPage ??
        page * STOREFRONT_PLANTS_PAGE_SIZE < total),
    setSearchInput: handleSearchInput,
    setSortOption: handleSortChange,
    loadMore,
    clearFilters,
    retry,
  };
}
