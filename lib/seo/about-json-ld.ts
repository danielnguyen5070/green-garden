import { SITE_URL } from "@/config/site";
import { LOCAL_BUSINESS_ID, WEBSITE_ID } from "@/lib/seo/schema-ids";
import { toAbsoluteUrl } from "@/lib/seo/url";

type AboutJsonLdInput = {
  locale: string;
  name: string;
  description: string;
};

/**
 * About page @graph: AboutPage linked to the shared site/business entities.
 */
export function buildAboutJsonLd({
  locale,
  name,
  description,
}: AboutJsonLdInput) {
  const pageUrl = `${SITE_URL}/${locale}/about`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
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
          url: toAbsoluteUrl("/images/og-about.jpg"),
        },
      },
    ],
  };
}
