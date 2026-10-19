import type { AbstractIntlMessages } from "next-intl";

import about from "../messages/en/about.json";
import blog from "../messages/en/blog.json";
import cart from "../messages/en/cart.json";
import chatbot from "../messages/en/chatbot.json";
import checkout from "../messages/en/checkout.json";
import common from "../messages/en/common.json";
import contact from "../messages/en/contact.json";
import faq from "../messages/en/faq.json";
import footer from "../messages/en/footer.json";
import home from "../messages/en/home.json";
import homeProducts from "../messages/en/home-products.json";
import nav from "../messages/en/nav.json";
import orderSuccess from "../messages/en/order-success.json";
import plantDetail from "../messages/en/plant-detail.json";
import plants from "../messages/en/plants.json";
import reviews from "../messages/en/reviews.json";
import search from "../messages/en/search.json";
import site from "../messages/en/site.json";
import status from "../messages/en/status.json";

/**
 * Feature message files under `messages/{locale}/`. Keep this list in sync
 * with the JSON files for every locale.
 */
export const MESSAGE_FILES = [
  "common",
  "site",
  "nav",
  "status",
  "cart",
  "footer",
  "home",
  "home-products",
  "plants",
  "blog",
  "search",
  "reviews",
  "plant-detail",
  "checkout",
  "order-success",
  "about",
  "faq",
  "contact",
  "chatbot",
] as const;

export type MessageFileName = (typeof MESSAGE_FILES)[number];

/**
 * Merged English message tree (feature fragments intersected).
 * Ready for `declare module "next-intl" { interface AppConfig { Messages } }`
 * once call sites narrow `locale` to `AppLocale`.
 */
export type Messages = typeof common &
  typeof site &
  typeof nav &
  typeof status &
  typeof cart &
  typeof footer &
  typeof home &
  typeof homeProducts &
  typeof plants &
  typeof blog &
  typeof search &
  typeof reviews &
  typeof plantDetail &
  typeof checkout &
  typeof orderSuccess &
  typeof about &
  typeof faq &
  typeof contact &
  typeof chatbot;

function isPlainObject(
  value: unknown
): value is Record<string, AbstractIntlMessages | string> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Deep-merge message fragments into one locale catalog. */
export function mergeMessages(
  fragments: AbstractIntlMessages[]
): AbstractIntlMessages {
  const result: AbstractIntlMessages = {};

  for (const fragment of fragments) {
    mergeInto(result, fragment);
  }

  return result;
}

function mergeInto(
  target: AbstractIntlMessages,
  source: AbstractIntlMessages
): void {
  for (const [key, value] of Object.entries(source)) {
    const existing = target[key];

    if (isPlainObject(existing) && isPlainObject(value)) {
      mergeInto(existing, value);
    } else {
      target[key] = value;
    }
  }
}
