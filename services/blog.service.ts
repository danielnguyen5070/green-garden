/**
 * Blog access layer.
 * Currently backed by local MDX files via `lib/blog`.
 * Swap this for an API later without rewriting page UI.
 */
export {
  getAllPosts,
  getAllSlugs,
  getPostBySlug,
  getPostImage,
} from "@/lib/blog";
