"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { getCurrentAdmin, logout as logoutRequest } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/errors";
import type { Admin } from "@/types/admin";

type AdminAuthContextValue = {
  admin: Admin | null;
  loading: boolean;
  error: string | null;
  setAdmin: (admin: Admin | null) => void;
  refreshAdmin: () => Promise<Admin | null>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

type AdminAuthProviderProps = {
  children: ReactNode;
};

function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAdmin = useCallback(async () => {
    try {
      const current = await getCurrentAdmin();
      setAdmin(current);
      setError(null);
      return current;
    } catch (err) {
      setAdmin(null);
      setError(getErrorMessage(err));
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const current = await getCurrentAdmin();
        if (cancelled) return;
        setAdmin(current);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setAdmin(null);
        setError(getErrorMessage(err));
        try {
          await logoutRequest();
        } catch {
          // Ignore logout failures; still leave the protected area.
        }
        if (!cancelled) {
          router.replace("/admin/login");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Always clear local state and leave admin area.
    } finally {
      setAdmin(null);
      router.replace("/admin/login");
    }
  }, [router]);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      admin,
      loading,
      error,
      setAdmin,
      refreshAdmin,
      logout,
    }),
    [admin, loading, error, refreshAdmin, logout]
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}

export { AdminAuthProvider, useAdminAuth };
