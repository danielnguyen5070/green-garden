import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import type { BlogPost, BlogPostMeta } from "@/types/blog";

const BLOG_ROOT = path.join(process.cwd(), "content/blog");

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

  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date: String(data.date ?? ""),
    author: String(data.author ?? ""),
    category: String(data.category ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    cover: String(data.cover ?? "/images/blog/placeholder.svg"),
    content,
  };
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
      const aTime = new Date(a.date).getTime();
      const bTime = new Date(b.date).getTime();
      return bTime - aTime;
    });
}

export function getPostBySlug(locale: string, slug: string): BlogPost | null {
  if (!slug || slug.includes("/") || slug.includes("..")) {
    return null;
  }

  return parsePost(locale, `${slug}.mdx`);
}
