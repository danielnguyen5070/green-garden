import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/cart/", "/checkout/"],
    },
    sitemap: "https://www.ngocnganbentre.vn/sitemap.xml",
  };
}
