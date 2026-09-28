import type { AbstractIntlMessages } from "next-intl";

/**
 * Message paths read by Client Components via `useTranslations`. Everything
 * else is only rendered on the server and stays out of the client payload.
 * Add a path here when a Client Component starts reading a new namespace.
 */
const CLIENT_MESSAGE_PATHS = [
  "common",
  "nav",
  "cart",
  "checkout",
  "orderSuccess",
  "reviews",
  "search",
  "chatbot",
  "plantDetail",
  "home.products",
  "status.error",
] as const;

function pickClientMessages(
  messages: AbstractIntlMessages
): AbstractIntlMessages {
  const picked: AbstractIntlMessages = {};

  for (const path of CLIENT_MESSAGE_PATHS) {
    const segments = path.split(".");
    let source: AbstractIntlMessages | string | undefined = messages;
    let target = picked;

    for (const [index, segment] of segments.entries()) {
      if (typeof source !== "object") break;
      source = source[segment];
      if (source === undefined) break;

      if (index === segments.length - 1) {
        target[segment] = source;
      } else {
        const next = target[segment];
        target[segment] = typeof next === "object" ? next : {};
        target = target[segment] as AbstractIntlMessages;
      }
    }
  }

  return picked;
}

export { CLIENT_MESSAGE_PATHS, pickClientMessages };
