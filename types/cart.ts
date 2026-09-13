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
  potSizeId?: string;
  potSizeLabel?: string;
  potColorId?: string;
  potColorLabel?: string;
};

export type CartPlantInput = {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  description: string;
  quantity?: number;
  potSizeId?: string;
  potSizeLabel?: string;
  potColorId?: string;
  potColorLabel?: string;
};

export function getCartLineId(input: {
  id: string;
  potSizeId?: string;
  potColorId?: string;
}) {
  const size = input.potSizeId ?? "default";
  const color = input.potColorId ?? "default";
  return `${input.id}__${size}__${color}`;
}

export function toCartPlantInput(plant: Plant): CartPlantInput {
  return {
    id: plant.id,
    name: plant.name,
    slug: plant.slug,
    image: plant.image,
    price: plant.price,
    description: plant.description,
  };
}
