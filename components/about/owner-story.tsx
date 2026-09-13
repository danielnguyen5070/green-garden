import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ABOUT_IMAGES } from "@/components/about/images";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Stack } from "@/components/layout/stack";
import { cn } from "@/lib/utils";

async function OwnerStory({ className }: { className?: string }) {
  const t = await getTranslations("about.ownerStory");

  return (
    <>
      <Section
        data-slot="owner-intro"
        aria-labelledby="owner-intro-heading"
        className={cn("bg-background", className)}
      >
        <Container>
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 xl:gap-20">
            <div className="order-2 md:order-1">
              <div className="relative mx-auto aspect-[4/5] w-full max-w-[28rem] overflow-hidden rounded-[1.5rem_4.5rem_1.75rem_3.25rem] bg-muted shadow-subtle md:max-w-none">
                <Image
                  src={ABOUT_IMAGES.story}
                  alt={t("introImageAlt")}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, 560px"
                />
              </div>
            </div>

            <Stack gap="lg" className="order-1 md:order-2 md:max-w-[34rem]">
              <h2
                id="owner-intro-heading"
                className="max-w-[16ch] font-heading text-h2 font-bold tracking-tight text-foreground"
              >
                {t("introTitle")}
              </h2>
              <p className="font-sans text-body text-muted-foreground">
                {t("introDescription")}
              </p>
            </Stack>
          </div>
        </Container>
      </Section>

      <Section
        data-slot="owner-journey"
        aria-labelledby="owner-journey-heading"
        className="bg-background"
      >
        <Container>
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16 xl:gap-24">
            <Stack gap="lg" className="max-w-[34rem]">
              <h2
                id="owner-journey-heading"
                className="max-w-[16ch] font-heading text-h2 font-bold tracking-tight text-foreground"
              >
                {t("journeyTitle")}
              </h2>
              <div className="flex flex-col gap-5 font-sans text-body text-muted-foreground">
                <p>{t("journeyParagraph1")}</p>
                <p>{t("journeyParagraph2")}</p>
                <p>{t("journeyParagraph3")}</p>
              </div>
            </Stack>

            <div className="relative mx-auto aspect-[4/5] w-full max-w-[28rem] overflow-hidden rounded-[3.5rem_1.25rem_4.5rem_1.5rem] bg-muted shadow-subtle md:max-w-none">
              <Image
                src={ABOUT_IMAGES.plants}
                alt={t("journeyImageAlt")}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, 560px"
              />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

export { OwnerStory };
