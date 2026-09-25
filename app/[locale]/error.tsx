"use client";

import { StorefrontError } from "@/components/storefront/storefront-error";

export default function LocaleError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <StorefrontError error={error} retry={retry} />;
}
