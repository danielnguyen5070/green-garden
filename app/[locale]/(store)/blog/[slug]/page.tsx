import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { formatDate } from "@/components/blog/blog-card";
import { MdxContent } from "@/components/blog/mdx-content";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import {
  getAllSlugs,
  getPostBySlug,
  getPostImage,
} from "@/services/blog.service";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;

function toIsoDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

function blogPostLanguages(slug: string): Record<string, string> {
  const languages: Record<string, string> = {};

  for (const locale of routing.locales) {
    if (getPostBySlug(locale, slug)) {
      languages[locale] = `/${locale}/blog/${slug}`;
    }
  }

  const defaultPath = languages[routing.defaultLocale];
  if (defaultPath) {
    languages["x-default"] = defaultPath;
  }

  return languages;
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getAllSlugs(locale).map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(locale, slug);

  if (!post) {
    return {};
  }

  const title = post.title;
  const description = post.description;
  const ogTitle = `${title} | Ngoc Ngan Ben Tre`;
  const path = `/${locale}/blog/${slug}`;
  const languages = blogPostLanguages(slug);
  const image = getPostImage(post);
  const imageAlt = post.ogImageAlt ?? title;
  const publishedTime = toIsoDate(post.publishedAt);
  const modifiedTime = toIsoDate(post.updatedAt) ?? publishedTime;

  return {
    title,
    description,
    authors: post.author ? [{ name: post.author }] : undefined,
    alternates: {
      canonical: path,
      languages,
    },
    openGraph: {
      title: ogTitle,
      description,
      url: path,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      alternateLocale: locale === "vi" ? ["en_US"] : ["vi_VN"],
      type: "article",
      publishedTime,
      modifiedTime,
      authors: post.author ? [post.author] : undefined,
      images: [
        {
          url: image,
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [image],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const post = getPostBySlug(locale, slug);

  if (!post) {
    notFound();
  }

  const t = await getTranslations("blog");
  const image = getPostImage(post);
  const imageAlt = post.ogImageAlt ?? post.title;

  return (
    <article
      data-slot="blog-post"
      className="bg-background py-10 md:py-12 lg:py-14"
    >
      <Container className="max-w-3xl">
        <Link
          href="/blog"
          className="inline-flex font-sans text-sm font-medium text-primary outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {t("backToBlog")}
        </Link>

        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-2 font-sans text-small text-muted-foreground">
            {post.category ? (
              <span className="rounded-md bg-secondary px-2 py-0.5 text-[0.6875rem] font-semibold tracking-wide text-secondary-foreground uppercase">
                {post.category}
              </span>
            ) : null}
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt, locale)}
            </time>
            {post.author ? <span>· {post.author}</span> : null}
          </div>

          <h1 className="mt-4 font-heading text-h2 font-bold tracking-tight text-foreground md:text-h1">
            {post.title}
          </h1>

          <p className="mt-4 font-sans text-body text-muted-foreground">
            {post.description}
          </p>

          {post.tags.length > 0 ? (
            <ul className="mt-5 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-border bg-card px-2.5 py-0.5 font-sans text-[0.6875rem] text-muted-foreground"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </header>

        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
          <Image
            src={image}
            alt={imageAlt}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>

        <div className="prose prose-lg mt-10 max-w-none prose-headings:font-heading prose-headings:tracking-tight prose-headings:text-foreground prose-p:font-sans prose-p:text-foreground/90 prose-a:text-primary prose-strong:text-foreground prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground prose-code:rounded-md prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted prose-pre:text-foreground prose-li:font-sans prose-li:text-foreground/90">
          <MdxContent source={post.content} />
        </div>
      </Container>
    </article>
  );
}
