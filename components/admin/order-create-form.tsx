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
import { adminCopy } from "@/lib/admin-copy";
import { getErrorMessage } from "@/lib/api/errors";
import { getPlant } from "@/lib/api/plants";
import { toast } from "@/lib/toast";
import type { AdminPlantListItem, AdminPlantPotSize } from "@/types/admin-plant";
import type { OrderCreateRequest, OrderItemCreateRequest } from "@/types/order";

const copy = adminCopy.orders;
const NO_POT_SIZE = "__none__";

type DraftItem = {
  /** Stable key so rows survive reordering and removal. */
  key: string;
  plant_id: string;
  quantity: string;
  pot_size: string;
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
    pot_size: NO_POT_SIZE,
  };
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
  /** Pot sizes come from plant detail, fetched once per selected plant. */
  const [potSizesByPlant, setPotSizesByPlant] = useState<
    Record<string, AdminPlantPotSize[]>
  >({});

  function updateItem(key: string, changes: Partial<DraftItem>) {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...changes } : item))
    );
  }

  async function handlePlantChange(key: string, plantId: string) {
    // Changing the plant invalidates any pot size picked for the old one.
    updateItem(key, { plant_id: plantId, pot_size: NO_POT_SIZE });

    if (potSizesByPlant[plantId]) return;

    try {
      const plant = await getPlant(plantId);
      setPotSizesByPlant((current) => ({
        ...current,
        [plantId]: plant.pot_sizes.filter((potSize) => potSize.is_active),
      }));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
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
        pot_size: item.pot_size === NO_POT_SIZE ? null : item.pot_size,
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
            {items.map((item) => {
              const plant = plants.find(
                (candidate) => candidate.id === item.plant_id
              );
              const potSizes = potSizesByPlant[item.plant_id] ?? [];

              return (
                <li
                  key={item.key}
                  className="space-y-2 rounded-lg border border-border p-2"
                >
                  <div className="flex items-center gap-2">
                    <Select
                      value={item.plant_id}
                      disabled={submitting}
                      onValueChange={(value) => {
                        if (value == null) return;
                        void handlePlantChange(item.key, value as string);
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
                      disabled={submitting || items.length === 1}
                      onClick={() =>
                        setItems((current) =>
                          current.filter(
                            (candidate) => candidate.key !== item.key
                          )
                        )
                      }
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
                          updateItem(item.key, { quantity: event.target.value })
                        }
                      />
                    </div>

                    <Select
                      value={item.pot_size}
                      disabled={submitting || potSizes.length === 0}
                      onValueChange={(value) => {
                        if (value == null) return;
                        updateItem(item.key, { pot_size: value as string });
                      }}
                    >
                      <SelectTrigger
                        className="w-full flex-1"
                        aria-label={copy.items.potSize}
                      >
                        <SelectValue>
                          {item.pot_size === NO_POT_SIZE
                            ? copy.items.noPotSize
                            : item.pot_size}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_POT_SIZE}>
                          {copy.items.noPotSize}
                        </SelectItem>
                        {potSizes.map((potSize) => (
                          <SelectItem key={potSize.id} value={potSize.name}>
                            {potSize.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </li>
              );
            })}
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
