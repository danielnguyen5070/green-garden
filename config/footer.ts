export const FOOTER_BRAND = {
  href: "/",
  nameKey: "brand.name",
  descriptionKey: "brand.description",
} as const;

export const FOOTER_SHOP = {
  titleKey: "shop.title",
  links: [
    { href: "/#products", labelKey: "shop.newArrivals" },
    { href: "/#products", labelKey: "shop.bestSellers" },
    { href: "/#products", labelKey: "shop.categories" },
    { href: "/#products", labelKey: "shop.plants" },
  ],
} as const;

export const FOOTER_SUPPORT = {
  titleKey: "support.title",
  links: [
    { href: "/blog", labelKey: "support.careGuide" },
    { href: "/#faq", labelKey: "support.faq" },
    { href: "/#shipping", labelKey: "support.shipping" },
    { href: "/#contact", labelKey: "support.contact" },
  ],
} as const;

export const FOOTER_SOCIAL = {
  titleKey: "social.title",
  links: [
    {
      href: "https://www.instagram.com",
      labelKey: "social.instagram",
      icon: "instagram",
    },
    {
      href: "https://www.facebook.com",
      labelKey: "social.facebook",
      icon: "facebook",
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
