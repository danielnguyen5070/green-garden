import { Container } from "@/components/layout/container";
import { CheckoutFooter } from "@/components/checkout/checkout-footer";
import { CheckoutHeader } from "@/components/checkout/checkout-header";
import { cn } from "@/lib/utils";

function CheckoutLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="checkout-layout"
      className={cn("flex min-h-full flex-1 flex-col bg-background", className)}
    >
      <CheckoutHeader />
      <main className="flex-1">
        <Container className="py-8 md:py-10 lg:py-12">{children}</Container>
      </main>
      <CheckoutFooter />
    </div>
  );
}

export { CheckoutLayout };
