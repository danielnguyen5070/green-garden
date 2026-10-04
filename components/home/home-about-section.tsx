import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {
  ArrowRightIcon,
  HandCoinsIcon,
  MapPinIcon,
  PackageCheckIcon,
  SproutIcon,
  type LucideIcon,
} from "lucide-react";
import { ABOUT_IMAGES } from "@/components/about/images";
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
      className={cn("bg-background py-12 md:py-16 lg:py-20", className)}
    >
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-elevated sm:aspect-[16/10] lg:aspect-[4/5]">
            <Image
              src={ABOUT_IMAGES.story}
              alt={t("imageAlt")}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>

          <div className="flex flex-col items-start">
            <h2
              id="home-about-heading"
              className="font-heading text-h3 font-bold tracking-tight text-foreground md:text-h2"
            >
              {t("title")}
            </h2>
            <p className="mt-4 max-w-2xl font-sans text-body text-muted-foreground">
              {t("description")}
            </p>

            <ul className="mt-8 grid w-full list-none grid-cols-1 gap-x-8 gap-y-6 border-t border-border pt-8 sm:grid-cols-2">
              {HIGHLIGHTS.map(({ key, icon: Icon }) => (
                <li key={key} className="flex gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5 stroke-[1.75]" aria-hidden="true" />
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

            <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="h-12 rounded-xl px-5 text-sm shadow-elevated has-data-[icon=inline-end]:pr-5"
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
        </div>
      </Container>
    </section>
  );
}

export { HomeAboutSection };
