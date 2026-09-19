export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  category: string;
  tags: string[];
  /** Social / article image. Falls back to legacy `cover` when parsing. */
  ogImage?: string;
  ogImageAlt?: string;
};

export type BlogPost = BlogPostMeta & {
  content: string;
};
