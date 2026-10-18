"use client";

import { useCallback, useEffect, useMemo, useState, type SubmitEvent } from "react";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { AdminSection } from "@/app/admin/_components/admin-section";
import { AdminStatusBadge } from "@/app/admin/_components/admin-status-badge";
import { CategoryForm } from "@/app/admin/(dashboard)/categories/_components/category-form";
import {
  readForm,
  validateForm,
  type CategoryFormValues,
} from "@/app/admin/(dashboard)/categories/_lib/category-form";
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
import {
  useAdminCategoriesList,
  useAdminCategoryDetail,
  useCreateCategory,
  useUpdateCategory,
  useUpdateCategoryStatus,
} from "@/app/admin/_hooks/use-admin-categories";
import { useQueryErrorToast } from "@/app/admin/_hooks/use-query-error-toast";
import { getErrorMessage } from "@/lib/api/errors";
import { refreshStorefront } from "@/app/admin/actions/revalidate";
import { adminCopy } from "@/app/admin/_lib/admin-copy";
import { toast } from "@/lib/toast";
import type {
  Category,
  CategoryCreateRequest,
  CategoryUpdateRequest,
} from "@/types/category";
import { ADMIN_LIST_PAGE_SIZE } from "@/lib/constants/pagination";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants/timing";

/** Caps the dialog to the viewport so the form body can scroll on short screens. */
const FORM_DIALOG_CLASS =
  "sm:max-w-md max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)]";

type DialogMode = "create" | "edit" | null;
type StatusFilter = "all" | "active" | "inactive";

export default function AdminCategoriesPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const onEmptyPage = useCallback((current: number) => {
    setPage(Math.max(1, current - 1));
  }, []);

  const isActive =
    statusFilter === "all" ? null : statusFilter === "active";

  const {
    items: categories,
    total,
    loading,
    isFetching,
  } = useAdminCategoriesList({
    page,
    search,
    isActive,
    onEmptyPage,
  });

  const detailQuery = useAdminCategoryDetail(
    dialogMode === "edit" ? editId : null
  );
  const selected = detailQuery.data;

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const statusMutation = useUpdateCategoryStatus();

  const submitting = createMutation.isPending || updateMutation.isPending;
  const statusPendingId =
    statusMutation.isPending && statusMutation.variables
      ? statusMutation.variables.id
      : null;

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / ADMIN_LIST_PAGE_SIZE)),
    [total]
  );
  const isFiltered = search !== "" || statusFilter !== "all";

  useEffect(() => {
    if (searchInput === search) return;

    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchInput, search]);

  useQueryErrorToast(
    dialogMode === "edit" && detailQuery.isError ? detailQuery.error : null
  );
  // Close the edit dialog when the detail query fails (adjust during render).
  if (dialogMode === "edit" && detailQuery.isError) {
    setDialogMode(null);
    setEditId(null);
  }

  function goToPage(nextPage: number) {
    setPage(nextPage);
  }

  function openCreate() {
    setEditId(null);
    setFormError(null);
    setDialogMode("create");
  }

  function openEdit(category: Category) {
    setFormError(null);
    setEditId(category.id);
    setDialogMode("edit");
  }

  function closeDialog() {
    if (submitting) return;
    setDialogMode(null);
    setEditId(null);
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
    try {
      await createMutation.mutateAsync(payload);
      setDialogMode(null);
      setEditId(null);
      toast.success(adminCopy.categories.createdSuccess);
      goToPage(1);
      void refreshStorefront({ entity: "categories" });
    } catch (err) {
      setFormError(getErrorMessage(err));
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
    try {
      await updateMutation.mutateAsync({ id: selected.id, data: changes });
      setDialogMode(null);
      setEditId(null);
      toast.success(adminCopy.categories.updatedSuccess);
      void refreshStorefront({ entity: "categories" });
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  }

  async function handleToggleStatus(category: Category) {
    try {
      await statusMutation.mutateAsync({
        id: category.id,
        data: { is_active: !category.is_active },
      });
      toast.success(
        category.is_active
          ? adminCopy.categories.deactivatedSuccess
          : adminCopy.categories.activatedSuccess
      );
      void refreshStorefront({ entity: "categories" });
    } catch (err) {
      toast.error(getErrorMessage(err));
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
            aria-busy={isFetching}
            className={isFetching ? "opacity-60 transition-opacity" : undefined}
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
                            onClick={() => openEdit(category)}
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
          {detailQuery.loading || !selected ? (
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
