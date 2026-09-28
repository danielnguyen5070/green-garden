import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRightIcon } from "lucide-react";
import { BlogCard } from "@/components/blog/blog-card";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { getAllPosts } from "@/services/blog.service";

const HOME_GUIDES_LIMIT = 3;

async function LatestGuidesSection({ className }: { className?: string }) {
  const [t, tBlog, locale] = await Promise.all([
    getTranslations("home.guides"),
    getTranslations("blog"),
    getLocale(),
  ]);
  const posts = getAllPosts(locale).slice(0, HOME_GUIDES_LIMIT);

  if (posts.length === 0) {
    return null;
  }

  return (
    <section
      data-slot="home-guides"
      aria-labelledby="home-guides-heading"
      className={cn("bg-background py-8 md:py-10", className)}
    >
      <Container>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h2
              id="home-guides-heading"
              className="font-heading text-h3 font-bold tracking-tight text-foreground md:text-h2"
            >
              {t("title")}
            </h2>
            <p className="mt-2 font-sans text-body text-muted-foreground">
              {t("description")}
            </p>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="h-11 w-fit shrink-0 rounded-xl border-border bg-card px-5 font-sans text-sm text-foreground shadow-subtle hover:bg-card hover:text-foreground"
            render={<Link href="/blog" />}
            nativeButton={false}
          >
            {t("viewAll")}
            <ArrowRightIcon data-icon="inline-end" className="size-4" />
          </Button>
        </div>

        <ul className="mt-8 grid list-none grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.slug} className="min-w-0">
              <BlogCard
                post={post}
                locale={locale}
                readMoreLabel={tBlog("readMore")}
                titleAs="h3"
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export { LatestGuidesSection };
