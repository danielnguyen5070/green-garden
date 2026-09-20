import { SITE_URL } from "@/config/site";
import { LOCAL_BUSINESS_ID, WEBSITE_ID } from "@/lib/seo/schema-ids";
import type { BlogPostMeta } from "@/types/blog";

type BlogIndexJsonLdInput = {
  locale: string;
  name: string;
  description: string;
  posts: BlogPostMeta[];
};

/**
 * Blog index @graph: CollectionPage + ItemList of posts.
 * Publisher/site entities are referenced by @id only (defined on the homepage).
 */
export function buildBlogIndexJsonLd({
  locale,
  name,
  description,
  posts,
}: BlogIndexJsonLdInput) {
  const pageUrl = `${SITE_URL}/${locale}/blog`;
  const itemListId = `${pageUrl}#blogpostlist`;

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
        about: {
          "@id": LOCAL_BUSINESS_ID,
        },
        mainEntity: {
          "@id": itemListId,
        },
      },
      {
        "@type": "ItemList",
        "@id": itemListId,
        numberOfItems: posts.length,
        itemListElement: posts.map((post, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${SITE_URL}/${locale}/blog/${post.slug}`,
          name: post.title,
        })),
      },
    ],
  };
}
