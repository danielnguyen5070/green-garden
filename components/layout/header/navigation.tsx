import Link from "next/link";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/config/navigation";

function Navigation({
  className,
  orientation = "horizontal",
}: {
  className?: string;
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <nav
      aria-label="Primary"
      className={cn(className)}
      data-orientation={orientation}
    >
      <ul
        className={cn(
          "flex",
          orientation === "horizontal"
            ? "items-center gap-5 lg:gap-7"
            : "flex-col gap-1"
        )}
      >
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                "rounded-md font-sans text-sm font-medium text-foreground/90 outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                orientation === "vertical" &&
                  "block px-3 py-2.5 text-base hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export { Navigation };
