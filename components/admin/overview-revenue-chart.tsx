import { adminCopy } from "@/lib/admin-copy";
import { formatAdminCurrency, formatAdminDate } from "@/lib/admin-format";
import type { RevenueByDay } from "@/types/overview";

const copy = adminCopy.dashboard.revenue;

/** Keeps the smallest earning day visible without overstating it. */
const MIN_BAR_PERCENT = 4;

type OverviewRevenueChartProps = {
  data: RevenueByDay[];
};

/** The API sends exact decimals as strings; they become numbers only to size bars. */
function toAmount(value: string): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

/** Reads the day off `YYYY-MM-DD` directly, so no timezone shifts the label. */
function dayOfMonth(date: string): string {
  const day = Number(date.slice(8, 10));
  return day > 0 ? String(day) : date;
}

function OverviewRevenueChart({ data }: OverviewRevenueChartProps) {
  const peak = Math.max(...data.map((point) => toAmount(point.revenue)), 0);

  // A month with nothing completed yet is empty, not an error.
  if (data.length === 0 || peak <= 0) {
    return <p className="text-sm text-muted-foreground">{copy.empty}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <div
        className="flex h-48 min-w-112 items-end gap-1 sm:gap-1.5"
        role="img"
        aria-label={copy.chartLabel}
      >
        {data.map((point) => {
          const amount = toAmount(point.revenue);
          const height =
            amount > 0 ? Math.max((amount / peak) * 100, MIN_BAR_PERCENT) : 0;

          return (
            <div
              key={point.date}
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
              title={copy.day(
                formatAdminDate(point.date),
                formatAdminCurrency(point.revenue, "USD")
              )}
            >
              <div className="flex h-36 w-full items-end justify-center rounded bg-muted/60 px-0.5 py-1">
                <div
                  className="w-full rounded bg-primary/80 transition-[height]"
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
                {dayOfMonth(point.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { OverviewRevenueChart };
