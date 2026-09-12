import { getTranslations } from "next-intl/server";
import { ShoppingBagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./language-switcher";

async function HeaderActions({ className }: { className?: string }) {
  const t = await getTranslations("common");

  return (
    <div className={cn("flex items-center gap-0.5 sm:gap-1", className)}>
      <LanguageSwitcher />

      <Button
        variant="ghost"
        size="icon"
        className="relative size-10 text-foreground hover:bg-muted hover:text-foreground"
        render={<Link href="/cart" />}
        nativeButton={false}
        aria-label={t("cart")}
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
