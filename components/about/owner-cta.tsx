import { getTranslations } from "next-intl/server";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Stack } from "@/components/layout/stack";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

async function OwnerCta({ className }: { className?: string }) {
  const t = await getTranslations("about.ownerCta");

  return (
    <Section
      data-slot="owner-cta"
      aria-labelledby="owner-cta-heading"
      className={cn("bg-background", className)}
    >
      <Container>
        <Stack align="center" gap="xl" className="text-center">
          <h2
            id="owner-cta-heading"
            className="max-w-[18ch] font-heading text-h2 font-bold tracking-tight text-foreground"
          >
            {t("title")}
          </h2>

          <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="h-12 w-full rounded-xl px-5 text-sm shadow-elevated sm:w-auto sm:min-w-[10.5rem]"
              render={<Link href="/#products" />}
              nativeButton={false}
            >
              {t("shop")}
              <ArrowRightIcon data-icon="inline-end" className="size-4" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-12 w-full rounded-xl border-border bg-card px-5 text-sm text-foreground shadow-subtle hover:bg-card hover:text-foreground sm:w-auto sm:min-w-[10.5rem]"
              render={<Link href="/blog" />}
              nativeButton={false}
            >
              {t("careGuide")}
            </Button>
          </div>
        </Stack>
      </Container>
    </Section>
  );
}

export { OwnerCta };
