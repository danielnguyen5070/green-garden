"use client";

import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { refreshStorefront } from "@/app/admin/actions/revalidate";
import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { AdminSection } from "@/app/admin/_components/admin-section";
import { AdminStatusBadge } from "@/app/admin/_components/admin-status-badge";
import { OrderCreateForm } from "@/app/admin/(dashboard)/orders/_components/order-create-form";
import { OrderDetail } from "@/app/admin/(dashboard)/orders/_components/order-detail";
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
  useAdminOrderDetail,
  useAdminOrdersList,
  useCreateOrder,
  useUpdateOrderStatus,
} from "@/app/admin/(dashboard)/orders/_hooks/use-admin-orders";
import { useAdminPlantPicker } from "@/app/admin/_hooks/use-admin-plants";
import { useQueryErrorToast } from "@/app/admin/_hooks/use-query-error-toast";
import { adminCopy } from "@/app/admin/_lib/admin-copy";
import { formatAdminCurrency, formatAdminDate } from "@/app/admin/_lib/admin-format";
import { ApiError, ErrorCode, getErrorMessage } from "@/lib/api/errors";
import { toast } from "@/lib/toast";
import {
  ORDER_STATUSES,
  type Order,
  type OrderCreateRequest,
  type OrderStatus,
} from "@/types/order";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;
/** Caps the dialog to the viewport so the body can scroll on short screens. */
const DIALOG_CLASS =
  "sm:max-w-2xl max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)]";

const copy = adminCopy.orders;

type DialogMode = "create" | "detail" | null;
type StatusFilter = "all" | OrderStatus;

