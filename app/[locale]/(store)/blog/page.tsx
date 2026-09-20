import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BlogCard } from "@/components/blog/blog-card";
import { Container } from "@/components/layout/container";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_NAME } from "@/config/site";
import { routing } from "@/i18n/routing";
import { buildBlogIndexJsonLd } from "@/lib/seo/blog-index-json-ld";
import { getAllPosts } from "@/services/blog.service";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });

  const title = t("title");
  const description = t("description");
  const ogTitle = `${title} | ${SITE_NAME}`;
  const path = `/${locale}/blog`;
  const languages = {
    vi: "/vi/blog",
    en: "/en/blog",
    "x-default": `/${routing.defaultLocale}/blog`,
  };

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages,
    },
    openGraph: {
      title: ogTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      alternateLocale: locale === "vi" ? ["en_US"] : ["vi_VN"],
      type: "website",
    },
    twitter: {
      card: "summary",
      title: ogTitle,
      description,
    },
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("blog");
  const posts = getAllPosts(locale);
  const jsonLd = buildBlogIndexJsonLd({
    locale,
    name: t("title"),
    description: t("description"),
    posts,
  });

  return (
    <>
      <JsonLd data={jsonLd} />
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
    </>
  );
}
