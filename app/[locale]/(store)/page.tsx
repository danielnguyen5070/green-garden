import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Hero } from "@/components/home/hero";
import { NewsletterSection } from "@/components/home/newsletter-section";
import {
  FeaturedPlantsSection,
  FeaturedPlantsSkeleton,
} from "@/components/plant/featured-plants-section";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_NAME } from "@/config/site";
import { routing } from "@/i18n/routing";
import { buildHomepageJsonLd } from "@/lib/seo/homepage-json-ld";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home.metadata" });

  const path = `/${locale}`;
  const languages = {
    vi: "/vi",
    en: "/en",
    "x-default": `/${routing.defaultLocale}`,
  };

  return {
    title: {
      absolute: t("title"),
    },
    description: t("description"),
    keywords: t("keywords"),
    alternates: {
      canonical: path,
      languages,
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: path,
      siteName: SITE_NAME,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      alternateLocale: locale === "vi" ? ["en_US"] : ["vi_VN"],
      type: "website",
      images: [
        {
          url: "/images/og-home.jpg",
          width: 1200,
          height: 630,
          alt: t("ogImageAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/images/og-home.jpg"],
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home.metadata" });
  const jsonLd = buildHomepageJsonLd({
    locale,
    name: t("title"),
    description: t("description"),
  });

  return (
    <>
      <JsonLd data={jsonLd} />
      <Hero />
      <Suspense fallback={<FeaturedPlantsSkeleton />}>
        <FeaturedPlantsSection />
      </Suspense>
      <NewsletterSection />
    </>
  );
}
