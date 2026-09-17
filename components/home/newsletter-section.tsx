import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRightIcon, LeafIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { CONTACT_CONFIG } from "@/config/contact";
import { cn } from "@/lib/utils";

async function NewsletterSection({ className }: { className?: string }) {
  const t = await getTranslations("home.newsletter");

  return (
    <section
      data-slot="home-newsletter"
      aria-labelledby="home-newsletter-heading"
      className={cn("bg-background pt-6 pb-12 md:pt-8 md:pb-16 lg:pt-20 lg:pb-28", className)}
    >
      <Container>
        <div className="rounded-xl bg-secondary px-6 py-12 text-center md:rounded-2xl md:px-10 md:py-16 lg:px-16 lg:py-20">
          <LeafIcon
            aria-hidden="true"
            className="mx-auto size-8 stroke-[1.5] text-primary md:size-9"
          />

          <h2
            id="home-newsletter-heading"
            className="mt-5 text-balance font-heading text-h3 font-bold tracking-tight text-foreground md:mt-6 md:text-[clamp(1.85rem,1.6rem+0.8vw,2.35rem)]"
          >
            {t("title")}
          </h2>

          <div className="mx-auto mt-3 w-full max-w-xl md:mt-4">
            <p className="font-sans text-body text-muted-foreground">
              {t("description")}
            </p>

            <Button
              size="lg"
              className="mt-8 h-11 rounded bg-[#0068ff] px-6 font-sans text-sm text-white shadow-elevated hover:bg-[#0068ff]/90"
              render={
                <a
                  href={CONTACT_CONFIG.zaloGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              nativeButton={false}
            >
              <Image
                src="/icons/zalo.png"
                alt=""
                width={96}
                height={96}
                aria-hidden="true"
                data-icon="inline-start"
                className="size-6 [filter:drop-shadow(0_1px_2px_rgb(36_49_39_/_0.28))]"
              />
              {t("cta")}
            </Button>

            <p className="mt-5 font-sans text-small text-muted-foreground">
              {t("note")}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

export { NewsletterSection };
