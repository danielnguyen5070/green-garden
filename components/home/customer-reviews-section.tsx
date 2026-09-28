import { getTranslations } from "next-intl/server";
import { ArrowRightIcon } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ReviewCard } from "@/components/reviews/review-card";
import { ReviewStars } from "@/components/reviews/review-stars";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { loadStorefrontReviewPreview } from "@/lib/reviews";
import { cn } from "@/lib/utils";

/** Three on desktop; the third is hidden on the two-column tablet grid. */
export const HOME_REVIEWS_LIMIT = 3;

const SKELETON_CARDS = Array.from(
  { length: HOME_REVIEWS_LIMIT },
  (_, index) => index
);

const sectionClassName = "bg-background py-8 md:py-10";
const headingClassName =
  "font-heading text-h3 font-bold tracking-tight text-foreground md:text-h2";
const gridClassName =
  "mt-8 grid list-none grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3";

async function CustomerReviewsSkeleton() {
  const t = await getTranslations("home.reviews");

  return (
    <section
      data-slot="home-reviews"
      aria-labelledby="home-reviews-heading"
      className={sectionClassName}
    >
      <Container>
        <h2 id="home-reviews-heading" className={headingClassName}>
          {t("title")}
        </h2>
        <Skeleton className="mt-3 h-5 w-full max-w-md rounded-md" />
        <ul className={gridClassName}>
          {SKELETON_CARDS.map((index) => (
            <li
              key={index}
              className={cn(index === 2 && "sm:max-lg:hidden")}
            >
              <Skeleton className="h-48 w-full rounded-2xl" />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/**
 * Homepage teaser for `/reviews`: overall rating plus the newest reviews.
 * Visible content only — the rating is intentionally not in homepage JSON-LD.
 */
async function CustomerReviewsSection({ className }: { className?: string }) {
  const [t, tReviews, preview] = await Promise.all([
    getTranslations("home.reviews"),
    getTranslations("reviews"),
    loadStorefrontReviewPreview(HOME_REVIEWS_LIMIT),
  ]);

  // Secondary content: hide instead of showing an error or an empty state.
  if (
    !preview ||
    preview.summary.total_reviews === 0 ||
    preview.reviews.length === 0
  ) {
    return null;
  }

  const { summary, reviews } = preview;
  const rating = summary.average_rating.toFixed(1);

  return (
    <section
      data-slot="home-reviews"
      aria-labelledby="home-reviews-heading"
      className={cn(sectionClassName, className)}
    >
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h2 id="home-reviews-heading" className={headingClassName}>
              {t("title")}
            </h2>
            <p className="mt-2 font-sans text-body text-muted-foreground">
              {t("description")}
            </p>
          </div>

          <div
            data-slot="home-reviews-summary"
            className="flex shrink-0 items-center gap-4"
          >
            <p className="font-heading text-3xl font-bold tracking-tight text-foreground tabular-nums">
              <span aria-hidden="true">{t("ratingValue", { rating })}</span>
              <span className="sr-only">
                {tReviews("averageRatingLabel", { rating })}
              </span>
            </p>
            <div>
              <ReviewStars rating={summary.average_rating} size="lg" />
              <p className="mt-1.5 font-sans text-small text-muted-foreground">
                {tReviews("basedOn", { count: summary.total_reviews })}
              </p>
            </div>
          </div>
        </div>

        <ul className={gridClassName}>
          {reviews.map((review, index) => (
            <li
              key={review.id}
              className={cn(index === 2 && "sm:max-lg:hidden")}
            >
              <ReviewCard
                review={review}
                className="h-full"
                bodyClassName="line-clamp-5"
              />
            </li>
          ))}
        </ul>

        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            className="h-12 rounded-xl border-border bg-card px-6 font-sans text-sm text-foreground shadow-subtle hover:bg-card hover:text-foreground"
            render={<Link href="/reviews" />}
            nativeButton={false}
          >
            {t("cta")}
            <ArrowRightIcon data-icon="inline-end" className="size-4" />
          </Button>
        </div>
      </Container>
    </section>
  );
}

export { CustomerReviewsSection, CustomerReviewsSkeleton };
