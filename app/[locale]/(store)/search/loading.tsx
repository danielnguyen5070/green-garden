import { Container } from "@/components/layout/container";
import { ProductSearchSkeleton } from "@/components/search/search-results";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <section
      data-slot="search-page-loading"
      className="bg-background py-10 md:py-12 lg:py-14"
      aria-busy="true"
    >
      <Container>
        <header className="max-w-2xl">
          <Skeleton className="h-9 w-72 max-w-full rounded-md md:h-10" />
          <Skeleton className="mt-3 h-5 w-full max-w-md rounded-md" />
          <Skeleton className="mt-6 h-11 w-full max-w-xl rounded-full" />
        </header>
        <ProductSearchSkeleton />
      </Container>
    </section>
  );
}
