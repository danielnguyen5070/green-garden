/**
 * Generates `/public/llms.txt` and `/public/llms-full.txt` from existing
 * site config, MDX blog posts, and the storefront plants API.
 *
 * Run: `npx tsx scripts/generate-llms.ts`
 * Or:  `npm run generate:llms`
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { CONTACT_CONFIG } from "../config/contact";
import { SITE_NAME, SITE_URL } from "../config/site";
import { getApiUrl } from "../lib/api/config";

type PlantListItem = {
  slug: string;
  name: string;
  name_vi: string | null;
  description: string | null;
  description_vi: string | null;
  category?: { name: string; name_vi: string | null; slug: string } | null;
};

type PlantListResponse = {
  items: PlantListItem[];
  page: number;
  page_size: number;
  total: number;
};

type BlogMeta = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  category: string;
  locale: string;
};

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const BLOG_ROOT = path.join(ROOT, "content/blog");
const LOCALES = ["vi", "en"] as const;
const PLANT_PAGE_SIZE = 100;

function plantDisplayName(plant: PlantListItem): string {
  return (plant.name_vi?.trim() || plant.name).trim();
}

function plantDescription(plant: PlantListItem): string {
  return (plant.description_vi?.trim() || plant.description?.trim() || "").trim();
}

function categoryName(plant: PlantListItem): string {
  const category = plant.category;
  if (!category) return "";
  return (category.name_vi?.trim() || category.name).trim();
}

async function fetchAllPlants(): Promise<PlantListItem[]> {
  const items: PlantListItem[] = [];
  let page = 1;
  let total = Number.POSITIVE_INFINITY;

  while ((page - 1) * PLANT_PAGE_SIZE < total) {
    const url = new URL(getApiUrl("/storefront/plants"));
    url.searchParams.set("page", String(page));
    url.searchParams.set("page_size", String(PLANT_PAGE_SIZE));

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch plants (${response.status}): ${url.toString()}`
      );
    }

    const data = (await response.json()) as PlantListResponse;
    items.push(...data.items);
    total = data.total;

    if (data.items.length === 0) break;
    page += 1;
  }

  return items.filter((plant) => Boolean(plant.slug));
}

function readBlogPosts(locale: string): BlogMeta[] {
  const dir = path.join(BLOG_ROOT, locale);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data } = matter(raw);
      const slug = file.replace(/\.mdx$/, "");
      return {
        slug,
        title: String(data.title ?? slug),
        description: String(data.description ?? ""),
        publishedAt: String(data.publishedAt ?? data.date ?? ""),
        category: String(data.category ?? ""),
        locale,
      };
    })
    .sort((a, b) => {
      return (
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    });
}

function link(label: string, url: string, note?: string): string {
  return note ? `- [${label}](${url}): ${note}` : `- [${label}](${url})`;
}

function buildLlmsTxt(plants: PlantListItem[], postsVi: BlogMeta[]): string {
  const lines: string[] = [
    `# ${SITE_NAME}`,
    "",
    `> Cây giống Ngọc Ngân Bến Tre (Ngọc Ngân Bến Tre) — nursery selling seedlings, fruit trees, and ornamental plants from Cái Mơn – Chợ Lách. Healthy stock, careful packing, nationwide delivery in Vietnam. Site: ${SITE_URL}. Languages: Vietnamese (\`/vi\`) and English (\`/en\`). Default locale: \`vi\`.`,
    "",
    "Contact is by Zalo or SMS (no voice calls). Cash on delivery and bank transfer are accepted. Orders do not require an account.",
    "",
    "## Main pages",
    "",
    link(
      "Trang chủ (vi)",
      `${SITE_URL}/vi`,
      "Homepage catalog of seedlings and featured plants"
    ),
    link("Home (en)", `${SITE_URL}/en`, "English homepage"),
    link(
      "Giới thiệu",
      `${SITE_URL}/vi/about`,
      "About Ngọc Ngân Bến Tre nursery"
    ),
    link("About", `${SITE_URL}/en/about`, "About page (English)"),
    link(
      "Câu hỏi thường gặp",
      `${SITE_URL}/vi/faq`,
      "Ordering, shipping, COD, packing, and plant care FAQ"
    ),
    link("FAQ", `${SITE_URL}/en/faq`, "FAQ (English)"),
    link(
      "Đánh giá",
      `${SITE_URL}/vi/reviews`,
      "Customer reviews of plants, packing, and service"
    ),
    link("Reviews", `${SITE_URL}/en/reviews`, "Customer reviews (English)"),
    link("Blog", `${SITE_URL}/vi/blog`, "Growing guides and nursery articles"),
    link("Blog (en)", `${SITE_URL}/en/blog`, "Blog index (English)"),
    link("Tìm kiếm", `${SITE_URL}/vi/search`, "Search plants and blog posts"),
    link("Sitemap", `${SITE_URL}/sitemap.xml`, "Machine-readable URL list"),
    "",
    "## Plant / product pages",
    "",
  ];

  if (plants.length === 0) {
    lines.push(
      `- Plant detail URLs follow \`${SITE_URL}/{locale}/plants/{slug}\` (catalog loaded from the storefront API).`
    );
  } else {
    for (const plant of plants) {
      const name = plantDisplayName(plant);
      const noteParts = [
        categoryName(plant),
        plantDescription(plant).slice(0, 120),
      ].filter(Boolean);
      lines.push(
        link(
          name,
          `${SITE_URL}/vi/plants/${plant.slug}`,
          noteParts.join(" — ") || undefined
        )
      );
    }
  }

  lines.push("", "## Blog pages", "");

  for (const post of postsVi) {
    lines.push(
      link(
        post.title,
        `${SITE_URL}/vi/blog/${post.slug}`,
        post.description || undefined
      )
    );
  }

  lines.push(
    "",
    "## Optional",
    "",
    link(
      "Full LLM context",
      `${SITE_URL}/llms-full.txt`,
      "Longer business, catalog, FAQ, and content summary"
    ),
    link("Cart", `${SITE_URL}/vi/cart`, "Shopping cart"),
    link("Checkout", `${SITE_URL}/vi/checkout`, "Checkout (phone, name, address)"),
    link("Facebook", CONTACT_CONFIG.facebookUrl),
    link("TikTok", CONTACT_CONFIG.tiktokUrl),
    link("YouTube", CONTACT_CONFIG.youtubeUrl),
    link("Zalo", CONTACT_CONFIG.zaloUrl, `Phone ${CONTACT_CONFIG.phone}`)
  );

  return `${lines.join("\n")}\n`;
}

function buildLlmsFullTxt(
  plants: PlantListItem[],
  postsByLocale: Record<(typeof LOCALES)[number], BlogMeta[]>
): string {
  const lines: string[] = [
    `# ${SITE_NAME} — full context`,
    "",
    `> Detailed LLM-oriented summary of Ngọc Ngân Bến Tre (${SITE_URL}): business facts, storefront routes, plant catalog entries from the live API, and blog posts from the site content. Do not invent products or policies beyond what is listed here.`,
    "",
    "## Business information",
    "",
    `- Legal / brand names: Cây giống Ngọc Ngân Bến Tre; alternateName Ngọc Ngân Bến Tre; English site name ${SITE_NAME}.`,
    "- Business type: Local nursery selling seedlings (cây giống), fruit trees (cây ăn trái), and ornamental plants (hoa kiểng), sourced from Cái Mơn – Chợ Lách.",
    `- Website: ${SITE_URL}`,
    `- Phone / Zalo / SMS: ${CONTACT_CONFIG.phone} (${CONTACT_CONFIG.phoneE164}); Zalo ${CONTACT_CONFIG.zaloUrl}`,
    `- Email: ${CONTACT_CONFIG.email}`,
    `- Address: ${CONTACT_CONFIG.address} (street: 618/34 ấp Bình Tây; locality: Vĩnh Thành; region: Vĩnh Long; country: VN; postal code 86000)`,
    "- Map: https://www.google.com/maps/place/C%C3%A2y+gi%E1%BB%91ng+Ng%E1%BB%8Dc+Ng%C3%A2n+B%E1%BA%BFn+Tre/@10.2212835,106.2300361,17z",
    "- Coordinates: latitude 10.2212835, longitude 106.2300361",
    "- Area served: Vietnam (nationwide shipping)",
    "- Currencies accepted: VND",
    "- Payment accepted: Cash on Delivery, Bank Transfer",
    "- Opening hours (published schema): every day 00:00–23:59",
    `- Social: Facebook ${CONTACT_CONFIG.facebookUrl}; TikTok ${CONTACT_CONFIG.tiktokUrl}; YouTube ${CONTACT_CONFIG.youtubeUrl}`,
    "- Locales: Vietnamese (`vi`, default) and English (`en`). URLs always include a locale prefix.",
    "",
    "## About the nursery (from site copy)",
    "",
    "Ngọc Ngân Bến Tre sells and supplies seedlings, selecting healthy plants of the correct variety and sharing growing experience from the home garden. Stock is associated with Cái Mơn – Chợ Lách nurseries; grafted seedlings are used so fruit traits match the mother plant. The nursery packs root balls carefully and ships via Vietnam Post (Bưu điện) or J&T Express, typically arriving in 3–5 business days.",
    "",
    "## Useful policies (from FAQ)",
    "",
    "- No account required to order; phone, name, and shipping address are enough.",
    "- Orders can also be placed via Zalo 0386569374.",
    "- Free shipping from 500.000₫; otherwise a fixed 50.000₫ shipping fee.",
    "- Free shipping unlock threshold and fee are shown in the order summary before placing an order.",
    "- Change or cancel is possible before the order is packed and shipped; contact Zalo with the order code.",
    "- After delivery: open the box, untie stems, place in bright shade, keep the root ball moist, rest 3–5 days before planting.",
    "- Typical seedling height when shipped: about 40–80 cm depending on variety (see each product page).",
    "",
    "## Important storefront URLs",
    "",
    link("Homepage VI", `${SITE_URL}/vi`),
    link("Homepage EN", `${SITE_URL}/en`),
    link("About VI", `${SITE_URL}/vi/about`),
    link("About EN", `${SITE_URL}/en/about`),
    link("FAQ VI", `${SITE_URL}/vi/faq`),
    link("FAQ EN", `${SITE_URL}/en/faq`),
    link("Reviews VI", `${SITE_URL}/vi/reviews`),
    link("Reviews EN", `${SITE_URL}/en/reviews`),
    link("Blog index VI", `${SITE_URL}/vi/blog`),
    link("Blog index EN", `${SITE_URL}/en/blog`),
    link("Search VI", `${SITE_URL}/vi/search`),
    link("Search EN", `${SITE_URL}/en/search`),
    link("Cart VI", `${SITE_URL}/vi/cart`),
    link("Checkout VI", `${SITE_URL}/vi/checkout`),
    link("Sitemap", `${SITE_URL}/sitemap.xml`),
    link("Robots", `${SITE_URL}/robots.txt`),
    link("Concise llms.txt", `${SITE_URL}/llms.txt`),
    "",
    "## Plant / product catalog",
    "",
    `Plant pages use absolute URLs of the form \`${SITE_URL}/{locale}/plants/{slug}\`. Names and descriptions below come from \`GET /api/v1/storefront/plants\` at generation time.`,
    "",
  ];

  if (plants.length === 0) {
    lines.push(
      "No plant items were available from the API when this file was generated."
    );
  } else {
    for (const plant of plants) {
      const name = plantDisplayName(plant);
      const description = plantDescription(plant);
      const category = categoryName(plant);
      const notes = [
        category ? `Category: ${category}` : "",
        description,
      ]
        .filter(Boolean)
        .join(". ");

      lines.push(link(name, `${SITE_URL}/vi/plants/${plant.slug}`, notes || undefined));
      lines.push(
        link(
          `${name} (en)`,
          `${SITE_URL}/en/plants/${plant.slug}`,
          plant.name !== name ? `English name: ${plant.name}` : undefined
        )
      );
    }
  }

  lines.push("", "## Blog posts", "");

  for (const locale of LOCALES) {
    const posts = postsByLocale[locale];
    lines.push(`### ${locale.toUpperCase()}`, "");
    if (posts.length === 0) {
      lines.push("No posts.", "");
      continue;
    }
    for (const post of posts) {
      const note = [post.category, post.description, post.publishedAt]
        .filter(Boolean)
        .join(" — ");
      lines.push(
        link(
          post.title,
          `${SITE_URL}/${locale}/blog/${post.slug}`,
          note || undefined
        )
      );
    }
    lines.push("");
  }

  lines.push(
    "## Notes for agents",
    "",
    "- Prefer Vietnamese URLs (`/vi/...`) for local customers; English mirrors exist under `/en/...`.",
    "- Product availability, price, and stock change; always confirm on the live plant page.",
    "- Admin routes under `/admin/` are private and not part of the public storefront.",
    `- This file pairs with the shorter overview at ${SITE_URL}/llms.txt.`,
    ""
  );

  return `${lines.join("\n")}\n`;
}

async function main() {
  let plants: PlantListItem[] = [];
  try {
    plants = await fetchAllPlants();
    console.log(`Loaded ${plants.length} plant(s) from storefront API.`);
  } catch (error) {
    console.warn(
      "Plant catalog unavailable; generating URL sections without plant items."
    );
    console.warn(error instanceof Error ? error.message : error);
  }

  const postsByLocale = {
    vi: readBlogPosts("vi"),
    en: readBlogPosts("en"),
  };

  fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  const llmsTxt = buildLlmsTxt(plants, postsByLocale.vi);
  const llmsFullTxt = buildLlmsFullTxt(plants, postsByLocale);

  fs.writeFileSync(path.join(PUBLIC_DIR, "llms.txt"), llmsTxt, "utf8");
  fs.writeFileSync(path.join(PUBLIC_DIR, "llms-full.txt"), llmsFullTxt, "utf8");

  console.log("Wrote public/llms.txt");
  console.log("Wrote public/llms-full.txt");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
