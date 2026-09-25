import type { ReactNode } from "react";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

const ILLUSTRATION = {
  src: "/images/404-illustration.webp",
  width: 819,
  height: 1024,
  alt: "Illustration — a person watering a plant beside a large 404 mark",
} as const;

function StatusView({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description: string;
  actions: ReactNode;
  className?: string;
}) {
  return (
    <section
      data-slot="status-view"
      className={cn(
        "flex min-h-dvh items-center bg-background py-12 md:py-16",
        className
      )}
    >
      <Container className="w-full">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 md:gap-8 lg:flex-row lg:justify-center lg:gap-10">
          <div className="flex w-full max-w-[18rem] shrink-0 justify-center sm:max-w-[22rem] md:max-w-[24rem]">
            <Image
              src={ILLUSTRATION.src}
              alt={ILLUSTRATION.alt}
              width={ILLUSTRATION.width}
              height={ILLUSTRATION.height}
              priority
              className="h-auto w-full max-h-[min(48vh,24rem)] object-contain object-center sm:max-h-[min(52vh,28rem)] lg:max-h-[min(68vh,34rem)]"
              sizes="(max-width: 1024px) min(24rem, 85vw), min(24rem, 40vw)"
            />
          </div>

          <div className="w-full max-w-md text-center lg:max-w-sm lg:text-left xl:max-w-md">
            <h1 className="font-heading text-[2rem] leading-[1.15] font-bold tracking-tight text-foreground md:text-[2.5rem] lg:text-[clamp(2.5rem,2.2rem+0.8vw,3rem)]">
              {title}
            </h1>
            <p className="mt-4 font-sans text-body text-muted-foreground md:mt-5">
              {description}
            </p>
            <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:justify-center lg:justify-start">
              {actions}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export { StatusView };
