import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FaqContact } from "@/components/faq/faq-contact";
import { FaqContent } from "@/components/faq/faq-content";
import { JsonLd } from "@/components/seo/json-ld";
import { FAQ_ITEMS } from "@/config/faq";
import { SITE_NAME } from "@/config/site";
import { routing } from "@/i18n/routing";
import { buildFaqJsonLd } from "@/lib/seo/faq-json-ld";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq.metadata" });

  const title = t("title");
  const description = t("description");
  const ogTitle = `${title} | ${SITE_NAME}`;

  const path = `/${locale}/faq`;
  const languages = {
    vi: "/vi/faq",
    en: "/en/faq",
    "x-default": `/${routing.defaultLocale}/faq`,
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
          url: "/images/og-faq.jpg",
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
      images: ["/images/og-faq.jpg"],
    },
  };
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq.metadata" });
  const tItems = await getTranslations({ locale, namespace: "faq.items" });

  const jsonLd = buildFaqJsonLd({
    locale,
    name: t("title"),
    description: t("description"),
    items: FAQ_ITEMS.map((item) => ({
      question: tItems(`${item.id}.question`),
      answer: tItems(`${item.id}.answer`),
    })),
  });

  return (
    <>
      <JsonLd data={jsonLd} />
      <FaqContent />
      <FaqContact />
    </>
  );
}
