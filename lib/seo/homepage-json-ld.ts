import { CONTACT_CONFIG } from "@/config/contact";
import { SITE_NAME, SITE_URL } from "@/config/site";
import {
  BUSINESS_DISPLAY_NAME,
  LOCAL_BUSINESS_ID,
  WEBSITE_ID,
} from "@/lib/seo/schema-ids";
import type { StorefrontReviewSummary } from "@/types/storefront-review";

type HomepageJsonLdInput = {
  locale: string;
  name: string;
  description: string;
  /**
   * Shop-level review summary from the storefront reviews API (same source as
   * the reviews UI). Omit or pass null when there are no approved reviews.
   */
  reviewSummary?: StorefrontReviewSummary | null;
};

/**
 * Homepage @graph: LocalBusiness + WebSite + locale-specific WebPage.
 * LocalBusiness / WebSite identities are stable; WebPage varies by locale.
 *
 * `aggregateRating` is attached to LocalBusiness only when real shop reviews
 * exist — never fabricated, never attached to Product.
 */
export function buildHomepageJsonLd({
  locale,
  name,
  description,
  reviewSummary = null,
}: HomepageJsonLdInput) {
  const pageUrl = `${SITE_URL}/${locale}`;

  const aggregateRating =
    reviewSummary &&
    reviewSummary.total_reviews > 0 &&
    Number.isFinite(reviewSummary.average_rating)
      ? {
          "@type": "AggregateRating" as const,
          ratingValue: reviewSummary.average_rating,
          bestRating: 5,
          worstRating: 1,
          ratingCount: reviewSummary.total_reviews,
          reviewCount: reviewSummary.total_reviews,
        }
      : null;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": LOCAL_BUSINESS_ID,
        name: BUSINESS_DISPLAY_NAME,
        alternateName: "Ngọc Ngân Bến Tre",
        url: SITE_URL,
        logo: `${SITE_URL}/images/logo-mark2.png`,
        image: [`${SITE_URL}/images/og-home.jpg`],
        description:
          "Cơ sở kinh doanh cây giống và hoa kiểng các loại. Cây giống, cây ăn trái và hoa kiểng từ Cái Mơn – Chợ Lách. Cây khỏe, đóng gói cẩn thận, giao toàn quốc.",
        telephone: CONTACT_CONFIG.phoneE164,
        email: CONTACT_CONFIG.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: "618/34 ấp Bình Tây",
          addressLocality: "Vĩnh Thành",
          addressRegion: "Vĩnh Long",
          postalCode: "86000",
          addressCountry: "VN",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 10.2212835,
          longitude: 106.2300361,
        },
        hasMap:
          "https://www.google.com/maps/place/C%C3%A2y+gi%E1%BB%91ng+Ng%E1%BB%8Dc+Ng%C3%A2n+B%E1%BA%BFn+Tre/@10.2212835,106.2300361,17z",
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "00:00",
            closes: "23:59",
          },
        ],
        sameAs: [
          CONTACT_CONFIG.facebookUrl,
          CONTACT_CONFIG.tiktokUrl,
          CONTACT_CONFIG.youtubeUrl,
          CONTACT_CONFIG.zaloUrl,
        ],
        areaServed: {
          "@type": "Country",
          name: "Vietnam",
        },
        publicAccess: true,
        currenciesAccepted: "VND",
        paymentAccepted: "Cash on Delivery, Bank Transfer",
        ...(aggregateRating ? { aggregateRating } : {}),
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: SITE_NAME,
        alternateName: "Ngọc Ngân Bến Tre",
        url: SITE_URL,
        description:
          "Cây giống, cây ăn trái và hoa kiểng từ Cái Mơn – Chợ Lách. Cây khỏe, đóng gói cẩn thận, giao toàn quốc.",
        inLanguage: ["vi", "en"],
        publisher: {
          "@id": LOCAL_BUSINESS_ID,
        },
      },
      {
        "@type": "WebPage",
        "@id": pageUrl,
        url: pageUrl,
        name,
        description,
        inLanguage: locale,
        isPartOf: {
          "@id": WEBSITE_ID,
        },
        about: {
          "@id": LOCAL_BUSINESS_ID,
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          "@id": `${pageUrl}#primaryimage`,
          url: `${SITE_URL}/images/og-home.jpg`,
        },
      },
    ],
  };
}
