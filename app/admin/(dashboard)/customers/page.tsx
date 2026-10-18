"use client";

import { useCallback, useEffect, useMemo, useState, type SubmitEvent } from "react";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { AdminSection } from "@/app/admin/_components/admin-section";
import { AdminStatusBadge } from "@/app/admin/_components/admin-status-badge";
import { CustomerDetail } from "@/app/admin/(dashboard)/customers/_components/customer-detail";
import { CustomerForm } from "@/app/admin/(dashboard)/customers/_components/customer-form";
import {
  readForm,
  validateForm,
} from "@/app/admin/(dashboard)/customers/_lib/customer-form";
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
  useAdminCustomerDetail,
  useAdminCustomersList,
  useCreateCustomer,
  useUpdateCustomer,
  useUpdateCustomerStatus,
} from "@/app/admin/(dashboard)/customers/_hooks/use-admin-customers";
import { useQueryErrorToast } from "@/app/admin/_hooks/use-query-error-toast";
import { adminCopy } from "@/app/admin/_lib/admin-copy";
import { formatAdminDate } from "@/app/admin/_lib/admin-format";
import { getErrorMessage } from "@/lib/api/errors";
import { toast } from "@/lib/toast";
import type {
  Customer,
  CustomerCreateRequest,
  CustomerUpdateRequest,
} from "@/types/customer";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;
/** Caps the dialog to the viewport so the body can scroll on short screens. */
const FORM_DIALOG_CLASS =
  "sm:max-w-md max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)]";
const DETAIL_DIALOG_CLASS =
  "sm:max-w-2xl max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)]";

const copy = adminCopy.customers;

type DialogMode = "create" | "edit" | "detail" | null;
type StatusFilter = "all" | "active" | "inactive";

