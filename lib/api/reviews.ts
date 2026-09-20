import { api } from "@/lib/api/client";
import type {
  Review,
  ReviewListResponse,
  ReviewStatus,
  ReviewStatusUpdateRequest,
} from "@/types/review";

export type ListReviewsParams = {
  page?: number;
  page_size?: number;
  /** Matches reviewer name or content. */
  search?: string;
  status?: ReviewStatus;
};

export async function listReviews(
  params: ListReviewsParams = {},
  options: { signal?: AbortSignal } = {}
): Promise<ReviewListResponse> {
  return api.get<ReviewListResponse>("/reviews", {
    signal: options.signal,
    query: {
      page: params.page ?? 1,
      page_size: params.page_size ?? 20,
      search: params.search,
      status: params.status,
    },
  });
}

export async function getReview(id: string): Promise<Review> {
  return api.get<Review>(`/reviews/${id}`);
}

export async function updateReviewStatus(
  id: string,
  data: ReviewStatusUpdateRequest
): Promise<Review> {
  return api.patch<Review>(`/reviews/${id}/status`, data);
}
