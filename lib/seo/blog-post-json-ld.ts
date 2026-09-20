import { SITE_URL } from "@/config/site";
import { LOCAL_BUSINESS_ID, WEBSITE_ID } from "@/lib/seo/schema-ids";
import { toAbsoluteUrl, toIsoDate } from "@/lib/seo/url";
import type { BlogPost } from "@/types/blog";

type BlogPostJsonLdInput = {
  locale: string;
  post: BlogPost;
  imageUrl: string;
};

/**
 * Blog post @graph: BlogPosting with publisher linked to LocalBusiness.
 */
export function buildBlogPostJsonLd({
  locale,
  post,
  imageUrl,
}: BlogPostJsonLdInput) {
  const pageUrl = `${SITE_URL}/${locale}/blog/${post.slug}`;
  const datePublished = toIsoDate(post.publishedAt);
  const dateModified = toIsoDate(post.updatedAt) ?? datePublished;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": pageUrl,
        url: pageUrl,
        headline: post.title,
        description: post.description,
        image: [toAbsoluteUrl(imageUrl)],
        inLanguage: locale,
        ...(datePublished ? { datePublished } : {}),
        ...(dateModified ? { dateModified } : {}),
        ...(post.author
          ? {
              author: {
                "@type": "Person",
                name: post.author,
              },
            }
          : {}),
        ...(post.category ? { articleSection: post.category } : {}),
        ...(post.tags.length > 0 ? { keywords: post.tags.join(", ") } : {}),
        isPartOf: {
          "@id": WEBSITE_ID,
        },
        publisher: {
          "@id": LOCAL_BUSINESS_ID,
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": pageUrl,
        },
      },
    ],
  };
}
