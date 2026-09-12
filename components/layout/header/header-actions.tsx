import Link from "next/link";
import { CircleUserRoundIcon, ShoppingBagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function HeaderActions({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5 sm:gap-1", className)}>
      <Button
        variant="ghost"
        size="icon"
        className="relative size-10 text-foreground hover:bg-muted hover:text-foreground"
        render={<Link href="/cart" />}
        nativeButton={false}
        aria-label="Cart"
      >
        <ShoppingBagIcon className="size-[1.15rem] stroke-[1.5]" />
        <span
          aria-hidden="true"
          className="absolute top-2 right-2 size-1.5 rounded-full bg-accent"
        />
      </Button>
    </div>
  );
}

export { HeaderActions };
