/**
 * Storefront contact channels — update these values for production.
 */
export const CONTACT_CONFIG = {
  phone: "+84901234567",
  zaloUrl: "https://zalo.me/84901234567",
} as const;

export const CONTACT_PHONE_HREF = `tel:${CONTACT_CONFIG.phone}` as const;
