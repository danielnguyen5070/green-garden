import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { ClockIcon, MapPinIcon, MessageCircleIcon } from "lucide-react";
import { BUSINESS_HOURS, CONTACT_CONFIG } from "@/config/contact";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { cn } from "@/lib/utils";

const linkClassName =
  "mt-2 inline-flex rounded-sm font-sans text-sm font-medium text-primary underline-offset-4 outline-none transition-colors duration-200 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function VisitInfoItem({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <li className="flex gap-4 py-5 first:pt-0 last:pb-0">
      <span
        aria-hidden="true"
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-card text-accent shadow-subtle"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <h3 className="font-heading text-lg font-medium tracking-tight text-foreground">
          {title}
        </h3>
        <div className="mt-1 font-sans text-body text-muted-foreground">
          {children}
        </div>
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
      className={cn("bg-secondary !py-12 md:!py-16 lg:!py-20", className)}
    >
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <h2
              id="visit-info-heading"
              className="font-display text-[clamp(2rem,1.35rem+2.4vw,3.5rem)] font-bold leading-[1.12] tracking-tight text-foreground"
            >
              {t("title")}
            </h2>
            <p className="mt-4 max-w-xl font-sans text-body text-muted-foreground md:text-lg md:leading-relaxed">
              {t("description")}
            </p>

            <ul className="mt-8 divide-y divide-foreground/10 md:mt-10">
              <VisitInfoItem
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
              </VisitInfoItem>

              <VisitInfoItem
                icon={<ClockIcon className="size-5 stroke-[1.75]" />}
                title={t("hoursTitle")}
              >
                <p>
                  {t("everyDay")}{" "}
                  <time dateTime={BUSINESS_HOURS.opens}>
                    {BUSINESS_HOURS.opens}
                  </time>
                  {" – "}
                  <time dateTime={BUSINESS_HOURS.closes}>
                    {BUSINESS_HOURS.closes}
                  </time>
                </p>
              </VisitInfoItem>

              <VisitInfoItem
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
              </VisitInfoItem>
            </ul>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/70 bg-muted shadow-elevated lg:aspect-auto lg:h-full lg:min-h-[28rem]">
            <iframe
              src={CONTACT_CONFIG.mapEmbedUrl}
              title={t("mapTitle")}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="absolute inset-0 size-full border-0"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}

export { VisitInfo };
