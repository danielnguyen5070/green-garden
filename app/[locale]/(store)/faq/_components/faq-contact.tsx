import { getTranslations } from "next-intl/server";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { CONTACT_CONFIG } from "@/config/contact";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

async function FaqContact({ className }: { className?: string }) {
  const t = await getTranslations("faq.contact");

  return (
    <Section
      data-slot="faq-contact"
      aria-labelledby="faq-contact-heading"
      className={cn("bg-background", className)}
    >
      <Container>
        <div className="rounded-xl bg-secondary px-6 py-12 text-center md:rounded-2xl md:px-10 md:py-16 lg:px-16 lg:py-20">
          <h2
            id="faq-contact-heading"
            className="font-heading text-h3 font-bold tracking-tight text-foreground md:text-[clamp(1.85rem,1.6rem+0.8vw,2.35rem)]"
          >
            {t("title")}
          </h2>

          <p className="mx-auto mt-3 max-w-xl font-sans text-body text-muted-foreground md:mt-4">
            {t("description")}
          </p>

          <div className="mt-8 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="h-12 w-full rounded-xl px-5 text-sm shadow-elevated sm:w-auto sm:min-w-[10.5rem]"
              render={
                <a
                  href={CONTACT_CONFIG.zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              nativeButton={false}
            >
              {t("contactUs")}
              <ArrowRightIcon data-icon="inline-end" className="size-4" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-12 w-full rounded-xl border-border bg-card px-5 text-sm text-foreground shadow-subtle hover:bg-card hover:text-foreground sm:w-auto sm:min-w-[10.5rem]"
              render={<Link href="/plants" />}
              nativeButton={false}
            >
              {t("shopPlants")}
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export { FaqContact };
