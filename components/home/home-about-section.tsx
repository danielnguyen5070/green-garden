import { getTranslations } from "next-intl/server";
import {
  ArrowRightIcon,
  HandCoinsIcon,
  MapPinIcon,
  PackageCheckIcon,
  SproutIcon,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const HIGHLIGHTS = [
  { key: "origin", icon: MapPinIcon },
  { key: "grafted", icon: SproutIcon },
  { key: "shipping", icon: PackageCheckIcon },
  { key: "cod", icon: HandCoinsIcon },
] as const satisfies ReadonlyArray<{ key: string; icon: LucideIcon }>;

async function HomeAboutSection({ className }: { className?: string }) {
  const t = await getTranslations("home.about");

  return (
    <section
      data-slot="home-about"
      aria-labelledby="home-about-heading"
      className={cn("bg-background py-8 md:py-10", className)}
    >
      <Container>
        <div className="grid gap-8 rounded-2xl bg-secondary px-6 py-10 md:px-10 md:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12 lg:px-14">
          <div className="flex flex-col items-start">
            <h2
              id="home-about-heading"
              className="font-heading text-h3 font-bold tracking-tight text-foreground md:text-h2"
            >
              {t("title")}
            </h2>
            <p className="mt-3 max-w-xl font-sans text-body text-muted-foreground">
              {t("description")}
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="h-12 rounded-xl px-5 text-sm shadow-elevated"
                render={<Link href="/about" />}
                nativeButton={false}
              >
                {t("aboutCta")}
                <ArrowRightIcon data-icon="inline-end" className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-xl border-border bg-card px-5 text-sm text-foreground shadow-subtle hover:bg-card hover:text-foreground"
                render={<Link href="/faq" />}
                nativeButton={false}
              >
                {t("faqCta")}
              </Button>
            </div>
          </div>

          <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            {HIGHLIGHTS.map(({ key, icon: Icon }) => (
              <li
                key={key}
                className="flex gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-subtle"
              >
                <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-4 stroke-[1.75]" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-sans text-sm font-semibold tracking-tight text-foreground">
                    {t(`highlights.${key}.title`)}
                  </h3>
                  <p className="mt-1 font-sans text-small leading-snug text-muted-foreground">
                    {t(`highlights.${key}.description`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

export { HomeAboutSection };
