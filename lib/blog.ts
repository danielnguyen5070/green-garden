import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { hasLocale } from "next-intl";
import { z } from "zod";
import { routing } from "@/i18n/routing";
import type { BlogPost, BlogPostMeta } from "@/types/blog";

const BLOG_ROOT = path.join(process.cwd(), "content/blog");
const DEFAULT_OG_IMAGE = "/images/blog/placeholder.svg";

function getBlogDir(locale: string) {
  if (!hasLocale(routing.locales, locale)) {
    return null;
  }

  const dir = path.join(BLOG_ROOT, locale);
  if (!fs.existsSync(dir)) {
    return null;
  }

  return dir;
}

function getMdxFileNames(locale: string): string[] {
  const dir = getBlogDir(locale);
  if (!dir) return [];

  return fs.readdirSync(dir).filter((file) => file.endsWith(".mdx"));
}

function toSlug(fileName: string) {
  return fileName.replace(/\.mdx$/, "");
}

const optionalFrontmatterString = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return undefined;
  return String(value);
}, z.string().optional());

const blogFrontmatterSchema = z.object({
  title: z.preprocess((v) => (v == null ? undefined : String(v)), z.string().optional()),
  description: z.preprocess(
    (v) => (v == null ? undefined : String(v)),
    z.string().optional()
  ),
  publishedAt: z.unknown().optional(),
  date: z.unknown().optional(),
  updatedAt: optionalFrontmatterString,
  author: z.preprocess((v) => (v == null ? undefined : String(v)), z.string().optional()),
  category: z.preprocess(
    (v) => (v == null ? undefined : String(v)),
    z.string().optional()
  ),
  tags: z.unknown().optional(),
  ogImage: optionalFrontmatterString,
  cover: optionalFrontmatterString,
  ogImageAlt: optionalFrontmatterString,
});

function parsePost(locale: string, fileName: string): BlogPost | null {
  const dir = getBlogDir(locale);
  if (!dir) return null;

  const fullPath = path.join(dir, fileName);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = blogFrontmatterSchema.parse(data);

  const slug = toSlug(fileName);
  const publishedAt = String(
    frontmatter.publishedAt ?? frontmatter.date ?? ""
  );
  const ogImage = frontmatter.ogImage ?? frontmatter.cover;

  return {
    slug,
    title: frontmatter.title ?? slug,
    description: frontmatter.description ?? "",
    publishedAt,
    updatedAt: frontmatter.updatedAt,
    author: frontmatter.author ?? "",
    category: frontmatter.category ?? "",
    tags: Array.isArray(frontmatter.tags)
      ? frontmatter.tags.map(String)
      : [],
    ogImage,
    ogImageAlt: frontmatter.ogImageAlt,
    content,
  };
}

/** Image URL for cards and article hero (placeholder when unset). */
export function getPostImage(post: BlogPostMeta): string {
  return post.ogImage ?? DEFAULT_OG_IMAGE;
}

export function getAllSlugs(locale: string): string[] {
  return getMdxFileNames(locale).map(toSlug);
}

export function getAllPosts(locale: string): BlogPostMeta[] {
  return getMdxFileNames(locale)
    .map((fileName) => {
      const post = parsePost(locale, fileName);
      if (!post) return null;

      const { content: _content, ...meta } = post;
      return meta;
    })
    .filter((post): post is BlogPostMeta => post !== null)
    .sort((a, b) => {
      const aTime = new Date(a.publishedAt).getTime();
      const bTime = new Date(b.publishedAt).getTime();
      return bTime - aTime;
    });
}

export function getPostBySlug(locale: string, slug: string): BlogPost | null {
  if (!slug || slug.includes("/") || slug.includes("..")) {
    return null;
  }

  return parsePost(locale, `${slug}.mdx`);
}

function postMatchesQuery(post: BlogPost, query: string): boolean {
  const haystack = [
    post.title,
    post.description,
    post.content,
    post.category,
    ...post.tags,
  ]
    .join("\n")
    .toLowerCase();

  return haystack.includes(query);
}

/**
 * Case-insensitive partial search over locale-specific MDX posts.
 * Matches title, description, body, category, and tags.
 */
export function searchPosts(locale: string, query: string): BlogPostMeta[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return getMdxFileNames(locale)
    .map((fileName) => parsePost(locale, fileName))
    .filter((post): post is BlogPost => {
      return post !== null && postMatchesQuery(post, normalized);
    })
    .map((post) => {
      const { content: _content, ...meta } = post;
      return meta;
    })
    .sort((a, b) => {
      const aTime = new Date(a.publishedAt).getTime();
      const bTime = new Date(b.publishedAt).getTime();
      return bTime - aTime;
    });
}
