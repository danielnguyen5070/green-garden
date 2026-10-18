"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { AdminSection } from "@/app/admin/_components/admin-section";
import { AdminStatusBadge } from "@/app/admin/_components/admin-status-badge";
import { PlantForm, type PlantFormValues } from "@/app/admin/(dashboard)/plants/_components/plant-form";
import { hasVietnameseCopy } from "@/app/admin/(dashboard)/plants/_lib/plant-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { notifyPlantToIndexNow } from "@/app/admin/actions/indexnow";
import { refreshStorefront } from "@/app/admin/actions/revalidate";
import { useAdminCategoryOptions } from "@/app/admin/_hooks/use-admin-categories";
import { useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminPlantDetail,
  useAdminPlantDetail,
  useAdminPlantsList,
  useCreatePlant,
  useUpdatePlant,
  useUpdatePlantStatus,
} from "@/app/admin/_hooks/use-admin-plants";
import { useQueryErrorToast } from "@/app/admin/_hooks/use-query-error-toast";
import { adminCopy } from "@/app/admin/_lib/admin-copy";
import {
  formatAdminCurrency,
  formatAdminDate,
  isSameDecimal,
} from "@/app/admin/_lib/admin-format";
import { getErrorMessage } from "@/lib/api/errors";
import { toast } from "@/lib/toast";
import type {
  AdminPlantCreateRequest,
  AdminPlantListItem,
  AdminPlantOrder,
  AdminPlantSort,
  AdminPlantUpdateRequest,
} from "@/types/admin-plant";

const PAGE_SIZE = 20;
const FILTER_DEBOUNCE_MS = 350;
/** Caps the dialog to the viewport so the form body can scroll on short screens. */
const FORM_DIALOG_CLASS =
  "sm:max-w-2xl max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)]";

const copy = adminCopy.plants;

type DialogMode = "create" | "edit" | null;
type StatusFilter = "all" | "active" | "inactive";
type FeaturedFilter = "all" | "featured" | "not_featured";

type DebouncedFilters = {
  search: string;
  minPrice: string;
  maxPrice: string;
};

