import type { Plant } from "@/types/plant";

export type CartItem = {
  id: string;
  plantId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  description: string;
};

export type CartPlantInput = Pick<
  Plant,
  "id" | "name" | "slug" | "image" | "price" | "description"
>;
