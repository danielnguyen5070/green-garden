import { api } from "@/lib/api/client";
import type {
  Customer,
  CustomerCreateRequest,
  CustomerListResponse,
  CustomerStatusUpdateRequest,
  CustomerUpdateRequest,
} from "@/types/customer";

export type ListCustomersParams = {
  page?: number;
  page_size?: number;
  /** Matches customer phone, name or email. */
  search?: string;
  is_active?: boolean;
};

export async function listCustomers(
  params: ListCustomersParams = {},
  options: { signal?: AbortSignal } = {}
): Promise<CustomerListResponse> {
  return api.get<CustomerListResponse>("/customers", {
    signal: options.signal,
    query: {
      page: params.page ?? 1,
      page_size: params.page_size ?? 20,
      search: params.search,
      is_active: params.is_active,
    },
  });
}

export async function getCustomer(id: string): Promise<Customer> {
  return api.get<Customer>(`/customers/${id}`);
}

export async function createCustomer(
  data: CustomerCreateRequest
): Promise<Customer> {
  return api.post<Customer>("/customers", data);
}

export async function updateCustomer(
  id: string,
  data: CustomerUpdateRequest
): Promise<Customer> {
  return api.patch<Customer>(`/customers/${id}`, data);
}

export async function updateCustomerStatus(
  id: string,
  data: CustomerStatusUpdateRequest
): Promise<Customer> {
  return api.patch<Customer>(`/customers/${id}/status`, data);
}
