/**
 * Storefront contact channels — update these values for production.
 * Phone is for SMS/Zalo messaging only (no voice calls).
 */
export const CONTACT_CONFIG = {
  phone: "0386569374",
  phoneE164: "+84386569374",
  zaloUrl: "https://zalo.me/0386569374",
  facebookUrl: "https://www.facebook.com/ngan.nguyenngockim.77",
  youtubeUrl: "https://www.youtube.com/@ngocnganbentre",
} as const;

export const CONTACT_SMS_HREF =
  `sms:${CONTACT_CONFIG.phoneE164}` as const;
