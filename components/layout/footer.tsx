import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {
  FOOTER_SECTIONS,
  type FooterNavSection,
  type FooterSocialIcon,
} from "@/config/footer";
import { CONTACT_CONFIG } from "@/config/contact";
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

async function FooterBrand() {
  const t = await getTranslations("footer");

  return (
    <div className="max-w-[17.5rem]">
      <Link
        href={FOOTER_BRAND.href}
        className="inline-flex items-center gap-2.5 rounded-md outline-none transition-opacity duration-200 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand-sage/60 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-deep"
      >
        <LogoMark className="brightness-0 invert" />
        <span className="flex flex-col">
          <span className="font-sans text-base font-semibold leading-tight tracking-tight text-primary-foreground sm:text-[1.05rem]">
            {t(FOOTER_BRAND.nameKey)}
          </span>
          <span className="font-sans text-[0.625rem] font-medium leading-tight tracking-[0.18em] text-primary-foreground/50 uppercase sm:text-[0.6875rem]">
            BEN TRE
          </span>
        </span>
      </Link>
      <p className="mt-4 max-w-[16.25rem] text-small leading-relaxed text-primary-foreground/50">
        {t(FOOTER_BRAND.descriptionKey)}
      </p>
      <address className="mt-3 max-w-[16.25rem] text-small leading-relaxed text-primary-foreground/50 not-italic">
        {CONTACT_CONFIG.address}
      </address>
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
            {"external" in link && link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClassName}
              >
                {t(link.labelKey)}
              </a>
            ) : (
              <Link href={link.href} className={linkClassName}>
                {t(link.labelKey)}
              </Link>
            )}
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
      <ul className="mt-6 flex items-center gap-0.5">
        {FOOTER_SOCIAL.links.map((link) => (
          <li key={link.icon}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t(link.labelKey)}
              className="inline-flex rounded-lg outline-none transition-opacity duration-200 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand-sage/60 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-deep"
            >
              <Image
                src={`/icons/${link.icon}.png`}
                alt=""
                width={96}
                height={96}
                aria-hidden="true"
                className="size-9 [filter:drop-shadow(0_2px_3px_rgb(0_0_0_/_0.35))]"
              />
            </a>
          </li>
        ))}
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
