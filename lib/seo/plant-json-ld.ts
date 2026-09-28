import { SITE_URL } from "@/config/site";
import { CART_CURRENCY, parseMoney } from "@/lib/cart";
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
  getPotSizeAdjustment,
  getPrimaryPlantImage,
  localizeOptionalTextEither,
  localizeText,
  sortPlantImages,
} from "@/lib/storefront";
import type {
  StorefrontPlantDetail,
  StorefrontShippingPolicy,
} from "@/types/storefront";

type PlantJsonLdInput = {
  locale: string;
  plant: StorefrontPlantDetail;
  homeLabel: string;
  plantsLabel: string;
  /** `null` when the policy could not be loaded; shipping details are omitted. */
  shippingPolicy: StorefrontShippingPolicy | null;
};

/**
 * Offer-level shipping for merchant listings.
 *
 * Lists the standard fee from the backend shipping policy, the same one
 * checkout charges; free shipping still applies when the order subtotal is
 * above the threshold.
 *
 * Transit: 3–5 business days (Vietnam Post / J&T), matching checkout copy.
 */
function buildOfferShippingDetails(policy: StorefrontShippingPolicy) {
  return {
    "@type": "OfferShippingDetails" as const,
    shippingRate: {
      "@type": "MonetaryAmount" as const,
      value: parseMoney(policy.shipping_fee),
      currency: policy.currency,
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

/**
 * Plant detail @graph: Brand, Product (+ Offers), BreadcrumbList.
 *
 * - `brand` → `#brand` (Brand with a real name) — never `#localbusiness`
 * - `seller` → `#localbusiness` (the shop LocalBusiness on the homepage)
 * - `offers` → one VND Offer per active pot size (default size first), or a
 *   single Offer at the base price when the plant has no sizes. Omitted when
 *   the plant has no VND price, because it cannot be ordered.
 *
 * Omits optional fields we cannot represent accurately yet: `review`,
 * `aggregateRating`.
 */
export function buildPlantJsonLd({
  locale,
  plant,
  homeLabel,
  plantsLabel,
  shippingPolicy,
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
  const availability = plant.in_stock
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  const potSizes = getActivePotSizes(plant.pot_sizes);

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
  const shippingDetails = shippingPolicy
    ? buildOfferShippingDetails(shippingPolicy)
    : null;
  const hasMerchantReturnPolicy = buildMerchantReturnPolicy(locale);

  const buildOffer = (price: number, sizeName?: string) => ({
    "@type": "Offer" as const,
    ...(sizeName ? { name: sizeName } : {}),
    price: price.toFixed(0),
    priceCurrency: CART_CURRENCY,
    availability,
    url: pageUrl,
    seller,
    ...(shippingDetails ? { shippingDetails } : {}),
    hasMerchantReturnPolicy,
  });

  // Unit prices must match what `PlantDetail` shows and checkout charges.
  const offers =
    basePrice === null
      ? null
      : potSizes.length > 0
        ? potSizes.map((size) =>
            buildOffer(basePrice + getPotSizeAdjustment(size), size.name)
          )
        : buildOffer(basePrice);

  const plantsUrl = `${SITE_URL}/${locale}/plants`;
  const breadcrumbTrail = [
    { name: homeLabel, item: `${SITE_URL}/${locale}` },
    { name: plantsLabel, item: plantsUrl },
    ...(plant.category && categoryName
      ? [
          {
            name: categoryName,
            item: `${SITE_URL}/${locale}/categories/${plant.category.slug}`,
          },
        ]
      : []),
    { name, item: pageUrl },
  ];
  const breadcrumbItems = breadcrumbTrail.map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    ...crumb,
  }));

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
        ...(offers ? { offers } : {}),
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
