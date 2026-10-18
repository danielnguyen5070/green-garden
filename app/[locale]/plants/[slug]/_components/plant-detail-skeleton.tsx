import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

function PlantDetailSkeleton() {
  return (
    <section
      data-slot="plant-detail-loading"
      className="bg-background py-8 md:py-10 lg:py-12"
      aria-busy="true"
    >
      <Container>
        <nav className="mb-8 md:mb-10" aria-hidden="true">
          <div className="flex flex-wrap items-center gap-1.5">
            <Skeleton className="h-4 w-12 rounded-md" />
            <Skeleton className="size-3.5 rounded-sm" />
            <Skeleton className="h-4 w-14 rounded-md" />
            <Skeleton className="size-3.5 rounded-sm" />
            <Skeleton className="h-4 w-28 rounded-md" />
          </div>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          <div className="w-full">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="mt-3 flex gap-2.5">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton
                  key={index}
                  className="size-[4.25rem] shrink-0 rounded-xl sm:size-[4.75rem]"
                />
              ))}
            </div>
          </div>

          <div className="flex min-w-0 flex-col">
            <Skeleton className="h-9 w-3/4 max-w-md rounded-md md:h-10" />
            <Skeleton className="mt-3 h-7 w-28 rounded-md" />
            <Skeleton className="mt-4 h-4 w-full rounded-md" />
            <Skeleton className="mt-2 h-4 w-5/6 rounded-md" />
            <Skeleton className="mt-2 h-4 w-2/3 rounded-md" />

            <div className="my-7 border-t border-border" />

            <Skeleton className="h-4 w-20 rounded-md" />
            <div className="mt-3 flex flex-wrap gap-2">
              <Skeleton className="h-10 w-20 rounded-xl" />
              <Skeleton className="h-10 w-24 rounded-xl" />
              <Skeleton className="h-10 w-20 rounded-xl" />
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Skeleton className="h-12 w-full rounded-xl sm:w-[7.5rem]" />
              <Skeleton className="h-12 w-full flex-1 rounded-xl" />
              <Skeleton className="size-12 shrink-0 rounded-xl" />
            </div>

            <div className="mt-8 space-y-3">
              <Skeleton className="h-5 w-40 rounded-md" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export { PlantDetailSkeleton };
