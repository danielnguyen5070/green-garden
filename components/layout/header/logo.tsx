import Link from "next/link";
import { cn } from "@/lib/utils";

function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-7 shrink-0 text-primary", className)}
    >
      <path
        d="M16 6.5c0 3.5-2.2 6.5-5 6.5 0-3.5 2.2-6.5 5-6.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 6.5c0 3.5 2.2 6.5 5 6.5 0-3.5-2.2-6.5-5-6.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 13v7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M11.5 25.5h9c.8 0 1.5-.7 1.5-1.5v-2c0-.8-.7-1.5-1.5-1.5h-9c-.8 0-1.5.7-1.5 1.5v2c0 .8.7 1.5 1.5 1.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-md text-foreground outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      <LogoMark />
      <span className="font-sans text-base font-semibold tracking-tight text-foreground sm:text-[1.05rem]">
        Green Garden
      </span>
    </Link>
  );
}

export { Logo, LogoMark };
