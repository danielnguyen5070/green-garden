import { toast as sonnerToast, type ExternalToast } from "sonner";
import type { ReactNode } from "react";

type ToastMessage = string | ReactNode;

type PromiseMessages<T> = {
  loading: ToastMessage;
  success: ToastMessage | ((data: T) => ToastMessage);
  error: ToastMessage | ((error: unknown) => ToastMessage);
};

/**
 * App-wide toast helpers.
 * Use from any Client Component: `import { toast } from "@/lib/toast"`.
 */
export const toast = {
  success(message: ToastMessage, options?: ExternalToast) {
    return sonnerToast.success(message, options);
  },

  error(message: ToastMessage, options?: ExternalToast) {
    return sonnerToast.error(message, options);
  },

  warning(message: ToastMessage, options?: ExternalToast) {
    return sonnerToast.warning(message, options);
  },

  info(message: ToastMessage, options?: ExternalToast) {
    return sonnerToast.info(message, options);
  },

  /** Show a loading toast; dismiss or update via returned id. */
  loading(message: ToastMessage, options?: ExternalToast) {
    return sonnerToast.loading(message, options);
  },

  /**
   * Wrap an async API call:
   * loading → success | error
   */
  promise<T>(
    promise: Promise<T>,
    messages: PromiseMessages<T>,
    options?: ExternalToast
  ) {
    return sonnerToast.promise(promise, { ...messages, ...options });
  },

  dismiss(id?: string | number) {
    sonnerToast.dismiss(id);
  },

  message(message: ToastMessage, options?: ExternalToast) {
    return sonnerToast(message, options);
  },
};
