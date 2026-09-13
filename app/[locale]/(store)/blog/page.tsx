import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { BlogCard } from "@/components/blog/blog-card";
import { getAllPosts } from "@/services/blog.service";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("blog");
  const posts = getAllPosts(locale);

  return (
    <section
      data-slot="blog-list"
      aria-labelledby="blog-list-heading"
      className="bg-background py-10 md:py-12 lg:py-14"
    >
      <Container>
        <header className="max-w-2xl">
          <h1
            id="blog-list-heading"
            className="font-heading text-h3 font-bold tracking-tight text-foreground md:text-h2"
          >
            {t("title")}
          </h1>
          <p className="mt-3 font-sans text-body text-muted-foreground">
            {t("description")}
          </p>
        </header>

        {posts.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard
                key={post.slug}
                post={post}
                locale={locale}
                readMoreLabel={t("readMore")}
              />
            ))}
          </div>
        ) : (
          <p className="mt-10 font-sans text-body text-muted-foreground">
            {t("empty")}
          </p>
        )}
      </Container>
    </section>
  );
}
