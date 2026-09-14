import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AdminSectionProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

function AdminSection({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: AdminSectionProps) {
  return (
    <Card data-slot="admin-section" className={cn("shadow-none", className)}>
      <CardHeader className="border-b">
        <CardTitle className="text-base font-semibold md:text-lg">
          {title}
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent className={cn("pt-(--card-spacing)", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

export { AdminSection };
