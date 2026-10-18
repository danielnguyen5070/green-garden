import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const statusStyles: Record<string, string> = {
  active: "bg-success/15 text-success border-transparent",
  inactive: "bg-muted text-muted-foreground border-transparent",
  published: "bg-success/15 text-success border-transparent",
  delivered: "bg-success/15 text-success border-transparent",
  completed: "bg-success/15 text-success border-transparent",
  paid: "bg-success/15 text-success border-transparent",
  processing: "bg-primary/10 text-primary border-transparent",
  shipped: "bg-primary/10 text-primary border-transparent",
  shipping: "bg-primary/10 text-primary border-transparent",
  confirmed: "bg-primary/10 text-primary border-transparent",
  scheduled: "bg-primary/10 text-primary border-transparent",
  pending: "bg-warning/15 text-warning border-transparent",
  approved: "bg-success/15 text-success border-transparent",
  rejected: "bg-destructive/10 text-destructive border-transparent",
  low_stock: "bg-warning/15 text-warning border-transparent",
  draft: "bg-muted text-muted-foreground border-transparent",
  cancelled: "bg-destructive/10 text-destructive border-transparent",
  out_of_stock: "bg-destructive/10 text-destructive border-transparent",
  refunded: "bg-destructive/10 text-destructive border-transparent",
};

type AdminStatusBadgeProps = {
  status: string;
  label: string;
  className?: string;
};

function AdminStatusBadge({ status, label, className }: AdminStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(statusStyles[status] ?? statusStyles.draft, className)}
    >
      {label}
    </Badge>
  );
}

export { AdminStatusBadge };
