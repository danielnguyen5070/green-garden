"use client";

import { useTranslations } from "next-intl";
import { ShoppingBagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart.store";
import { cn } from "@/lib/utils";

function CartButton({ className }: { className?: string }) {
  const t = useTranslations("common");
  const openCart = useCartStore((state) => state.openCart);
  const totalItems = useCartStore((state) => state.totalItems());
  const hasHydrated = useCartStore((state) => state.hasHydrated);

  const count = hasHydrated ? totalItems : 0;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "relative size-10 text-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
      aria-label={t("cartWithCount", { count })}
      onClick={openCart}
    >
      <ShoppingBagIcon className="size-[1.15rem] stroke-[1.5]" />
      {count > 0 ? (
        <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-sans text-[0.625rem] font-semibold text-primary-foreground tabular-nums">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Button>
  );
}

export { CartButton };
