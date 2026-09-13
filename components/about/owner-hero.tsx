import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRightIcon, BookOpenIcon, LeafIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { ABOUT_IMAGES } from "@/components/about/images";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

async function OwnerHero({ className }: { className?: string }) {
  const t = await getTranslations("about.ownerHero");

  return (
    <section
      data-slot="owner-hero"
      aria-labelledby="owner-hero-heading"
      className={cn("bg-background", className)}
    >
      <Container className="pt-6 pb-14 md:pt-8 md:pb-16 lg:pt-10 lg:pb-20">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14 xl:gap-16">
          <div className="flex flex-col items-start">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5 font-sans text-[0.6875rem] font-semibold tracking-[0.14em] text-accent uppercase">
              <LeafIcon className="size-3.5 stroke-[1.75]" aria-hidden="true" />
              {t("eyebrow")}
            </span>

            <h1
              id="owner-hero-heading"
              className="mt-5 max-w-[14ch] font-display text-[clamp(2.4rem,1.5rem+3vw,4.25rem)] font-bold leading-[1.05] tracking-tight text-foreground md:mt-6"
            >
              {t("title")}
            </h1>

            <p className="mt-6 max-w-[32rem] font-sans text-body text-muted-foreground">
              {t("description")}
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="h-12 rounded-xl px-5 text-sm shadow-elevated sm:min-w-[10.5rem]"
                render={<Link href="/#products" />}
                nativeButton={false}
              >
                {t("primaryCta")}
                <ArrowRightIcon data-icon="inline-end" className="size-4" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-xl border-border bg-card px-5 text-sm text-foreground shadow-subtle hover:bg-card hover:text-foreground sm:min-w-[10.5rem]"
                render={<Link href="/blog" />}
                nativeButton={false}
              >
                {t("secondaryCta")}
                <BookOpenIcon data-icon="inline-end" className="size-4" />
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[22rem] sm:max-w-[26rem] md:max-w-none md:justify-self-end">
            <div className="relative aspect-[4/5] w-full">
              <svg
                aria-hidden="true"
                width="0"
                height="0"
                className="absolute"
              >
                <defs>
                  <clipPath
                    id="gg-owner-hero-organic-clip"
                    clipPathUnits="objectBoundingBox"
                  >
                    <path d="M0.48 0.02 C0.66 0.00 0.84 0.05 0.93 0.16 C1.03 0.29 1.02 0.46 0.97 0.60 C0.91 0.78 0.78 0.93 0.60 0.98 C0.40 1.03 0.18 0.95 0.07 0.80 C-0.03 0.64 0.00 0.42 0.08 0.26 C0.16 0.09 0.32 0.04 0.48 0.02 Z" />
                  </clipPath>
                </defs>
              </svg>

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-[4%] -z-0 bg-[radial-gradient(ellipse_at_70%_28%,color-mix(in_oklab,var(--brand-earth),transparent_78%)_0%,transparent_55%),radial-gradient(ellipse_at_28%_78%,color-mix(in_oklab,var(--brand-sage),transparent_28%)_0%,transparent_60%),radial-gradient(ellipse_at_55%_48%,color-mix(in_oklab,var(--primary),transparent_90%)_0%,transparent_68%)] blur-3xl"
              />

              <div className="absolute inset-[1.5%] [filter:drop-shadow(0_20px_40px_rgb(36_49_39_/_0.11))_drop-shadow(0_6px_14px_rgb(36_49_39_/_0.06))] md:inset-[2%]">
                <div className="relative h-full w-full overflow-hidden [clip-path:url(#gg-owner-hero-organic-clip)]">
                  <Image
                    src={ABOUT_IMAGES.owner}
                    alt={t("imageAlt")}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, 520px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export { OwnerHero };
