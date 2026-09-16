/** Admin account from the FastAPI backend. */
export type Admin = {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminListResponse = {
  items: Admin[];
  page: number;
  page_size: number;
  total: number;
};

export type AdminCreateRequest = {
  name: string;
  email: string;
  password: string;
};

export type AdminUpdateRequest = {
  name?: string | null;
  email?: string | null;
  is_active?: boolean | null;
};

export type AdminStatusUpdateRequest = {
  is_active: boolean;
};

export type AdminPasswordUpdateRequest = {
  password: string;
};

/** Legacy UI shapes retained for pages without a backend API yet. */
export type AdminStat = {
  id: "plants" | "orders" | "revenue" | "customers";
  value: number;
  changeKey: string;
  trend: "up" | "down" | "neutral";
  icon: "leaf" | "shopping-bag" | "banknote" | "users";
  format?: "currency" | "number";
};

export type AdminSalesPoint = {
  label: string;
  value: number;
};
