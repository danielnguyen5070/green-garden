"use client";

import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
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
import {
  createCategory,
  getCategory,
  listCategories,
  updateCategory,
  updateCategoryStatus,
} from "@/lib/api/categories";
import { getErrorMessage } from "@/lib/api/errors";
import { adminCopy } from "@/lib/admin-copy";
import { toast } from "@/lib/toast";
import type {
  Category,
  CategoryCreateRequest,
  CategoryUpdateRequest,
} from "@/types/category";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;
/** Caps the dialog to the viewport so the form body can scroll on short screens. */
const FORM_DIALOG_CLASS =
  "sm:max-w-md max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)]";

type DialogMode = "create" | "edit" | null;
type StatusFilter = "all" | "active" | "inactive";

type CategoryFormValues = {
  name: string;
  name_vi: string;
  slug: string;
  description: string;
  description_vi: string;
  image_url: string;
  sort_order: string;
  is_active: boolean;
};

function readForm(form: HTMLFormElement): CategoryFormValues {
  const formData = new FormData(form);
  return {
    name: String(formData.get("name") ?? "").trim(),
    name_vi: String(formData.get("name_vi") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    description_vi: String(formData.get("description_vi") ?? "").trim(),
    image_url: String(formData.get("image_url") ?? "").trim(),
    sort_order: String(formData.get("sort_order") ?? "").trim(),
    is_active: formData.get("is_active") === "on",
  };
}

/** Client-side guardrails; the backend stays the source of truth. */
function validateForm(values: CategoryFormValues): string | null {
  if (!values.name || values.name.length > 255) {
    return adminCopy.categories.invalidName;
  }
  // Vietnamese name is optional; only its length is constrained.
  if (values.name_vi.length > 255) {
    return adminCopy.categories.invalidNameVi;
  }
  if (!values.slug || values.slug.length > 255) {
    return adminCopy.categories.invalidSlug;
  }

  const sortOrder = Number(values.sort_order);
  if (
    !Number.isInteger(sortOrder) ||
    sortOrder < 0 ||
    values.sort_order.length === 0
  ) {
    return adminCopy.categories.invalidSortOrder;
  }

  if (values.image_url) {
    try {
      const url = new URL(values.image_url);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return adminCopy.categories.invalidImageUrl;
      }
    } catch {
      return adminCopy.categories.invalidImageUrl;
    }
  }

  return null;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [reloadToken, setReloadToken] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selected, setSelected] = useState<Category | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusPendingId, setStatusPendingId] = useState<string | null>(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total]
  );
  const isFiltered = search !== "" || statusFilter !== "all";

  useEffect(() => {
    if (searchInput === search) return;

    const timeout = setTimeout(() => {
      setLoading(true);
      setSearch(searchInput);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchInput, search]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCategories() {
      try {
        const response = await listCategories(
          {
            page,
            page_size: PAGE_SIZE,
            search: search || undefined,
            is_active:
              statusFilter === "all" ? undefined : statusFilter === "active",
          },
          { signal: controller.signal }
        );
        if (controller.signal.aborted) return;
        // A page can empty out after a status change or filter narrows results.
        if (response.items.length === 0 && page > 1) {
          setPage((current) => Math.max(1, current - 1));
          return;
        }
        setCategories(response.items);
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

    void fetchCategories();
    return () => controller.abort();
  }, [page, search, statusFilter, reloadToken]);

  function refresh(nextPage = page) {
    setLoading(true);
    setPage(nextPage);
    setReloadToken((token) => token + 1);
  }

  function openCreate() {
    setSelected(null);
    setFormError(null);
    setDialogMode("create");
  }

  async function openEdit(category: Category) {
    setSelected(null);
    setFormError(null);
    setDialogMode("edit");
    setDetailLoading(true);

    try {
      const detail = await getCategory(category.id);
      setSelected(detail);
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

  async function handleCreate(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = readForm(event.currentTarget);
    const invalid = validateForm(values);
    if (invalid) {
      setFormError(invalid);
      return;
    }

    const payload: CategoryCreateRequest = {
      name: values.name,
      name_vi: values.name_vi || null,
      slug: values.slug,
      description: values.description || null,
      description_vi: values.description_vi || null,
      image_url: values.image_url || null,
      sort_order: Number(values.sort_order),
      is_active: values.is_active,
    };

    setFormError(null);
    setSubmitting(true);
    try {
      await createCategory(payload);
      setDialogMode(null);
      setSelected(null);
      toast.success(adminCopy.categories.createdSuccess);
      refresh(1);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;

    const values = readForm(event.currentTarget);
    const invalid = validateForm(values);
    if (invalid) {
      setFormError(invalid);
      return;
    }

    // PATCH is partial: omitted fields keep their value, explicit null clears.
    const changes: CategoryUpdateRequest = {};
    if (values.name !== selected.name) changes.name = values.name;
    if (values.slug !== selected.slug) changes.slug = values.slug;

    const nextNameVi = values.name_vi || null;
    if (nextNameVi !== selected.name_vi) {
      changes.name_vi = nextNameVi;
    }

    const nextDescription = values.description || null;
    if (nextDescription !== selected.description) {
      changes.description = nextDescription;
    }

    const nextDescriptionVi = values.description_vi || null;
    if (nextDescriptionVi !== selected.description_vi) {
      changes.description_vi = nextDescriptionVi;
    }

    const nextImageUrl = values.image_url || null;
    if (nextImageUrl !== selected.image_url) {
      changes.image_url = nextImageUrl;
    }

    const nextSortOrder = Number(values.sort_order);
    if (nextSortOrder !== selected.sort_order) {
      changes.sort_order = nextSortOrder;
    }

    if (Object.keys(changes).length === 0) {
      closeDialog();
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      await updateCategory(selected.id, changes);
      setDialogMode(null);
      setSelected(null);
      toast.success(adminCopy.categories.updatedSuccess);
      refresh(page);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(category: Category) {
    setStatusPendingId(category.id);
    try {
      await updateCategoryStatus(category.id, {
        is_active: !category.is_active,
      });
      toast.success(
        category.is_active
          ? adminCopy.categories.deactivatedSuccess
          : adminCopy.categories.activatedSuccess
      );
      refresh(page);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setStatusPendingId(null);
    }
  }

  const showInitialLoading = loading && categories.length === 0;

  return (
    <>
      <AdminPageHeader
        description={adminCopy.categories.description}
        actions={
          <Button type="button" onClick={openCreate}>
            <Plus data-icon="inline-start" />
            {adminCopy.categories.add}
          </Button>
        }
      />

      <AdminSection contentClassName="space-y-4">
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
              placeholder={adminCopy.categories.searchPlaceholder}
              aria-label={adminCopy.common.search}
              className="pl-8"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) => {
              if (value == null) return;
              setLoading(true);
              setStatusFilter(value as StatusFilter);
              setPage(1);
            }}
          >
            <SelectTrigger
              className="w-full sm:w-44"
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
              <SelectItem value="all">{adminCopy.common.allStatuses}</SelectItem>
              <SelectItem value="active">{adminCopy.status.active}</SelectItem>
              <SelectItem value="inactive">
                {adminCopy.status.inactive}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showInitialLoading ? (
          <p className="text-sm text-muted-foreground">
            {adminCopy.common.loading}
          </p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {isFiltered
              ? adminCopy.categories.noResults
              : adminCopy.categories.empty}
          </p>
        ) : (
          <div
            aria-busy={loading}
            className={loading ? "opacity-60 transition-opacity" : undefined}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{adminCopy.categories.table.image}</TableHead>
                  <TableHead>{adminCopy.categories.table.name}</TableHead>
                  <TableHead>{adminCopy.categories.table.slug}</TableHead>
                  <TableHead>{adminCopy.categories.table.description}</TableHead>
                  <TableHead>{adminCopy.categories.table.sortOrder}</TableHead>
                  <TableHead>{adminCopy.categories.table.status}</TableHead>
                  <TableHead className="text-right">
                    {adminCopy.common.actions}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {category.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element -- category images are arbitrary remote URLs, not configured next/image hosts
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="size-10 rounded-lg object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-[10px] text-muted-foreground">
                          {adminCopy.categories.noImage}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{category.name}</span>
                      {category.name_vi ? (
                        <span className="block text-xs text-muted-foreground">
                          {category.name_vi}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {category.slug}
                    </TableCell>
                    <TableCell>
                      <span
                        className="block max-w-64 truncate"
                        title={category.description ?? undefined}
                      >
                        {category.description || "—"}
                      </span>
                      {category.description_vi ? (
                        <span
                          className="block max-w-64 truncate text-xs text-muted-foreground"
                          title={category.description_vi}
                        >
                          {category.description_vi}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell>{category.sort_order}</TableCell>
                    <TableCell>
                      <AdminStatusBadge
                        status={category.is_active ? "active" : "inactive"}
                        label={
                          category.is_active
                            ? adminCopy.status.active
                            : adminCopy.status.inactive
                        }
                      />
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
                              void openEdit(category);
                            }}
                          >
                            {adminCopy.common.edit}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer"
                            disabled={statusPendingId === category.id}
                            onClick={() => {
                              void handleToggleStatus(category);
                            }}
                          >
                            {category.is_active
                              ? adminCopy.categories.deactivate
                              : adminCopy.categories.activate}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!showInitialLoading && total > 0 ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {adminCopy.categories.pageInfo(page, totalPages, total)}
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
            <DialogTitle>{adminCopy.categories.createTitle}</DialogTitle>
          </DialogHeader>
          <CategoryForm
            mode="create"
            submitting={submitting}
            error={formError}
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
            <DialogTitle>{adminCopy.categories.editTitle}</DialogTitle>
          </DialogHeader>
          {detailLoading || !selected ? (
            <p className="text-sm text-muted-foreground">
              {adminCopy.common.loading}
            </p>
          ) : (
            <CategoryForm
              key={selected.id}
              mode="edit"
              category={selected}
              submitting={submitting}
              error={formError}
              onSubmit={handleEdit}
              onCancel={closeDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

type CategoryFormProps = {
  mode: "create" | "edit";
  category?: Category;
  submitting: boolean;
  error: string | null;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

function CategoryForm({
  mode,
  category,
  submitting,
  error,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const prefix = mode === "create" ? "create" : "edit";

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-col gap-4" noValidate>
      {/* Scrolls on its own so the header and footer stay in view. */}
      <div className="-mx-1 min-h-0 flex-1 space-y-4 overflow-y-auto px-1">
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-name`}>
            {adminCopy.categories.table.name}
          </Label>
          <Input
            id={`${prefix}-name`}
            name="name"
            required
            maxLength={255}
            defaultValue={category?.name}
            disabled={submitting}
            className="h-11 rounded-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${prefix}-name-vi`}>
            {adminCopy.categories.nameVi}
          </Label>
          <Input
            id={`${prefix}-name-vi`}
            name="name_vi"
            maxLength={255}
            defaultValue={category?.name_vi ?? ""}
            disabled={submitting}
            className="h-11 rounded-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${prefix}-slug`}>
            {adminCopy.categories.table.slug}
          </Label>
          <Input
            id={`${prefix}-slug`}
            name="slug"
            required
            maxLength={255}
            defaultValue={category?.slug}
            disabled={submitting}
            className="h-11 rounded-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${prefix}-description`}>
            {adminCopy.categories.table.description}
          </Label>
          <Textarea
            id={`${prefix}-description`}
            name="description"
            defaultValue={category?.description ?? ""}
            disabled={submitting}
            className="rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${prefix}-description-vi`}>
            {adminCopy.categories.descriptionVi}
          </Label>
          <Textarea
            id={`${prefix}-description-vi`}
            name="description_vi"
            defaultValue={category?.description_vi ?? ""}
            disabled={submitting}
            className="rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${prefix}-image-url`}>
            {adminCopy.categories.imageUrl}
          </Label>
          <Input
            id={`${prefix}-image-url`}
            name="image_url"
            type="url"
            inputMode="url"
            defaultValue={category?.image_url ?? ""}
            disabled={submitting}
            className="h-11 rounded-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${prefix}-sort-order`}>
            {adminCopy.categories.table.sortOrder}
          </Label>
          <Input
            id={`${prefix}-sort-order`}
            name="sort_order"
            type="number"
            min={0}
            step={1}
            defaultValue={category?.sort_order ?? 0}
            disabled={submitting}
            className="h-11 rounded-full"
          />
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
                {adminCopy.categories.active}
              </Label>
              <p className="text-xs text-muted-foreground">
                {adminCopy.categories.activeHint}
              </p>
            </div>
          </div>
        ) : null}
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
