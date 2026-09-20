"use client";

import { useId, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
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
import { createStorefrontReview } from "@/lib/api/storefront";
import { ApiError } from "@/lib/api/errors";
import { toast } from "@/lib/toast";
import {
  STOREFRONT_REVIEW_CONTENT_MAX,
  STOREFRONT_REVIEW_NAME_MAX,
  STOREFRONT_REVIEW_RATING_MAX,
  STOREFRONT_REVIEW_RATING_MIN,
} from "@/types/storefront-review";

type FormErrors = {
  name?: string;
  rating?: string;
  content?: string;
};

function getSubmitErrorKey(error: unknown) {
  if (!(error instanceof ApiError)) return "generic";

  switch (error.status) {
    case 422:
      return "validation";
    case 429:
      return "rateLimited";
    case 403: {
      const detail = String(error.detail ?? error.message).toLowerCase();
      if (
        detail.includes("turnstile") ||
        detail.includes("captcha") ||
        detail.includes("spam")
      ) {
        return "spam";
      }
      return "generic";
    }
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
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("reviews");
  const tForm = useTranslations("reviews.form");
  const tErrors = useTranslations("reviews.errors");

  const nameId = useId();
  const ratingId = useId();
  const contentId = useId();

  const [name, setName] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setName("");
    setRating(null);
    setContent("");
    setErrors({});
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    const trimmedName = name.trim();
    const trimmedContent = content.trim();

    if (!trimmedName) {
      next.name = tForm("errors.nameRequired");
    } else if (trimmedName.length > STOREFRONT_REVIEW_NAME_MAX) {
      next.name = tForm("errors.nameTooLong");
    }

    if (
      rating == null ||
      rating < STOREFRONT_REVIEW_RATING_MIN ||
      rating > STOREFRONT_REVIEW_RATING_MAX
    ) {
      next.rating = tForm("errors.ratingRequired");
    }

    if (!trimmedContent) {
      next.content = tForm("errors.contentRequired");
    } else if (trimmedContent.length > STOREFRONT_REVIEW_CONTENT_MAX) {
      next.content = tForm("errors.contentTooLong");
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

    setSubmitting(true);

    try {
      await createStorefrontReview({
        name: name.trim(),
        rating: rating!,
        content: content.trim(),
      });
      resetForm();
      onOpenChange(false);
      toast.success(t("submitSuccess"), {
        description: t("submitSuccessDescription"),
      });
    } catch (error) {
      toast.error(tErrors(getSubmitErrorKey(error)));
    } finally {
      setSubmitting(false);
    }
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
          <DialogTitle>{tForm("title")}</DialogTitle>
          <DialogDescription>{tForm("description")}</DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
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
