import { getLocale, getTranslations } from "next-intl/server";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { HoverMenu } from "@/components/layout/header/hover-menu";
import { NAV_LINKS } from "@/config/navigation";
import { Link } from "@/i18n/navigation";
import { localizeText } from "@/lib/storefront";
import { getCatalogHref } from "@/lib/storefront/catalog";
import type { StorefrontCategory } from "@/types/storefront";

const topLinkClassName =
  "rounded-md font-sans text-sm font-medium text-foreground/90 outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const panelLinkClassName =
  "block rounded-md px-3 py-2 font-sans text-sm text-foreground outline-none transition-colors hover:bg-muted hover:text-primary focus-visible:bg-muted focus-visible:text-primary";

/**
 * Opens on hover/focus with CSS, so every category link ships in the server
 * HTML rather than appearing after a client-side open.
 */
function CategoriesMenu({
  label,
  allLabel,
  listLabel,
  categories,
  locale,
}: {
  label: string;
  allLabel: string;
  listLabel: string;
  categories: StorefrontCategory[];
  locale: string;
}) {
  return (
    <HoverMenu className="relative">
      <Link
        href="/plants"
        className={cn(topLinkClassName, "inline-flex items-center gap-1")}
      >
        {label}
        <ChevronDownIcon
          aria-hidden="true"
          className="size-3.5 stroke-[1.75] transition-transform duration-200 group-focus-within:rotate-180 group-hover:rotate-180 group-data-closed:!rotate-0"
        />
      </Link>

      <div className="invisible absolute top-full left-0 z-50 pt-3 opacity-0 transition-[opacity,visibility] duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100 group-data-closed:!invisible group-data-closed:!opacity-0">
        <ul
          aria-label={listLabel}
          className="min-w-56 rounded-xl bg-popover p-1.5 text-popover-foreground shadow-md ring-1 ring-foreground/10"
        >
          <li>
            <Link
              href="/plants"
              className={cn(panelLinkClassName, "font-medium")}
            >
              {allLabel}
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={getCatalogHref(category.slug, 1)}
                className={panelLinkClassName}
              >
                {localizeText(category.name, category.name_vi, locale)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </HoverMenu>
  );
}

async function Navigation({
  categories,
  className,
}: {
  categories: StorefrontCategory[];
  className?: string;
}) {
  const [t, locale] = await Promise.all([getTranslations("nav"), getLocale()]);

  return (
    <nav aria-label="Primary" className={cn(className)}>
      <ul className="flex items-center gap-5 lg:gap-7">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            {"withCategories" in link && categories.length > 0 ? (
              <CategoriesMenu
                label={t(link.labelKey)}
                allLabel={t("allPlants")}
                listLabel={t("categoriesLabel")}
                categories={categories}
                locale={locale}
              />
            ) : (
              <Link href={link.href} className={topLinkClassName}>
                {t(link.labelKey)}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export { Navigation };
