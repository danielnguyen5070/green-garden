import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Stack } from "@/components/layout/stack";
import { cn } from "@/lib/utils";

async function OwnerPhilosophy({ className }: { className?: string }) {
  const t = await getTranslations("about.ownerPhilosophy");

  return (
    <Section
      data-slot="owner-philosophy"
      aria-labelledby="owner-philosophy-heading"
      className={cn("bg-secondary", className)}
    >
      <Container>
        <Stack
          align="center"
          gap="lg"
          className="mx-auto max-w-3xl text-center"
        >
          <h2
            id="owner-philosophy-heading"
            className="max-w-[18ch] font-display text-[clamp(2rem,1.35rem+2.4vw,3.5rem)] font-bold leading-[1.12] tracking-tight text-foreground"
          >
            {t("title")}
          </h2>
          <p className="max-w-2xl font-sans text-body text-muted-foreground md:text-lg md:leading-relaxed">
            {t("description")}
          </p>
        </Stack>
      </Container>
    </Section>
  );
}

export { OwnerPhilosophy };
