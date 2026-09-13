import { getTranslations } from "next-intl/server";
import { HandHeartIcon, SproutIcon, UsersIcon } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Grid } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { cn } from "@/lib/utils";

const VALUES = [
  { key: "healthyPlants", icon: SproutIcon },
  { key: "honestGuidance", icon: HandHeartIcon },
  { key: "growingTogether", icon: UsersIcon },
] as const;

async function OwnerValues({ className }: { className?: string }) {
  const t = await getTranslations("about.ownerValues");

  return (
    <Section
      data-slot="owner-values"
      aria-labelledby="owner-values-heading"
      className={cn("bg-background", className)}
    >
      <Container>
        <h2
          id="owner-values-heading"
          className="max-w-[16ch] font-heading text-h2 font-bold tracking-tight text-foreground"
        >
          {t("title")}
        </h2>

        <Grid cols={3} gap="lg" className="mt-10 md:mt-14 lg:mt-16 lg:gap-12">
          {VALUES.map(({ key, icon: Icon }, index) => (
            <article
              key={key}
              data-slot="owner-value"
              className={cn(
                "md:border-border/70",
                index > 0 && "md:border-l md:pl-8 lg:pl-10"
              )}
            >
              <Icon
                className="size-5 stroke-[1.5] text-primary"
                aria-hidden="true"
              />
              <h3 className="mt-5 font-heading text-lg font-semibold tracking-tight text-foreground md:text-xl">
                {t(`${key}.title`)}
              </h3>
              <p className="mt-2 max-w-[32ch] font-sans text-body text-muted-foreground">
                {t(`${key}.description`)}
              </p>
            </article>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}

export { OwnerValues };
