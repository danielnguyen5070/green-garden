/**
 * Order shapes from the FastAPI backend.
 *
 * The backend owns every monetary value here: it snapshots the plant price plus
 * the pot-size adjustment into `unit_price` and sums them into `total_amount`.
 * The admin UI only displays what it receives.
 */

/** Money is serialized by the backend as an exact decimal string ("1250000.00"). */
export type DecimalString = string;

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipping",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

/** Customer summary embedded in an order response. */
export type OrderCustomer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
};

export type OrderItem = {
  id: string;
  plant_id: string;
  /** Snapshot of the plant name at order time. */
  plant_name: string;
  quantity: number;
  unit_price: DecimalString;
  pot_size: string | null;
};

export type Order = {
  id: string;
  order_number: string;
  status: OrderStatus;
  total_amount: DecimalString;
  shipping_address: string;
  note: string | null;
  customer: OrderCustomer;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
};

export type OrderListResponse = {
  items: Order[];
  page: number;
  page_size: number;
  total: number;
};

/** Customer details for a new order; the backend links or creates by phone. */
export type OrderCustomerCreateRequest = {
  phone: string;
  name: string;
  email?: string | null;
};

/** Only the selection is sent — the backend resolves price and stock. */
export type OrderItemCreateRequest = {
  plant_id: string;
  quantity: number;
  pot_size?: string | null;
};

export type OrderCreateRequest = {
  customer: OrderCustomerCreateRequest;
  shipping_address: string;
  note?: string | null;
  items: OrderItemCreateRequest[];
};

export type OrderStatusUpdateRequest = {
  status: OrderStatus;
};
