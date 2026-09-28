import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { FaqSearch } from "@/components/faq/faq-search";
import { cn } from "@/lib/utils";

async function FaqHero({ className }: { className?: string }) {
  const t = await getTranslations("faq.hero");

  return (
    <section
      data-slot="faq-hero"
      aria-labelledby="faq-hero-heading"
      className={cn("bg-background", className)}
    >
      <Container className="pt-10 pb-8 md:pt-14 md:pb-10 lg:pt-16 lg:pb-12">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-accent/15 px-3 py-1.5 font-sans text-[0.6875rem] font-semibold tracking-[0.14em] text-accent uppercase">
            {t("eyebrow")}
          </span>

          <h1
            id="faq-hero-heading"
            className="mt-5 font-heading text-h2 font-bold tracking-tight text-foreground md:mt-6 md:text-h1"
          >
            {t("title")}
          </h1>

          <p className="mx-auto mt-4 max-w-xl font-sans text-body text-muted-foreground">
            {t("description")}
          </p>

          <FaqSearch
            placeholder={t("searchPlaceholder")}
            className="mx-auto mt-8 max-w-md"
          />
        </div>
      </Container>
    </section>
  );
}

export { FaqHero };
