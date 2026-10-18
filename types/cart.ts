/**
 * A cart line is only a selection. Names, images, prices, shipping and totals
 * all come from the backend quote, so nothing here can go stale or carry the
 * wrong currency.
 */
export type CartItem = {
  id: string;
  plantId: string;
  quantity: number;
};

export type CartPlantInput = {
  plantId: string;
  quantity?: number;
};

export function getCartLineId(input: { plantId: string }) {
  return input.plantId;
}