export default function AdminPlantsPage() {
  const [page, setPage] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [filters, setFilters] = useState<DebouncedFilters>({
    search: "",
    minPrice: "",
    maxPrice: "",
  });
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedFilter>("all");
  const [sort, setSort] = useState<AdminPlantSort>("created_at");
  const [order, setOrder] = useState<AdminPlantOrder>("desc");

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [editPlantId, setEditPlantId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const onEmptyPage = useCallback((current: number) => {
    setPage(Math.max(1, current - 1));
  }, []);

  const { items: categories } = useAdminCategoryOptions();

  const {
    items: plants,
    total,
    loading,
    isFetching,
  } = useAdminPlantsList({
    page,
    search: filters.search,
    categoryId: categoryFilter === "all" ? null : categoryFilter,
    isActive: statusFilter === "all" ? null : statusFilter === "active",
    isFeatured:
      featuredFilter === "all" ? null : featuredFilter === "featured",
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sort,
    order,
    onEmptyPage,
  });

  const detailQuery = useAdminPlantDetail(
    dialogMode === "edit" ? editPlantId : null
  );
  const selected = detailQuery.data;

  const queryClient = useQueryClient();
  const createMutation = useCreatePlant();
  const updateMutation = useUpdatePlant();
  const statusMutation = useUpdatePlantStatus();

  const submitting = createMutation.isPending || updateMutation.isPending;
  const statusPendingId =
    statusMutation.isPending && statusMutation.variables
      ? statusMutation.variables.id
      : null;

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total]
  );
  const isFiltered =
    filters.search !== "" ||
    filters.minPrice !== "" ||
    filters.maxPrice !== "" ||
    categoryFilter !== "all" ||
    statusFilter !== "all" ||
    featuredFilter !== "all";

  const categoryNameById = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category]));
  }, [categories]);

  /** Any filter change restarts from the first page. */
  const applyFilterChange = useCallback((apply: () => void) => {
    apply();
    setPage(1);
  }, []);

  useEffect(() => {
    const next: DebouncedFilters = {
      search: searchInput.trim(),
      minPrice: minPriceInput.trim(),
      maxPrice: maxPriceInput.trim(),
    };
    if (
      next.search === filters.search &&
      next.minPrice === filters.minPrice &&
      next.maxPrice === filters.maxPrice
    ) {
      return;
    }

    const timeout = setTimeout(() => {
      applyFilterChange(() => setFilters(next));
    }, FILTER_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchInput, minPriceInput, maxPriceInput, filters, applyFilterChange]);

  useQueryErrorToast(
    dialogMode === "edit" && detailQuery.isError ? detailQuery.error : null
  );
  // Close the edit dialog when the detail query fails (adjust during render).
  if (dialogMode === "edit" && detailQuery.isError) {
    setDialogMode(null);
    setEditPlantId(null);
  }

  function goToPage(nextPage: number) {
    setPage(nextPage);
  }

  function resetFilters() {
    setSearchInput("");
    setMinPriceInput("");
    setMaxPriceInput("");
    applyFilterChange(() => {
      setFilters({ search: "", minPrice: "", maxPrice: "" });
      setCategoryFilter("all");
      setStatusFilter("all");
      setFeaturedFilter("all");
      setSort("created_at");
      setOrder("desc");
    });
  }

  function openCreate() {
    setEditPlantId(null);
    setFormError(null);
    setDialogMode("create");
  }

  function openEdit(plant: AdminPlantListItem) {
    setFormError(null);
    setEditPlantId(plant.id);
    setDialogMode("edit");
  }

  function closeDialog() {
    if (submitting) return;
    setDialogMode(null);
    setEditPlantId(null);
    setFormError(null);
  }

  async function handleCreate(values: PlantFormValues) {
    const payload: AdminPlantCreateRequest = {
      category_id: values.category_id,
      name: values.name,
      name_vi: values.name_vi || null,
      slug: values.slug,
      description: values.description || null,
      description_vi: values.description_vi || null,
      long_description: values.long_description || null,
      long_description_vi: values.long_description_vi || null,
      // Decimal strings are sent as-is so money never round-trips as a float.
      price: values.price,
      price_vi: values.price_vi || null,
      stock: Number(values.stock),
      sku: values.sku,
      og_image_url: values.og_image_url || null,
      is_featured: values.is_featured,
      is_active: values.is_active,
      plant_type: values.plant_type,
      difficulty: values.difficulty,
      growth_rate: values.growth_rate,
      sunlight: values.sunlight,
      watering: values.watering,
      space_requirement: values.space_requirement,
      indoor_suitable: values.indoor_suitable,
      outdoor_suitable: values.outdoor_suitable,
      pet_safe: values.pet_safe,
      beginner_friendly: values.beginner_friendly,
    };

    setFormError(null);
    try {
      const plant = await createMutation.mutateAsync(payload);
      setDialogMode(null);
      setEditPlantId(null);
      toast.success(copy.createdSuccess);
      goToPage(1);
      void refreshStorefront({ entity: "plants", slugs: [plant.slug] });
      if (plant.is_active) {
        void notifyPlantToIndexNow(plant.slug);
      }
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  }

  async function handleEdit(values: PlantFormValues) {
    if (!selected) return;

    // PATCH is partial: omitted fields keep their value, explicit null clears.
    const changes: AdminPlantUpdateRequest = {};
    if (values.category_id !== selected.category_id) {
      changes.category_id = values.category_id;
    }
    if (values.name !== selected.name) changes.name = values.name;
    if (values.slug !== selected.slug) changes.slug = values.slug;
    if (values.sku !== selected.sku) changes.sku = values.sku;

    const nextNameVi = values.name_vi || null;
    if (nextNameVi !== selected.name_vi) changes.name_vi = nextNameVi;

    const nextDescription = values.description || null;
    if (nextDescription !== selected.description) {
      changes.description = nextDescription;
    }

    const nextDescriptionVi = values.description_vi || null;
    if (nextDescriptionVi !== selected.description_vi) {
      changes.description_vi = nextDescriptionVi;
    }

    const nextLongDescription = values.long_description || null;
    if (nextLongDescription !== selected.long_description) {
      changes.long_description = nextLongDescription;
    }

    const nextLongDescriptionVi = values.long_description_vi || null;
    if (nextLongDescriptionVi !== selected.long_description_vi) {
      changes.long_description_vi = nextLongDescriptionVi;
    }

    if (!isSameDecimal(values.price, selected.price)) {
      changes.price = values.price;
    }

    const nextPriceVi = values.price_vi || null;
    if (!isSameDecimal(nextPriceVi, selected.price_vi)) {
      changes.price_vi = nextPriceVi;
    }

    const nextStock = Number(values.stock);
    if (nextStock !== selected.stock) changes.stock = nextStock;

    const nextOgImageUrl = values.og_image_url || null;
    if (nextOgImageUrl !== selected.og_image_url) {
      changes.og_image_url = nextOgImageUrl;
    }

    if (values.is_featured !== selected.is_featured) {
      changes.is_featured = values.is_featured;
    }

    if (values.plant_type !== selected.plant_type) {
      changes.plant_type = values.plant_type;
    }
    if (values.difficulty !== selected.difficulty) {
      changes.difficulty = values.difficulty;
    }
    if (values.growth_rate !== selected.growth_rate) {
      changes.growth_rate = values.growth_rate;
    }
    if (values.sunlight !== selected.sunlight) {
      changes.sunlight = values.sunlight;
    }
    if (values.watering !== selected.watering) {
      changes.watering = values.watering;
    }
    if (values.space_requirement !== selected.space_requirement) {
      changes.space_requirement = values.space_requirement;
    }
    if (values.indoor_suitable !== selected.indoor_suitable) {
      changes.indoor_suitable = values.indoor_suitable;
    }
    if (values.outdoor_suitable !== selected.outdoor_suitable) {
      changes.outdoor_suitable = values.outdoor_suitable;
    }
    if (values.pet_safe !== selected.pet_safe) {
      changes.pet_safe = values.pet_safe;
    }
    if (values.beginner_friendly !== selected.beginner_friendly) {
      changes.beginner_friendly = values.beginner_friendly;
    }

    if (Object.keys(changes).length === 0) {
      closeDialog();
      return;
    }

    const previousSlug = selected.slug;
    setFormError(null);
    try {
      const plant = await updateMutation.mutateAsync({
        id: selected.id,
        data: changes,
      });
      setDialogMode(null);
      setEditPlantId(null);
      toast.success(copy.updatedSuccess);
      void refreshStorefront({
        entity: "plants",
        slugs: [plant.slug, previousSlug],
      });
      if (plant.is_active) {
        void notifyPlantToIndexNow(
          plant.slug,
          previousSlug !== plant.slug ? previousSlug : undefined
        );
      }
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  }

  async function handleToggleStatus(plant: AdminPlantListItem) {
    try {
      // List items omit descriptions, so activation checks the full record.
      if (
        !plant.is_active &&
        !hasVietnameseCopy(await fetchAdminPlantDetail(queryClient, plant.id))
      ) {
        toast.error(copy.vietnameseRequiredForActive);
        return;
      }

      const updated = await statusMutation.mutateAsync({
        id: plant.id,
        data: { is_active: !plant.is_active },
      });
      toast.success(
        plant.is_active ? copy.deactivatedSuccess : copy.activatedSuccess
      );
      void refreshStorefront({ entity: "plants", slugs: [updated.slug] });
      if (updated.is_active) {
        void notifyPlantToIndexNow(updated.slug);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  const showInitialLoading = loading && plants.length === 0;

  return (
    <>
      <AdminPageHeader
        description={copy.description}
        actions={
          <Button type="button" onClick={openCreate}>
            <Plus data-icon="inline-start" />
            {copy.add}
          </Button>
        }
      />

      <AdminSection contentClassName="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-xs">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={copy.searchPlaceholder}
                aria-label={adminCopy.common.search}
                className="pl-8"
              />
            </div>

            <Select
              value={categoryFilter}
              onValueChange={(value) => {
                if (value == null) return;
                applyFilterChange(() => setCategoryFilter(value as string));
              }}
            >
              <SelectTrigger
                className="w-full sm:w-48"
                aria-label={copy.filters.allCategories}
              >
                <SelectValue>
                  {categoryFilter === "all"
                    ? copy.filters.allCategories
                    : (categoryNameById.get(categoryFilter)?.name ??
                      copy.filters.allCategories)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{copy.filters.allCategories}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(value) => {
                if (value == null) return;
                applyFilterChange(() => setStatusFilter(value as StatusFilter));
              }}
            >
              <SelectTrigger
                className="w-full sm:w-40"
                aria-label={adminCopy.common.allStatuses}
              >
                <SelectValue>
                  {statusFilter === "all"
                    ? adminCopy.common.allStatuses
                    : statusFilter === "active"
                      ? adminCopy.status.active
                      : adminCopy.status.inactive}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {adminCopy.common.allStatuses}
                </SelectItem>
                <SelectItem value="active">{adminCopy.status.active}</SelectItem>
                <SelectItem value="inactive">
                  {adminCopy.status.inactive}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={featuredFilter}
              onValueChange={(value) => {
                if (value == null) return;
                applyFilterChange(() =>
                  setFeaturedFilter(value as FeaturedFilter)
                );
              }}
            >
              <SelectTrigger
                className="w-full sm:w-40"
                aria-label={copy.filters.allPlants}
              >
                <SelectValue>
                  {featuredFilter === "all"
                    ? copy.filters.allPlants
                    : featuredFilter === "featured"
                      ? copy.filters.featuredOnly
                      : copy.filters.notFeatured}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{copy.filters.allPlants}</SelectItem>
                <SelectItem value="featured">
                  {copy.filters.featuredOnly}
                </SelectItem>
                <SelectItem value="not_featured">
                  {copy.filters.notFeatured}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              type="number"
              min={0}
              step="0.01"
              value={minPriceInput}
              onChange={(event) => setMinPriceInput(event.target.value)}
              placeholder={copy.filters.minPrice}
              aria-label={copy.filters.minPrice}
              className="w-full sm:w-32"
            />
            <Input
              type="number"
              min={0}
              step="0.01"
              value={maxPriceInput}
              onChange={(event) => setMaxPriceInput(event.target.value)}
              placeholder={copy.filters.maxPrice}
              aria-label={copy.filters.maxPrice}
              className="w-full sm:w-32"
            />

            <Select
              value={sort}
              onValueChange={(value) => {
                if (value == null) return;
                applyFilterChange(() => setSort(value as AdminPlantSort));
              }}
            >
              <SelectTrigger
                className="w-full sm:w-40"
                aria-label={copy.filters.sortLabel}
              >
                <SelectValue>
                  {sort === "created_at"
                    ? copy.filters.sortNewest
                    : sort === "name"
                      ? copy.filters.sortName
                      : sort === "price"
                        ? copy.filters.sortPrice
                        : copy.filters.sortStock}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">
                  {copy.filters.sortNewest}
                </SelectItem>
                <SelectItem value="name">{copy.filters.sortName}</SelectItem>
                <SelectItem value="price">{copy.filters.sortPrice}</SelectItem>
                <SelectItem value="stock">{copy.filters.sortStock}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={order}
              onValueChange={(value) => {
                if (value == null) return;
                applyFilterChange(() => setOrder(value as AdminPlantOrder));
              }}
            >
              <SelectTrigger
                className="w-full sm:w-36"
                aria-label={copy.filters.orderLabel}
              >
                <SelectValue>
                  {order === "asc"
                    ? copy.filters.ascending
                    : copy.filters.descending}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">{copy.filters.descending}</SelectItem>
                <SelectItem value="asc">{copy.filters.ascending}</SelectItem>
              </SelectContent>
            </Select>

            {isFiltered ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetFilters}
              >
                {copy.filters.reset}
              </Button>
            ) : null}
          </div>
        </div>

        {showInitialLoading ? (
          <p className="text-sm text-muted-foreground">
            {adminCopy.common.loading}
          </p>
        ) : plants.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {isFiltered ? copy.noResults : copy.empty}
          </p>
        ) : (
          <div
            aria-busy={isFetching}
            className={isFetching ? "opacity-60 transition-opacity" : undefined}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{copy.table.plant}</TableHead>
                  <TableHead>{copy.table.category}</TableHead>
                  <TableHead>{copy.table.sku}</TableHead>
                  <TableHead>{copy.table.price}</TableHead>
                  <TableHead>{copy.table.stock}</TableHead>
                  <TableHead>{copy.table.status}</TableHead>
                  <TableHead>{copy.table.updated}</TableHead>
                  <TableHead className="text-right">
                    {adminCopy.common.actions}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plants.map((plant) => {
                  const category =
                    plant.category ?? categoryNameById.get(plant.category_id);

                  return (
                    <TableRow key={plant.id}>
                      <TableCell>
                        <span className="font-medium">{plant.name}</span>
                        {plant.name_vi ? (
                          <span className="block text-xs text-muted-foreground">
                            {plant.name_vi}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <span>{category?.name ?? "—"}</span>
                        {category?.name_vi ? (
                          <span className="block text-xs text-muted-foreground">
                            {category.name_vi}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {plant.sku}
                      </TableCell>
                      <TableCell>
                        {plant.price_vi ? (
                          <span>{formatAdminCurrency(plant.price_vi, "VND")}</span>
                        ) : (
                          <span className="text-destructive">
                            {copy.list.noSellingPrice}
                          </span>
                        )}
                        <span className="block text-xs text-muted-foreground">
                          {formatAdminCurrency(plant.price, "USD")}
                        </span>
                      </TableCell>
                      <TableCell>{plant.stock}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1">
                          <AdminStatusBadge
                            status={plant.is_active ? "active" : "inactive"}
                            label={
                              plant.is_active
                                ? adminCopy.status.active
                                : adminCopy.status.inactive
                            }
                          />
                          {plant.is_featured ? (
                            <AdminStatusBadge
                              status="scheduled"
                              label={copy.fields.featured}
                            />
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatAdminDate(plant.updated_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={adminCopy.common.actions}
                              />
                            }
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => {
                                openEdit(plant);
                              }}
                            >
                              {adminCopy.common.edit}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer"
                              disabled={statusPendingId === plant.id}
                              onClick={() => {
                                void handleToggleStatus(plant);
                              }}
                            >
                              {plant.is_active
                                ? copy.deactivate
                                : copy.activate}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {!showInitialLoading && total > 0 ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {copy.pageInfo(page, totalPages, total)}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || isFetching}
                onClick={() => goToPage(page - 1)}
              >
                {adminCopy.common.previous}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isFetching}
                onClick={() => goToPage(page + 1)}
              >
                {adminCopy.common.next}
              </Button>
            </div>
          </div>
        ) : null}
      </AdminSection>

      <Dialog
        open={dialogMode === "create"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className={FORM_DIALOG_CLASS}>
          <DialogHeader>
            <DialogTitle>{copy.createTitle}</DialogTitle>
          </DialogHeader>
          <PlantForm
            mode="create"
            categories={categories}
            submitting={submitting}
            error={formError}
            onValidationError={setFormError}
            onSubmit={handleCreate}
            onCancel={closeDialog}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialogMode === "edit"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className={FORM_DIALOG_CLASS}>
          <DialogHeader>
            <DialogTitle>{copy.editTitle}</DialogTitle>
          </DialogHeader>
          {detailQuery.loading || !selected ? (
            <p className="text-sm text-muted-foreground">
              {adminCopy.common.loading}
            </p>
          ) : (
            <PlantForm
              key={selected.id}
              mode="edit"
              plant={selected}
              categories={categories}
              submitting={submitting}
              error={formError}
              onValidationError={setFormError}
              onSubmit={handleEdit}
              onCancel={closeDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
