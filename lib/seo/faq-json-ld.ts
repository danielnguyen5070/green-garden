import { SITE_URL } from "@/config/site";
import { LOCAL_BUSINESS_ID, WEBSITE_ID } from "@/lib/seo/schema-ids";
import { toAbsoluteUrl } from "@/lib/seo/url";

export type FaqJsonLdItem = {
  question: string;
  answer: string;
};

type FaqJsonLdInput = {
  locale: string;
  name: string;
  description: string;
  items: FaqJsonLdItem[];
};

/**
 * FAQ page @graph: FAQPage with Question/Answer entities for rich results.
 */
export function buildFaqJsonLd({
  locale,
  name,
  description,
  items,
}: FaqJsonLdInput) {
  const pageUrl = `${SITE_URL}/${locale}/faq`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
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
          url: toAbsoluteUrl("/images/og-faq.jpg"),
        },
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}
