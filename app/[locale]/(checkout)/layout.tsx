import { CheckoutLayout } from "@/components/checkout/checkout-layout";

export default function CheckoutRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CheckoutLayout>{children}</CheckoutLayout>;
}
