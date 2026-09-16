import { api } from "@/lib/api/client";
import type {
  Order,
  OrderCreateRequest,
  OrderListResponse,
  OrderStatus,
  OrderStatusUpdateRequest,
} from "@/types/order";

export type ListOrdersParams = {
  page?: number;
  page_size?: number;
  /** Matches order number, customer phone or customer name. */
  search?: string;
  status?: OrderStatus;
  customer_id?: string;
  /** Created on or after this date (UTC, `YYYY-MM-DD`). */
  date_from?: string;
  /** Created on or before this date (UTC, `YYYY-MM-DD`). */
  date_to?: string;
};

export async function listOrders(
  params: ListOrdersParams = {},
  options: { signal?: AbortSignal } = {}
): Promise<OrderListResponse> {
  return api.get<OrderListResponse>("/orders", {
    signal: options.signal,
    query: {
      page: params.page ?? 1,
      page_size: params.page_size ?? 20,
      search: params.search,
      status: params.status,
      customer_id: params.customer_id,
      date_from: params.date_from,
      date_to: params.date_to,
    },
  });
}

export async function getOrder(id: string): Promise<Order> {
  return api.get<Order>(`/orders/${id}`);
}

/**
 * Sends only the customer details and item selections. Prices, the order total
 * and stock deduction are all resolved server-side.
 */
export async function createOrder(data: OrderCreateRequest): Promise<Order> {
  return api.post<Order>("/orders", data);
}

export async function updateOrderStatus(
  id: string,
  data: OrderStatusUpdateRequest
): Promise<Order> {
  return api.patch<Order>(`/orders/${id}/status`, data);
}
