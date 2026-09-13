import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRightIcon, DropletsIcon, LeafIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const AVATAR_TONES = [
  "bg-[color-mix(in_oklab,var(--brand-earth),white_35%)]",
  "bg-[color-mix(in_oklab,var(--brand-forest),white_55%)]",
  "bg-[color-mix(in_oklab,var(--brand-earth),black_12%)]",
] as const;

async function Hero({ className }: { className?: string }) {
  const t = await getTranslations("home.hero");

  return (
    <section
      data-slot="home-hero"
      aria-labelledby="home-hero-heading"
      className={cn("bg-background", className)}
    >
      <Container className="pt-6 pb-14 md:pt-8 md:pb-16 lg:pt-10 lg:pb-20">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12 xl:gap-16">
          <div className="flex flex-col items-start">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5 font-sans text-[0.6875rem] font-semibold tracking-[0.14em] text-accent uppercase">
              <SunIcon className="size-3.5 stroke-[1.75]" aria-hidden="true" />
              {t("badge")}
            </span>

            <h1
              id="home-hero-heading"
              className="mt-5 max-w-[11ch] font-display text-[clamp(2.6rem,1.7rem+3.2vw,4.75rem)] font-bold leading-[1.02] tracking-tight text-foreground md:mt-6"
            >
              <span className="block">{t("titleLine1")}</span>
              <span className="block">
                <span className="text-primary">{t("titleAccent")}</span>
                {t("titleSuffix")}
              </span>
            </h1>

            <p className="mt-6 max-w-[32.5rem] font-sans text-body text-muted-foreground">
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
                render={<Link href="/#quiz" />}
                nativeButton={false}
              >
                {t("secondaryCta")}
                <LeafIcon data-icon="inline-end" className="size-4" />
              </Button>
            </div>

            <div className="mt-10 flex items-center gap-3">
              <div className="flex items-center" aria-hidden="true">
                {AVATAR_TONES.map((tone, index) => (
                  <span
                    key={tone}
                    className={cn(
                      "size-9 rounded-full border-2 border-background ring-0",
                      tone,
                      index > 0 && "-ml-2.5"
                    )}
                  />
                ))}
                <span className="-ml-2.5 inline-flex size-9 items-center justify-center rounded-full border-2 border-background bg-muted font-sans text-[0.625rem] font-semibold tracking-tight text-muted-foreground">
                  {t("socialProofCount")}
                </span>
              </div>
              <p className="max-w-[14rem] font-sans text-small text-muted-foreground sm:max-w-none">
                {t("socialProof")}
              </p>
            </div>
          </div>

          <div className="relative mx-auto hidden w-full max-w-[28rem] md:block md:max-w-none md:justify-self-end">
            <div className="relative aspect-square w-full">
              <svg
                aria-hidden="true"
                width="0"
                height="0"
                className="absolute"
              >
                <defs>
                  <clipPath
                    id="gg-hero-organic-clip"
                    clipPathUnits="objectBoundingBox"
                  >
                    {/* Soft pebble silhouette: near-circular, slightly fuller at top-right */}
                    <path d="M0.50 0.025 C0.66 0.01 0.82 0.045 0.91 0.145 C0.99 0.24 1.02 0.38 0.995 0.52 C0.97 0.68 0.93 0.82 0.82 0.91 C0.70 1.005 0.52 1.015 0.36 0.97 C0.20 0.92 0.07 0.80 0.03 0.64 C-0.01 0.48 0.015 0.30 0.10 0.18 C0.19 0.055 0.34 0.035 0.50 0.025 Z" />
                  </clipPath>
                </defs>
              </svg>

              {/* Soft warm/green glow behind the organic silhouette */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-[4%] -z-0 bg-[radial-gradient(ellipse_at_70%_28%,color-mix(in_oklab,var(--brand-earth),transparent_78%)_0%,transparent_55%),radial-gradient(ellipse_at_28%_78%,color-mix(in_oklab,var(--brand-sage),transparent_28%)_0%,transparent_60%),radial-gradient(ellipse_at_55%_48%,color-mix(in_oklab,var(--primary),transparent_90%)_0%,transparent_68%)] blur-3xl"
              />

              <div className="absolute inset-[1.5%] [filter:drop-shadow(0_20px_40px_rgb(36_49_39_/_0.11))_drop-shadow(0_6px_14px_rgb(36_49_39_/_0.06))] md:inset-[2%]">
                <div className="relative h-full w-full overflow-hidden [clip-path:url(#gg-hero-organic-clip)]">
                  <Image
                    src="/images/hero-plants.svg"
                    alt={t("imageAlt")}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, 560px"
                  />
                </div>
              </div>

              <aside className="absolute bottom-[6%] left-0 z-10 w-[min(100%,16.5rem)] rounded-2xl border border-border/70 bg-card p-3.5 shadow-elevated sm:bottom-[8%] sm:left-0 sm:w-[17.5rem] sm:p-4">
                <div className="flex gap-3">
                  <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <DropletsIcon className="size-4 stroke-[1.75]" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-sans text-[0.6875rem] font-semibold tracking-[0.12em] text-foreground uppercase">
                      {t("wateringTip.title")}
                    </p>
                    <p className="mt-1.5 font-sans text-small leading-snug text-muted-foreground">
                      {t("wateringTip.description")}
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export { Hero };
