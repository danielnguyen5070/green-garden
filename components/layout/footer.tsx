import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import {
  FOOTER_SECTIONS,
  type FooterNavSection,
  type FooterSocialIcon,
} from "@/config/footer";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/container";
import { LogoMark } from "@/components/layout/header/logo";

const {
  brand: FOOTER_BRAND,
  shop: FOOTER_SHOP,
  support: FOOTER_SUPPORT,
  social: FOOTER_SOCIAL,
} = FOOTER_SECTIONS;

const linkClassName =
  "rounded-sm text-small text-primary-foreground/50 outline-none transition-colors duration-200 hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-brand-sage/60 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-deep";

const headingClassName =
  "font-heading text-[0.9375rem] font-medium tracking-tight text-primary-foreground";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M14.2 8.5h2.8V5.4h-2.8c-2.3 0-3.9 1.5-3.9 3.9v2.2H8.2v3.1h2.1V21h3.2v-6.4h2.6l.5-3.1h-3.1V9.4c0-.6.4-.9 1-.9Z" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M22.5 7.2a2.9 2.9 0 0 0-2-2.1C18.7 4.7 12 4.7 12 4.7s-6.7 0-8.5.4a2.9 2.9 0 0 0-2 2.1A30 30 0 0 0 1.2 12a30 30 0 0 0 .3 4.8 2.9 2.9 0 0 0 2 2.1c1.8.4 8.5.4 8.5.4s6.7 0 8.5-.4a2.9 2.9 0 0 0 2-2.1 30 30 0 0 0 .3-4.8 30 30 0 0 0-.3-4.8ZM10 15.2V8.8l5.5 3.2L10 15.2Z" />
    </svg>
  );
}

const SOCIAL_ICONS: Record<
  FooterSocialIcon,
  (props: { className?: string }) => ReactNode
> = {
  facebook: FacebookIcon,
  youtube: YoutubeIcon,
};

async function FooterBrand() {
  const t = await getTranslations("footer");

  return (
    <div className="max-w-[17.5rem]">
      <Link
        href={FOOTER_BRAND.href}
        className="inline-flex items-center gap-2.5 rounded-md outline-none transition-opacity duration-200 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand-sage/60 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-deep"
      >
        <LogoMark className="text-primary-foreground" />
        <span className="font-sans text-base font-semibold tracking-tight text-primary-foreground sm:text-[1.05rem]">
          {t(FOOTER_BRAND.nameKey)}
        </span>
      </Link>
      <p className="mt-4 max-w-[16.25rem] text-small leading-relaxed text-primary-foreground/50">
        {t(FOOTER_BRAND.descriptionKey)}
      </p>
    </div>
  );
}

async function FooterNavColumn({ section }: { section: FooterNavSection }) {
  const t = await getTranslations("footer");
  const headingId = `footer-${section.titleKey.replace(".", "-")}`;

  return (
    <nav aria-labelledby={headingId}>
      <h2 id={headingId} className={headingClassName}>
        {t(section.titleKey)}
      </h2>
      <ul className="mt-6 flex flex-col gap-3">
        {section.links.map((link) => (
          <li key={link.labelKey}>
            <Link href={link.href} className={linkClassName}>
              {t(link.labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

async function FooterSocial() {
  const t = await getTranslations("footer");
  const headingId = "footer-social-title";

  return (
    <nav aria-labelledby={headingId}>
      <h2 id={headingId} className={headingClassName}>
        {t(FOOTER_SOCIAL.titleKey)}
      </h2>
      <ul className="mt-6 flex items-center gap-2.5">
        {FOOTER_SOCIAL.links.map((link) => {
          const Icon = SOCIAL_ICONS[link.icon];

          return (
            <li key={link.icon}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t(link.labelKey)}
                className="inline-flex size-9 items-center justify-center rounded-full border border-primary-foreground/20 bg-primary-foreground/8 text-primary-foreground/75 outline-none transition-colors duration-200 hover:border-primary-foreground/35 hover:bg-primary-foreground/12 hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-brand-sage/60 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-deep"
              >
                <Icon className="size-4" />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

async function Footer({ className }: { className?: string }) {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer
      data-slot="footer"
      className={cn("mt-auto bg-brand-deep", className)}
    >
      <Container className="pt-16 md:pt-20 lg:pt-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-8 md:gap-y-12 lg:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,0.9fr))] lg:gap-x-16 xl:gap-x-24">
          <FooterBrand />
          <FooterNavColumn section={FOOTER_SHOP} />
          <FooterNavColumn section={FOOTER_SUPPORT} />
          <FooterSocial />
        </div>

        <div
          aria-hidden="true"
          className="mt-14 h-px w-full bg-primary-foreground/12 md:mt-16 lg:mt-[4.5rem]"
        />

        <p className="py-7 text-center text-small text-primary-foreground/45 md:py-8">
          {t("copyright", { year })}
        </p>
      </Container>
    </footer>
  );
}

export { Footer };
