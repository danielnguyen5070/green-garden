import { ChatWidget } from "@/components/chatbot/chat-widget";
import { FloatingContact } from "@/components/floating/floating-contact";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

/**
 * Storefront chrome shared by the main shop shell and plant detail.
 * Kept outside pages that must render as a standalone 404.
 */
function StoreChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingContact />
      <ChatWidget />
    </>
  );
}

export { StoreChrome };
