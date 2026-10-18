"use client";

import { useState, type SubmitEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { adminCopy } from "@/app/admin/_lib/admin-copy";
import type { AdminPlantListItem } from "@/types/admin-plant";
import type { OrderCreateRequest, OrderItemCreateRequest } from "@/types/order";

const copy = adminCopy.orders;

type DraftItem = {
  /** Stable key so rows survive reordering and removal. */
  key: string;
  plant_id: string;
  quantity: string;
};

type OrderCreateFormProps = {
  plants: AdminPlantListItem[];
  submitting: boolean;
  error: string | null;
  onValidationError: (message: string | null) => void;
  onSubmit: (payload: OrderCreateRequest) => void | Promise<void>;
  onCancel: () => void;
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function createDraftItem(): DraftItem {
  return {
    key: crypto.randomUUID(),
    plant_id: "",
    quantity: "1",
  };
}

type OrderItemRowProps = {
  item: DraftItem;
  plants: AdminPlantListItem[];
  submitting: boolean;
  canRemove: boolean;
  onUpdate: (key: string, changes: Partial<DraftItem>) => void;
  onRemove: (key: string) => void;
};

function OrderItemRow({
  item,
  plants,
  submitting,
  canRemove,
  onUpdate,
  onRemove,
}: OrderItemRowProps) {
  const plant = plants.find((candidate) => candidate.id === item.plant_id);

  return (
    <li className="space-y-2 rounded-lg border border-border p-2">
      <div className="flex items-center gap-2">
        <Select
          value={item.plant_id}
          disabled={submitting}
          onValueChange={(value) => {
            if (value == null) return;
            onUpdate(item.key, { plant_id: value as string });
          }}
        >
          <SelectTrigger
            className="w-full flex-1"
            aria-label={copy.items.plant}
          >
            <SelectValue>
              {plant ? (
                plant.name
              ) : (
                <span className="text-muted-foreground">
                  {copy.items.selectPlant}
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {plants.map((candidate) => (
              <SelectItem key={candidate.id} value={candidate.id}>
                {candidate.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={copy.items.remove}
          disabled={submitting || !canRemove}
          onClick={() => onRemove(item.key)}
        >
          <Trash2 className="text-destructive" />
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="w-24">
          <Input
            type="number"
            min={1}
            step={1}
            value={item.quantity}
            disabled={submitting}
            aria-label={copy.items.quantity}
            placeholder={copy.items.quantity}
            onChange={(event) =>
              onUpdate(item.key, { quantity: event.target.value })
            }
          />
        </div>
      </div>
    </li>
  );
}

export function OrderCreateForm({
  plants,
  submitting,
  error,
  onValidationError,
  onSubmit,
  onCancel,
}: OrderCreateFormProps) {
  const [items, setItems] = useState<DraftItem[]>([createDraftItem()]);

  function updateItem(key: string, changes: Partial<DraftItem>) {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...changes } : item))
    );
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("customer_name") ?? "").trim();
    const phone = String(formData.get("customer_phone") ?? "").trim();
    const email = String(formData.get("customer_email") ?? "").trim();
    const shippingAddress = String(
      formData.get("shipping_address") ?? ""
    ).trim();
    const note = String(formData.get("note") ?? "").trim();

    if (!name || name.length > 255) {
      onValidationError(copy.invalidCustomerName);
      return;
    }
    if (!phone || phone.length > 32) {
      onValidationError(copy.invalidCustomerPhone);
      return;
    }
    if (email && !isValidEmail(email)) {
      onValidationError(copy.invalidEmail);
      return;
    }
    if (!shippingAddress) {
      onValidationError(copy.invalidShippingAddress);
      return;
    }

    const selected = items.filter((item) => item.plant_id !== "");
    if (selected.length === 0) {
      onValidationError(copy.items.required);
      return;
    }

    const payloadItems: OrderItemCreateRequest[] = [];
    for (const item of selected) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        onValidationError(copy.invalidQuantity);
        return;
      }
      payloadItems.push({
        plant_id: item.plant_id,
        quantity,
      });
    }

    onValidationError(null);
    // No prices or totals are sent; the backend computes them.
    void onSubmit({
      customer: { name, phone, email: email || null },
      shipping_address: shippingAddress,
      note: note || null,
      items: payloadItems,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-0 flex-col gap-4"
      noValidate
    >
      {/* Scrolls on its own so the header and footer stay in view. */}
      <div className="-mx-1 min-h-0 flex-1 space-y-6 overflow-y-auto px-1">
        <section className="space-y-4">
          <h3 className="text-sm font-medium">{copy.table.customer}</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="order-customer-name">
                {copy.fields.customerName}
              </Label>
              <Input
                id="order-customer-name"
                name="customer_name"
                required
                maxLength={255}
                disabled={submitting}
                className="h-11 rounded-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order-customer-phone">
                {copy.fields.customerPhone}
              </Label>
              <Input
                id="order-customer-phone"
                name="customer_phone"
                type="tel"
                inputMode="tel"
                required
                maxLength={32}
                disabled={submitting}
                className="h-11 rounded-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order-customer-email">
              {copy.fields.customerEmail}
            </Label>
            <Input
              id="order-customer-email"
              name="customer_email"
              type="email"
              inputMode="email"
              disabled={submitting}
              className="h-11 rounded-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order-shipping-address">
              {copy.fields.shippingAddress}
            </Label>
            <Textarea
              id="order-shipping-address"
              name="shipping_address"
              required
              disabled={submitting}
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order-note">{copy.fields.note}</Label>
            <Textarea
              id="order-note"
              name="note"
              disabled={submitting}
              className="rounded-lg"
            />
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-medium">{copy.items.title}</h3>
          <p className="text-xs text-muted-foreground">
            {copy.items.priceHint}
          </p>

          <ul className="space-y-2">
            {items.map((item) => (
              <OrderItemRow
                key={item.key}
                item={item}
                plants={plants}
                submitting={submitting}
                canRemove={items.length > 1}
                onUpdate={updateItem}
                onRemove={(key) =>
                  setItems((current) =>
                    current.filter((candidate) => candidate.key !== key)
                  )
                }
              />
            ))}
          </ul>

          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={submitting}
            onClick={() =>
              setItems((current) => [...current, createDraftItem()])
            }
          >
            <Plus data-icon="inline-start" />
            {copy.items.add}
          </Button>
        </section>
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
          {submitting ? adminCopy.common.saving : adminCopy.common.create}
        </Button>
      </DialogFooter>
    </form>
  );
}
