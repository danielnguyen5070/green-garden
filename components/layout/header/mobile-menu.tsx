"use client";

import Link from "next/link";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "./logo";
import { NAV_LINKS } from "@/config/navigation";

function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-10 text-foreground hover:bg-muted md:hidden"
            aria-label="Open menu"
          />
        }
      >
        <MenuIcon className="size-5 stroke-[1.5]" />
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[min(100%,20rem)] bg-background p-0"
      >
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <Logo />
        </SheetHeader>

        <nav aria-label="Mobile" className="px-2 py-3">
          <ul className="flex flex-col gap-0.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <SheetClose
                  render={
                    <Link
                      href={link.href}
                      className="block rounded-md px-3 py-2.5 font-sans text-base font-medium text-foreground outline-none transition-colors hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  }
                >
                  {link.label}
                </SheetClose>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto border-t border-border px-5 py-4">
          <SheetClose
            render={
              <Button
                variant="ghost"
                className="h-10 w-full justify-start px-3 font-medium"
                type="button"
                aria-label="Account"
              />
            }
          >
            Account
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { MobileMenu };
