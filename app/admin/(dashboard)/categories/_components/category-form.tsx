"use client";

import type { SubmitEvent } from "react";
import { adminCopy } from "@/app/admin/_lib/admin-copy";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Category } from "@/types/category";

export type CategoryFormProps = {
  mode: "create" | "edit";
  category?: Category;
  submitting: boolean;
  error: string | null;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export function CategoryForm({
  mode,
  category,
  submitting,
  error,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const prefix = mode === "create" ? "create" : "edit";

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-col gap-4" noValidate>
      {/* Scrolls on its own so the header and footer stay in view. */}
      <div className="-mx-1 min-h-0 flex-1 space-y-4 overflow-y-auto px-1">
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-name`}>
            {adminCopy.categories.table.name}
          </Label>
          <Input
            id={`${prefix}-name`}
            name="name"
            required
            maxLength={255}
            defaultValue={category?.name}
            disabled={submitting}
            className="h-11 rounded-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${prefix}-name-vi`}>
            {adminCopy.categories.nameVi}
          </Label>
          <Input
            id={`${prefix}-name-vi`}
            name="name_vi"
            maxLength={255}
            defaultValue={category?.name_vi ?? ""}
            disabled={submitting}
            className="h-11 rounded-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${prefix}-slug`}>
            {adminCopy.categories.table.slug}
          </Label>
          <Input
            id={`${prefix}-slug`}
            name="slug"
            required
            maxLength={255}
            defaultValue={category?.slug}
            disabled={submitting}
            className="h-11 rounded-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${prefix}-description`}>
            {adminCopy.categories.table.description}
          </Label>
          <Textarea
            id={`${prefix}-description`}
            name="description"
            defaultValue={category?.description ?? ""}
            disabled={submitting}
            className="rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${prefix}-description-vi`}>
            {adminCopy.categories.descriptionVi}
          </Label>
          <Textarea
            id={`${prefix}-description-vi`}
            name="description_vi"
            defaultValue={category?.description_vi ?? ""}
            disabled={submitting}
            className="rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${prefix}-image-url`}>
            {adminCopy.categories.imageUrl}
          </Label>
          <Input
            id={`${prefix}-image-url`}
            name="image_url"
            type="url"
            inputMode="url"
            defaultValue={category?.image_url ?? ""}
            disabled={submitting}
            className="h-11 rounded-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${prefix}-sort-order`}>
            {adminCopy.categories.table.sortOrder}
          </Label>
          <Input
            id={`${prefix}-sort-order`}
            name="sort_order"
            type="number"
            min={0}
            step={1}
            defaultValue={category?.sort_order ?? 0}
            disabled={submitting}
            className="h-11 rounded-full"
          />
        </div>

        {mode === "create" ? (
          <div className="flex items-start gap-2">
            <input
              id={`${prefix}-is-active`}
              name="is_active"
              type="checkbox"
              defaultChecked
              disabled={submitting}
              className="mt-0.5 size-4 accent-primary"
            />
            <div className="space-y-1">
              <Label htmlFor={`${prefix}-is-active`}>
                {adminCopy.categories.active}
              </Label>
              <p className="text-xs text-muted-foreground">
                {adminCopy.categories.activeHint}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={submitting}
          onClick={onCancel}
        >
          {adminCopy.common.cancel}
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="w-24 rounded-full"
        >
          {submitting
            ? adminCopy.common.saving
            : mode === "create"
              ? adminCopy.common.create
              : adminCopy.common.save}
        </Button>
      </DialogFooter>
    </form>
  );
}
