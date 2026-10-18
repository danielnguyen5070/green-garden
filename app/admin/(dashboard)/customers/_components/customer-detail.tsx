"use client";

import { AdminStatusBadge } from "@/app/admin/_components/admin-status-badge";
import { useAdminCustomerOrders } from "@/app/admin/(dashboard)/customers/_hooks/use-admin-customers";
import { adminCopy } from "@/app/admin/_lib/admin-copy";
import { formatAdminCurrency, formatAdminDate } from "@/app/admin/_lib/admin-format";
import { getErrorMessage } from "@/lib/api/errors";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Customer } from "@/types/customer";

const copy = adminCopy.customers;

export function CustomerDetail({ customer }: { customer: Customer }) {
  const {
    items: orders,
    total: orderTotal,
    loading: ordersLoading,
    error: ordersError,
    isError: ordersIsError,
  } = useAdminCustomerOrders(customer.id);

  const ordersErrorMessage = ordersIsError
    ? getErrorMessage(ordersError, copy.orders.loadError)
    : null;

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
          {!ordersLoading && !ordersErrorMessage && orderTotal > 0 ? (
            <span className="text-xs text-muted-foreground">
              {copy.orders.viewAll(orderTotal)}
            </span>
          ) : null}
        </div>

        {ordersLoading ? (
          <p className="text-sm text-muted-foreground">
            {adminCopy.common.loading}
          </p>
        ) : ordersErrorMessage ? (
          <p role="alert" className="text-sm text-destructive">
            {ordersErrorMessage}
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
