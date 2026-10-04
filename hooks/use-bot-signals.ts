"use client";

import { useCallback, useEffect, useRef } from "react";
import type { BotSignals } from "@/types/bot-signals";

export type UseBotSignalsResult = {
  /** Attach to `<HoneypotField />`. */
  honeypotRef: React.RefObject<HTMLInputElement | null>;
  /** Reads the honeypot and the time since the form became active. */
  getBotSignals: () => BotSignals;
  /** Clears the honeypot and restarts the fill timer, e.g. after a submit. */
  reset: () => void;
};

/**
 * Tracks when a public form became active and owns its hidden honeypot, so
 * every storefront form sends the same `website` / `form_elapsed_ms` signals.
 *
 * `active` restarts the timer each time it turns true — pass a dialog's `open`
 * state; always-visible forms can rely on the default.
 */
export function useBotSignals(active = true): UseBotSignalsResult {
  const honeypotRef = useRef<HTMLInputElement | null>(null);
  const startedAtRef = useRef<number | null>(null);

  const reset = useCallback(() => {
    startedAtRef.current = Date.now();
    if (honeypotRef.current) honeypotRef.current.value = "";
  }, []);

  useEffect(() => {
    if (active) reset();
  }, [active, reset]);

  const getBotSignals = useCallback((): BotSignals => {
    const startedAt = startedAtRef.current;
    return {
      website: honeypotRef.current?.value ?? "",
      form_elapsed_ms: startedAt === null ? 0 : Date.now() - startedAt,
    };
  }, []);

  return { honeypotRef, getBotSignals, reset };
}
