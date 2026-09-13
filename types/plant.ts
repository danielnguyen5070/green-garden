export type Plant = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  category: string;
  tags: string[];
  createdAt: string;
  soldCount: number;
  bestseller: boolean;
};

export type PlantSortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "best-selling";
