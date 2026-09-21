import { CONTACT_CONFIG } from "@/config/contact";

export const FOOTER_BRAND = {
  href: "/",
  nameKey: "brand.name",
  descriptionKey: "brand.description",
} as const;

export const FOOTER_SHOP = {
  titleKey: "shop.title",
  links: [
    { href: "/plants", labelKey: "shop.newArrivals" },
    { href: "/plants", labelKey: "shop.bestSellers" },
    { href: "/plants", labelKey: "shop.categories" },
    { href: "/plants", labelKey: "shop.plants" },
  ],
} as const;

export const FOOTER_SUPPORT = {
  titleKey: "support.title",
  links: [
    { href: "/blog", labelKey: "support.careGuide" },
    { href: "/faq", labelKey: "support.faq" },
    { href: "/reviews", labelKey: "support.reviews" },
    {
      href: CONTACT_CONFIG.zaloUrl,
      labelKey: "support.shipping",
      external: true,
    },
    {
      href: CONTACT_CONFIG.zaloUrl,
      labelKey: "support.contact",
      external: true,
    },
  ],
} as const;

export const FOOTER_SOCIAL = {
  titleKey: "social.title",
  links: [
    {
      href: CONTACT_CONFIG.facebookUrl,
      labelKey: "social.facebook",
      icon: "facebook",
    },
    {
      href: CONTACT_CONFIG.tiktokUrl,
      labelKey: "social.tiktok",
      icon: "tiktok",
    },
    {
      href: CONTACT_CONFIG.youtubeUrl,
      labelKey: "social.youtube",
      icon: "youtube",
    },
  ],
} as const;

export const FOOTER_SECTIONS = {
  brand: FOOTER_BRAND,
  shop: FOOTER_SHOP,
  support: FOOTER_SUPPORT,
  social: FOOTER_SOCIAL,
} as const;

export type FooterNavSection = typeof FOOTER_SHOP | typeof FOOTER_SUPPORT;
export type FooterSocialIcon = (typeof FOOTER_SOCIAL.links)[number]["icon"];
