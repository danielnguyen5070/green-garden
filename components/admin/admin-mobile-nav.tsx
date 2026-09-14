"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { adminCopy } from "@/lib/admin-copy";

type AdminMobileNavProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function AdminMobileNav({ open, onOpenChange }: AdminMobileNavProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[min(100%,20rem)] gap-0 p-0 sm:max-w-80"
        showCloseButton
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{adminCopy.navigation.mainNav}</SheetTitle>
        </SheetHeader>
        <AdminSidebar
          className="h-full border-r-0"
          onNavigate={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}

export { AdminMobileNav };
