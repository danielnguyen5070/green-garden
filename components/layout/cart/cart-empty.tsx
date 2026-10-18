"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart.store";
import { useRouter } from "@/i18n/navigation";

function CartEmpty() {
  const t = useTranslations("cart");
  const router = useRouter();
  const closeCart = useCartStore((state) => state.closeCart);

  function handleShopPlants() {
    closeCart();
    router.push("/plants");
  }

  return (
    <div
      data-slot="cart-empty"
      className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center"
    >
      <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
        {t("empty")}
      </h3>
      <p className="mt-2 max-w-xs font-sans text-sm text-muted-foreground">
        {t("emptyDescription")}
      </p>
      <Button
        type="button"
        className="mt-6 h-10 rounded-xl px-5 font-sans"
        onClick={handleShopPlants}
      >
        {t("shopPlants")}
      </Button>
    </div>
  );
}

export { CartEmpty };
