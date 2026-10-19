"use client";

import { useId, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { HoneypotField } from "@/components/forms/honeypot-field";
import { ReviewRatingInput } from "@/components/reviews/review-rating-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBotSignals } from "@/hooks/use-bot-signals";
import {
  STOREFRONT_PLANT_REVIEWS_PAGE_SIZE,
  STOREFRONT_REVIEWS_PAGE_SIZE,
  createStorefrontPlantReview,
  createStorefrontReview,
} from "@/lib/api/storefront";
import { ApiError, ErrorCode, getErrorReference } from "@/lib/api/errors";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "@/lib/toast";
import {
  STOREFRONT_REVIEW_CONTENT_MAX,
  STOREFRONT_REVIEW_NAME_MAX,
} from "@/types/storefront-review";
import {
  validateReviewForm,
  type ReviewFormErrorKey,
  type ReviewFormField,
} from "@/lib/review-form";

type FormErrors = Partial<Record<ReviewFormField, string>>;

function getSubmitErrorKey(error: unknown) {
  if (!(error instanceof ApiError)) return "generic";

  switch (error.errorCode) {
    case ErrorCode.VALIDATION_ERROR:
      return "validation";
    case ErrorCode.RATE_LIMITED:
      return "rateLimited";
    case ErrorCode.SUBMISSION_REJECTED:
      return "spam";
  }

  // Gateways in front of the API answer without an error code.
  switch (error.status) {
    case 502:
    case 503:
    case 504:
      return "unavailable";
    default:
      return "generic";
  }
}

function ReviewFormDialog({
  open,
  onOpenChange,
  plantSlug,
  title,
  description,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Submits a review of this plant instead of a website-wide shop review. */
  plantSlug?: string;
  title?: string;
  description?: string;
}) {
  const t = useTranslations("reviews");
  const tForm = useTranslations("reviews.form");
  const tErrors = useTranslations("reviews.errors");
  const tCommon = useTranslations("common");

  const nameId = useId();
  const ratingId = useId();
  const contentId = useId();

  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const { honeypotRef, getBotSignals, reset: resetBotSignals } =
    useBotSignals(open);

  function resetForm() {
    setName("");
    setRating(null);
    setContent("");
    setErrors({});
    resetBotSignals();
  }

  const submitMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...getBotSignals(),
        name: name.trim(),
        rating: rating!,
        content: content.trim(),
      };
      if (plantSlug) {
        return createStorefrontPlantReview(plantSlug, payload);
      }
      return createStorefrontReview(payload);
    },
    onSuccess: async () => {
      if (plantSlug) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.reviews.plant(plantSlug, {
            pageSize: STOREFRONT_PLANT_REVIEWS_PAGE_SIZE,
          }),
        });
      } else {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.reviews.storefront({
            pageSize: STOREFRONT_REVIEWS_PAGE_SIZE,
          }),
        });
      }
      resetForm();
      onOpenChange(false);
      toast.success(t("submitSuccess"), {
        description: t("submitSuccessDescription"),
      });
    },
    onError: (error) => {
      const reference = getErrorReference(error);
      toast.error(
        tErrors(getSubmitErrorKey(error)),
        reference
          ? { description: tCommon("errorReference", { id: reference }) }
          : undefined
      );
    },
  });

  const submitting = submitMutation.isPending;

  function validate(): FormErrors {
    const keys = validateReviewForm({ name, rating, content });
    const next: FormErrors = {};
    for (const field of Object.keys(keys) as ReviewFormField[]) {
      const key = keys[field] as ReviewFormErrorKey | undefined;
      if (key) next[field] = tForm(`errors.${key}`);
    }
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.name) {
        document.getElementById(nameId)?.focus();
      } else if (nextErrors.rating) {
        document.getElementById(ratingId)?.querySelector("button")?.focus();
      } else if (nextErrors.content) {
        document.getElementById(contentId)?.focus();
      }
      return;
    }

    submitMutation.mutate();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (submitting) return;
        if (!nextOpen) resetForm();
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title ?? tForm("title")}</DialogTitle>
          <DialogDescription>
            {description ?? tForm("description")}
          </DialogDescription>
        </DialogHeader>

        <form className="relative grid gap-4" onSubmit={handleSubmit} noValidate>
          <HoneypotField ref={honeypotRef} />
          <div className="grid gap-2">
            <Label htmlFor={nameId}>{tForm("name")}</Label>
            <Input
              id={nameId}
              name="name"
              autoComplete="name"
              value={name}
              maxLength={STOREFRONT_REVIEW_NAME_MAX}
              disabled={submitting}
              aria-invalid={Boolean(errors.name) || undefined}
              aria-describedby={errors.name ? `${nameId}-error` : undefined}
              onChange={(event) => {
                setName(event.target.value);
                if (errors.name) {
                  setErrors((current) => ({ ...current, name: undefined }));
                }
              }}
            />
            {errors.name ? (
              <p
                id={`${nameId}-error`}
                className="font-sans text-small text-destructive"
                role="alert"
              >
                {errors.name}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label id={`${ratingId}-label`}>{tForm("rating")}</Label>
            <ReviewRatingInput
              id={ratingId}
              aria-labelledby={`${ratingId}-label`}
              value={rating}
              disabled={submitting}
              error={Boolean(errors.rating)}
              onChange={(next) => {
                setRating(next);
                if (errors.rating) {
                  setErrors((current) => ({ ...current, rating: undefined }));
                }
              }}
            />
            {errors.rating ? (
              <p
                id={`${ratingId}-error`}
                className="font-sans text-small text-destructive"
                role="alert"
              >
                {errors.rating}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor={contentId}>{tForm("content")}</Label>
            <Textarea
              id={contentId}
              name="content"
              rows={5}
              value={content}
              maxLength={STOREFRONT_REVIEW_CONTENT_MAX}
              disabled={submitting}
              aria-invalid={Boolean(errors.content) || undefined}
              aria-describedby={
                errors.content ? `${contentId}-error` : undefined
              }
              onChange={(event) => {
                setContent(event.target.value);
                if (errors.content) {
                  setErrors((current) => ({ ...current, content: undefined }));
                }
              }}
            />
            {errors.content ? (
              <p
                id={`${contentId}-error`}
                className="font-sans text-small text-destructive"
                role="alert"
              >
                {errors.content}
              </p>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
            >
              {tForm("cancel")}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? tForm("submitting") : tForm("submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { ReviewFormDialog };
