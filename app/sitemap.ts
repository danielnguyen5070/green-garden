import type { MetadataRoute } from "next";
import { routing, type AppLocale } from "@/i18n/routing";
import { getStorefrontPlants } from "@/lib/api/storefront";
import { getAllPosts } from "@/services/blog.service";

const baseUrl = "https://ngocnganbentre.vn";

/** Matches the storefront API `page_size` cap. */
const PLANT_PAGE_SIZE = 100;

/** Public static routes that exist under `app/[locale]/(store)/`. */
const STATIC_PATHS = ["", "/about", "/blog"] as const;

function localeUrl(locale: AppLocale, path: string): string {
  return path === "" ? `${baseUrl}/${locale}` : `${baseUrl}/${locale}${path}`;
}

function languageAlternates(path: string): Record<string, string> {
  return Object.fromEntries(
    routing.locales.map((locale) => [locale, localeUrl(locale, path)])
  );
}

function toLastModified(date: string): Date | undefined {
  if (!date) return undefined;

  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
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

  for (const path of STATIC_PATHS) {
    const languages = languageAlternates(path);
    entries.push({
      url: languages[routing.defaultLocale],
      alternates: { languages },
    });
  }

  const plantSlugs = await getAllPlantSlugs();
  for (const slug of plantSlugs) {
    const path = `/plants/${slug}`;
    const languages = languageAlternates(path);
    entries.push({
      url: languages[routing.defaultLocale],
      alternates: { languages },
    });
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
    let lastModified: Date | undefined;

    for (const locale of routing.locales) {
      const post = postsByLocale[locale].find((item) => item.slug === slug);
      if (!post) continue;

      languages[locale] = localeUrl(locale, `/blog/${slug}`);

      const postModified = toLastModified(post.date);
      if (
        postModified &&
        (!lastModified || postModified.getTime() > lastModified.getTime())
      ) {
        lastModified = postModified;
      }
    }

    const url =
      languages[routing.defaultLocale] ?? Object.values(languages)[0];

    if (!url) continue;

    entries.push({
      url,
      ...(lastModified ? { lastModified } : {}),
      alternates: { languages },
    });
  }

  return entries;
}