/** Create failures caused by stale stock or catalog data in the picker. */
function getCreateErrorMessage(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;

  switch (error.errorCode) {
    case ErrorCode.INSUFFICIENT_STOCK:
      return copy.createErrors.insufficientStock;
    case ErrorCode.PLANT_UNAVAILABLE:
    case ErrorCode.PLANT_NOT_FOUND:
      return copy.createErrors.plantUnavailable;
    default:
      return null;
  }
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdFromQuery = searchParams.get("order");

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  /** Manual dialog overrides URL deep-links until dismissed. */
  const [manualDialog, setManualDialog] = useState<{
    mode: DialogMode;
    orderId: string | null;
  }>({ mode: null, orderId: null });
  /** URL order ids the user has closed so they do not reopen immediately. */
  const [dismissedUrlOrder, setDismissedUrlOrder] = useState<string | null>(
    null
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [detailLoadFailedId, setDetailLoadFailedId] = useState<string | null>(
    null
  );

  const urlOpensDetail =
    !!orderIdFromQuery &&
    orderIdFromQuery !== dismissedUrlOrder &&
    orderIdFromQuery !== detailLoadFailedId;

  const dialogMode: DialogMode =
    manualDialog.mode ?? (urlOpensDetail ? "detail" : null);
  const detailOrderId =
    dialogMode === "detail"
      ? (manualDialog.orderId ?? (urlOpensDetail ? orderIdFromQuery : null))
      : null;

  const onEmptyPage = () => {
    setPage((current) => Math.max(1, current - 1));
  };

  const {
    items: orders,
    total,
    loading,
    isFetching,
  } = useAdminOrdersList({
    page,
    search,
    status: statusFilter === "all" ? null : statusFilter,
    dateFrom,
    dateTo,
    onEmptyPage,
  });

  const { items: plants, refetch: refetchPlants } = useAdminPlantPicker();

  const detailQueryEnabled = dialogMode === "detail" && !!detailOrderId;
  const {
    data: detailOrder,
    loading: detailQueryLoading,
    isError: detailIsError,
    error: detailError,
    refetch: refetchDetailOrder,
  } = useAdminOrderDetail(detailQueryEnabled ? detailOrderId : null);

  const detailLoading =
    detailQueryEnabled && !detailOrder && detailQueryLoading;

  const createMutation = useCreateOrder();
  const updateStatusMutation = useUpdateOrderStatus();

  const submitting = createMutation.isPending;
  const statusPending = updateStatusMutation.isPending;

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total]
  );
  const isFiltered =
    search !== "" || statusFilter !== "all" || dateFrom !== "" || dateTo !== "";

  function applyFilterChange(apply: () => void) {
    apply();
    setPage(1);
  }

  useEffect(() => {
    if (searchInput.trim() === search) return;

    const timeout = setTimeout(() => {
      applyFilterChange(() => setSearch(searchInput.trim()));
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchInput, search]);

  useQueryErrorToast(
    detailQueryEnabled && detailIsError ? detailError : null
  );

  // Remember failed detail loads so URL deep-links do not reopen them.
  if (
    detailQueryEnabled &&
    detailIsError &&
    detailOrderId &&
    detailLoadFailedId !== detailOrderId
  ) {
    setDetailLoadFailedId(detailOrderId);
    setManualDialog({ mode: null, orderId: null });
    if (orderIdFromQuery === detailOrderId) {
      setDismissedUrlOrder(orderIdFromQuery);
    }
  }

  // Clear the deep-link query when detail load fails.
  useEffect(() => {
    if (!detailIsError || !orderIdFromQuery) return;
    router.replace("/admin/orders");
  }, [detailIsError, orderIdFromQuery, router]);

  function resetFilters() {
    setSearchInput("");
    applyFilterChange(() => {
      setSearch("");
      setStatusFilter("all");
      setDateFrom("");
      setDateTo("");
    });
  }

  function openCreate() {
    setFormError(null);
    setManualDialog({ mode: "create", orderId: null });
  }

  function openDetail(order: Order) {
    setFormError(null);
    setDetailLoadFailedId(null);
    setManualDialog({ mode: "detail", orderId: order.id });
    router.replace(`/admin/orders?order=${encodeURIComponent(order.id)}`);
  }

  function closeDialog() {
    if (submitting) return;
    setManualDialog({ mode: null, orderId: null });
    setFormError(null);
    if (orderIdFromQuery) {
      setDismissedUrlOrder(orderIdFromQuery);
      router.replace("/admin/orders");
    }
  }

  async function handleCreate(payload: OrderCreateRequest) {
    setFormError(null);
    try {
      await createMutation.mutateAsync(payload);
      setManualDialog({ mode: null, orderId: null });
      toast.success(copy.createdSuccess);
      setPage(1);
      // Orders move stock, which plant lists and detail pages show.
      void refreshStorefront({ entity: "plants" });
    } catch (err) {
      const staleCatalogMessage = getCreateErrorMessage(err);
      const message = staleCatalogMessage ?? getErrorMessage(err);
      setFormError(message);
      toast.error(message);
      if (staleCatalogMessage) {
        void refetchPlants();
      }
    }
  }

  async function handleStatusChange(status: OrderStatus) {
    if (!detailOrder) return;

    try {
      // Refresh the open detail from the response, then the list behind it.
      await updateStatusMutation.mutateAsync({
        id: detailOrder.id,
        data: { status },
      });
      toast.success(copy.statusSuccess);
      void refreshStorefront({ entity: "plants" });
    } catch (err) {
      toast.error(getErrorMessage(err));
      // Re-sync the control with the server's actual state.
      try {
        await refetchDetailOrder();
      } catch {
        // Keep the dialog usable; the list refresh below still reflects truth.
      }
    }
  }

  const showInitialLoading = loading && orders.length === 0;

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
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
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
              applyFilterChange(() => setStatusFilter(value as StatusFilter));
            }}
          >
            <SelectTrigger
              className="w-full sm:w-44"
              aria-label={copy.allStatuses}
            >
              <SelectValue>
                {statusFilter === "all"
                  ? copy.allStatuses
                  : adminCopy.status[statusFilter]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{copy.allStatuses}</SelectItem>
              {ORDER_STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {adminCopy.status[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={dateFrom}
            onChange={(event) => {
              const value = event.target.value;
              applyFilterChange(() => setDateFrom(value));
            }}
            aria-label={copy.dateFrom}
            className="w-full sm:w-40"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(event) => {
              const value = event.target.value;
              applyFilterChange(() => setDateTo(value));
            }}
            aria-label={copy.dateTo}
            className="w-full sm:w-40"
          />

          {isFiltered ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetFilters}
            >
              {copy.reset}
            </Button>
          ) : null}
        </div>

        {showInitialLoading ? (
          <p className="text-sm text-muted-foreground">
            {adminCopy.common.loading}
          </p>
        ) : orders.length === 0 ? (
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
                  <TableHead>{copy.table.orderNumber}</TableHead>
                  <TableHead>{copy.table.customer}</TableHead>
                  <TableHead>{copy.table.items}</TableHead>
                  <TableHead>{copy.table.total}</TableHead>
                  <TableHead>{copy.table.status}</TableHead>
                  <TableHead>{copy.table.date}</TableHead>
                  <TableHead className="text-right">
                    {adminCopy.common.actions}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.order_number}
                    </TableCell>
                    <TableCell>
                      <span>{order.customer.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {order.customer.phone}
                      </span>
                    </TableCell>
                    <TableCell>{order.items.length}</TableCell>
                    <TableCell>
                      {formatAdminCurrency(order.total_amount, order.currency)}
                    </TableCell>
                    <TableCell>
                      <AdminStatusBadge
                        status={order.status}
                        label={adminCopy.status[order.status]}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatAdminDate(order.created_at)}
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
                              openDetail(order);
                            }}
                          >
                            {adminCopy.common.view}
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
        <DialogContent className={DIALOG_CLASS}>
          <DialogHeader>
            <DialogTitle>{copy.createTitle}</DialogTitle>
          </DialogHeader>
          <OrderCreateForm
            plants={plants}
            submitting={submitting}
            error={formError}
            onValidationError={setFormError}
            onSubmit={handleCreate}
            onCancel={closeDialog}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialogMode === "detail"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className={DIALOG_CLASS}>
          <DialogHeader>
            <DialogTitle>{copy.detailTitle}</DialogTitle>
          </DialogHeader>
          {detailLoading || !detailOrder ? (
            <p className="text-sm text-muted-foreground">
              {adminCopy.common.loading}
            </p>
          ) : (
            <OrderDetail
              key={detailOrder.id}
              order={detailOrder}
              statusPending={statusPending}
              onStatusChange={handleStatusChange}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
