import { api } from "@/lib/api/client";
import type { MessageResponse } from "@/types/auth";
import type {
  Admin,
  AdminCreateRequest,
  AdminListResponse,
  AdminPasswordUpdateRequest,
  AdminStatusUpdateRequest,
  AdminUpdateRequest,
} from "@/types/admin";

export type ListAdminsParams = {
  page?: number;
  page_size?: number;
};

export async function listAdmins(
  params: ListAdminsParams = {}
): Promise<AdminListResponse> {
  return api.get<AdminListResponse>("/admins", {
    query: {
      page: params.page ?? 1,
      page_size: params.page_size ?? 20,
    },
  });
}

export async function getAdmin(id: string): Promise<Admin> {
  return api.get<Admin>(`/admins/${id}`);
}

export async function createAdmin(data: AdminCreateRequest): Promise<Admin> {
  return api.post<Admin>("/admins", data);
}

export async function updateAdmin(
  id: string,
  data: AdminUpdateRequest
): Promise<Admin> {
  return api.patch<Admin>(`/admins/${id}`, data);
}

export async function updateAdminStatus(
  id: string,
  data: AdminStatusUpdateRequest
): Promise<Admin> {
  return api.patch<Admin>(`/admins/${id}/status`, data);
}

export async function updateAdminPassword(
  id: string,
  data: AdminPasswordUpdateRequest
): Promise<MessageResponse> {
  return api.patch<MessageResponse>(`/admins/${id}/password`, data);
}
