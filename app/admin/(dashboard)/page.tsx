"use client";

import { Banknote, Leaf, ShoppingBag, Users } from "lucide-react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { OverviewRevenueChart } from "@/components/admin/overview-revenue-chart";
import { OverviewSkeleton } from "@/components/admin/overview-skeleton";
import { OverviewStatusChart } from "@/components/admin/overview-status-chart";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOverview } from "@/hooks/use-overview";
import { adminCopy } from "@/lib/admin-copy";
import {
  formatAdminCurrency,
  formatAdminDate,
  formatAdminNumber,
  type AdminCurrency,
} from "@/lib/admin-format";
import { cn } from "@/lib/utils";
import type { SalesPeriodStats } from "@/types/overview";

const copy = adminCopy.dashboard;

/**
 * Order totals are built from the plants' USD prices, so the dashboard formats
 * money the same way the Orders page does.
 */
const CURRENCY: AdminCurrency = "USD";

/** The backend leaves the customer blank on orders placed without one. */
const EMPTY_FIELD = "—";

/** The backend picks which plants are low; zero stock only changes the label. */
function stockStatus(stock: number): "low_stock" | "out_of_stock" {
  return stock === 0 ? "out_of_stock" : "low_stock";
}

function ViewAllButton({ href, label }: { href: string; label: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      nativeButton={false}
      render={<Link href={href} />}
    >
      {label}
    </Button>
  );
}

function SalesPeriod({
  label,
  stats,
}: {
  label: string;
  stats: SalesPeriodStats;
}) {
  return (
    <div className="space-y-2 rounded border border-border/80 bg-card px-3 py-2.5">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="font-heading text-xl font-semibold tracking-tight text-foreground">
          {formatAdminCurrency(stats.revenue, CURRENCY)}
        </p>
        <p className="text-sm text-muted-foreground">
          {copy.sales.orders}:{" "}
          <span className="font-medium tabular-nums text-foreground">
            {formatAdminNumber(stats.orders)}
          </span>
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, loading, error, refetch } = useOverview();

  if (loading && !data) {
    return (
      <>
        <AdminPageHeader description={copy.description} />
        <OverviewSkeleton />
      </>
    );
  }

  // Only reached when the very first load failed; a failed refetch keeps the
  // statistics on screen and reports itself through a toast instead.
  if (!data) {
    return (
      <>
        <AdminPageHeader description={copy.description} />
        <AdminSection contentClassName="space-y-4">
          <p className="text-sm text-muted-foreground">
            {error ?? copy.loadError}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={refetch}
          >
            {loading ? adminCopy.common.loading : copy.retry}
          </Button>
        </AdminSection>
      </>
    );
  }

  const {
    summary,
    sales,
    orders_by_status,
    revenue_by_day,
    top_plants,
    low_stock,
    recent_orders,
  } = data;

  return (
    <>
      <AdminPageHeader description={copy.description} />

      <div
        aria-busy={loading}
        className={cn(
          "space-y-6 md:space-y-8",
          loading && "opacity-60 transition-opacity"
        )}
      >
        <section
          aria-label={copy.title}
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          <AdminStatCard
            label={copy.stats.plants}
            value={formatAdminNumber(summary.total_plants)}
            change={copy.stats.activePlants(summary.active_plants)}
            icon={Leaf}
          />
          <AdminStatCard
            label={copy.stats.orders}
            value={formatAdminNumber(summary.total_orders)}
            change={copy.stats.pendingOrders(summary.pending_orders)}
            icon={ShoppingBag}
          />
          <AdminStatCard
            label={copy.stats.revenue}
            value={formatAdminCurrency(summary.total_revenue, CURRENCY)}
            change={copy.stats.revenueHint}
            icon={Banknote}
          />
          <AdminStatCard
            label={copy.stats.customers}
            value={formatAdminNumber(summary.total_customers)}
            change={copy.stats.activeCustomers(summary.active_customers)}
            icon={Users}
          />
        </section>

        <AdminSection
          title={copy.sales.title}
          description={copy.sales.description}
          contentClassName="grid gap-3 sm:grid-cols-2"
        >
          <SalesPeriod label={copy.sales.today} stats={sales.today} />
          <SalesPeriod label={copy.sales.thisMonth} stats={sales.this_month} />
        </AdminSection>

        <AdminSection
          title={copy.revenue.title}
          description={copy.revenue.description}
        >
          <OverviewRevenueChart data={revenue_by_day} />
        </AdminSection>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <AdminSection
            title={copy.recentOrders.title}
            description={copy.recentOrders.description}
            action={
              <ViewAllButton
                href="/admin/orders"
                label={copy.recentOrders.viewAll}
              />
            }
            contentClassName={recent_orders.length > 0 ? "px-0" : undefined}
          >
            {recent_orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {copy.recentOrders.empty}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{copy.table.order}</TableHead>
                    <TableHead>{copy.table.customer}</TableHead>
                    <TableHead>{copy.table.total}</TableHead>
                    <TableHead>{copy.table.status}</TableHead>
                    <TableHead>{copy.table.date}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent_orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.order_number}
                      </TableCell>
                      <TableCell>
                        <span>{order.customer_name ?? EMPTY_FIELD}</span>
                        {order.customer_phone ? (
                          <span className="block text-xs text-muted-foreground">
                            {order.customer_phone}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        {formatAdminCurrency(order.total_amount, CURRENCY)}
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
          </AdminSection>

          <AdminSection
            title={copy.ordersByStatus.title}
            description={copy.ordersByStatus.description}
          >
            <OverviewStatusChart data={orders_by_status} />
          </AdminSection>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <AdminSection
            title={copy.topPlants.title}
            description={copy.topPlants.description}
            action={
              <ViewAllButton
                href="/admin/plants"
                label={copy.topPlants.viewAll}
              />
            }
            contentClassName="space-y-2"
          >
            {top_plants.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {copy.topPlants.empty}
              </p>
            ) : (
              top_plants.map((plant) => (
                <div
                  key={plant.plant_id}
                  className="flex items-center justify-between gap-3 rounded border border-border/80 bg-card px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {plant.plant_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {copy.topPlants.sold(plant.quantity_sold)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium tabular-nums text-foreground">
                    {formatAdminCurrency(plant.revenue, CURRENCY)}
                  </p>
                </div>
              ))
            )}
          </AdminSection>

          <AdminSection
            title={copy.lowStock.title}
            description={copy.lowStock.description}
            action={
              <ViewAllButton
                href="/admin/plants"
                label={copy.lowStock.viewAll}
              />
            }
            contentClassName="space-y-2"
          >
            {low_stock.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {copy.lowStock.empty}
              </p>
            ) : (
              low_stock.map((plant) => (
                <div
                  key={plant.plant_id}
                  className="flex items-center justify-between gap-3 rounded border border-border/80 bg-card px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {plant.plant_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {copy.lowStock.stock(plant.stock)}
                    </p>
                  </div>
                  <AdminStatusBadge
                    status={stockStatus(plant.stock)}
                    label={adminCopy.status[stockStatus(plant.stock)]}
                  />
                </div>
              ))
            )}
          </AdminSection>
        </div>
      </div>
    </>
  );
}
