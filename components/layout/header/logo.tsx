import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/images/logo-mark2.png"
      alt=""
      width={48}
      height={48}
      aria-hidden="true"
      className={cn("size-7 shrink-0", className)}
    />
  );
}

function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex shrink-0 items-center gap-2.5 rounded-md text-foreground outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:gap-3",
        className
      )}
    >
      <LogoMark className="size-10 sm:size-11 md:size-12" />
      <span className="font-sans text-base font-semibold tracking-tight text-foreground sm:text-lg">
        NGOC NGAN
      </span>
    </Link>
  );
}

export { Logo, LogoMark };
