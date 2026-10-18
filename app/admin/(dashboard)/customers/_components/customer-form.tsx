"use client";

import type { SubmitEvent } from "react";
import { adminCopy } from "@/app/admin/_lib/admin-copy";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Customer } from "@/types/customer";

const copy = adminCopy.customers;

export type CustomerFormProps = {
  mode: "create" | "edit";
  customer?: Customer;
  submitting: boolean;
  error: string | null;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export function CustomerForm({
  mode,
  customer,
  submitting,
  error,
  onSubmit,
  onCancel,
}: CustomerFormProps) {
  const prefix = mode === "create" ? "create" : "edit";

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-col gap-4" noValidate>
      {/* Scrolls on its own so the header and footer stay in view. */}
      <div className="-mx-1 min-h-0 flex-1 space-y-4 overflow-y-auto px-1">
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-name`}>{copy.fields.name}</Label>
          <Input
            id={`${prefix}-name`}
            name="name"
            required
            maxLength={255}
            defaultValue={customer?.name}
            disabled={submitting}
            className="h-11 rounded-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${prefix}-phone`}>{copy.fields.phone}</Label>
          <Input
            id={`${prefix}-phone`}
            name="phone"
            type="tel"
            inputMode="tel"
            required
            maxLength={32}
            defaultValue={customer?.phone}
            disabled={submitting}
            className="h-11 rounded-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${prefix}-email`}>{copy.fields.email}</Label>
          <Input
            id={`${prefix}-email`}
            name="email"
            type="email"
            inputMode="email"
            defaultValue={customer?.email ?? ""}
            disabled={submitting}
            className="h-11 rounded-full"
          />
          <p className="text-xs text-muted-foreground">
            {copy.fields.emailHint}
          </p>
        </div>
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
