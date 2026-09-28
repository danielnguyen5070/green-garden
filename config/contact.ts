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
  mapUrl:
    "https://www.google.com/maps/place/C%C3%A2y+gi%E1%BB%91ng+Ng%E1%BB%8Dc+Ng%C3%A2n+B%E1%BA%BFn+Tre/@10.2212835,106.2300361,17z",
} as const;

/** Must match the hours on the Google Business Profile. */
export const BUSINESS_HOURS = {
  days: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
  opens: "07:00",
  closes: "18:00",
} as const;

export const CONTACT_SMS_HREF =
  `sms:${CONTACT_CONFIG.phoneE164}` as const;
