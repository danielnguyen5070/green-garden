"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { PlayIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Plant, PlantImage } from "@/types/plant";

function PlantGallery({
  plant,
  className,
}: {
  plant: Plant;
  className?: string;
}) {
  const t = useTranslations("plantDetail");
  const images = plant.images ?? [
    { src: plant.image, alt: plant.name, type: "image" as const },
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];

  function selectImage(index: number) {
    setActiveIndex(index);
  }

  return (
    <div data-slot="plant-gallery" className={cn("w-full", className)}>
      <div className="relative overflow-hidden rounded-2xl bg-muted">
        <div className="relative aspect-[4/5] w-full">
          <Image
            src={active.src}
            alt={active.alt ?? plant.name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {active.type === "video" ? (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
              <span className="flex size-14 items-center justify-center rounded-full bg-card/95 text-foreground shadow-subtle">
                <PlayIcon className="size-6 fill-current" aria-hidden="true" />
              </span>
              <span className="sr-only">{t("videoPreview")}</span>
            </div>
          ) : null}
        </div>

        {plant.bestseller ? (
          <Badge
            variant="outline"
            className="absolute top-4 left-4 h-7 rounded-full border-border/80 bg-card px-3 font-sans text-[0.625rem] font-semibold tracking-[0.08em] text-foreground uppercase shadow-subtle"
          >
            {t("bestseller")}
          </Badge>
        ) : null}
      </div>

      {images.length > 1 ? (
        <ul className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <li key={`${image.src}-${index}`} className="shrink-0">
              <ThumbnailButton
                image={image}
                plantName={plant.name}
                selected={index === activeIndex}
                index={index}
                onSelect={selectImage}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ThumbnailButton({
  image,
  plantName,
  selected,
  index,
  onSelect,
}: {
  image: PlantImage;
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
        image.type === "video"
          ? t("selectVideo", { name: plantName })
          : t("selectImage", { name: plantName, index: index + 1 })
      }
      aria-pressed={selected}
      className={cn(
        "relative size-[4.25rem] overflow-hidden rounded-xl border-2 bg-muted outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:size-[4.75rem]",
        selected ? "border-primary" : "border-transparent hover:border-border",
      )}
    >
      <Image
        src={image.src}
        alt=""
        fill
        className="object-cover"
        sizes="76px"
      />
      {image.type === "video" ? (
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
