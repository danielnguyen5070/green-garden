import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

type AdminStatCardProps = {
  label: string;
  value: string;
  /** Secondary line under the value, such as a related total or a delta. */
  change?: string;
  /** Omit when the figure has no direction to report; no arrow is drawn. */
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  className?: string;
};

function AdminStatCard({
  label,
  value,
  change,
  trend,
  icon: Icon,
  className,
}: AdminStatCardProps) {
  const TrendIcon =
    trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;

  return (
    <Card
      data-slot="admin-stat-card"
      className={cn("shadow-none", className)}
      size="sm"
    >
      <CardContent className="flex items-start justify-between gap-3 pt-(--card-spacing)">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <p className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {change ? (
            <p
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium",
                trend === "up" && "text-success",
                trend === "down" && "text-destructive",
                (trend === "neutral" || !trend) && "text-muted-foreground"
              )}
            >
              {trend ? (
                <TrendIcon className="size-3.5" aria-hidden="true" />
              ) : null}
              <span>{change}</span>
            </p>
          ) : null}
        </div>
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded bg-primary/10 text-primary"
          aria-hidden="true"
        >
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export { AdminStatCard };
