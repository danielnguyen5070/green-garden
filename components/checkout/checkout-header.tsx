import { getTranslations } from "next-intl/server";
import { ShieldCheckIcon } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/header/logo";
import { cn } from "@/lib/utils";

async function CheckoutHeader({ className }: { className?: string }) {
  const t = await getTranslations("checkout.secure");

  return (
    <header
      data-slot="checkout-header"
      className={cn(
        "border-b border-border/70 bg-background",
        className,
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4 md:h-[4.25rem]">
        <Logo />
        <p className="inline-flex items-center gap-1.5 font-sans text-small text-muted-foreground">
          <ShieldCheckIcon
            className="size-3.5 text-primary stroke-[1.5]"
            aria-hidden="true"
          />
          <span className="hidden sm:inline">{t("title")}</span>
        </p>
      </Container>
    </header>
  );
}

export { CheckoutHeader };
