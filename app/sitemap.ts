import type { MetadataRoute } from "next";
import { routing, type AppLocale } from "@/i18n/routing";
import { getStorefrontPlants } from "@/lib/api/storefront";
import { getAllPosts } from "@/services/blog.service";

const baseUrl = "https://ngocnganbentre.vn";

/** Matches the storefront API `page_size` cap. */
const PLANT_PAGE_SIZE = 100;

/**
 * Public static routes that exist under `app/[locale]/(store)/`.
 * `/plants` and `/categories` listing pages are not present, so they are omitted.
 */
const STATIC_PAGES = [
  { path: "", priority: 1.0 },
  { path: "/blog", priority: 0.8 },
  { path: "/about", priority: 0.6 },
] as const;

function localeUrl(locale: AppLocale, path: string): string {
  return path === "" ? `${baseUrl}/${locale}` : `${baseUrl}/${locale}${path}`;
}

function languageAlternates(path: string): Record<string, string> {
  return Object.fromEntries(
    routing.locales.map((locale) => [locale, localeUrl(locale, path)])
  );
}

function pushLocalizedEntries(
  entries: MetadataRoute.Sitemap,
  languages: Record<string, string>,
  priority: number
) {
  for (const locale of routing.locales) {
    const url = languages[locale];
    if (!url) continue;

    entries.push({
      url,
      priority,
      alternates: { languages },
    });
  }
}

async function getAllPlantSlugs(): Promise<string[]> {
  const slugs: string[] = [];
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
          slugs.push(plant.slug);
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
    return slugs;
  }

  return slugs;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of STATIC_PAGES) {
    pushLocalizedEntries(entries, languageAlternates(page.path), page.priority);
  }

  const plantSlugs = await getAllPlantSlugs();
  for (const slug of plantSlugs) {
    // Storefront list items have no reliable updatedAt; omit lastModified.
    pushLocalizedEntries(
      entries,
      languageAlternates(`/plants/${slug}`),
      0.8
    );
  }

  const postsByLocale = Object.fromEntries(
    routing.locales.map((locale) => [locale, getAllPosts(locale)])
  ) as Record<AppLocale, ReturnType<typeof getAllPosts>>;

  const blogSlugs = new Set(
    routing.locales.flatMap((locale) =>
      postsByLocale[locale].map((post) => post.slug)
    )
  );

  for (const slug of blogSlugs) {
    const languages: Record<string, string> = {};

    for (const locale of routing.locales) {
      const post = postsByLocale[locale].find((item) => item.slug === slug);
      if (!post) continue;
      languages[locale] = localeUrl(locale, `/blog/${slug}`);
    }

    // Blog frontmatter only has publication `date`, not dateModified/updatedAt.
    pushLocalizedEntries(entries, languages, 0.7);
  }

  return entries;
}
