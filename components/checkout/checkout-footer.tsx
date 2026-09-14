import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { LogoMark } from "@/components/layout/header/logo";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

async function CheckoutFooter({ className }: { className?: string }) {
  const t = await getTranslations("checkout.footer");
  const year = new Date().getFullYear();

  const links = [
    { href: "/#privacy", labelKey: "privacy" as const },
    { href: "/#terms", labelKey: "terms" as const },
    { href: "/#help", labelKey: "help" as const },
  ];

  return (
    <footer
      data-slot="checkout-footer"
      className={cn("mt-auto bg-card", className)}
    >
      <Container className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:py-7">
        <div className="flex items-center gap-2.5">
          <LogoMark className="size-5 opacity-60" />
          <p className="font-sans text-small text-muted-foreground">
            {t("copyright", { year })}
          </p>
        </div>

        <nav aria-label={t("navLabel")}>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:justify-end">
            {links.map((link) => (
              <li key={link.labelKey}>
                <Link
                  href={link.href}
                  className="font-sans text-small text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {t(link.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </footer>
  );
}

export { CheckoutFooter };
