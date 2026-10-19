import * as rootParams from "next/root-params";
import { hasLocale, type AbstractIntlMessages } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { MESSAGE_FILES, mergeMessages } from "./messages";
import { routing } from "./routing";

async function loadMessages(locale: string) {
  const fragments = await Promise.all(
    MESSAGE_FILES.map(
      (name) => import(`../messages/${locale}/${name}.json`)
    )
  );

  return mergeMessages(
    fragments.map((mod) => mod.default as AbstractIntlMessages)
  );
}

export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    const paramValue = await rootParams.locale();

    if (hasLocale(routing.locales, paramValue)) {
      locale = paramValue;
    } else if (paramValue) {
      notFound();
    } else {
      // Outside `[locale]` (e.g. `/admin`) — fall back for any next-intl calls
      locale = routing.defaultLocale;
    }
  }

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
