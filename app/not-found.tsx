import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusView } from "@/components/storefront/status-view";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

/**
 * Global unmatched-URL fallback. With multiple root layouts (`[locale]`,
 * `admin`), this file sits outside them and must define its own document tags.
 */
export default function RootNotFound() {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <StatusView
          title="Page not found"
          description="The page you're looking for doesn't exist or may have been moved."
          actions={
            <>
              <Button
                size="lg"
                className="h-12 w-full rounded-xl px-6 font-sans text-sm font-semibold sm:w-auto"
                render={<Link href="/plants" />}
                nativeButton={false}
              >
                Browse plants
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
      </body>
    </html>
  );
}
