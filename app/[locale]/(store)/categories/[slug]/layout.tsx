import { notFound } from "next/navigation";
import { getCategoryBySlugOrNull } from "@/lib/storefront/get-category-by-slug";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

/**
 * Resolve the category above `loading.tsx` so an unknown slug returns a real
 * 404 status instead of a streamed soft 404.
 */
export default async function CategoryLayout({ children, params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlugOrNull(slug);

  if (!category) {
    notFound();
  }

  return children;
}
