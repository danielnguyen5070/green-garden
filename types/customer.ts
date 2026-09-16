/** Customer from the FastAPI backend. Customers have no login or password. */
export type Customer = {
  id: string;
  phone: string;
  name: string;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CustomerListResponse = {
  items: Customer[];
  page: number;
  page_size: number;
  total: number;
};

export type CustomerCreateRequest = {
  phone: string;
  name: string;
  email?: string | null;
};

export type CustomerUpdateRequest = {
  phone?: string | null;
  name?: string | null;
  email?: string | null;
};

export type CustomerStatusUpdateRequest = {
  is_active: boolean;
};
