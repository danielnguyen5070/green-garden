import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";
import { HeaderActions } from "./header/header-actions";
import { Logo } from "./header/logo";
import { MobileMenu } from "./header/mobile-menu";
import { Navigation } from "./header/navigation";
import { HeaderSearch } from "./header/search";

function Header({ className }: { className?: string }) {
  return (
    <header
      data-slot="header"
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border bg-background",
        className
      )}
    >
      <Container className="flex h-[4.75rem] items-center gap-4 md:h-20 md:gap-6 lg:gap-10">
        <div className="flex min-w-0 items-center gap-6 lg:gap-10">
          <Logo />
          <Navigation className="hidden md:block" />
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-2.5 md:gap-3">
          <HeaderSearch className="max-w-[9.5rem] sm:max-w-[11rem] md:max-w-[13rem] lg:max-w-56" />
          <HeaderActions />
          <MobileMenu />
        </div>
      </Container>
    </header>
  );
}

export { Header };
