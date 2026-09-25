import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { StatusView } from "@/components/storefront/status-view";
import { Link } from "@/i18n/navigation";

async function StorefrontNotFound() {
  const t = await getTranslations("status.notFound");

  return (
    <StatusView
      title={t("title")}
      description={t("description")}
      actions={
        <>
          <Button
            size="lg"
            className="h-12 w-full rounded-xl px-6 font-sans text-sm font-semibold sm:w-auto"
            render={<Link href="/plants" />}
            nativeButton={false}
          >
            {t("browsePlants")}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 w-full rounded-xl border-border bg-card px-6 font-sans text-sm sm:w-auto"
            render={<Link href="/" />}
            nativeButton={false}
          >
            {t("backHome")}
          </Button>
        </>
      }
    />
  );
}

export { StorefrontNotFound };
