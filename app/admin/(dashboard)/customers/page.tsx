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
import { adminCopy } from "@/lib/admin-copy";
import { formatAdminCurrency, formatAdminDate } from "@/lib/admin-format";
import {
  createCustomer,
  getCustomer,
  listCustomers,
  updateCustomer,
  updateCustomerStatus,
} from "@/lib/api/customers";
import { getErrorMessage } from "@/lib/api/errors";
import { listOrders } from "@/lib/api/orders";
import { toast } from "@/lib/toast";
import type {
  Customer,
  CustomerCreateRequest,
  CustomerUpdateRequest,
} from "@/types/customer";
import type { Order } from "@/types/order";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;
const ORDER_HISTORY_PAGE_SIZE = 20;
/** Caps the dialog to the viewport so the body can scroll on short screens. */
const FORM_DIALOG_CLASS =
  "sm:max-w-md max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)]";
const DETAIL_DIALOG_CLASS =
  "sm:max-w-2xl max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)]";

const copy = adminCopy.customers;

type DialogMode = "create" | "edit" | "detail" | null;
type StatusFilter = "all" | "active" | "inactive";

type CustomerFormValues = {
  name: string;
  phone: string;
  email: string;
};

function readForm(form: HTMLFormElement): CustomerFormValues {
  const formData = new FormData(form);
  return {
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
  };
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Client-side guardrails; the backend stays the source of truth. */
function validateForm(values: CustomerFormValues): string | null {
  if (!values.name || values.name.length > 255) return copy.invalidName;
  if (!values.phone || values.phone.length > 32) return copy.invalidPhone;
  // Email is optional, but must be well-formed when provided.
  if (values.email && !isValidEmail(values.email)) return copy.invalidEmail;
  return null;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [reloadToken, setReloadToken] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selected, setSelected] = useState<Customer | null>(null);
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
    if (searchInput.trim() === search) return;

    const timeout = setTimeout(() => {
      setLoading(true);
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchInput, search]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCustomers() {
      try {
        const response = await listCustomers(
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
        setCustomers(response.items);
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

    void fetchCustomers();
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

  async function openDetailDialog(customer: Customer, mode: "edit" | "detail") {
    setSelected(null);
    setFormError(null);
    setDialogMode(mode);
    setDetailLoading(true);

    try {
      setSelected(await getCustomer(customer.id));
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

    const payload: CustomerCreateRequest = {
      name: values.name,
      phone: values.phone,
      email: values.email || null,
    };

    setFormError(null);
    setSubmitting(true);
    try {
      await createCustomer(payload);
      setDialogMode(null);
      setSelected(null);
      toast.success(copy.createdSuccess);
      refresh(1);
    } catch (err) {
      // Surfaces the backend's 409 duplicate-phone detail.
      const message = getErrorMessage(err);
      setFormError(message);
      toast.error(message);
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
    const changes: CustomerUpdateRequest = {};
    if (values.name !== selected.name) changes.name = values.name;
    if (values.phone !== selected.phone) changes.phone = values.phone;

    const nextEmail = values.email || null;
    if (nextEmail !== selected.email) changes.email = nextEmail;

    if (Object.keys(changes).length === 0) {
      closeDialog();
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      await updateCustomer(selected.id, changes);
      setDialogMode(null);
      setSelected(null);
      toast.success(copy.updatedSuccess);
      refresh(page);
    } catch (err) {
      const message = getErrorMessage(err);
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(customer: Customer) {
    setStatusPendingId(customer.id);
    try {
      await updateCustomerStatus(customer.id, {
        is_active: !customer.is_active,
      });
      toast.success(
        customer.is_active ? copy.deactivatedSuccess : copy.activatedSuccess
      );
      refresh(page);
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
        ) : customers.length === 0 ? (
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
                              void openDetailDialog(customer, "detail");
                            }}
                          >
                            {adminCopy.common.view}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => {
                              void openDetailDialog(customer, "edit");
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
          {detailLoading || !selected ? (
            <p className="text-sm text-muted-foreground">
              {adminCopy.common.loading}
            </p>
          ) : (
            <CustomerForm
              key={selected.id}
              mode="edit"
              customer={selected}
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
          {detailLoading || !selected ? (
            <p className="text-sm text-muted-foreground">
              {adminCopy.common.loading}
            </p>
          ) : (
            <CustomerDetail key={selected.id} customer={selected} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

type CustomerFormProps = {
  mode: "create" | "edit";
  customer?: Customer;
  submitting: boolean;
  error: string | null;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

function CustomerForm({
  mode,
  customer,
  submitting,
  error,
  onSubmit,
  onCancel,
}: CustomerFormProps) {
  const prefix = mode === "create" ? "create" : "edit";

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-col gap-4" noValidate>
      {/* Scrolls on its own so the header and footer stay in view. */}
      <div className="-mx-1 min-h-0 flex-1 space-y-4 overflow-y-auto px-1">
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-name`}>{copy.fields.name}</Label>
          <Input
            id={`${prefix}-name`}
            name="name"
            required
            maxLength={255}
            defaultValue={customer?.name}
            disabled={submitting}
            className="h-11 rounded-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${prefix}-phone`}>{copy.fields.phone}</Label>
          <Input
            id={`${prefix}-phone`}
            name="phone"
            type="tel"
            inputMode="tel"
            required
            maxLength={32}
            defaultValue={customer?.phone}
            disabled={submitting}
            className="h-11 rounded-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${prefix}-email`}>{copy.fields.email}</Label>
          <Input
            id={`${prefix}-email`}
            name="email"
            type="email"
            inputMode="email"
            defaultValue={customer?.email ?? ""}
            disabled={submitting}
            className="h-11 rounded-full"
          />
          <p className="text-xs text-muted-foreground">
            {copy.fields.emailHint}
          </p>
        </div>
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

function CustomerDetail({ customer }: { customer: Customer }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Order history reuses the Orders API filtered by customer_id.
  useEffect(() => {
    const controller = new AbortController();

    async function fetchOrders() {
      try {
        const response = await listOrders(
          { customer_id: customer.id, page_size: ORDER_HISTORY_PAGE_SIZE },
          { signal: controller.signal }
        );
        if (controller.signal.aborted) return;
        setOrders(response.items);
        setOrderTotal(response.total);
      } catch (err) {
        if (controller.signal.aborted) return;
        setOrdersError(getErrorMessage(err, copy.orders.loadError));
      } finally {
        if (!controller.signal.aborted) {
          setOrdersLoading(false);
        }
      }
    }

    void fetchOrders();
    return () => controller.abort();
  }, [customer.id]);

  return (
    <div className="-mx-1 min-h-0 flex-1 space-y-6 overflow-y-auto px-1">
      <dl className="grid gap-4 sm:grid-cols-2">
        <DetailField label={copy.fields.name} value={customer.name} />
        <DetailField label={copy.fields.phone} value={customer.phone} />
        <DetailField label={copy.fields.email} value={customer.email || "—"} />
        <div className="space-y-1">
          <dt className="text-xs text-muted-foreground">
            {copy.fields.status}
          </dt>
          <dd>
            <AdminStatusBadge
              status={customer.is_active ? "active" : "inactive"}
              label={
                customer.is_active
                  ? adminCopy.status.active
                  : adminCopy.status.inactive
              }
            />
          </dd>
        </div>
        <DetailField
          label={copy.fields.created}
          value={formatAdminDate(customer.created_at)}
        />
        <DetailField
          label={copy.fields.updated}
          value={formatAdminDate(customer.updated_at)}
        />
      </dl>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{copy.orders.title}</h3>
          {!ordersLoading && !ordersError && orderTotal > 0 ? (
            <span className="text-xs text-muted-foreground">
              {copy.orders.viewAll(orderTotal)}
            </span>
          ) : null}
        </div>

        {ordersLoading ? (
          <p className="text-sm text-muted-foreground">
            {adminCopy.common.loading}
          </p>
        ) : ordersError ? (
          <p role="alert" className="text-sm text-destructive">
            {ordersError}
          </p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">{copy.orders.empty}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{adminCopy.orders.table.orderNumber}</TableHead>
                <TableHead>{adminCopy.orders.table.items}</TableHead>
                <TableHead>{adminCopy.orders.table.total}</TableHead>
                <TableHead>{adminCopy.orders.table.status}</TableHead>
                <TableHead>{adminCopy.orders.table.date}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.order_number}
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}
