import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { adminCopy } from "@/lib/admin-copy";
import { formatAdminNumber } from "@/lib/admin-format";
import { cn } from "@/lib/utils";
import { ORDER_STATUSES, type OrderStatus } from "@/types/order";
import type { OrdersByStatus } from "@/types/overview";

/** Same palette the status badges use, so the two read as one system. */
const barStyles: Record<OrderStatus, string> = {
  pending: "bg-warning",
  confirmed: "bg-primary",
  processing: "bg-primary",
  shipping: "bg-primary",
  completed: "bg-success",
  cancelled: "bg-destructive",
};

type OverviewStatusChartProps = {
  data: OrdersByStatus;
};

function OverviewStatusChart({ data }: OverviewStatusChartProps) {
  // Bars are sized against the busiest status; no total is recomputed here.
  const peak = Math.max(...ORDER_STATUSES.map((status) => data[status]), 1);

  return (
    <ul className="space-y-3">
      {ORDER_STATUSES.map((status) => {
        const count = data[status];

        return (
          <li key={status} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <AdminStatusBadge
                status={status}
                label={adminCopy.status[status]}
              />
              <span className="text-sm font-medium tabular-nums text-foreground">
                {formatAdminNumber(count)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                className={cn(
                  "h-full rounded-full transition-[width]",
                  barStyles[status]
                )}
                style={{ width: `${(count / peak) * 100}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export { OverviewStatusChart };