export default function AdminCustomersPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [detailCustomerId, setDetailCustomerId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusPendingId, setStatusPendingId] = useState<string | null>(null);

  const isActive = useMemo(
    (): boolean | null =>
      statusFilter === "all"
        ? null
        : statusFilter === "active",
    [statusFilter]
  );

  const onEmptyPage = useCallback(() => {
    setPage((current) => Math.max(1, current - 1));
  }, []);

  const {
    items: customers,
    total,
    loading,
    isFetching,
  } = useAdminCustomersList({
    page,
    search,
    isActive,
    onEmptyPage,
  });

  const detailQueryEnabled =
    dialogMode === "edit" || dialogMode === "detail";
  const {
    data: detailCustomer,
    loading: detailQueryLoading,
    isError: detailIsError,
    error: detailError,
  } = useAdminCustomerDetail(detailQueryEnabled ? detailCustomerId : null);

  const detailLoading =
    detailQueryEnabled && !detailCustomer && detailQueryLoading;

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const statusMutation = useUpdateCustomerStatus();

  const submitting =
    createMutation.isPending || updateMutation.isPending;

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total]
  );
  const isFiltered = search !== "" || statusFilter !== "all";

  useEffect(() => {
    if (searchInput.trim() === search) return;

    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchInput, search]);

  useQueryErrorToast(
    detailQueryEnabled && detailIsError ? detailError : null
  );
  // Close detail/edit when the detail query fails (adjust during render).
  if (detailQueryEnabled && detailIsError && detailCustomerId) {
    setDialogMode(null);
    setDetailCustomerId(null);
  }

  function openCreate() {
    setDetailCustomerId(null);
    setFormError(null);
    setDialogMode("create");
  }

  function openDetailDialog(customer: Customer, mode: "edit" | "detail") {
    setFormError(null);
    setDetailCustomerId(customer.id);
    setDialogMode(mode);
  }

  function closeDialog() {
    if (submitting) return;
    setDialogMode(null);
    setDetailCustomerId(null);
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

    const payload: CustomerCreateRequest = {
      name: values.name,
      phone: values.phone,
      email: values.email || null,
    };

    setFormError(null);
    try {
      await createMutation.mutateAsync(payload);
      setDialogMode(null);
      setDetailCustomerId(null);
      toast.success(copy.createdSuccess);
      setPage(1);
    } catch (err) {
      // Surfaces the backend's duplicate-phone message (409, CUSTOMER_PHONE_TAKEN).
      const message = getErrorMessage(err);
      setFormError(message);
      toast.error(message);
    }
  }

  async function handleEdit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!detailCustomer) return;

    const values = readForm(event.currentTarget);
    const invalid = validateForm(values);
    if (invalid) {
      setFormError(invalid);
      return;
    }

    // PATCH is partial: omitted fields keep their value, explicit null clears.
    const changes: CustomerUpdateRequest = {};
    if (values.name !== detailCustomer.name) changes.name = values.name;
    if (values.phone !== detailCustomer.phone) changes.phone = values.phone;

    const nextEmail = values.email || null;
    if (nextEmail !== detailCustomer.email) changes.email = nextEmail;

    if (Object.keys(changes).length === 0) {
      closeDialog();
      return;
    }

    setFormError(null);
    try {
      await updateMutation.mutateAsync({ id: detailCustomer.id, data: changes });
      setDialogMode(null);
      setDetailCustomerId(null);
      toast.success(copy.updatedSuccess);
    } catch (err) {
      const message = getErrorMessage(err);
      setFormError(message);
      toast.error(message);
    }
  }

  async function handleToggleStatus(customer: Customer) {
    setStatusPendingId(customer.id);
    try {
      await statusMutation.mutateAsync({
        id: customer.id,
        data: { is_active: !customer.is_active },
      });
      toast.success(
        customer.is_active ? copy.deactivatedSuccess : copy.activatedSuccess
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setStatusPendingId(null);
    }
  }

  const showInitialLoading = loading && customers.length === 0;

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
        ) : customers.length === 0 ? (
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
                  <TableHead>{copy.table.name}</TableHead>
                  <TableHead>{copy.table.phone}</TableHead>
                  <TableHead>{copy.table.email}</TableHead>
                  <TableHead>{copy.table.status}</TableHead>
                  <TableHead>{copy.table.created}</TableHead>
                  <TableHead className="text-right">
                    {adminCopy.common.actions}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.name}
                    </TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.email || "—"}
                    </TableCell>
                    <TableCell>
                      <AdminStatusBadge
                        status={customer.is_active ? "active" : "inactive"}
                        label={
                          customer.is_active
                            ? adminCopy.status.active
                            : adminCopy.status.inactive
                        }
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatAdminDate(customer.created_at)}
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
                              openDetailDialog(customer, "detail");
                            }}
                          >
                            {adminCopy.common.view}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => {
                              openDetailDialog(customer, "edit");
                            }}
                          >
                            {adminCopy.common.edit}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer"
                            disabled={statusPendingId === customer.id}
                            onClick={() => {
                              void handleToggleStatus(customer);
                            }}
                          >
                            {customer.is_active
                              ? copy.deactivate
                              : copy.activate}
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
              {copy.pageInfo(page, totalPages, total)}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage(page - 1)}
              >
                {adminCopy.common.previous}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage(page + 1)}
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
          <CustomerForm
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
            <DialogTitle>{copy.editTitle}</DialogTitle>
          </DialogHeader>
          {detailLoading || !detailCustomer ? (
            <p className="text-sm text-muted-foreground">
              {adminCopy.common.loading}
            </p>
          ) : (
            <CustomerForm
              key={detailCustomer.id}
              mode="edit"
              customer={detailCustomer}
              submitting={submitting}
              error={formError}
              onSubmit={handleEdit}
              onCancel={closeDialog}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialogMode === "detail"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className={DETAIL_DIALOG_CLASS}>
          <DialogHeader>
            <DialogTitle>{copy.detailTitle}</DialogTitle>
          </DialogHeader>
          {detailLoading || !detailCustomer ? (
            <p className="text-sm text-muted-foreground">
              {adminCopy.common.loading}
            </p>
          ) : (
            <CustomerDetail key={detailCustomer.id} customer={detailCustomer} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
