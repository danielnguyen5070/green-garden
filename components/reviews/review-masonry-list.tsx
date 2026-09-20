import { ReviewCard } from "@/components/reviews/review-card";
import type { StorefrontReview } from "@/types/storefront-review";
import { cn } from "@/lib/utils";

/**
 * Pinterest-style masonry via CSS multi-column layout.
 * Each column flows independently so short cards don't leave row gaps.
 * 1 column on mobile, 3 on md+.
 */
function ReviewMasonryList({
  reviews,
  className,
}: {
  reviews: StorefrontReview[];
  className?: string;
}) {
  return (
    <ul
      data-slot="review-masonry"
      className={cn(
        // Multi-column masonry: each column flows independently (Pinterest-style).
        "m-0 list-none columns-1 gap-x-4 md:columns-3",
        className
      )}
    >
      {reviews.map((review) => (
        <li
          key={review.id}
          className="mb-4 break-inside-avoid [break-inside:avoid] [page-break-inside:avoid]"
        >
          <ReviewCard review={review} />
        </li>
      ))}
    </ul>
  );
}

export { ReviewMasonryList };
