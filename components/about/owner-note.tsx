import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ABOUT_IMAGES } from "@/components/about/images";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Stack } from "@/components/layout/stack";
import { cn } from "@/lib/utils";

async function OwnerNote({ className }: { className?: string }) {
  const t = await getTranslations("about.ownerNote");

  return (
    <Section
      data-slot="owner-note"
      aria-labelledby="owner-note-heading"
      className={cn("bg-background", className)}
    >
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Stack align="center" gap="lg">
            <div className="relative size-20 overflow-hidden rounded-[1.75rem_0.75rem_2rem_1rem] bg-muted shadow-subtle sm:size-24">
              <Image
                src={ABOUT_IMAGES.owner}
                alt={t("imageAlt")}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>

            <h2
              id="owner-note-heading"
              className="max-w-[18ch] font-heading text-h2 font-bold tracking-tight text-foreground"
            >
              {t("title")}
            </h2>

            <p className="font-sans text-body text-muted-foreground md:text-lg md:leading-relaxed">
              {t("description")}
            </p>

            <div className="pt-2">
              <p className="font-heading text-base font-semibold tracking-tight text-foreground">
                {t("name")}
              </p>
              <p className="mt-1 font-sans text-small text-muted-foreground">
                {t("role")}
              </p>
            </div>
          </Stack>
        </div>
      </Container>
    </Section>
  );
}

export { OwnerNote };
