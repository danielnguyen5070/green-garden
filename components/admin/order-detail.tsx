"use client";

import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
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
  ORDER_STATUSES,
  isOrderStatus,
  type Order,
  type OrderStatus,
} from "@/types/order";

const copy = adminCopy.orders;

type OrderDetailProps = {
  order: Order;
  statusPending: boolean;
  onStatusChange: (status: OrderStatus) => void;
};

export function OrderDetail({
  order,
  statusPending,
  onStatusChange,
}: OrderDetailProps) {
  return (
    <div className="-mx-1 min-h-0 flex-1 space-y-6 overflow-y-auto px-1">
      <dl className="grid gap-4 sm:grid-cols-2">
        <DetailField
          label={copy.fields.orderNumber}
          value={order.order_number}
        />
        <div className="space-y-1">
          <dt className="text-xs text-muted-foreground">
            {copy.fields.status}
          </dt>
          <dd>
            <AdminStatusBadge
              status={order.status}
              label={adminCopy.status[order.status]}
            />
          </dd>
        </div>
        <DetailField
          label={copy.fields.customerName}
          value={order.customer.name}
        />
        <DetailField
          label={copy.fields.customerPhone}
          value={order.customer.phone}
        />
        <DetailField
          label={copy.fields.customerEmail}
          value={order.customer.email || "—"}
        />
        <DetailField
          label={copy.fields.shippingAddress}
          value={order.shipping_address}
        />
        <DetailField label={copy.fields.note} value={order.note || "—"} />
        <DetailField
          label={copy.fields.created}
          value={formatAdminDate(order.created_at)}
        />
        <DetailField
          label={copy.fields.updated}
          value={formatAdminDate(order.updated_at)}
        />
      </dl>

      <section className="space-y-3">
        <h3 className="text-sm font-medium">{copy.items.title}</h3>
        {order.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{copy.items.empty}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{copy.items.plant}</TableHead>
                <TableHead>{copy.items.potSize}</TableHead>
                <TableHead>{copy.items.quantity}</TableHead>
                <TableHead>{copy.items.unitPrice}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.plant_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.pot_size || "—"}
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    {formatAdminCurrency(item.unit_price, "USD")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Displayed as returned; the frontend never recalculates the total. */}
        <div className="flex items-baseline justify-between rounded-lg bg-muted px-3 py-2">
          <span className="text-sm font-medium">
            {copy.fields.totalAmount}
          </span>
          <span className="text-sm font-medium">
            {formatAdminCurrency(order.total_amount, "USD")}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {copy.fields.totalHint}
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-medium">{copy.fields.status}</h3>
        {/* The saved order is the source of truth, so a failed update reverts. */}
        <Select
          value={order.status}
          disabled={statusPending}
          onValueChange={(value) => {
            if (value == null || typeof value !== "string") return;
            // Guards against any value outside the backend's status enum.
            if (!isOrderStatus(value) || value === order.status) return;
            onStatusChange(value);
          }}
        >
          <SelectTrigger
            className="h-11 w-full rounded-full px-4 sm:w-56"
            aria-label={copy.fields.status}
          >
            <SelectValue>{adminCopy.status[order.status]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {adminCopy.status[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm break-words">{value}</dd>
    </div>
  );
}
