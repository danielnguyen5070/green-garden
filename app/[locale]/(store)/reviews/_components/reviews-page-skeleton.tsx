import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

function ReviewsPageSkeleton() {
  return (
    <section
      data-slot="reviews-page-loading"
      className="bg-background py-10 md:py-12 lg:py-14"
      aria-busy="true"
    >
      <Container>
        <div className="space-y-8 md:space-y-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl space-y-3">
              <Skeleton className="h-9 w-48 max-w-full rounded-md md:h-10" />
              <Skeleton className="h-5 w-full max-w-md rounded-md" />
            </div>
            <Skeleton className="h-11 w-40 rounded-xl" />
          </div>
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-40 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export { ReviewsPageSkeleton };
