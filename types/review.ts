export type ReviewStatus = "pending" | "approved" | "rejected";

/** `shop` = website-wide reviews; `plant` = reviews of any plant. */
export type ReviewScope = "shop" | "plant";

export type ReviewPlantSummary = {
  id: string;
  name: string;
  name_vi: string | null;
  slug: string;
};

export type Review = {
  id: string;
  /** `null` for website-wide shop reviews. */
  plant_id: string | null;
  plant: ReviewPlantSummary | null;
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

export const REVIEW_SCOPES = [
  "shop",
  "plant",
] as const satisfies readonly ReviewScope[];
