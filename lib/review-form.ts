import { z } from "zod";
import {
  STOREFRONT_REVIEW_CONTENT_MAX,
  STOREFRONT_REVIEW_NAME_MAX,
  STOREFRONT_REVIEW_RATING_MAX,
  STOREFRONT_REVIEW_RATING_MIN,
} from "@/types/storefront-review";
import { issuesByField } from "@/lib/validation/first-issue";

export type ReviewFormField = "name" | "rating" | "content";

export type ReviewFormValues = {
  name: string;
  rating: number | null;
  content: string;
};

/** Message keys under `reviews.form.errors`. */
export type ReviewFormErrorKey =
  | "nameRequired"
  | "nameTooLong"
  | "ratingRequired"
  | "contentRequired"
  | "contentTooLong";

export type ReviewFormErrors = Partial<Record<ReviewFormField, ReviewFormErrorKey>>;

const REVIEW_FORM_FIELDS = ["name", "rating", "content"] as const;

const reviewFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "nameRequired" })
    .max(STOREFRONT_REVIEW_NAME_MAX, { error: "nameTooLong" }),
  rating: z
    .number({ error: "ratingRequired" })
    .int({ error: "ratingRequired" })
    .min(STOREFRONT_REVIEW_RATING_MIN, { error: "ratingRequired" })
    .max(STOREFRONT_REVIEW_RATING_MAX, { error: "ratingRequired" }),
  content: z
    .string()
    .trim()
    .min(1, { error: "contentRequired" })
    .max(STOREFRONT_REVIEW_CONTENT_MAX, { error: "contentTooLong" }),
});

export function validateReviewForm(values: ReviewFormValues): ReviewFormErrors {
  const result = reviewFormSchema.safeParse({
    name: values.name,
    rating: values.rating,
    content: values.content,
  });
  if (result.success) return {};
  return issuesByField(result.error, REVIEW_FORM_FIELDS) as ReviewFormErrors;
}
