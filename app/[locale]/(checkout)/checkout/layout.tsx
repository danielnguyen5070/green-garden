import { CheckoutLayout } from "@/app/[locale]/(checkout)/_components/checkout-layout";

export default function CheckoutPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CheckoutLayout>{children}</CheckoutLayout>;
}
