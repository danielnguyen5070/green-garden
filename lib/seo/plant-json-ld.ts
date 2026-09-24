import { SITE_URL } from "@/config/site";
import { getCartCurrency } from "@/lib/cart";
import {
  BRAND_ID,
  BUSINESS_DISPLAY_NAME,
  LOCAL_BUSINESS_ID,
  WEBSITE_ID,
} from "@/lib/seo/schema-ids";
import { toAbsoluteUrl } from "@/lib/seo/url";
import {
  getActivePotSizes,
  getLocalizedPlant,
  getPrimaryPlantImage,
  localizeOptionalTextEither,
  localizePrice,
  localizeText,
  sortPlantImages,
} from "@/lib/storefront";
import type { StorefrontPlantDetail } from "@/types/storefront";

type PlantJsonLdInput = {
  locale: string;
  plant: StorefrontPlantDetail;
  homeLabel: string;
  plantsLabel: string;
};

/**
 * Plant detail @graph: Brand, Product (+ Offer/AggregateOffer), BreadcrumbList.
 *
 * - `brand` → `#brand` (Brand with a real name) — never `#localbusiness`
 * - `seller` → `#localbusiness` (the shop LocalBusiness on the homepage)
 *
 * Omits optional fields we cannot represent accurately yet: `review`,
 * `aggregateRating`, `shippingDetails`, `hasMerchantReturnPolicy`.
 */
export function buildPlantJsonLd({
  locale,
  plant,
  homeLabel,
  plantsLabel,
}: PlantJsonLdInput) {
  const { name, description, price: basePrice } = getLocalizedPlant(
    plant,
    locale
  );
  const longDescription = localizeOptionalTextEither(
    plant.long_description,
    plant.long_description_vi,
    locale
  );
  // Prefer long-form copy for Product schema when present.
  const schemaDescription = longDescription ?? description;
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

  const seller = { "@id": LOCAL_BUSINESS_ID };

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
          seller,
        }
      : {
          "@type": "Offer",
          price: basePrice.toFixed(currency === "VND" ? 0 : 2),
          priceCurrency: currency,
          availability,
          url: pageUrl,
          seller,
        };

  const plantsUrl = `${SITE_URL}/${locale}/plants`;
  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: homeLabel,
      item: `${SITE_URL}/${locale}`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: plantsLabel,
      item: plantsUrl,
    },
    {
      "@type": "ListItem",
      position: 3,
      name,
      item: pageUrl,
    },
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Brand",
        "@id": BRAND_ID,
        name: BUSINESS_DISPLAY_NAME,
        url: SITE_URL,
      },
      {
        "@type": "Product",
        "@id": `${pageUrl}#product`,
        name,
        ...(schemaDescription ? { description: schemaDescription } : {}),
        ...(imageUrls.length > 0 ? { image: imageUrls } : {}),
        url: pageUrl,
        ...(categoryName ? { category: categoryName } : {}),
        brand: { "@id": BRAND_ID },
        offers,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": pageUrl,
          url: pageUrl,
          name,
          ...(schemaDescription ? { description: schemaDescription } : {}),
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
