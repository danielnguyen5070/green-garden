import {
  Banknote,
  Leaf,
  ShoppingBag,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import statsData from "@/data/admin/stats.json";
import ordersData from "@/data/admin/orders.json";
import plantsData from "@/data/admin/plants.json";
import salesData from "@/data/admin/sales.json";
import { adminCopy } from "@/lib/admin-copy";
import {
  formatAdminCurrency,
  formatAdminDate,
  formatAdminNumber,
} from "@/lib/admin-format";
import type {
  AdminOrder,
  AdminPlant,
  AdminSalesPoint,
  AdminStat,
} from "@/types/admin";

const iconMap: Record<AdminStat["icon"], LucideIcon> = {
  leaf: Leaf,
  "shopping-bag": ShoppingBag,
  banknote: Banknote,
  users: Users,
};

const statLabels = {
  plants: adminCopy.dashboard.stats.plants,
  orders: adminCopy.dashboard.stats.orders,
  revenue: adminCopy.dashboard.stats.revenue,
  customers: adminCopy.dashboard.stats.customers,
} as const;

const statChanges = {
  plantsChange: adminCopy.dashboard.stats.plantsChange,
  ordersChange: adminCopy.dashboard.stats.ordersChange,
  revenueChange: adminCopy.dashboard.stats.revenueChange,
  customersChange: adminCopy.dashboard.stats.customersChange,
} as const;

export default function AdminDashboardPage() {
  const stats = statsData as AdminStat[];
  const recentOrders = (ordersData as AdminOrder[]).slice(0, 5);
  const inventory = (plantsData as AdminPlant[]).slice(0, 6);
  const sales = salesData as AdminSalesPoint[];
  const maxSales = Math.max(...sales.map((point) => point.value), 1);

  return (
    <>
      <AdminPageHeader
        title={adminCopy.dashboard.title}
        description={adminCopy.dashboard.description}
      />

      <section
        aria-label={adminCopy.dashboard.title}
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat) => {
          const value =
            stat.format === "currency"
              ? formatAdminCurrency(stat.value)
              : formatAdminNumber(stat.value);

          return (
            <AdminStatCard
              key={stat.id}
              label={statLabels[stat.id]}
              value={value}
              change={statChanges[stat.changeKey as keyof typeof statChanges]}
              trend={stat.trend}
              icon={iconMap[stat.icon]}
            />
          );
        })}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <AdminSection
          title={adminCopy.dashboard.recentOrders.title}
          description={adminCopy.dashboard.recentOrders.description}
          action={
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/admin/orders" />}
            >
              {adminCopy.dashboard.recentOrders.viewAll}
            </Button>
          }
          contentClassName="px-0"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{adminCopy.dashboard.table.order}</TableHead>
                <TableHead>{adminCopy.dashboard.table.customer}</TableHead>
                <TableHead className="text-right">
                  {adminCopy.dashboard.table.items}
                </TableHead>
                <TableHead className="text-right">
                  {adminCopy.dashboard.table.total}
                </TableHead>
                <TableHead>{adminCopy.dashboard.table.status}</TableHead>
                <TableHead>{adminCopy.dashboard.table.date}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell className="text-right">{order.items}</TableCell>
                  <TableCell className="text-right">
                    {formatAdminCurrency(order.total)}
                  </TableCell>
                  <TableCell>
                    <AdminStatusBadge
                      status={order.status}
                      label={adminCopy.status[order.status]}
                    />
                  </TableCell>
                  <TableCell>{formatAdminDate(order.date)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AdminSection>

        <AdminSection
          title={adminCopy.dashboard.inventory.title}
          description={adminCopy.dashboard.inventory.description}
          action={
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/admin/plants" />}
            >
              {adminCopy.dashboard.inventory.viewAll}
            </Button>
          }
          contentClassName="space-y-2"
        >
          {inventory.map((plant) => (
            <div
              key={plant.id}
              className="flex items-center justify-between gap-3 rounded border border-border/80 bg-card px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {plant.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {adminCopy.dashboard.inventory.stock(plant.stock)}
                </p>
              </div>
              <AdminStatusBadge
                status={plant.status}
                label={adminCopy.status[plant.status]}
              />
            </div>
          ))}
        </AdminSection>
      </div>

      <AdminSection
        title={adminCopy.dashboard.sales.title}
        description={adminCopy.dashboard.sales.description}
      >
        <div
          className="flex h-48 items-end gap-2 sm:gap-3"
          role="img"
          aria-label={adminCopy.dashboard.sales.title}
        >
          {sales.map((point) => (
            <div
              key={point.label}
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <div className="flex h-36 w-full items-end justify-center rounded bg-muted/60 px-1.5 py-2">
                <div
                  className="w-full max-w-10 rounded bg-primary/80 transition-[height]"
                  style={{
                    height: `${Math.max((point.value / maxSales) * 100, 8)}%`,
                  }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {point.label}
              </span>
            </div>
          ))}
        </div>
      </AdminSection>
    </>
  );
}
