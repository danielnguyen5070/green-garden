import { EyeIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getPathPageviews } from "@/lib/vercel-web-analytics";
import { cn } from "@/lib/utils";

/**
 * Lifetime views of this plant page in this locale. Render inside `Suspense`:
 * it waits on Vercel Web Analytics and renders nothing when that is
 * unavailable.
 */
async function PlantPageViews({
  locale,
  slug,
  className,
}: {
  locale: string;
  /** Canonical `plant.slug`, matching the URL Web Analytics recorded. */
  slug: string;
  className?: string;
}) {
  const [t, views] = await Promise.all([
    getTranslations("plantDetail"),
    getPathPageviews(`/${locale}/plants/${slug}`),
  ]);

  if (!views.available || views.pageviews == null) {
    return null;
  }

  return (
    <p
      data-slot="plant-page-views"
      className={cn(
        "inline-flex items-center gap-1.5 font-sans text-small text-muted-foreground",
        className
      )}
      title={t("pageViewsPeriod")}
    >
      <EyeIcon aria-hidden="true" className="size-4 stroke-[1.75]" />
      {t("pageViews", { count: views.pageviews })}
    </p>
  );
}

export { PlantPageViews };
