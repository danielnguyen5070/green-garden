/**
 * Storefront contact channels — update these values for production.
 * Phone is for SMS/Zalo messaging only (no voice calls).
 */
export const CONTACT_CONFIG = {
  phone: "0386569374",
  phoneE164: "+84386569374",
  email: "ngocnganbentre90@gmail.com",
  address: "618/34 ấp Bình Tây, Vĩnh Thành, Vĩnh Long",
  zaloUrl: "https://zalo.me/0386569374",
  /** Zalo community group invite. Falls back to the 1:1 chat until the real group link is set. */
  zaloGroupUrl: "https://zalo.me/0386569374",
  facebookUrl: "https://www.facebook.com/ngan.nguyenngockim.77",
  tiktokUrl: "https://www.tiktok.com/@ngocnganbentre",
  youtubeUrl: "https://www.youtube.com/@ngocnganbentre",
} as const;

export const CONTACT_SMS_HREF =
  `sms:${CONTACT_CONFIG.phoneE164}` as const;
