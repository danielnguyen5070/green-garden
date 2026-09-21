import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  PlantListSection,
  PlantListSkeleton,
} from "@/components/plant/plant-list-section";
import { SITE_NAME } from "@/config/site";
import { routing } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "plants.metadata" });

  const title = t("title");
  const description = t("description");
  const ogTitle = `${title} | ${SITE_NAME}`;
  const path = `/${locale}/plants`;
  const languages = {
    vi: "/vi/plants",
    en: "/en/plants",
    "x-default": `/${routing.defaultLocale}/plants`,
  };

  return {
    title,
    description,
    keywords: t("keywords"),
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
      title: ogTitle,
      description,
      images: ["/images/og-home.jpg"],
    },
  };
}

export default async function PlantsPage() {
  const t = await getTranslations("plants");
  const sectionClassName = "pb-16 md:pb-20 lg:pb-24";

  return (
    <Suspense
      fallback={
        <PlantListSkeleton
          title={t("title")}
          headingAs="h1"
          frameId="plants"
          className={sectionClassName}
        />
      }
    >
      <PlantListSection
        title={t("title")}
        headingAs="h1"
        frameId="plants"
        className={sectionClassName}
      />
    </Suspense>
  );
}
