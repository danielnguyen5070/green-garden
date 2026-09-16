"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminCopy } from "@/lib/admin-copy";
import { isSameDecimal } from "@/lib/admin-format";
import {
  createPlantPotSize,
  deletePlantPotSize,
  updatePlantPotSize,
} from "@/lib/api/plants";
import { getErrorMessage } from "@/lib/api/errors";
import { toast } from "@/lib/toast";
import type { AdminPlantPotSize } from "@/types/admin-plant";

type PlantPotSizesSectionProps = {
  plantId: string;
  potSizes: AdminPlantPotSize[];
  disabled: boolean;
  onChange: (potSizes: AdminPlantPotSize[]) => void;
};

const copy = adminCopy.plants.potSizes;

/** Empty is allowed (means "not set"); otherwise it must be a number >= 0. */
function isValidAmount(value: string, required: boolean): boolean {
  const trimmed = value.trim();
  if (trimmed === "") return !required;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0;
}

function bySortOrder(a: AdminPlantPotSize, b: AdminPlantPotSize): number {
  return a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at);
}

export function PlantPotSizesSection({
  plantId,
  potSizes,
  disabled,
  onChange,
}: PlantPotSizesSectionProps) {
  const [name, setName] = useState("");
  const [adjustment, setAdjustment] = useState("");
  const [adjustmentVi, setAdjustmentVi] = useState("");
  const [adding, setAdding] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const sorted = [...potSizes].sort(bySortOrder);
  const busy = disabled || adding || pendingId !== null;

  function applyUpdate(updated: AdminPlantPotSize) {
    onChange(potSizes.map((item) => (item.id === updated.id ? updated : item)));
  }

  async function handleAdd() {
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length > 100) {
      toast.error(copy.invalidName);
      return;
    }
    if (
      !isValidAmount(adjustment, false) ||
      !isValidAmount(adjustmentVi, false)
    ) {
      toast.error(copy.invalidAdjustment);
      return;
    }

    setAdding(true);
    try {
      const created = await createPlantPotSize(plantId, {
        name: trimmedName,
        // Decimal strings go straight to the API, never through a float.
        price_adjustment: adjustment.trim() || "0",
        price_adjustment_vi: adjustmentVi.trim() || null,
        sort_order: sorted.length,
        is_active: true,
      });
      onChange([...potSizes, created]);
      setName("");
      setAdjustment("");
      setAdjustmentVi("");
      toast.success(copy.addedSuccess);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(potSize: AdminPlantPotSize) {
    setPendingId(potSize.id);
    try {
      await deletePlantPotSize(plantId, potSize.id);
      onChange(potSizes.filter((item) => item.id !== potSize.id));
      toast.success(copy.deletedSuccess);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  async function handleNameBlur(potSize: AdminPlantPotSize, value: string) {
    const next = value.trim();
    if (next === potSize.name) return;
    if (!next || next.length > 100) {
      toast.error(copy.invalidName);
      return;
    }

    setPendingId(potSize.id);
    try {
      applyUpdate(await updatePlantPotSize(plantId, potSize.id, { name: next }));
      toast.success(copy.updatedSuccess);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  async function handleAdjustmentBlur(
    potSize: AdminPlantPotSize,
    field: "price_adjustment" | "price_adjustment_vi",
    value: string
  ) {
    const required = field === "price_adjustment";
    if (!isValidAmount(value, required)) {
      toast.error(copy.invalidAdjustment);
      return;
    }

    const next = value.trim() || (required ? "0" : null);
    if (isSameDecimal(next, potSize[field])) return;

    setPendingId(potSize.id);
    try {
      applyUpdate(
        await updatePlantPotSize(plantId, potSize.id, { [field]: next })
      );
      toast.success(copy.updatedSuccess);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  async function handleToggleActive(potSize: AdminPlantPotSize) {
    setPendingId(potSize.id);
    try {
      applyUpdate(
        await updatePlantPotSize(plantId, potSize.id, {
          is_active: !potSize.is_active,
        })
      );
      toast.success(copy.updatedSuccess);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  /** Reorder by swapping sort_order with the adjacent pot size. */
  async function handleMove(index: number, direction: -1 | 1) {
    const current = sorted[index];
    const neighbour = sorted[index + direction];
    if (!current || !neighbour) return;

    setPendingId(current.id);
    try {
      const [movedCurrent, movedNeighbour] = await Promise.all([
        updatePlantPotSize(plantId, current.id, {
          sort_order: neighbour.sort_order,
        }),
        updatePlantPotSize(plantId, neighbour.id, {
          sort_order: current.sort_order,
        }),
      ]);
      const updates = new Map([
        [movedCurrent.id, movedCurrent],
        [movedNeighbour.id, movedNeighbour],
      ]);
      onChange(potSizes.map((item) => updates.get(item.id) ?? item));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div
      className="space-y-3"
      onKeyDown={(event) => {
        // These fields sit inside the plant form; Enter must not submit it.
        if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
          event.preventDefault();
        }
      }}
    >
      <p className="text-xs text-muted-foreground">{copy.description}</p>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">{copy.empty}</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((potSize, index) => (
            <li
              key={potSize.id}
              className="space-y-2 rounded-lg border border-border p-2"
            >
              <div className="flex items-center gap-2">
                <Input
                  defaultValue={potSize.name}
                  maxLength={100}
                  disabled={busy}
                  aria-label={copy.name}
                  className="h-8 flex-1 rounded-full text-xs"
                  onBlur={(event) => {
                    void handleNameBlur(potSize, event.target.value);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={copy.moveUp}
                  disabled={busy || index === 0}
                  onClick={() => {
                    void handleMove(index, -1);
                  }}
                >
                  <ArrowUp />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={copy.moveDown}
                  disabled={busy || index === sorted.length - 1}
                  onClick={() => {
                    void handleMove(index, 1);
                  }}
                >
                  <ArrowDown />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={copy.delete}
                  disabled={busy}
                  onClick={() => {
                    void handleDelete(potSize);
                  }}
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={potSize.price_adjustment}
                  disabled={busy}
                  aria-label={copy.adjustment}
                  placeholder={copy.adjustment}
                  className="h-8 rounded-full text-xs"
                  onBlur={(event) => {
                    void handleAdjustmentBlur(
                      potSize,
                      "price_adjustment",
                      event.target.value
                    );
                  }}
                />
                <Input
                  type="number"
                  min={0}
                  step="1"
                  defaultValue={potSize.price_adjustment_vi ?? ""}
                  disabled={busy}
                  aria-label={copy.adjustmentVi}
                  placeholder={copy.adjustmentVi}
                  className="h-8 rounded-full text-xs"
                  onBlur={(event) => {
                    void handleAdjustmentBlur(
                      potSize,
                      "price_adjustment_vi",
                      event.target.value
                    );
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 rounded-full"
                  disabled={busy}
                  onClick={() => {
                    void handleToggleActive(potSize);
                  }}
                >
                  {potSize.is_active ? copy.deactivate : copy.activate}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
        <div className="space-y-2">
          <Label htmlFor="plant-pot-size-name">{copy.name}</Label>
          <Input
            id="plant-pot-size-name"
            value={name}
            maxLength={100}
            disabled={busy}
            onChange={(event) => setName(event.target.value)}
            className="h-10 rounded-full"
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1 space-y-2">
            <Label htmlFor="plant-pot-size-adjustment">{copy.adjustment}</Label>
            <Input
              id="plant-pot-size-adjustment"
              type="number"
              min={0}
              step="0.01"
              value={adjustment}
              disabled={busy}
              onChange={(event) => setAdjustment(event.target.value)}
              className="h-10 rounded-full"
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="plant-pot-size-adjustment-vi">
              {copy.adjustmentVi}
            </Label>
            <Input
              id="plant-pot-size-adjustment-vi"
              type="number"
              min={0}
              step="1"
              value={adjustmentVi}
              disabled={busy}
              onChange={(event) => setAdjustmentVi(event.target.value)}
              className="h-10 rounded-full"
            />
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={busy || name.trim() === ""}
          onClick={() => {
            void handleAdd();
          }}
        >
          <Plus data-icon="inline-start" />
          {adding ? copy.adding : copy.add}
        </Button>
      </div>
    </div>
  );
}
