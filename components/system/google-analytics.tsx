import Script from "next/script";
import { GA_MEASUREMENT_ID } from "@/config/site";

/**
 * GA4 Enhanced Measurement already records client-side route changes via the
 * History API, so no manual `page_view` events are sent — they would double count.
 */
function GoogleAnalytics() {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  );
}

export { GoogleAnalytics };
