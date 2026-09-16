import { AdminSection } from "@/components/admin/admin-section";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { adminCopy } from "@/lib/admin-copy";
import { ORDER_STATUSES } from "@/types/order";

const copy = adminCopy.dashboard;

/** Matches the loaded card and row counts so nothing jumps when data lands. */
const STAT_CARDS = 4;
const LIST_ROWS = 5;

function rows(count: number): number[] {
  return Array.from({ length: count }, (_, index) => index);
}

/** Stands in for the "View all" buttons, keeping the header grid identical. */
function ActionSkeleton() {
  return <Skeleton className="h-7 w-16" />;
}

function ListRowsSkeleton() {
  return (
    <div className="space-y-2">
      {rows(LIST_ROWS).map((row) => (
        <div
          key={row}
          className="flex items-center justify-between gap-3 rounded border border-border/80 bg-card px-3 py-2.5"
        >
          <div className="min-w-0 space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

/**
 * Placeholder for the first dashboard load. It keeps the real section headers
 * so only the figures fade in, and never shows a stand-in `0`.
 */
function OverviewSkeleton() {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {rows(STAT_CARDS).map((card) => (
          <Card key={card} className="shadow-none" size="sm">
            <CardContent className="flex items-start justify-between gap-3 pt-(--card-spacing)">
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="size-10 shrink-0 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      <AdminSection
        title={copy.sales.title}
        description={copy.sales.description}
        contentClassName="grid gap-3 sm:grid-cols-2"
      >
        {rows(2).map((period) => (
          <div
            key={period}
            className="space-y-3 rounded border border-border/80 bg-card px-3 py-2.5"
          >
            <Skeleton className="h-3 w-20" />
            <div className="flex items-end justify-between gap-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </AdminSection>

      <AdminSection
        title={copy.revenue.title}
        description={copy.revenue.description}
      >
        <Skeleton className="h-48 w-full" />
      </AdminSection>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <AdminSection
          title={copy.recentOrders.title}
          description={copy.recentOrders.description}
          action={<ActionSkeleton />}
        >
          <div className="space-y-3">
            {rows(LIST_ROWS).map((row) => (
              <Skeleton key={row} className="h-9 w-full" />
            ))}
          </div>
        </AdminSection>

        <AdminSection
          title={copy.ordersByStatus.title}
          description={copy.ordersByStatus.description}
        >
          <div className="space-y-3">
            {rows(ORDER_STATUSES.length).map((row) => (
              <div key={row} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </AdminSection>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminSection
          title={copy.topPlants.title}
          description={copy.topPlants.description}
          action={<ActionSkeleton />}
        >
          <ListRowsSkeleton />
        </AdminSection>

        <AdminSection
          title={copy.lowStock.title}
          description={copy.lowStock.description}
          action={<ActionSkeleton />}
        >
          <ListRowsSkeleton />
        </AdminSection>
      </div>
    </>
  );
}

export { OverviewSkeleton };
