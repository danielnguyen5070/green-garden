import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import {
  AdminRowActions,
  AdminToolbar,
} from "@/components/admin/admin-toolbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ordersData from "@/data/admin/orders.json";
import { adminCopy } from "@/lib/admin-copy";
import { formatAdminCurrency, formatAdminDate } from "@/lib/admin-format";
import type { AdminOrder } from "@/types/admin";

export default function AdminOrdersPage() {
  const orders = ordersData as AdminOrder[];

  return (
    <>
      <AdminPageHeader
        title={adminCopy.orders.title}
        description={adminCopy.orders.description}
      />

      <AdminSection
        title={adminCopy.orders.title}
        contentClassName="space-y-4"
      >
        <AdminToolbar
          searchPlaceholder={adminCopy.orders.searchPlaceholder}
          showStatusFilter
          showDateFilter
          statusOptions={[
            "pending",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
          ]}
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{adminCopy.orders.table.orderId}</TableHead>
              <TableHead>{adminCopy.orders.table.customer}</TableHead>
              <TableHead className="text-right">
                {adminCopy.orders.table.items}
              </TableHead>
              <TableHead className="text-right">
                {adminCopy.orders.table.total}
              </TableHead>
              <TableHead>{adminCopy.orders.table.payment}</TableHead>
              <TableHead>{adminCopy.orders.table.status}</TableHead>
              <TableHead>{adminCopy.orders.table.date}</TableHead>
              <TableHead className="text-right">
                {adminCopy.common.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>
                  <div className="min-w-0">
                    <p className="font-medium">{order.customer}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.email}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-right">{order.items}</TableCell>
                <TableCell className="text-right">
                  {formatAdminCurrency(order.total)}
                </TableCell>
                <TableCell>
                  <AdminStatusBadge
                    status={order.payment}
                    label={adminCopy.status[order.payment]}
                  />
                </TableCell>
                <TableCell>
                  <AdminStatusBadge
                    status={order.status}
                    label={adminCopy.status[order.status]}
                  />
                </TableCell>
                <TableCell>{formatAdminDate(order.date)}</TableCell>
                <TableCell className="text-right">
                  <AdminRowActions />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AdminSection>
    </>
  );
}
