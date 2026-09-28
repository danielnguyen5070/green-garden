import { SITE_URL } from "@/config/site";

/** Stable entity IDs — reference these across pages; do not redefine full blobs. */
export const LOCAL_BUSINESS_ID = `${SITE_URL}/#localbusiness` as const;
export const WEBSITE_ID = `${SITE_URL}/#website` as const;
/** Product brand — separate from LocalBusiness (`#localbusiness` is the shop). */
export const BRAND_ID = `${SITE_URL}/#brand` as const;

/**
 * LocalBusiness.name — must exactly match the Google Business Profile name.
 * The site/brand name is `SITE_NAME` in `config/site.ts`.
 */
export const BUSINESS_DISPLAY_NAME = "Cây giống Ngọc Ngân Bến Tre" as const;
