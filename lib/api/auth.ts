import { api } from "@/lib/api/client";
import type { Admin } from "@/types/admin";
import type {
  AdminLoginRequest,
  AuthResponse,
  MessageResponse,
} from "@/types/auth";

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const body: AdminLoginRequest = { email, password };
  return api.post<AuthResponse>("/auth/login", body, {
    skipAuthRefresh: true,
    skipAuthRedirect: true,
  });
}

export async function logout(): Promise<MessageResponse> {
  return api.post<MessageResponse>(
    "/auth/logout",
    undefined,
    {
      skipAuthRefresh: true,
      skipAuthRedirect: true,
    }
  );
}

export async function getCurrentAdmin(): Promise<Admin> {
  return api.get<Admin>("/auth/me", { skipAuthRedirect: true });
}

export async function refreshToken(): Promise<MessageResponse> {
  return api.post<MessageResponse>(
    "/auth/refresh",
    undefined,
    {
      skipAuthRefresh: true,
      skipAuthRedirect: true,
    }
  );
}
