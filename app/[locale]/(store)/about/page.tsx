import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OwnerCta } from "@/components/about/owner-cta";
import { OwnerHero } from "@/components/about/owner-hero";
import { OwnerNote } from "@/components/about/owner-note";
import { OwnerPhilosophy } from "@/components/about/owner-philosophy";
import { OwnerStory } from "@/components/about/owner-story";
import { OwnerValues } from "@/components/about/owner-values";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about.metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function AboutPage() {
  return (
    <>
      <OwnerHero />
      <OwnerStory />
      <OwnerPhilosophy />
      <OwnerValues />
      <OwnerNote />
      <OwnerCta />
    </>
  );
}
