import type { MetadataRoute } from "next";
import { routing, type AppLocale } from "@/i18n/routing";
import { getStorefrontPlants } from "@/lib/api/storefront";
import { getAllPosts } from "@/services/blog.service";

const baseUrl = "https://www.ngocnganbentre.vn";

/** Matches the storefront API `page_size` cap. */
const PLANT_PAGE_SIZE = 100;

const STATIC_PAGES = [
  { path: "", priority: 1 },
  { path: "/blog", priority: 0.8 },
  { path: "/reviews", priority: 0.7 },
  { path: "/about", priority: 0.6 },
] as const;

function localeUrl(locale: AppLocale, path: string): string {
  return path === "" ? `${baseUrl}/${locale}` : `${baseUrl}/${locale}${path}`;
}

function entry(
  path: string,
  priority: number,
  languages?: Record<string, string>
): MetadataRoute.Sitemap[number] {
  const alternates = languages ?? {
    vi: localeUrl("vi", path),
    en: localeUrl("en", path),
  };

  const url =
    alternates[routing.defaultLocale] ?? Object.values(alternates)[0];

  return {
    url,
    priority,
    alternates: { languages: alternates },
  };
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
    entries.push(entry(page.path, page.priority));
  }

  const plantSlugs = await getAllPlantSlugs();
  for (const slug of plantSlugs) {
    entries.push(entry(`/plants/${slug}`, 0.8));
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

    if (Object.keys(languages).length === 0) continue;

    entries.push(entry(`/blog/${slug}`, 0.7, languages));
  }

  return entries;
}
