"use client";

import {
  FolderTree,
  LayoutDashboard,
  Leaf,
  MessageSquareQuote,
  Settings,
  Shield,
  ShoppingBag,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminCopy } from "@/lib/admin-copy";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const primaryNav: NavItem[] = [
  {
    href: "/admin",
    label: adminCopy.navigation.overview,
    icon: LayoutDashboard,
  },
  { href: "/admin/plants", label: adminCopy.navigation.plants, icon: Leaf },
  {
    href: "/admin/categories",
    label: adminCopy.navigation.categories,
    icon: FolderTree,
  },
  {
    href: "/admin/orders",
    label: adminCopy.navigation.orders,
    icon: ShoppingBag,
  },
  {
    href: "/admin/reviews",
    label: adminCopy.navigation.reviews,
    icon: MessageSquareQuote,
  },
];

const managementNav: NavItem[] = [
  {
    href: "/admin/customers",
    label: adminCopy.navigation.customers,
    icon: Users,
  },
  {
    href: "/admin/admins",
    label: adminCopy.navigation.admins,
    icon: Shield,
  },
  {
    href: "/admin/settings",
    label: adminCopy.navigation.settings,
    icon: Settings,
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

type AdminNavProps = {
  onNavigate?: () => void;
  className?: string;
};

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "bg-primary/12 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  );
}

function AdminNav({ onNavigate, className }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav
      data-slot="admin-nav"
      aria-label={adminCopy.navigation.mainNav}
      className={cn("flex flex-col gap-6", className)}
    >
      <div className="flex flex-col gap-1">
        {primaryNav.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isActivePath(pathname, item.href)}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <p className="px-3 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {adminCopy.navigation.management}
        </p>
        {managementNav.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isActivePath(pathname, item.href)}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </nav>
  );
}

export { AdminNav, primaryNav, managementNav, isActivePath };
export type { NavItem };
