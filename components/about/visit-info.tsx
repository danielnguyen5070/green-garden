import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { ClockIcon, MapPinIcon, MessageCircleIcon } from "lucide-react";
import { BUSINESS_HOURS, CONTACT_CONFIG } from "@/config/contact";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { cn } from "@/lib/utils";

const linkClassName =
  "mt-3 inline-flex rounded-sm font-sans text-sm font-medium text-primary underline-offset-4 outline-none transition-colors duration-200 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function VisitInfoCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <li className="flex flex-col items-start rounded-2xl border border-border bg-card p-6 shadow-subtle">
      <span
        aria-hidden="true"
        className="inline-flex size-10 items-center justify-center rounded-full bg-accent/15 text-accent"
      >
        {icon}
      </span>
      <h3 className="mt-4 font-heading text-lg font-medium tracking-tight text-foreground">
        {title}
      </h3>
      <div className="mt-2 font-sans text-body text-muted-foreground">
        {children}
      </div>
    </li>
  );
}

async function VisitInfo({ className }: { className?: string }) {
  const t = await getTranslations("about.visitInfo");

  return (
    <Section
      data-slot="visit-info"
      aria-labelledby="visit-info-heading"
      className={cn("bg-background !py-12 md:!py-16 lg:!py-20", className)}
    >
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="visit-info-heading"
            className="font-display text-[clamp(2rem,1.35rem+2.4vw,3.5rem)] font-bold leading-[1.12] tracking-tight text-foreground"
          >
            {t("title")}
          </h2>
          <p className="mt-4 font-sans text-body text-muted-foreground md:text-lg md:leading-relaxed">
            {t("description")}
          </p>
        </div>

        <ul className="mx-auto mt-10 grid max-w-5xl gap-4 md:mt-12 md:grid-cols-3 md:gap-6">
          <VisitInfoCard
            icon={<MapPinIcon className="size-5 stroke-[1.75]" />}
            title={t("addressTitle")}
          >
            <address className="not-italic">{CONTACT_CONFIG.address}</address>
            <a
              href={CONTACT_CONFIG.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
            >
              {t("mapLink")}
            </a>
          </VisitInfoCard>

          <VisitInfoCard
            icon={<ClockIcon className="size-5 stroke-[1.75]" />}
            title={t("hoursTitle")}
          >
            <p>
              {t("everyDay")}{" "}
              <time dateTime={BUSINESS_HOURS.opens}>{BUSINESS_HOURS.opens}</time>
              {" – "}
              <time dateTime={BUSINESS_HOURS.closes}>
                {BUSINESS_HOURS.closes}
              </time>
            </p>
          </VisitInfoCard>

          <VisitInfoCard
            icon={<MessageCircleIcon className="size-5 stroke-[1.75]" />}
            title={t("contactTitle")}
          >
            <p>{t("contactNote", { phone: CONTACT_CONFIG.phone })}</p>
            <a
              href={CONTACT_CONFIG.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
            >
              {t("zaloLink")}
            </a>
          </VisitInfoCard>
        </ul>
      </Container>
    </Section>
  );
}

export { VisitInfo };
