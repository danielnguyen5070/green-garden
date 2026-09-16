/**
 * Dashboard overview shapes from the FastAPI backend.
 *
 * Every count, sum and ranking here is calculated by the backend, so the admin
 * UI only formats what it receives. Revenue always means `completed` orders.
 */

import type { OrderStatus } from "@/types/order";

/** Money is serialized by the backend as an exact decimal string ("125000000.00"). */
export type DecimalString = string;

/** Catalogue, customer and order totals behind the header cards. */
export type OverviewSummary = {
  total_plants: number;
  active_plants: number;
  total_categories: number;
  active_categories: number;
  total_customers: number;
  active_customers: number;
  total_orders: number;
  pending_orders: number;
  total_revenue: DecimalString;
};

/** Orders created in a period, and the revenue its completed orders earned. */
export type SalesPeriodStats = {
  orders: number;
  revenue: DecimalString;
};

export type SalesOverview = {
  today: SalesPeriodStats;
  this_month: SalesPeriodStats;
};

/** Every order status is reported, including the ones with no orders at all. */
export type OrdersByStatus = Record<OrderStatus, number>;

/** One calendar day of the current month; days without sales are included. */
export type RevenueByDay = {
  /** UTC calendar day, `YYYY-MM-DD`. */
  date: string;
  orders: number;
  revenue: DecimalString;
};

/** Best seller, named and priced from the order item snapshots. */
export type TopPlant = {
  plant_id: string;
  plant_name: string;
  quantity_sold: number;
  revenue: DecimalString;
};

export type LowStockPlant = {
  plant_id: string;
  plant_name: string;
  stock: number;
};

/** Latest order, flattened by the backend for the dashboard table. */
export type RecentOrder = {
  id: string;
  order_number: string;
  customer_name: string | null;
  customer_phone: string | null;
  status: OrderStatus;
  total_amount: DecimalString;
  created_at: string;
};

export type OverviewResponse = {
  summary: OverviewSummary;
  sales: SalesOverview;
  orders_by_status: OrdersByStatus;
  /** Chronological, from the 1st of the current month up to today (UTC). */
  revenue_by_day: RevenueByDay[];
  /** Already ranked; the backend returns the 5 best sellers. */
  top_plants: TopPlant[];
  /** Active plants at or below the backend's threshold, scarcest first. */
  low_stock: LowStockPlant[];
  recent_orders: RecentOrder[];
};
