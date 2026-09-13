export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  cover: string;
};

export type BlogPost = BlogPostMeta & {
  content: string;
};
