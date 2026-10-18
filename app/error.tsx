"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusView } from "@/components/feedback/status-view";

export default function RootError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusView
      title="Something went wrong"
      description="We couldn't load this page right now. Please try again in a moment."
      actions={
        <>
          <Button
            type="button"
            size="lg"
            className="h-12 w-full rounded-xl px-6 font-sans text-sm font-semibold sm:w-auto"
            onClick={() => retry()}
          >
            Try again
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 w-full rounded-xl border-border bg-card px-6 font-sans text-sm sm:w-auto"
            render={<Link href="/" />}
            nativeButton={false}
          >
            Back to homepage
          </Button>
        </>
      }
    />
  );
}
