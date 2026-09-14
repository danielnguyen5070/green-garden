"use client";

import Link from "next/link";
import { LogoMark } from "@/components/layout/header/logo";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { adminCopy } from "@/lib/admin-copy";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  onNavigate?: () => void;
  className?: string;
};

function AdminSidebar({ onNavigate, className }: AdminSidebarProps) {
  return (
    <aside
      data-slot="admin-sidebar"
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      <div className="flex items-center gap-2.5 px-4 py-4">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="inline-flex min-w-0 items-center gap-2.5 rounded outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <LogoMark className="size-9" />
          <span className="min-w-0">
            <span className="block truncate font-sans text-sm font-semibold tracking-tight text-foreground">
              {adminCopy.brand}
            </span>
            <span className="block text-xs text-muted-foreground">
              {adminCopy.brandSubtitle}
            </span>
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <AdminNav onNavigate={onNavigate} />
      </div>

      <div className="border-t border-sidebar-border p-3">
        <div className="rounded bg-brand-deep px-4 py-4 text-brand-cream">
          <p className="font-heading text-sm font-semibold">
            {adminCopy.navigation.help}
          </p>
          <p className="mt-1 text-xs text-brand-cream/75">
            {adminCopy.navigation.helpDescription}
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3 w-full bg-brand-cream text-brand-deep hover:bg-brand-cream/90"
            nativeButton={false}
            render={<a href="mailto:support@greengarden.vn" />}
          >
            {adminCopy.navigation.helpCta}
          </Button>
        </div>
      </div>
    </aside>
  );
}

export { AdminSidebar };
