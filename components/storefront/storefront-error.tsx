"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { StatusView } from "@/components/storefront/status-view";
import { Link } from "@/i18n/navigation";

function StorefrontError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations("status.error");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusView
      title={t("title")}
      description={t("description")}
      actions={
        <>
          <Button
            type="button"
            size="lg"
            className="h-12 w-full rounded-xl px-6 font-sans text-sm font-semibold sm:w-auto"
            onClick={() => retry()}
          >
            {t("tryAgain")}
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

export { StorefrontError };
