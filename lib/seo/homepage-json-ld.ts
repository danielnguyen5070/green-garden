import { BUSINESS_HOURS, CONTACT_CONFIG } from "@/config/contact";
import { SITE_NAME, SITE_NAME_ASCII, SITE_URL } from "@/config/site";
import {
  BUSINESS_DISPLAY_NAME,
  LOCAL_BUSINESS_ID,
  WEBSITE_ID,
} from "@/lib/seo/schema-ids";

type HomepageJsonLdInput = {
  locale: string;
  name: string;
  description: string;
};

/**
 * Homepage @graph: LocalBusiness + WebSite + locale-specific WebPage.
 * LocalBusiness / WebSite identities are stable; WebPage varies by locale.
 *
 * No `aggregateRating`: shop reviews are collected and shown on our own site,
 * which Google treats as self-serving for LocalBusiness.
 */
export function buildHomepageJsonLd({
  locale,
  name,
  description,
}: HomepageJsonLdInput) {
  const pageUrl = `${SITE_URL}/${locale}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": LOCAL_BUSINESS_ID,
        name: BUSINESS_DISPLAY_NAME,
        alternateName: [SITE_NAME, SITE_NAME_ASCII],
        url: SITE_URL,
        logo: `${SITE_URL}/images/logo-mark.png`,
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
        hasMap: CONTACT_CONFIG.mapUrl,
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: BUSINESS_HOURS.days,
            opens: BUSINESS_HOURS.opens,
            closes: BUSINESS_HOURS.closes,
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
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: SITE_NAME,
        alternateName: [SITE_NAME_ASCII],
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
