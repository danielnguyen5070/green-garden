/**
 * Bot-signal fields every public storefront form sends with its payload.
 *
 * `website` is a hidden honeypot a person never fills in; `form_elapsed_ms` is
 * how long the form was open. The backend rejects a filled honeypot or a
 * submission faster than 3 seconds with `403`.
 */
export type BotSignals = {
  website: string;
  form_elapsed_ms: number;
};
