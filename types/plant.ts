export type PlantImage = {
  src: string;
  alt?: string;
  type?: "image" | "video";
};

export type PlantPotSize = {
  id: string;
  label: string;
};

export type PlantPotColor = {
  id: string;
  label: string;
  hex: string;
};

export type PlantCare = {
  light: string;
  water: string;
  pets: string;
};

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
  scientificName?: string;
  longDescription?: string;
  rating?: number;
  reviewCount?: number;
  images?: PlantImage[];
  potSizes?: PlantPotSize[];
  potColors?: PlantPotColor[];
  care?: PlantCare;
};

export type PlantSortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "best-selling";
