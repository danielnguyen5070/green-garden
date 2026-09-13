import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FaqContact } from "@/components/faq/faq-contact";
import { FaqContent } from "@/components/faq/faq-content";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq.metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function FaqPage() {
  return (
    <>
      <FaqContent />
      <FaqContact />
    </>
  );
}
