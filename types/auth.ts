import type { Admin } from "@/types/admin";

export type AuthResponse = {
  admin: Admin;
};

export type MessageResponse = {
  message: string;
};

export type AdminLoginRequest = {
  email: string;
  password: string;
};
