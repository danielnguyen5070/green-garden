import { getTranslations } from "next-intl/server";
import { LeafIcon, QuoteIcon } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { cn } from "@/lib/utils";

async function OwnerPhilosophy({ className }: { className?: string }) {
  const t = await getTranslations("about.ownerPhilosophy");

  return (
    <Section
      data-slot="owner-philosophy"
      aria-label={t("title")}
      className={cn("bg-background !py-12 md:!py-16 lg:!py-20", className)}
    >
      <Container>
        <div className="relative isolate overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground shadow-elevated md:px-12 md:py-20 lg:py-24">
          <LeafIcon
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 -right-10 -z-10 size-56 rotate-12 stroke-[0.75] text-primary-foreground/[0.06] md:size-72"
          />
          <LeafIcon
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-12 -left-12 -z-10 size-48 -rotate-[150deg] stroke-[0.75] text-primary-foreground/[0.06] md:size-64"
          />

          <div className="mx-auto flex max-w-3xl flex-col items-center">
            <figure>
              <QuoteIcon
                aria-hidden="true"
                className="mx-auto size-8 fill-accent stroke-accent md:size-10"
              />
              <blockquote className="mt-5">
                <p className="whitespace-pre-line font-display text-[clamp(1.35rem,1.1rem+1vw,2rem)] italic leading-snug text-brand-sage">
                  {t("verse")}
                </p>
              </blockquote>
              <figcaption className="mt-5 font-sans text-xs font-semibold tracking-[0.14em] text-primary-foreground/60 uppercase">
                — {t("verseLabel")}
              </figcaption>
            </figure>

            <div
              aria-hidden="true"
              className="mt-10 h-px w-16 bg-primary-foreground/25 md:mt-12"
            />

            <p className="mt-10 max-w-2xl font-sans text-body text-primary-foreground/80 md:mt-12 md:text-lg md:leading-relaxed">
              {t("description")}
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export { OwnerPhilosophy };
