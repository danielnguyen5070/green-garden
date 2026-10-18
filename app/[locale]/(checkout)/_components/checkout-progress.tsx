"use client";

import { useTranslations } from "next-intl";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHECKOUT_STEPS, type CheckoutStep } from "@/types/checkout";

function CheckoutProgress({
  currentStep = "shipping",
  className,
}: {
  currentStep?: CheckoutStep;
  className?: string;
}) {
  const t = useTranslations("checkout.progress");
  const currentIndex = CHECKOUT_STEPS.indexOf(currentStep);

  return (
    <nav
      data-slot="checkout-progress"
      aria-label={t("label")}
      className={cn("font-sans text-sm", className)}
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {CHECKOUT_STEPS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <li key={step} className="inline-flex items-center gap-2">
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className="text-muted-foreground/50"
                >
                  /
                </span>
              ) : null}
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 font-medium",
                  isCurrent && "text-primary",
                  isComplete && "text-primary",
                  isUpcoming && "text-muted-foreground",
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isComplete || isCurrent ? (
                  <CheckIcon
                    className="size-3.5 stroke-[2.5]"
                    aria-hidden="true"
                  />
                ) : null}
                {t(step)}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export { CheckoutProgress };
