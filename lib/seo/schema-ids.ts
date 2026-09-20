import { SITE_URL } from "@/config/site";

/** Stable entity IDs — reference these across pages; do not redefine full blobs. */
export const LOCAL_BUSINESS_ID = `${SITE_URL}/#localbusiness` as const;
export const WEBSITE_ID = `${SITE_URL}/#website` as const;
