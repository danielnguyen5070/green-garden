import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { SproutIcon } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { localizeOptionalText, localizeText } from "@/lib/storefront";
import { getCatalogHref } from "@/lib/storefront/catalog";
import { getNavCategories } from "@/lib/storefront/get-nav-categories";
import { cn } from "@/lib/utils";

const SKELETON_CARDS = [0, 1, 2, 3] as const;

const sectionClassName = "bg-background py-8 md:py-10";
const headingClassName =
  "font-heading text-h3 font-bold tracking-tight text-foreground md:text-h2";
const gridClassName =
  "mt-8 grid list-none grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6";

/** Admins may paste any https image URL; only Cloudinary is in `remotePatterns`. */
function isOptimizableImage(src: string): boolean {
  try {
    return new URL(src).hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

async function ShopByCategorySkeleton() {
  const t = await getTranslations("home.categories");

  return (
    <section
      data-slot="home-categories"
      aria-labelledby="home-categories-heading"
      className={sectionClassName}
    >
      <Container>
        <h2 id="home-categories-heading" className={headingClassName}>
          {t("title")}
        </h2>
        <Skeleton className="mt-3 h-5 w-full max-w-md rounded-md" />
        <ul className={gridClassName}>
          {SKELETON_CARDS.map((index) => (
            <li key={index}>
              <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
              <Skeleton className="mt-4 h-5 w-2/3 rounded-md" />
              <Skeleton className="mt-2 h-4 w-full rounded-md" />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/**
 * Homepage entry point to every `/categories/{slug}` page, so category
 * listings are linked from the strongest page on the site.
 */
async function ShopByCategorySection({ className }: { className?: string }) {
  const [t, locale, categories] = await Promise.all([
    getTranslations("home.categories"),
    getLocale(),
    getNavCategories(),
  ]);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section
      data-slot="home-categories"
      aria-labelledby="home-categories-heading"
      className={cn(sectionClassName, className)}
    >
      <Container>
        <h2 id="home-categories-heading" className={headingClassName}>
          {t("title")}
        </h2>
        <p className="mt-3 max-w-2xl font-sans text-body text-muted-foreground">
          {t("description")}
        </p>

        <ul className={gridClassName}>
          {categories.map((category) => {
            const name = localizeText(category.name, category.name_vi, locale);
            const description = localizeOptionalText(
              category.description,
              category.description_vi,
              locale
            );
            const image = category.image_url?.trim();

            return (
              <li key={category.id} className="min-w-0">
                <Link
                  href={getCatalogHref(category.slug, 1)}
                  className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                    {image ? (
                      <Image
                        src={image}
                        alt=""
                        fill
                        unoptimized={!isOptimizableImage(image)}
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground/60">
                        <SproutIcon
                          aria-hidden="true"
                          className="size-10 stroke-[1.25]"
                        />
                      </div>
                    )}
                  </div>
                  <h3 className="mt-4 font-sans text-base font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                    {name}
                  </h3>
                  {description ? (
                    <p className="mt-1 line-clamp-2 font-sans text-small text-muted-foreground">
                      {description}
                    </p>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

export { ShopByCategorySection, ShopByCategorySkeleton };
