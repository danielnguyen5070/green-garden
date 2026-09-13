export const FAQ_CATEGORY_IDS = [
  "orders",
  "delivery",
  "care",
  "pots",
  "returns",
  "general",
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
  { id: "pots", labelKey: "pots" },
  { id: "returns", labelKey: "returns" },
  { id: "general", labelKey: "general" },
] as const satisfies ReadonlyArray<{
  id: FaqCategoryFilter;
  labelKey: string;
}>;

export const FAQ_ITEMS: readonly FaqItemConfig[] = [
  { id: "placeOrder", categoryId: "orders" },
  { id: "changeOrder", categoryId: "orders" },
  { id: "multiplePlants", categoryId: "orders" },
  { id: "deliveryTime", categoryId: "delivery" },
  { id: "sameDay", categoryId: "delivery" },
  { id: "packaging", categoryId: "delivery" },
  { id: "outsideCity", categoryId: "delivery" },
  { id: "watering", categoryId: "care" },
  { id: "sunlight", categoryId: "care" },
  { id: "losingLeaves", categoryId: "care" },
  { id: "petSafety", categoryId: "care" },
  { id: "potSize", categoryId: "pots" },
  { id: "potColor", categoryId: "pots" },
  { id: "plantsWithPots", categoryId: "pots" },
  { id: "returnPolicy", categoryId: "returns" },
  { id: "damagedPlant", categoryId: "returns" },
  { id: "exchangePlant", categoryId: "returns" },
  { id: "whereGrown", categoryId: "general" },
  { id: "payment", categoryId: "general" },
  { id: "contactUs", categoryId: "general" },
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
