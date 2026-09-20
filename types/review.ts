export type ReviewStatus = "pending" | "approved" | "rejected";

export type Review = {
  id: string;
  name: string;
  rating: number;
  content: string;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
};

export type ReviewListItem = Review;

export type ReviewListResponse = {
  items: ReviewListItem[];
  page: number;
  page_size: number;
  total: number;
};

export type ReviewStatusUpdateRequest = {
  status: ReviewStatus;
};

export const REVIEW_STATUSES = [
  "pending",
  "approved",
  "rejected",
] as const satisfies readonly ReviewStatus[];
