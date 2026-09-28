import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { SITE_NAME, SITE_URL } from "@/config/site";
import { pickClientMessages } from "@/i18n/client-messages";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import "../globals.css";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/** Pages without their own description inherit this one, so it must match `lang`. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const base: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    applicationName: SITE_NAME,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
    },
  };

  if (!hasLocale(routing.locales, locale)) {
    return base;
  }

  const t = await getTranslations({ locale, namespace: "site" });

  return {
    ...base,
    description: t("description"),
    openGraph: {
      ...base.openGraph,
      locale: locale === "vi" ? "vi_VN" : "en_US",
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <NextIntlClientProvider
          locale={locale}
          messages={pickClientMessages(messages)}
        >
          {children}
        </NextIntlClientProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
