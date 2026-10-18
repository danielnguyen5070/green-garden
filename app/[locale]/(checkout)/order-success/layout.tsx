import { StoreChrome } from "@/components/layout/store-chrome";

/**
 * Order success historically rendered under the store shell. Keep StoreChrome
 * here so moving ownership into `(checkout)` does not switch to checkout chrome.
 */
export default function OrderSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StoreChrome>{children}</StoreChrome>;
}
