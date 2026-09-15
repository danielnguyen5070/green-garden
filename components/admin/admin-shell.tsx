"use client";

import { useState, type ReactNode } from "react";
import { AdminAuthProvider, useAdminAuth } from "@/components/admin/admin-auth-provider";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { adminCopy } from "@/lib/admin-copy";

type AdminShellProps = {
  children: ReactNode;
};

function AdminShellFrame({ children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { loading, admin } = useAdminAuth();

  if (loading || !admin) {
    return (
      <div className="flex min-h-dvh flex-1 items-center justify-center bg-background text-sm text-muted-foreground">
        {adminCopy.common.loading}
      </div>
    );
  }

  return (
    <div
      data-slot="admin-shell"
      className="flex min-h-dvh flex-1 bg-background text-foreground"
    >
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col xl:w-72">
        <AdminSidebar />
      </div>

      <AdminMobileNav open={mobileOpen} onOpenChange={setMobileOpen} />

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64 xl:pl-72">
        <AdminTopbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-x-hidden px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto w-full max-w-7xl space-y-6 md:space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function AdminShell({ children }: AdminShellProps) {
  return (
    <AdminAuthProvider>
      <AdminShellFrame>{children}</AdminShellFrame>
    </AdminAuthProvider>
  );
}

export { AdminShell };
