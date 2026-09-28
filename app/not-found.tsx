import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { StatusView } from "@/components/storefront/status-view";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

/**
 * Global unmatched-URL fallback. With multiple root layouts (`[locale]`,
 * `admin`), this file sits outside them and must define its own document tags.
 * There is no locale segment here, so it renders in the default locale.
 */
export default async function RootNotFound() {
  const locale = routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "status.notFound" });

  return (
    <html lang={locale} className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <StatusView
          title={t("title")}
          description={t("description")}
          actions={
            <>
              <Button
                size="lg"
                className="h-12 w-full rounded-xl px-6 font-sans text-sm font-semibold sm:w-auto"
                render={<Link href={`/${locale}/plants`} />}
                nativeButton={false}
              >
                {t("browsePlants")}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 w-full rounded-xl border-border bg-card px-6 font-sans text-sm sm:w-auto"
                render={<Link href={`/${locale}`} />}
                nativeButton={false}
              >
                {t("backHome")}
              </Button>
            </>
          }
        />
      </body>
    </html>
  );
}
