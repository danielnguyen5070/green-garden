import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OwnerHero } from "@/components/about/owner-hero";
import { OwnerPhilosophy } from "@/components/about/owner-philosophy";
import { OwnerStory } from "@/components/about/owner-story";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_NAME } from "@/config/site";
import { routing } from "@/i18n/routing";
import { buildAboutJsonLd } from "@/lib/seo/about-json-ld";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about.metadata" });

  const title = t("title");
  const description = t("description");
  const ogTitle = `${title} | ${SITE_NAME}`;

  const path = `/${locale}/about`;
  const languages = {
    vi: "/vi/about",
    en: "/en/about",
    "x-default": `/${routing.defaultLocale}/about`,
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
          url: "/images/og-about.jpg",
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
      images: ["/images/og-about.jpg"],
    },
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about.metadata" });
  const jsonLd = buildAboutJsonLd({
    locale,
    name: t("title"),
    description: t("description"),
  });

  return (
    <>
      <JsonLd data={jsonLd} />
      <OwnerHero />
      <OwnerStory />
      <OwnerPhilosophy />
    </>
  );
}
