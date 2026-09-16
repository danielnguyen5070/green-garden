"use client";

import { useCallback, useEffect, useMemo, useState, type SubmitEvent } from "react";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { PlantImagesSection } from "@/components/admin/plant-images-section";
import { PlantPotSizesSection } from "@/components/admin/plant-pot-sizes-section";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { adminCopy } from "@/lib/admin-copy";
import {
  formatAdminCurrency,
  formatAdminDate,
  isSameDecimal,
} from "@/lib/admin-format";
import { listCategories } from "@/lib/api/categories";
import { getErrorMessage } from "@/lib/api/errors";
import {
  createPlant,
  getPlant,
  listPlants,
  updatePlant,
  updatePlantStatus,
} from "@/lib/api/plants";
import { toast } from "@/lib/toast";
import type { Category } from "@/types/category";
import type {
  AdminPlant,
  AdminPlantCreateRequest,
  AdminPlantImage,
  AdminPlantListItem,
  AdminPlantOrder,
  AdminPlantPotSize,
  AdminPlantSort,
  AdminPlantUpdateRequest,
} from "@/types/admin-plant";

const PAGE_SIZE = 20;
const FILTER_DEBOUNCE_MS = 350;
const CATEGORY_PAGE_SIZE = 100;
/** Guards against an unbounded crawl if the category count ever explodes. */
const CATEGORY_MAX_PAGES = 10;
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

type PlantFormValues = {
  category_id: string;
  name: string;
  name_vi: string;
  slug: string;
  description: string;
  description_vi: string;
  sku: string;
  price: string;
  price_vi: string;
  stock: string;
  is_featured: boolean;
  is_active: boolean;
};

