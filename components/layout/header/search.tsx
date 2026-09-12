import { SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function HeaderSearch({ className }: { className?: string }) {
  return (
    <div
      role="search"
      className={cn("relative w-full max-w-56 min-w-0", className)}
    >
      <SearchIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <label htmlFor="header-search" className="sr-only">
        Search plants
      </label>
      <input
        id="header-search"
        type="search"
        name="q"
        placeholder="Search plants..."
        autoComplete="off"
        className={cn(
          "h-10 w-full rounded-full border-0 bg-muted py-2 pr-3 pl-9 font-sans text-sm text-foreground outline-none placeholder:text-muted-foreground",
          "transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        )}
      />
    </div>
  );
}

export { HeaderSearch };
