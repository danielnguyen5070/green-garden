import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["vi", "en"],
  defaultLocale: "vi",
  localePrefix: "always",
  // Prefer URL + defaultLocale over Accept-Language so first visit lands on /vi
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
