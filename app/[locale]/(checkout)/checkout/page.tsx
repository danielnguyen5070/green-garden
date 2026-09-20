import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CheckoutPageView } from "@/components/checkout/checkout-page";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });

  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: false },
  };
}

export default function CheckoutPage() {
  return <CheckoutPageView />;
}
