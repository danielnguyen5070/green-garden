import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { hasLocale } from "next-intl";
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

function optionalString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return String(value);
}

function parsePost(locale: string, fileName: string): BlogPost | null {
  const dir = getBlogDir(locale);
  if (!dir) return null;

  const fullPath = path.join(dir, fileName);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);

  const slug = toSlug(fileName);
  const publishedAt = String(data.publishedAt ?? data.date ?? "");
  const ogImage = optionalString(data.ogImage ?? data.cover);

  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    publishedAt,
    updatedAt: optionalString(data.updatedAt),
    author: String(data.author ?? ""),
    category: String(data.category ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    ogImage,
    ogImageAlt: optionalString(data.ogImageAlt),
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
