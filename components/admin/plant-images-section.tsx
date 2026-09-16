"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminCopy } from "@/lib/admin-copy";
import {
  createPlantImage,
  deletePlantImage,
  updatePlantImage,
} from "@/lib/api/plants";
import { getErrorMessage } from "@/lib/api/errors";
import { toast } from "@/lib/toast";
import type { AdminPlantImage, PlantImageType } from "@/types/admin-plant";

type PlantImagesSectionProps = {
  plantId: string;
  images: AdminPlantImage[];
  disabled: boolean;
  onChange: (images: AdminPlantImage[]) => void;
};

const copy = adminCopy.plants.images;

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function bySortOrder(a: AdminPlantImage, b: AdminPlantImage): number {
  return a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at);
}

export function PlantImagesSection({
  plantId,
  images,
  disabled,
  onChange,
}: PlantImagesSectionProps) {
  const [url, setUrl] = useState("");
  const [type, setType] = useState<PlantImageType>("image");
  const [altText, setAltText] = useState("");
  const [adding, setAdding] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const sorted = [...images].sort(bySortOrder);
  const busy = disabled || adding || pendingId !== null;

  async function handleAdd() {
    const trimmedUrl = url.trim();
    if (!isValidHttpUrl(trimmedUrl)) {
      toast.error(copy.invalidUrl);
      return;
    }

    setAdding(true);
    try {
      const created = await createPlantImage(plantId, {
        url: trimmedUrl,
        type,
        alt_text: altText.trim() || null,
        // Append to the end of the current order.
        sort_order: sorted.length,
      });
      onChange([...images, created]);
      setUrl("");
      setAltText("");
      setType("image");
      toast.success(copy.addedSuccess);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(image: AdminPlantImage) {
    setPendingId(image.id);
    try {
      await deletePlantImage(plantId, image.id);
      onChange(images.filter((item) => item.id !== image.id));
      toast.success(copy.deletedSuccess);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  async function handleAltTextBlur(image: AdminPlantImage, value: string) {
    const next = value.trim() || null;
    if (next === image.alt_text) return;

    setPendingId(image.id);
    try {
      const updated = await updatePlantImage(plantId, image.id, {
        alt_text: next,
      });
      onChange(images.map((item) => (item.id === image.id ? updated : item)));
      toast.success(copy.updatedSuccess);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  /** Reorder by swapping sort_order with the adjacent image. */
  async function handleMove(index: number, direction: -1 | 1) {
    const current = sorted[index];
    const neighbour = sorted[index + direction];
    if (!current || !neighbour) return;

    setPendingId(current.id);
    try {
      const [movedCurrent, movedNeighbour] = await Promise.all([
        updatePlantImage(plantId, current.id, {
          sort_order: neighbour.sort_order,
        }),
        updatePlantImage(plantId, neighbour.id, {
          sort_order: current.sort_order,
        }),
      ]);
      const updates = new Map([
        [movedCurrent.id, movedCurrent],
        [movedNeighbour.id, movedNeighbour],
      ]);
      onChange(images.map((item) => updates.get(item.id) ?? item));
      toast.success(copy.reorderedSuccess);
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
          {sorted.map((image, index) => (
            <li
              key={image.id}
              className="flex items-center gap-3 rounded-lg border border-border p-2"
            >
              {image.type === "video" ? (
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-[10px] text-muted-foreground">
                  {copy.typeVideo}
                </span>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- plant images are arbitrary remote URLs, not configured next/image hosts
                <img
                  src={image.url}
                  alt={image.alt_text ?? ""}
                  className="size-10 shrink-0 rounded-lg object-cover"
                  loading="lazy"
                />
              )}

              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-xs text-muted-foreground" title={image.url}>
                  {image.url}
                </p>
                <Input
                  defaultValue={image.alt_text ?? ""}
                  maxLength={255}
                  disabled={busy}
                  placeholder={copy.altText}
                  aria-label={copy.altText}
                  className="h-8 rounded-full text-xs"
                  onBlur={(event) => {
                    void handleAltTextBlur(image, event.target.value);
                  }}
                />
              </div>

              <div className="flex shrink-0 gap-1">
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
                    void handleDelete(image);
                  }}
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
        <div className="space-y-2">
          <Label htmlFor="plant-image-url">{copy.url}</Label>
          <Input
            id="plant-image-url"
            type="url"
            inputMode="url"
            value={url}
            disabled={busy}
            onChange={(event) => setUrl(event.target.value)}
            className="h-10 rounded-full"
          />
        </div>

        <div className="flex gap-2">
          <div className="w-32 space-y-2">
            <Label htmlFor="plant-image-type">{copy.type}</Label>
            <Select
              value={type}
              disabled={busy}
              onValueChange={(value) => {
                if (value == null) return;
                setType(value as PlantImageType);
              }}
            >
              <SelectTrigger id="plant-image-type" className="w-full">
                <SelectValue>
                  {type === "image" ? copy.typeImage : copy.typeVideo}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">{copy.typeImage}</SelectItem>
                <SelectItem value="video">{copy.typeVideo}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 space-y-2">
            <Label htmlFor="plant-image-alt">{copy.altText}</Label>
            <Input
              id="plant-image-alt"
              value={altText}
              maxLength={255}
              disabled={busy}
              onChange={(event) => setAltText(event.target.value)}
              className="h-10 rounded-full"
            />
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={busy || url.trim() === ""}
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
