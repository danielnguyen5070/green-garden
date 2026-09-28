import { Fragment, type ComponentProps } from "react";
import { ChevronRightIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  /** Omitted for the current page, which is always the last item. */
  href?: ComponentProps<typeof Link>["href"];
};

/**
 * Visible trail that mirrors the page's `BreadcrumbList` JSON-LD. Hook-free so
 * it renders from both server and client components.
 */
function Breadcrumbs({
  label,
  items,
  className,
}: {
  /** Accessible name for the `<nav>` landmark. */
  label: string;
  items: BreadcrumbItem[];
  className?: string;
}) {
  const lastIndex = items.length - 1;

  return (
    <nav aria-label={label} className={cn("mb-8 md:mb-10", className)}>
      <ol className="flex flex-wrap items-center gap-1.5 font-sans text-small">
        {items.map((item, index) => (
          <Fragment key={`${index}-${item.label}`}>
            <li>
              {index === lastIndex || !item.href ? (
                <span
                  className="font-medium text-foreground"
                  aria-current={index === lastIndex ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.label}
                </Link>
              )}
            </li>
            {index < lastIndex ? (
              <li aria-hidden="true" className="text-muted-foreground/70">
                <ChevronRightIcon className="size-3.5" />
              </li>
            ) : null}
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

export { Breadcrumbs };
