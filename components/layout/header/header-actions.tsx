import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./language-switcher";
import { CartButton } from "@/components/cart/cart-button";
import { CartDrawer } from "@/components/cart/cart-drawer";

function HeaderActions({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5 sm:gap-1", className)}>
      <Suspense fallback={<div className="h-10 w-10" aria-hidden="true" />}>
        <LanguageSwitcher />
      </Suspense>
      <CartButton />
      <CartDrawer />
    </div>
  );
}

export { HeaderActions };
