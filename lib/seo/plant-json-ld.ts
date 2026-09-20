import { SITE_URL } from "@/config/site";
import { getCartCurrency } from "@/lib/cart";
import { LOCAL_BUSINESS_ID, WEBSITE_ID } from "@/lib/seo/schema-ids";
import { toAbsoluteUrl } from "@/lib/seo/url";
import {
  getActivePotSizes,
  getLocalizedPlant,
  getPrimaryPlantImage,
  localizePrice,
  localizeText,
  sortPlantImages,
} from "@/lib/storefront";
import type { StorefrontPlantDetail } from "@/types/storefront";

type PlantJsonLdInput = {
  locale: string;
  plant: StorefrontPlantDetail;
  homeLabel: string;
};

/**
 * Plant detail @graph: Product (+ Offer/AggregateOffer) and BreadcrumbList.
 * Matches the visible Home → Plant trail (category has no public URL).
 */
export function buildPlantJsonLd({
  locale,
  plant,
  homeLabel,
}: PlantJsonLdInput) {
  const { name, description, price: basePrice } = getLocalizedPlant(
    plant,
    locale
  );
  const pageUrl = `${SITE_URL}/${locale}/plants/${plant.slug}`;
  const currency = getCartCurrency(locale);
  const availability = plant.in_stock
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  const potSizes = getActivePotSizes(plant.pot_sizes);
  const offerPrices =
    potSizes.length > 0
      ? potSizes.map(
          (size) =>
            basePrice +
            localizePrice(
              size.price_adjustment,
              size.price_adjustment_vi,
              locale
            )
        )
      : [basePrice];
  const lowPrice = Math.min(...offerPrices);
  const highPrice = Math.max(...offerPrices);

  const imageUrls = sortPlantImages(plant.images)
    .filter((image) => image.type === "image")
    .map((image) => toAbsoluteUrl(image.url));

  if (imageUrls.length === 0) {
    const primary = getPrimaryPlantImage(plant.images);
    if (primary?.url) {
      imageUrls.push(toAbsoluteUrl(primary.url));
    } else if (plant.og_image_url?.trim()) {
      imageUrls.push(toAbsoluteUrl(plant.og_image_url.trim()));
    }
  }

  const categoryName = plant.category
    ? localizeText(plant.category.name, plant.category.name_vi, locale)
    : null;

  const offers =
    potSizes.length > 1
      ? {
          "@type": "AggregateOffer",
          lowPrice: lowPrice.toFixed(currency === "VND" ? 0 : 2),
          highPrice: highPrice.toFixed(currency === "VND" ? 0 : 2),
          priceCurrency: currency,
          offerCount: potSizes.length,
          availability,
          url: pageUrl,
          seller: { "@id": LOCAL_BUSINESS_ID },
        }
      : {
          "@type": "Offer",
          price: basePrice.toFixed(currency === "VND" ? 0 : 2),
          priceCurrency: currency,
          availability,
          url: pageUrl,
          seller: { "@id": LOCAL_BUSINESS_ID },
        };

  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: homeLabel,
      item: `${SITE_URL}/${locale}`,
    },
    ...(categoryName
      ? [
          {
            "@type": "ListItem",
            position: 2,
            name: categoryName,
          },
        ]
      : []),
    {
      "@type": "ListItem",
      position: categoryName ? 3 : 2,
      name,
      item: pageUrl,
    },
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${pageUrl}#product`,
        name,
        ...(description ? { description } : {}),
        ...(imageUrls.length > 0 ? { image: imageUrls } : {}),
        url: pageUrl,
        ...(categoryName ? { category: categoryName } : {}),
        brand: {
          "@id": LOCAL_BUSINESS_ID,
        },
        offers,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": pageUrl,
          url: pageUrl,
          name,
          ...(description ? { description } : {}),
          inLanguage: locale,
          isPartOf: {
            "@id": WEBSITE_ID,
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: breadcrumbItems,
      },
    ],
  };
}