function readForm(form: HTMLFormElement, categoryId: string): PlantFormValues {
  const formData = new FormData(form);
  return {
    category_id: categoryId,
    name: String(formData.get("name") ?? "").trim(),
    name_vi: String(formData.get("name_vi") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    description_vi: String(formData.get("description_vi") ?? "").trim(),
    sku: String(formData.get("sku") ?? "").trim(),
    price: String(formData.get("price") ?? "").trim(),
    price_vi: String(formData.get("price_vi") ?? "").trim(),
    stock: String(formData.get("stock") ?? "").trim(),
    is_featured: formData.get("is_featured") === "on",
    is_active: formData.get("is_active") === "on",
  };
}

function isNonNegativeAmount(value: string): boolean {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0;
}

/** Client-side guardrails; the backend stays the source of truth. */
function validateForm(values: PlantFormValues): string | null {
  if (!values.category_id) return copy.invalidCategory;
  if (!values.name || values.name.length > 255) return copy.invalidName;
  // Vietnamese name is optional; only its length is constrained.
  if (values.name_vi.length > 255) return copy.invalidNameVi;
  if (!values.slug || values.slug.length > 255) return copy.invalidSlug;
  if (!values.sku || values.sku.length > 100) return copy.invalidSku;

  if (!values.price || !isNonNegativeAmount(values.price)) {
    return copy.invalidPrice;
  }
  if (values.price_vi && !isNonNegativeAmount(values.price_vi)) {
    return copy.invalidPriceVi;
  }

  const stock = Number(values.stock);
  if (!values.stock || !Number.isInteger(stock) || stock < 0) {
    return copy.invalidStock;
  }

  return null;
}

export default function AdminPlantsPage() {
  const [plants, setPlants] = useState<AdminPlantListItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [reloadToken, setReloadToken] = useState(0);
  const [loading, setLoading] = useState(true);

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

  const [categories, setCategories] = useState<Category[]>([]);

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selected, setSelected] = useState<AdminPlant | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusPendingId, setStatusPendingId] = useState<string | null>(null);

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
    setLoading(true);
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

  // The form's category dropdown is driven by the Categories API, never hardcoded.
  useEffect(() => {
    const controller = new AbortController();

    async function fetchCategories() {
      try {
        const collected: Category[] = [];
        for (let current = 1; current <= CATEGORY_MAX_PAGES; current += 1) {
          const response = await listCategories(
            { page: current, page_size: CATEGORY_PAGE_SIZE },
            { signal: controller.signal }
          );
          collected.push(...response.items);
          if (collected.length >= response.total || response.items.length === 0) {
            break;
          }
        }
        if (controller.signal.aborted) return;
        setCategories(collected);
      } catch (err) {
        if (controller.signal.aborted) return;
        toast.error(getErrorMessage(err, copy.categoriesLoadError));
      }
    }

    void fetchCategories();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPlants() {
      try {
        const response = await listPlants(
          {
            page,
            page_size: PAGE_SIZE,
            search: filters.search || undefined,
            min_price: filters.minPrice || undefined,
            max_price: filters.maxPrice || undefined,
            category_id: categoryFilter === "all" ? undefined : categoryFilter,
            is_active:
              statusFilter === "all" ? undefined : statusFilter === "active",
            is_featured:
              featuredFilter === "all"
                ? undefined
                : featuredFilter === "featured",
            sort,
            order,
          },
          { signal: controller.signal }
        );
        if (controller.signal.aborted) return;
        // A page can empty out after a status change or filter narrows results.
        if (response.items.length === 0 && page > 1) {
          setPage((current) => Math.max(1, current - 1));
          return;
        }
        setPlants(response.items);
        setTotal(response.total);
      } catch (err) {
        if (controller.signal.aborted) return;
        toast.error(getErrorMessage(err));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchPlants();
    return () => controller.abort();
  }, [
    page,
    filters,
    categoryFilter,
    statusFilter,
    featuredFilter,
    sort,
    order,
    reloadToken,
  ]);

  function refresh(nextPage = page) {
    setLoading(true);
    setPage(nextPage);
    setReloadToken((token) => token + 1);
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
    setSelected(null);
    setFormError(null);
    setDialogMode("create");
  }

  async function openEdit(plant: AdminPlantListItem) {
    setSelected(null);
    setFormError(null);
    setDialogMode("edit");
    setDetailLoading(true);

    try {
      setSelected(await getPlant(plant.id));
    } catch (err) {
      setDialogMode(null);
      toast.error(getErrorMessage(err));
      refresh(page);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDialog() {
    if (submitting) return;
    setDialogMode(null);
    setSelected(null);
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
      // Decimal strings are sent as-is so money never round-trips as a float.
      price: values.price,
      price_vi: values.price_vi || null,
      stock: Number(values.stock),
      sku: values.sku,
      is_featured: values.is_featured,
      is_active: values.is_active,
    };

    setFormError(null);
    setSubmitting(true);
    try {
      await createPlant(payload);
      setDialogMode(null);
      setSelected(null);
      toast.success(copy.createdSuccess);
      refresh(1);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
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

    if (!isSameDecimal(values.price, selected.price)) {
      changes.price = values.price;
    }

    const nextPriceVi = values.price_vi || null;
    if (!isSameDecimal(nextPriceVi, selected.price_vi)) {
      changes.price_vi = nextPriceVi;
    }

    const nextStock = Number(values.stock);
    if (nextStock !== selected.stock) changes.stock = nextStock;

    if (values.is_featured !== selected.is_featured) {
      changes.is_featured = values.is_featured;
    }

    if (Object.keys(changes).length === 0) {
      closeDialog();
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      await updatePlant(selected.id, changes);
      setDialogMode(null);
      setSelected(null);
      toast.success(copy.updatedSuccess);
      refresh(page);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(plant: AdminPlantListItem) {
    setStatusPendingId(plant.id);
    try {
      await updatePlantStatus(plant.id, { is_active: !plant.is_active });
      toast.success(
        plant.is_active ? copy.deactivatedSuccess : copy.activatedSuccess
      );
      refresh(page);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setStatusPendingId(null);
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
            aria-busy={loading}
            className={loading ? "opacity-60 transition-opacity" : undefined}
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
                        <span>{formatAdminCurrency(plant.price, "USD")}</span>
                        {plant.price_vi ? (
                          <span className="block text-xs text-muted-foreground">
                            {formatAdminCurrency(plant.price_vi, "VND")}
                          </span>
                        ) : null}
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
                                void openEdit(plant);
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
                disabled={page <= 1 || loading}
                onClick={() => refresh(page - 1)}
              >
                {adminCopy.common.previous}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => refresh(page + 1)}
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
          {detailLoading || !selected ? (
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

type PlantFormProps = {
  mode: "create" | "edit";
  plant?: AdminPlant;
  categories: Category[];
  submitting: boolean;
  error: string | null;
  onValidationError: (message: string | null) => void;
  onSubmit: (values: PlantFormValues) => void | Promise<void>;
  onCancel: () => void;
};

function PlantForm({
  mode,
  plant,
  categories,
  submitting,
  error,
  onValidationError,
  onSubmit,
  onCancel,
}: PlantFormProps) {
  const prefix = mode === "create" ? "create" : "edit";
  const [categoryId, setCategoryId] = useState(plant?.category_id ?? "");
  // Nested resources save immediately, so they live outside the form submit.
  const [images, setImages] = useState<AdminPlantImage[]>(plant?.images ?? []);
  const [potSizes, setPotSizes] = useState<AdminPlantPotSize[]>(
    plant?.pot_sizes ?? []
  );

  const selectedCategory = categories.find(
    (category) => category.id === categoryId
  );

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = readForm(event.currentTarget, categoryId);
    const invalid = validateForm(values);
    if (invalid) {
      onValidationError(invalid);
      return;
    }

    onValidationError(null);
    void onSubmit(values);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-0 flex-col gap-4"
      noValidate
    >
      {/* Scrolls on its own so the header and footer stay in view. */}
      <div className="-mx-1 min-h-0 flex-1 space-y-6 overflow-y-auto px-1">
        <section className="space-y-4">
          <h3 className="text-sm font-medium">{copy.sections.basics}</h3>

          <div className="space-y-2">
            <Label htmlFor={`${prefix}-category`}>{copy.fields.category}</Label>
            <Select
              value={categoryId}
              disabled={submitting}
              onValueChange={(value) => {
                if (value == null) return;
                setCategoryId(value as string);
              }}
            >
              <SelectTrigger
                id={`${prefix}-category`}
                className="h-11 w-full rounded-full px-4"
              >
                <SelectValue>
                  {selectedCategory ? (
                    selectedCategory.name
                  ) : (
                    <span className="text-muted-foreground">
                      {copy.fields.categoryPlaceholder}
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <span>{category.name}</span>
                    {category.name_vi ? (
                      <span className="text-xs text-muted-foreground">
                        {category.name_vi}
                      </span>
                    ) : null}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${prefix}-name`}>{copy.fields.name}</Label>
              <Input
                id={`${prefix}-name`}
                name="name"
                required
                maxLength={255}
                defaultValue={plant?.name}
                disabled={submitting}
                className="h-11 rounded-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${prefix}-name-vi`}>{copy.fields.nameVi}</Label>
              <Input
                id={`${prefix}-name-vi`}
                name="name_vi"
                maxLength={255}
                defaultValue={plant?.name_vi ?? ""}
                disabled={submitting}
                className="h-11 rounded-full"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${prefix}-slug`}>{copy.fields.slug}</Label>
              <Input
                id={`${prefix}-slug`}
                name="slug"
                required
                maxLength={255}
                defaultValue={plant?.slug}
                disabled={submitting}
                className="h-11 rounded-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${prefix}-sku`}>{copy.fields.sku}</Label>
              <Input
                id={`${prefix}-sku`}
                name="sku"
                required
                maxLength={100}
                defaultValue={plant?.sku}
                disabled={submitting}
                className="h-11 rounded-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${prefix}-description`}>
              {copy.fields.description}
            </Label>
            <Textarea
              id={`${prefix}-description`}
              name="description"
              defaultValue={plant?.description ?? ""}
              disabled={submitting}
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${prefix}-description-vi`}>
              {copy.fields.descriptionVi}
            </Label>
            <Textarea
              id={`${prefix}-description-vi`}
              name="description_vi"
              defaultValue={plant?.description_vi ?? ""}
              disabled={submitting}
              className="rounded-lg"
            />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-medium">{copy.sections.pricing}</h3>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor={`${prefix}-price`}>{copy.fields.price}</Label>
              <Input
                id={`${prefix}-price`}
                name="price"
                type="number"
                min={0}
                step="0.01"
                required
                defaultValue={plant?.price ?? ""}
                disabled={submitting}
                className="h-11 rounded-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${prefix}-price-vi`}>{copy.fields.priceVi}</Label>
              <Input
                id={`${prefix}-price-vi`}
                name="price_vi"
                type="number"
                min={0}
                step="1"
                defaultValue={plant?.price_vi ?? ""}
                disabled={submitting}
                className="h-11 rounded-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${prefix}-stock`}>{copy.fields.stock}</Label>
              <Input
                id={`${prefix}-stock`}
                name="stock"
                type="number"
                min={0}
                step={1}
                defaultValue={plant?.stock ?? 0}
                disabled={submitting}
                className="h-11 rounded-full"
              />
            </div>
          </div>

          <div className="flex items-start gap-2">
            <input
              id={`${prefix}-is-featured`}
              name="is_featured"
              type="checkbox"
              defaultChecked={plant?.is_featured ?? false}
              disabled={submitting}
              className="mt-0.5 size-4 accent-primary"
            />
            <div className="space-y-1">
              <Label htmlFor={`${prefix}-is-featured`}>
                {copy.fields.featured}
              </Label>
              <p className="text-xs text-muted-foreground">
                {copy.fields.featuredHint}
              </p>
            </div>
          </div>

          {mode === "create" ? (
            <div className="flex items-start gap-2">
              <input
                id={`${prefix}-is-active`}
                name="is_active"
                type="checkbox"
                defaultChecked
                disabled={submitting}
                className="mt-0.5 size-4 accent-primary"
              />
              <div className="space-y-1">
                <Label htmlFor={`${prefix}-is-active`}>
                  {copy.fields.active}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {copy.fields.activeHint}
                </p>
              </div>
            </div>
          ) : null}
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-medium">{copy.sections.images}</h3>
          {plant ? (
            <PlantImagesSection
              plantId={plant.id}
              images={images}
              disabled={submitting}
              onChange={setImages}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {copy.images.availableAfterCreate}
            </p>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-medium">{copy.sections.potSizes}</h3>
          {plant ? (
            <PlantPotSizesSection
              plantId={plant.id}
              potSizes={potSizes}
              disabled={submitting}
              onChange={setPotSizes}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {copy.potSizes.availableAfterCreate}
            </p>
          )}
        </section>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={submitting}
          onClick={onCancel}
        >
          {adminCopy.common.cancel}
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="w-24 rounded-full"
        >
          {submitting
            ? adminCopy.common.saving
            : mode === "create"
              ? adminCopy.common.create
              : adminCopy.common.save}
        </Button>
      </DialogFooter>
    </form>
  );
}
