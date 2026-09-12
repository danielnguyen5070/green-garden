"use client";

import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOCALE_LABELS } from "@/config/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(nextLocale: AppLocale) {
    if (nextLocale === locale) return;
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-10 min-w-10 px-2.5 font-sans text-xs font-semibold tracking-wide text-foreground hover:bg-muted",
              className
            )}
            aria-label={t("language")}
          />
        }
      >
        {LOCALE_LABELS[locale as AppLocale]}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-24">
        {routing.locales.map((item) => (
          <DropdownMenuItem
            key={item}
            className={cn(
              "cursor-pointer font-sans text-sm font-medium",
              item === locale && "bg-muted"
            )}
            onClick={() => switchLocale(item)}
          >
            {LOCALE_LABELS[item]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { LanguageSwitcher };
