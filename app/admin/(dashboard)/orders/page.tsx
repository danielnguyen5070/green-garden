"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { OrderCreateForm } from "@/components/admin/order-create-form";
import { OrderDetail } from "@/components/admin/order-detail";
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
import { adminCopy } from "@/lib/admin-copy";
import { formatAdminCurrency, formatAdminDate } from "@/lib/admin-format";
import { getErrorMessage } from "@/lib/api/errors";
import {
  createOrder,
  getOrder,
  listOrders,
  updateOrderStatus,
} from "@/lib/api/orders";
import { listPlants } from "@/lib/api/plants";
import { toast } from "@/lib/toast";
import type { AdminPlantListItem } from "@/types/admin-plant";
import {
  ORDER_STATUSES,
  type Order,
  type OrderCreateRequest,
  type OrderStatus,
} from "@/types/order";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;
const PLANT_PICKER_PAGE_SIZE = 100;
/** Caps the dialog to the viewport so the body can scroll on short screens. */
const DIALOG_CLASS =
  "sm:max-w-2xl max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)]";

const copy = adminCopy.orders;

type DialogMode = "create" | "detail" | null;
type StatusFilter = "all" | OrderStatus;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [reloadToken, setReloadToken] = useState(0);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [plants, setPlants] = useState<AdminPlantListItem[]>([]);

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selected, setSelected] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusPending, setStatusPending] = useState(false);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total]
  );
  const isFiltered =
    search !== "" || statusFilter !== "all" || dateFrom !== "" || dateTo !== "";

  /** Any filter change restarts from the first page. */
  const applyFilterChange = useCallback((apply: () => void) => {
    setLoading(true);
    apply();
    setPage(1);
  }, []);

  useEffect(() => {
    if (searchInput.trim() === search) return;

    const timeout = setTimeout(() => {
      applyFilterChange(() => setSearch(searchInput.trim()));
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchInput, search, applyFilterChange]);

  // The order form's plant picker is driven by the Plants API, never hardcoded.
  useEffect(() => {
    const controller = new AbortController();

    async function fetchPlants() {
      try {
        const response = await listPlants(
          {
            page_size: PLANT_PICKER_PAGE_SIZE,
            is_active: true,
            sort: "name",
            order: "asc",
          },
          { signal: controller.signal }
        );
        if (controller.signal.aborted) return;
        setPlants(response.items);
      } catch (err) {
        if (controller.signal.aborted) return;
        toast.error(getErrorMessage(err, copy.plantsLoadError));
      }
    }

    void fetchPlants();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchOrders() {
      try {
        const response = await listOrders(
          {
            page,
            page_size: PAGE_SIZE,
            search: search || undefined,
            status: statusFilter === "all" ? undefined : statusFilter,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
          },
          { signal: controller.signal }
        );
        if (controller.signal.aborted) return;
        // A page can empty out after a filter narrows the results.
        if (response.items.length === 0 && page > 1) {
          setPage((current) => Math.max(1, current - 1));
          return;
        }
        setOrders(response.items);
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

    void fetchOrders();
    return () => controller.abort();
  }, [page, search, statusFilter, dateFrom, dateTo, reloadToken]);

  function refresh(nextPage = page) {
    setLoading(true);
    setPage(nextPage);
    setReloadToken((token) => token + 1);
  }

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
    setSelected(null);
    setFormError(null);
    setDialogMode("create");
  }

  async function openDetail(order: Order) {
    setSelected(null);
    setFormError(null);
    setDialogMode("detail");
    setDetailLoading(true);

    try {
      setSelected(await getOrder(order.id));
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

  async function handleCreate(payload: OrderCreateRequest) {
    setFormError(null);
    setSubmitting(true);
    try {
      await createOrder(payload);
      setDialogMode(null);
      toast.success(copy.createdSuccess);
      refresh(1);
    } catch (err) {
      // Surfaces backend stock and validation failures.
      const message = getErrorMessage(err);
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(status: OrderStatus) {
    if (!selected) return;

    setStatusPending(true);
    try {
      // Refresh the open detail from the response, then the list behind it.
      setSelected(await updateOrderStatus(selected.id, { status }));
      toast.success(copy.statusSuccess);
      refresh(page);
    } catch (err) {
      toast.error(getErrorMessage(err));
      // Re-sync the control with the server's actual state.
      try {
        setSelected(await getOrder(selected.id));
      } catch {
        // Keep the dialog usable; the list refresh below still reflects truth.
      }
    } finally {
      setStatusPending(false);
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
            aria-busy={loading}
            className={loading ? "opacity-60 transition-opacity" : undefined}
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
                      {formatAdminCurrency(order.total_amount, "USD")}
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
                              void openDetail(order);
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
          {detailLoading || !selected ? (
            <p className="text-sm text-muted-foreground">
              {adminCopy.common.loading}
            </p>
          ) : (
            <OrderDetail
              order={selected}
              statusPending={statusPending}
              onStatusChange={handleStatusChange}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
