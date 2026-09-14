import { getTranslations } from "next-intl/server";
import { MessageSquareIcon } from "lucide-react";
import {
  CONTACT_CONFIG,
  CONTACT_SMS_HREF,
} from "@/config/contact";
import { cn } from "@/lib/utils";

const actionClassName = cn(
  "group relative inline-flex size-12 items-center justify-center rounded-full shadow-elevated outline-none transition-transform duration-200",
  "hover:scale-105 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "md:size-14"
);

const tooltipClassName = cn(
  "pointer-events-none absolute top-1/2 left-[calc(100%+0.75rem)] -translate-y-1/2 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5",
  "font-sans text-xs font-medium text-background opacity-0 shadow-subtle transition-opacity duration-150",
  "group-hover:opacity-100 group-focus-visible:opacity-100",
  "max-md:hidden"
);

async function FloatingContact({ className }: { className?: string }) {
  const t = await getTranslations("contact");

  return (
    <nav
      data-slot="floating-contact"
      aria-label={t("navLabel")}
      className={cn(
        "fixed bottom-4 left-4 z-[45] flex flex-col gap-2.5 md:bottom-6 md:left-6",
        className
      )}
    >
      <a
        href={CONTACT_CONFIG.zaloUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("zalo")}
        className={cn(
          actionClassName,
          "bg-[#0068ff] text-white hover:bg-[#0068ff]/90"
        )}
      >
        <span className={tooltipClassName}>{t("zalo")}</span>
        <span
          aria-hidden="true"
          className="font-sans text-[0.625rem] font-bold tracking-tight md:text-xs"
        >
          Zalo
        </span>
      </a>

      <a
        href={CONTACT_SMS_HREF}
        aria-label={t("sms")}
        className={cn(
          actionClassName,
          "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        <span className={tooltipClassName}>{t("sms")}</span>
        <MessageSquareIcon
          className="size-5 stroke-[1.75] md:size-[1.35rem]"
          aria-hidden="true"
        />
      </a>
    </nav>
  );
}

export { FloatingContact };
