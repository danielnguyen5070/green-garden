import { routing, type AppLocale } from "@/i18n/routing";
import { getStorefrontPlants } from "@/lib/api/storefront";
import { getAllPosts } from "@/services/blog.service";

const BASE_URL = "https://ngocnganbentre.vn";
const PLANT_PAGE_SIZE = 100;

type SitemapEntry = {
  loc: string;
  priority: string;
  lastmod?: string;
};

const STATIC_PAGES: ReadonlyArray<{ path: string; priority: string }> = [
  { path: "", priority: "1.00" },
  { path: "/blog", priority: "0.80" },
  { path: "/about", priority: "0.60" },
];

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function localeUrl(locale: AppLocale, path: string): string {
  return path === "" ? `${BASE_URL}/${locale}` : `${BASE_URL}/${locale}${path}`;
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
    return slugs;
  }

  return slugs;
}

async function buildEntries(): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = [];
  const seen = new Set<string>();

  function push(entry: SitemapEntry) {
    if (seen.has(entry.loc)) return;
    seen.add(entry.loc);
    entries.push(entry);
  }

  for (const page of STATIC_PAGES) {
    for (const locale of routing.locales) {
      push({
        loc: localeUrl(locale, page.path),
        priority: page.priority,
      });
    }
  }

  const plantSlugs = await getAllPlantSlugs();
  for (const slug of plantSlugs) {
    for (const locale of routing.locales) {
      push({
        loc: localeUrl(locale, `/plants/${slug}`),
        priority: "0.80",
      });
    }
  }

  for (const locale of routing.locales) {
    for (const post of getAllPosts(locale)) {
      // Frontmatter only exposes publication `date`, not dateModified/updatedAt.
      push({
        loc: localeUrl(locale, `/blog/${post.slug}`),
        priority: "0.70",
      });
    }
  }

  return entries;
}

function renderSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map((entry) => {
      const lines = [
        "  <url>",
        `    <loc>${escapeXml(entry.loc)}</loc>`,
      ];

      if (entry.lastmod) {
        lines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
      }

      lines.push(`    <priority>${escapeXml(entry.priority)}</priority>`);
      lines.push("  </url>");
      return lines.join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    "<urlset",
    '  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
    '  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9',
    '    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
}

export async function GET() {
  const entries = await buildEntries();
  const xml = renderSitemapXml(entries);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
