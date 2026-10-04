import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";
import { routing, type AppLocale } from "@/i18n/routing";
import { toIsoDate } from "@/lib/seo/url";
import {
  getAllCategorySlugs,
  getAllPlantSlugs,
} from "@/lib/storefront/catalog-slugs";
import { getAllPosts } from "@/services/blog.service";

function localeUrl(locale: AppLocale, path: string): string {
  return path === "" ? `${SITE_URL}/${locale}` : `${SITE_URL}/${locale}${path}`;
}

/** ISO strings from `toIsoDate` share one format, so they sort as text. */
function latest(dates: (string | undefined)[]): string | undefined {
  return dates.reduce<string | undefined>(
    (max, date) => (date && (!max || date > max) ? date : max),
    undefined
  );
}

/**
 * One `<url>` per locale version, each repeating the full hreflang set so
 * every version is self-describing.
 */
function localizedEntries(
  path: string,
  options: {
    locales?: readonly AppLocale[];
    lastModified?: (locale: AppLocale) => string | undefined;
  } = {}
): MetadataRoute.Sitemap {
  const locales = options.locales ?? routing.locales;
  if (locales.length === 0) return [];

  const languages: Record<string, string> = Object.fromEntries(
    locales.map((locale) => [locale, localeUrl(locale, path)])
  );
  const fallback = locales.includes(routing.defaultLocale)
    ? routing.defaultLocale
    : locales[0];
  languages["x-default"] = localeUrl(fallback, path);

  return locales.map((locale) => ({
    url: localeUrl(locale, path),
    lastModified: options.lastModified?.(locale),
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, plants] = await Promise.all([
    getAllCategorySlugs(),
    getAllPlantSlugs(),
  ]);

  const postsByLocale = Object.fromEntries(
    routing.locales.map((locale) => [locale, getAllPosts(locale)])
  ) as Record<AppLocale, ReturnType<typeof getAllPosts>>;

  const postDate = (post: ReturnType<typeof getAllPosts>[number]) =>
    toIsoDate(post.updatedAt) ?? toIsoDate(post.publishedAt);

  const plantsModified = latest(plants.map((plant) => plant.updatedAt));
  const blogModified = latest(
    routing.locales.flatMap((locale) => postsByLocale[locale].map(postDate))
  );

  // Pages without a content date omit `<lastmod>` rather than claim build time.
  const staticPages: { path: string; lastModified?: string }[] = [
    { path: "", lastModified: latest([plantsModified, blogModified]) },
    { path: "/plants", lastModified: plantsModified },
    { path: "/blog", lastModified: blogModified },
    { path: "/reviews" },
    { path: "/faq" },
    { path: "/about" },
  ];

  const entries: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
    localizedEntries(page.path, { lastModified: () => page.lastModified })
  );

  for (const category of categories) {
    entries.push(
      ...localizedEntries(`/categories/${category.slug}`, {
        lastModified: () => category.updatedAt,
      })
    );
  }

  for (const plant of plants) {
    entries.push(
      ...localizedEntries(`/plants/${plant.slug}`, {
        lastModified: () => plant.updatedAt,
      })
    );
  }

  const blogSlugs = new Set(
    routing.locales.flatMap((locale) =>
      postsByLocale[locale].map((post) => post.slug)
    )
  );

  for (const slug of blogSlugs) {
    const postByLocale = new Map(
      routing.locales.flatMap((locale) => {
        const post = postsByLocale[locale].find((item) => item.slug === slug);
        return post ? [[locale, post] as const] : [];
      })
    );

    entries.push(
      ...localizedEntries(`/blog/${slug}`, {
        locales: [...postByLocale.keys()],
        lastModified: (locale) => {
          const post = postByLocale.get(locale);
          return post ? postDate(post) : undefined;
        },
      })
    );
  }

  return entries;
}
