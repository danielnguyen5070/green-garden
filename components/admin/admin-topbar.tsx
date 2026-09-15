"use client";

import { Bell, Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/admin/admin-auth-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminCopy } from "@/lib/admin-copy";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const titleByPath: Record<string, string> = {
  "/admin": adminCopy.dashboard.title,
  "/admin/plants": adminCopy.plants.title,
  "/admin/categories": adminCopy.categories.title,
  "/admin/orders": adminCopy.orders.title,
  "/admin/blog": adminCopy.blog.title,
  "/admin/customers": adminCopy.customers.title,
  "/admin/admins": adminCopy.admins.title,
  "/admin/settings": adminCopy.settings.title,
};

type AdminTopbarProps = {
  onMenuClick: () => void;
  className?: string;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "GG";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function AdminTopbar({ onMenuClick, className }: AdminTopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout } = useAdminAuth();

  const matchedPath =
    Object.keys(titleByPath)
      .sort((a, b) => b.length - a.length)
      .find(
        (path) =>
          pathname === path ||
          (path !== "/admin" && pathname.startsWith(`${path}/`))
      ) ?? "/admin";

  const title = titleByPath[matchedPath] ?? adminCopy.dashboard.title;
  const profileName = admin?.name ?? adminCopy.topbar.profileName;
  const profileEmail = admin?.email ?? adminCopy.topbar.profileEmail;

  return (
    <header
      data-slot="admin-topbar"
      className={cn(
        "sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-md md:h-16 md:px-6",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label={adminCopy.navigation.openMenu}
        >
          <Menu className="size-5" />
        </Button>
        <p className="truncate font-heading text-sm font-semibold text-foreground md:text-base">
          {title}
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={adminCopy.topbar.notifications}
        >
          <Bell className="size-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label={adminCopy.topbar.profile}
              />
            }
          >
            <span
              className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
              aria-hidden="true"
            >
              {getInitials(profileName)}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <span className="block text-sm font-medium text-foreground">
                  {profileName}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {profileEmail}
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => router.push(`/${routing.defaultLocale}`)}
            >
              {adminCopy.topbar.viewStore}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                void logout();
              }}
            >
              {adminCopy.topbar.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export { AdminTopbar };
