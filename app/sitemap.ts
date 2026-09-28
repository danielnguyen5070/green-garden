import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";
import { routing, type AppLocale } from "@/i18n/routing";
import {
  getStorefrontCategories,
  getStorefrontPlants,
} from "@/lib/api/storefront";
import { toIsoDate } from "@/lib/seo/url";
import { getAllPosts } from "@/services/blog.service";

/** Matches the storefront API `page_size` cap. */
const PLANT_PAGE_SIZE = 100;

type DatedSlug = {
  slug: string;
  updatedAt: string | undefined;
};

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

async function getAllCategories(): Promise<DatedSlug[]> {
  try {
    const { items } = await getStorefrontCategories();
    return items
      .filter((category) => Boolean(category.slug))
      .map((category) => ({
        slug: category.slug,
        updatedAt: toIsoDate(category.updated_at),
      }));
  } catch {
    // Catalog may be unavailable at build time; keep the remaining URLs.
    return [];
  }
}

async function getAllPlants(): Promise<DatedSlug[]> {
  const plants: DatedSlug[] = [];
  let page = 1;
  let total = Number.POSITIVE_INFINITY;

  try {
    while ((page - 1) * PLANT_PAGE_SIZE < total) {
      const response = await getStorefrontPlants({
        page,
        page_size: PLANT_PAGE_SIZE,
      });

      for (const plant of response.items) {
        if (plant.slug) {
          plants.push({
            slug: plant.slug,
            updatedAt: toIsoDate(plant.updated_at),
          });
        }
      }

      total = response.total;

      if (response.items.length === 0) {
        break;
      }

      page += 1;
    }
  } catch {
    // Catalog may be unavailable at build time; keep static + blog URLs.
    return plants;
  }

  return plants;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, plants] = await Promise.all([
    getAllCategories(),
    getAllPlants(),
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
