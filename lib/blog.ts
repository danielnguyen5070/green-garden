import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { BlogPost, BlogPostMeta } from "@/types/blog";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

function ensureBlogDir() {
  if (!fs.existsSync(BLOG_DIR)) {
    return false;
  }
  return true;
}

function getMdxFileNames(): string[] {
  if (!ensureBlogDir()) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".mdx"));
}

function toSlug(fileName: string) {
  return fileName.replace(/\.mdx$/, "");
}

function parsePost(fileName: string): BlogPost | null {
  const fullPath = path.join(BLOG_DIR, fileName);

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

export function getAllSlugs(): string[] {
  return getMdxFileNames().map(toSlug);
}

export function getAllPosts(): BlogPostMeta[] {
  return getMdxFileNames()
    .map((fileName) => {
      const post = parsePost(fileName);
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

export function getPostBySlug(slug: string): BlogPost | null {
  if (!slug || slug.includes("/") || slug.includes("..")) {
    return null;
  }

  return parsePost(`${slug}.mdx`);
}
