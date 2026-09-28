import { SITE_URL } from "@/config/site";
import { getCartCurrency, SHIPPING_RULES } from "@/lib/cart";
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
import type {
  StorefrontPlantDetail,
  StorefrontPlantPotSize,
} from "@/types/storefront";

type PlantJsonLdInput = {
  locale: string;
  plant: StorefrontPlantDetail;
  homeLabel: string;
  plantsLabel: string;
};

/**
 * Offer-level shipping for merchant listings.
 *
 * Uses the same flat fee / free-shipping currency rules as checkout
 * (`SHIPPING_RULES`). Lists the standard fee for Vietnam; free shipping still
 * applies in checkout when the cart meets the threshold.
 *
 * Transit: 3–5 business days (Vietnam Post / J&T), matching checkout copy.
 */
function buildOfferShippingDetails(locale: string) {
  const currency = getCartCurrency(locale);
  const { fee } = SHIPPING_RULES[currency];
  const decimals = currency === "VND" ? 0 : 2;

  return {
    "@type": "OfferShippingDetails" as const,
    shippingRate: {
      "@type": "MonetaryAmount" as const,
      value: Number(fee.toFixed(decimals)),
      currency,
    },
    shippingDestination: {
      "@type": "DefinedRegion" as const,
      addressCountry: "VN",
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime" as const,
      handlingTime: {
        "@type": "QuantitativeValue" as const,
        minValue: 0,
        maxValue: 1,
        unitCode: "DAY",
      },
      transitTime: {
        "@type": "QuantitativeValue" as const,
        minValue: 3,
        maxValue: 5,
        unitCode: "DAY",
      },
    },
  };
}

/**
 * Offer-level return policy for merchant listings.
 *
 * Matches FAQ: healthy plants are not taken back, so returns are not permitted.
 * Transit damage reported within 48 hours gets a replacement or refund — a
 * guarantee, not a return, so it lives only in the FAQ copy.
 */
function buildMerchantReturnPolicy(locale: string) {
  return {
    "@type": "MerchantReturnPolicy" as const,
    applicableCountry: "VN",
    returnPolicyCategory:
      "https://schema.org/MerchantReturnNotPermitted" as const,
    merchantReturnLink: `${SITE_URL}/${locale}/faq`,
  };
}

/** Must match the unit price `PlantDetail` shows for the selected pot size. */
function getPotSizeUnitPrice(
  basePrice: number,
  size: StorefrontPlantPotSize,
  locale: string
): number {
  return (
    basePrice +
    localizePrice(size.price_adjustment, size.price_adjustment_vi, locale)
  );
}

/**
 * Plant detail @graph: Brand, Product (+ Offers), BreadcrumbList.
 *
 * - `brand` → `#brand` (Brand with a real name) — never `#localbusiness`
 * - `seller` → `#localbusiness` (the shop LocalBusiness on the homepage)
 * - `offers` → one Offer per active pot size (default size first), or a single
 *   Offer at the base price when the plant has no sizes
 *
 * Omits optional fields we cannot represent accurately yet: `review`,
 * `aggregateRating`.
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
  const priceDecimals = currency === "VND" ? 0 : 2;

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
  const shippingDetails = buildOfferShippingDetails(locale);
  const hasMerchantReturnPolicy = buildMerchantReturnPolicy(locale);

  const buildOffer = (price: number, sizeName?: string) => ({
    "@type": "Offer" as const,
    ...(sizeName ? { name: sizeName } : {}),
    price: price.toFixed(priceDecimals),
    priceCurrency: currency,
    availability,
    url: pageUrl,
    seller,
    shippingDetails,
    hasMerchantReturnPolicy,
  });

  const offers =
    potSizes.length > 0
      ? potSizes.map((size) =>
          buildOffer(getPotSizeUnitPrice(basePrice, size, locale), size.name)
        )
      : buildOffer(basePrice);

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
