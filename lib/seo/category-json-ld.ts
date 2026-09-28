import { SITE_URL } from "@/config/site";
import { WEBSITE_ID } from "@/lib/seo/schema-ids";

type CategoryJsonLdInput = {
  locale: string;
  slug: string;
  name: string;
  description: string;
  homeLabel: string;
  plantsLabel: string;
};

/**
 * Category page @graph: CollectionPage + BreadcrumbList
 * (Home → Plants → Category). Site entities are referenced by @id only.
 */
export function buildCategoryJsonLd({
  locale,
  slug,
  name,
  description,
  homeLabel,
  plantsLabel,
}: CategoryJsonLdInput) {
  const pageUrl = `${SITE_URL}/${locale}/categories/${slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": pageUrl,
        url: pageUrl,
        name,
        description,
        inLanguage: locale,
        isPartOf: {
          "@id": WEBSITE_ID,
        },
        breadcrumb: {
          "@id": `${pageUrl}#breadcrumb`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: homeLabel,
            item: `${SITE_URL}/${locale}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: plantsLabel,
            item: `${SITE_URL}/${locale}/plants`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name,
            item: pageUrl,
          },
        ],
      },
    ],
  };
}
