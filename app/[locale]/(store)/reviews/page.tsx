import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { ReviewsSection } from "@/components/reviews/reviews-section";
import { SITE_NAME } from "@/config/site";
import { routing } from "@/i18n/routing";
import {
  STOREFRONT_REVIEWS_PAGE_SIZE,
  getAllStorefrontReviews,
  getStorefrontReviews,
} from "@/lib/api/storefront";
import { resolveReviewSummary } from "@/lib/reviews";
import type {
  StorefrontReview,
  StorefrontReviewSummary,
} from "@/types/storefront-review";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reviews.metadata" });

  const title = t("title");
  const description = t("description");
  const path = `/${locale}/reviews`;
  const languages = {
    vi: "/vi/reviews",
    en: "/en/reviews",
    "x-default": `/${routing.defaultLocale}/reviews`,
  };

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: t("keywords"),
    alternates: {
      canonical: path,
      languages,
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      alternateLocale: locale === "vi" ? ["en_US"] : ["vi_VN"],
      type: "website",
      images: [
        {
          url: "/images/og-home.jpg",
          width: 1200,
          height: 630,
          alt: t("ogImageAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/og-home.jpg"],
    },
  };
}

async function loadReviewsPageData(): Promise<{
  reviews: StorefrontReview[];
  total: number;
  summary: StorefrontReviewSummary;
  error: boolean;
}> {
  try {
    const page = await getStorefrontReviews({
      page: 1,
      page_size: STOREFRONT_REVIEWS_PAGE_SIZE,
    });

    const hasApiSummary =
      typeof page.average_rating === "number" &&
      page.rating_distribution != null;

    const allForSummary = hasApiSummary
      ? null
      : await getAllStorefrontReviews().catch(() => page.items);

    const summary = resolveReviewSummary(
      page,
      allForSummary ?? page.items
    );

    return {
      reviews: page.items,
      total: page.total,
      summary,
      error: false,
    };
  } catch {
    return {
      reviews: [],
      total: 0,
      summary: {
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
      error: true,
    };
  }
}

export default async function ReviewsPage() {
  const t = await getTranslations("reviews");
  const { reviews, total, summary, error } = await loadReviewsPageData();

  return (
    <section
      data-slot="reviews-page"
      aria-labelledby="reviews-heading"
      className="bg-background py-10 md:py-12 lg:py-14"
    >
      <Container>
        {error ? (
          <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-subtle">
            <h1
              id="reviews-heading"
              className="font-heading text-h3 font-bold tracking-tight text-foreground md:text-h2"
            >
              {t("title")}
            </h1>
            <p className="mx-auto mt-3 max-w-md font-sans text-body text-muted-foreground">
              {t("errors.unavailable")}
            </p>
          </div>
        ) : (
          <ReviewsSection
            initialReviews={reviews}
            initialTotal={total}
            summary={summary}
          />
        )}
      </Container>
    </section>
  );
}
