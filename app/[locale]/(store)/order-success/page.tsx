import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OrderSuccess } from "@/components/checkout/order-success";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "orderSuccess" });

  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: false },
  };
}

export default function OrderSuccessPage() {
  return <OrderSuccess />;
}
