"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { PlayIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PLANT_IMAGE_PLACEHOLDER } from "@/lib/storefront";
import type { StorefrontPlantImage } from "@/types/storefront";
import { cn } from "@/lib/utils";

type GalleryItem = {
  key: string;
  src: string;
  alt: string;
  isVideo: boolean;
};

function PlantGallery({
  images,
  name,
  featured = false,
  className,
}: {
  /** Already ordered by `sort_order`. */
  images: StorefrontPlantImage[];
  name: string;
  featured?: boolean;
  className?: string;
}) {
  const t = useTranslations("plantDetail");
  const [activeIndex, setActiveIndex] = useState(0);

  const items: GalleryItem[] =
    images.length > 0
      ? images.map((image) => ({
          key: image.id,
          src: image.url,
          alt: image.alt_text?.trim() || name,
          isVideo: image.type === "video",
        }))
      : [
          {
            key: "placeholder",
            src: PLANT_IMAGE_PLACEHOLDER,
            alt: name,
            isVideo: false,
          },
        ];

  const active = items[activeIndex] ?? items[0];

  return (
    <div data-slot="plant-gallery" className={cn("w-full", className)}>
      <div className="relative overflow-hidden rounded-2xl bg-muted">
        <div className="relative aspect-square w-full">
          <Image
            src={active.src}
            alt={active.alt}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {active.isVideo ? (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
              <span className="flex size-14 items-center justify-center rounded-full bg-card/95 text-foreground shadow-subtle">
                <PlayIcon className="size-6 fill-current" aria-hidden="true" />
              </span>
              <span className="sr-only">{t("videoPreview")}</span>
            </div>
          ) : null}
        </div>

        {featured ? (
          <Badge
            variant="outline"
            className="absolute top-4 left-4 h-7 rounded-full border-border/80 bg-card px-3 font-sans text-[0.625rem] font-semibold tracking-[0.08em] text-foreground uppercase shadow-subtle"
          >
            {t("featured")}
          </Badge>
        ) : null}
      </div>

      {items.length > 1 ? (
        <ul className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
          {items.map((item, index) => (
            <li key={item.key} className="shrink-0">
              <ThumbnailButton
                item={item}
                plantName={name}
                selected={index === activeIndex}
                index={index}
                onSelect={setActiveIndex}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ThumbnailButton({
  item,
  plantName,
  selected,
  index,
  onSelect,
}: {
  item: GalleryItem;
  plantName: string;
  selected: boolean;
  index: number;
  onSelect: (index: number) => void;
}) {
  const t = useTranslations("plantDetail");

  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      aria-label={
        item.isVideo
          ? t("selectVideo", { name: plantName })
          : t("selectImage", { name: plantName, index: index + 1 })
      }
      aria-pressed={selected}
      className={cn(
        "relative size-[4.25rem] overflow-hidden rounded-xl border-2 bg-muted outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:size-[4.75rem]",
        selected ? "border-primary" : "border-transparent hover:border-border"
      )}
    >
      <Image
        src={item.src}
        alt=""
        fill
        className="object-cover"
        sizes="76px"
      />
      {item.isVideo ? (
        <span className="absolute inset-0 flex items-center justify-center bg-foreground/25">
          <PlayIcon
            className="size-4 fill-card text-card"
            aria-hidden="true"
          />
        </span>
      ) : null}
    </button>
  );
}

export { PlantGallery };
