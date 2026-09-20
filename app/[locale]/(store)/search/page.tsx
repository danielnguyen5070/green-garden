import { Suspense } from "react";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { SearchForm } from "@/components/search/search-form";
import {
  BlogSearchResults,
  ProductSearchResults,
  ProductSearchSkeleton,
} from "@/components/search/search-results";
import { routing, type AppLocale } from "@/i18n/routing";
import { searchPosts } from "@/services/blog.service";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
};

function readQuery(raw: string | string[] | undefined): string {
  if (typeof raw === "string") return raw.trim();
  if (Array.isArray(raw) && typeof raw[0] === "string") return raw[0].trim();
  return "";
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  const query = readQuery((await searchParams).q);
  const t = await getTranslations({ locale, namespace: "search" });

  const title = query ? t("metadata.title", { query }) : t("metadata.titleEmpty");
  const description = query
    ? t("metadata.description", { query })
    : t("metadata.descriptionEmpty");

  return {
    title: {
      absolute: title,
    },
    description,
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale: localeParam } = await params;

  if (!hasLocale(routing.locales, localeParam)) {
    notFound();
  }

  const locale = localeParam as AppLocale;
  const query = readQuery((await searchParams).q);
  const t = await getTranslations("search");
  const blogPosts = query ? searchPosts(locale, query) : [];

  return (
    <section
      data-slot="search-page"
      aria-labelledby="search-page-heading"
      className="bg-background py-10 md:py-12 lg:py-14"
    >
      <Container>
        <header className="max-w-2xl">
          <h1
            id="search-page-heading"
            className="font-heading text-h3 font-bold tracking-tight text-foreground md:text-h2"
          >
            {query ? t("heading", { query }) : t("headingEmpty")}
          </h1>
          <p className="mt-3 font-sans text-body text-muted-foreground">
            {query ? t("description") : t("descriptionEmpty")}
          </p>
          <SearchForm query={query} className="mt-6" />
        </header>

        {query ? (
          <>
            <Suspense fallback={<ProductSearchSkeleton />}>
              <ProductSearchResults
                query={query}
                locale={locale}
                hasBlogResults={blogPosts.length > 0}
              />
            </Suspense>
            <BlogSearchResults locale={locale} posts={blogPosts} />
          </>
        ) : (
          <div className="mt-10 rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-subtle">
            <p className="font-sans text-body text-muted-foreground">
              {t("prompt")}
            </p>
          </div>
        )}
      </Container>
    </section>
  );
}
