export const FAQ_CATEGORY_IDS = [
  "orders",
  "delivery",
  "care",
  "plants",
  "returns",
] as const;

export type FaqCategoryId = (typeof FAQ_CATEGORY_IDS)[number];

export type FaqCategoryFilter = "all" | FaqCategoryId;

export type FaqItemConfig = {
  id: string;
  categoryId: FaqCategoryId;
};

export const FAQ_CATEGORIES = [
  { id: "all", labelKey: "all" },
  { id: "orders", labelKey: "orders" },
  { id: "delivery", labelKey: "delivery" },
  { id: "care", labelKey: "care" },
  { id: "plants", labelKey: "plants" },
  { id: "returns", labelKey: "returns" },
] as const satisfies ReadonlyArray<{
  id: FaqCategoryFilter;
  labelKey: string;
}>;

export const FAQ_ITEMS: readonly FaqItemConfig[] = [
  { id: "placeOrder", categoryId: "orders" },
  { id: "noAccount", categoryId: "orders" },
  { id: "orderConfirmation", categoryId: "orders" },
  { id: "changeOrder", categoryId: "orders" },
  { id: "multiplePlants", categoryId: "orders" },
  { id: "deliveryTime", categoryId: "delivery" },
  { id: "shippingCost", categoryId: "delivery" },
  { id: "nationwide", categoryId: "delivery" },
  { id: "packaging", categoryId: "delivery" },
  { id: "trackOrder", categoryId: "delivery" },
  { id: "afterDelivery", categoryId: "care" },
  { id: "watering", categoryId: "care" },
  { id: "planting", categoryId: "care" },
  { id: "losingLeaves", categoryId: "care" },
  { id: "fruiting", categoryId: "care" },
  { id: "graftedSeedlings", categoryId: "plants" },
  { id: "plantSize", categoryId: "plants" },
  { id: "potSize", categoryId: "plants" },
  { id: "plantsWithPots", categoryId: "plants" },
  { id: "returnPolicy", categoryId: "returns" },
  { id: "damagedPlant", categoryId: "returns" },
  { id: "exchangePlant", categoryId: "returns" },
] as const;

export function filterFaqItems(
  items: readonly FaqItemConfig[],
  category: FaqCategoryFilter
): FaqItemConfig[] {
  if (category === "all") {
    return [...items];
  }

  return items.filter((item) => item.categoryId === category);
}
