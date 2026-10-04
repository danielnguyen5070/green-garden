"use client";

import { useLocale, useTranslations } from "next-intl";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_LINKS } from "@/config/navigation";
import { Link } from "@/i18n/navigation";
import { localizeText } from "@/lib/storefront";
import { getCatalogHref } from "@/lib/storefront/catalog";
import type { StorefrontCategory } from "@/types/storefront";
import { Logo } from "./logo";

function MobileMenu({ categories }: { categories: StorefrontCategory[] }) {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-10 text-foreground hover:bg-muted md:hidden"
            aria-label={tCommon("openMenu")}
          />
        }
      >
        <MenuIcon className="size-5 stroke-[1.5]" />
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[min(100%,20rem)] bg-background p-0"
      >
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="sr-only">{tCommon("menu")}</SheetTitle>
          <Logo />
        </SheetHeader>

        <nav aria-label="Mobile" className="px-2 py-3">
          <ul className="flex flex-col gap-0.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <SheetClose
                  render={
                    <Link
                      href={link.href}
                      className="block rounded-md px-3 py-2.5 font-sans text-base font-medium text-foreground outline-none transition-colors hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  }
                >
                  {tNav(link.labelKey)}
                </SheetClose>
                {"withCategories" in link && categories.length > 0 ? (
                  <ul
                    aria-label={tNav("categoriesLabel")}
                    className="mb-1 ml-3 flex flex-col gap-0.5 border-l border-border pl-2"
                  >
                    <li>
                      <SheetClose
                        render={
                          <Link
                            href="/plants"
                            className="block rounded-md px-3 py-2 font-sans text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        }
                      >
                        {tNav("allPlants")}
                      </SheetClose>
                    </li>
                    {categories.map((category) => (
                      <li key={category.id}>
                        <SheetClose
                          render={
                            <Link
                              href={getCatalogHref(category.slug, 1)}
                              className="block rounded-md px-3 py-2 font-sans text-sm text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                            />
                          }
                        >
                          {localizeText(category.name, category.name_vi, locale)}
                        </SheetClose>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto border-t border-border px-5 py-4">
          <SheetClose
            render={
              <Button
                variant="ghost"
                className="h-10 w-full justify-start px-3 font-medium"
                type="button"
                aria-label={tCommon("account")}
              />
            }
          >
            {tCommon("account")}
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { MobileMenu };
