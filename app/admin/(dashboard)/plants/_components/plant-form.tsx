"use client";

import { useState, type SubmitEvent } from "react";
import { PlantImagesSection } from "@/app/admin/(dashboard)/plants/_components/plant-images-section";
import { adminCopy } from "@/app/admin/_lib/admin-copy";
import { refreshStorefront } from "@/app/admin/actions/revalidate";
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
import type { AdminPlant, AdminPlantImage } from "@/types/admin-plant";
import type { Category } from "@/types/category";
import {
  PLANT_DIFFICULTIES,
  PLANT_GROWTH_RATES,
  PLANT_SPACE_REQUIREMENTS,
  PLANT_SUNLIGHTS,
  PLANT_TYPES,
  PLANT_WATERINGS,
  isPlantDifficulty,
  isPlantGrowthRate,
  isPlantSpaceRequirement,
  isPlantSunlight,
  isPlantType,
  isPlantWatering,
} from "@/types/plant-attributes";
import {
  UNSET_VALUE,
  careStateFromPlant,
  enumSelectValue,
  isValidHttpUrl,
  nextNullableBool,
  parseEnumSelectValue,
  readForm,
  validateForm,
  type CareFormState,
  type PlantFormValues,
} from "../_lib/plant-form";

const copy = adminCopy.plants;

export type { PlantFormValues };

export type PlantFormProps = {
  mode: "create" | "edit";
  plant?: AdminPlant;
  categories: Category[];
  submitting: boolean;
  error: string | null;
  onValidationError: (message: string | null) => void;
  onSubmit: (values: PlantFormValues) => void | Promise<void>;
  onCancel: () => void;
};

export function PlantForm({
  mode,
  plant,
  categories,
  submitting,
  error,
  onValidationError,
  onSubmit,
  onCancel,
}: PlantFormProps) {
  const prefix = mode === "create" ? "create" : "edit";
  const [categoryId, setCategoryId] = useState(plant?.category_id ?? "");
  const [ogImageUrl, setOgImageUrl] = useState(plant?.og_image_url ?? "");
  const [ogImageBroken, setOgImageBroken] = useState(false);
  const [care, setCare] = useState<CareFormState>(() => careStateFromPlant(plant));
  // Nested resources save immediately, so they live outside the form submit.
  const [images, setImages] = useState<AdminPlantImage[]>(plant?.images ?? []);

  const selectedCategory = categories.find(
    (category) => category.id === categoryId
  );
  const ogImagePreviewUrl =
    ogImageUrl.trim() && isValidHttpUrl(ogImageUrl.trim())
      ? ogImageUrl.trim()
      : null;

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = readForm(event.currentTarget, categoryId, care);
    // Edit has no status field; status changes go through the list action.
    const willBeActive =
      mode === "create" ? values.is_active : Boolean(plant?.is_active);
    const invalid = validateForm(values, willBeActive);
    if (invalid) {
      onValidationError(invalid);
      return;
    }

    onValidationError(null);
    void onSubmit(values);
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
          <h3 className="text-sm font-medium">{copy.sections.basics}</h3>

          <div className="space-y-2">
            <Label htmlFor={`${prefix}-category`}>{copy.fields.category}</Label>
            <Select
              value={categoryId}
              disabled={submitting}
              onValueChange={(value) => {
                if (value == null) return;
                setCategoryId(value as string);
              }}
            >
              <SelectTrigger
                id={`${prefix}-category`}
                className="h-11 w-full rounded-full px-4"
              >
                <SelectValue>
                  {selectedCategory ? (
                    selectedCategory.name
                  ) : (
                    <span className="text-muted-foreground">
                      {copy.fields.categoryPlaceholder}
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <span>{category.name}</span>
                    {category.name_vi ? (
                      <span className="text-xs text-muted-foreground">
                        {category.name_vi}
                      </span>
                    ) : null}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${prefix}-name`}>{copy.fields.name}</Label>
              <Input
                id={`${prefix}-name`}
                name="name"
                required
                maxLength={255}
                defaultValue={plant?.name}
                disabled={submitting}
                className="h-11 rounded-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${prefix}-name-vi`}>{copy.fields.nameVi}</Label>
              <Input
                id={`${prefix}-name-vi`}
                name="name_vi"
                maxLength={255}
                defaultValue={plant?.name_vi ?? ""}
                disabled={submitting}
                className="h-11 rounded-full"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${prefix}-slug`}>{copy.fields.slug}</Label>
              <Input
                id={`${prefix}-slug`}
                name="slug"
                required
                maxLength={255}
                defaultValue={plant?.slug}
                disabled={submitting}
                className="h-11 rounded-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${prefix}-sku`}>{copy.fields.sku}</Label>
              <Input
                id={`${prefix}-sku`}
                name="sku"
                required
                maxLength={100}
                defaultValue={plant?.sku}
                disabled={submitting}
                className="h-11 rounded-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${prefix}-description`}>
              {copy.fields.description}
            </Label>
            <Textarea
              id={`${prefix}-description`}
              name="description"
              defaultValue={plant?.description ?? ""}
              disabled={submitting}
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${prefix}-description-vi`}>
              {copy.fields.descriptionVi}
            </Label>
            <Textarea
              id={`${prefix}-description-vi`}
              name="description_vi"
              defaultValue={plant?.description_vi ?? ""}
              disabled={submitting}
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${prefix}-long-description`}>
              {copy.fields.longDescription}
            </Label>
            <Textarea
              id={`${prefix}-long-description`}
              name="long_description"
              rows={12}
              defaultValue={plant?.long_description ?? ""}
              disabled={submitting}
              className="min-h-48 rounded-lg font-sans"
            />
            <p className="text-xs text-muted-foreground">
              {copy.fields.longDescriptionHint}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${prefix}-long-description-vi`}>
              {copy.fields.longDescriptionVi}
            </Label>
            <Textarea
              id={`${prefix}-long-description-vi`}
              name="long_description_vi"
              rows={12}
              defaultValue={plant?.long_description_vi ?? ""}
              disabled={submitting}
              className="min-h-48 rounded-lg font-sans"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${prefix}-og-image-url`}>
              {copy.fields.ogImageUrl}
            </Label>
            <Input
              id={`${prefix}-og-image-url`}
              name="og_image_url"
              type="url"
              inputMode="url"
              value={ogImageUrl}
              onChange={(event) => {
                setOgImageUrl(event.target.value);
                setOgImageBroken(false);
              }}
              disabled={submitting}
              className="h-11 rounded-full"
            />
            <p className="text-xs text-muted-foreground">
              {copy.fields.ogImageUrlHint}
            </p>
            {ogImagePreviewUrl && !ogImageBroken ? (
              // eslint-disable-next-line @next/next/no-img-element -- OG images are arbitrary remote URLs, not configured next/image hosts
              <img
                src={ogImagePreviewUrl}
                alt=""
                className="mt-1 h-20 w-36 rounded-lg border border-border object-cover"
                loading="lazy"
                onError={() => setOgImageBroken(true)}
              />
            ) : null}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-medium">{copy.sections.care}</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <CareEnumSelect
              id={`${prefix}-plant-type`}
              label={copy.fields.plantType}
              value={care.plant_type}
              disabled={submitting}
              options={PLANT_TYPES.map((value) => ({
                value,
                label: copy.enums.plantType[value],
              }))}
              onChange={(value) =>
                setCare((current) => ({
                  ...current,
                  plant_type: parseEnumSelectValue(value, isPlantType),
                }))
              }
            />
            <CareEnumSelect
              id={`${prefix}-difficulty`}
              label={copy.fields.difficulty}
              value={care.difficulty}
              disabled={submitting}
              options={PLANT_DIFFICULTIES.map((value) => ({
                value,
                label: copy.enums.difficulty[value],
              }))}
              onChange={(value) =>
                setCare((current) => ({
                  ...current,
                  difficulty: parseEnumSelectValue(value, isPlantDifficulty),
                }))
              }
            />
            <CareEnumSelect
              id={`${prefix}-growth-rate`}
              label={copy.fields.growthRate}
              value={care.growth_rate}
              disabled={submitting}
              options={PLANT_GROWTH_RATES.map((value) => ({
                value,
                label: copy.enums.growthRate[value],
              }))}
              onChange={(value) =>
                setCare((current) => ({
                  ...current,
                  growth_rate: parseEnumSelectValue(value, isPlantGrowthRate),
                }))
              }
            />
            <CareEnumSelect
              id={`${prefix}-sunlight`}
              label={copy.fields.sunlight}
              value={care.sunlight}
              disabled={submitting}
              options={PLANT_SUNLIGHTS.map((value) => ({
                value,
                label: copy.enums.sunlight[value],
              }))}
              onChange={(value) =>
                setCare((current) => ({
                  ...current,
                  sunlight: parseEnumSelectValue(value, isPlantSunlight),
                }))
              }
            />
            <CareEnumSelect
              id={`${prefix}-watering`}
              label={copy.fields.watering}
              value={care.watering}
              disabled={submitting}
              options={PLANT_WATERINGS.map((value) => ({
                value,
                label: copy.enums.watering[value],
              }))}
              onChange={(value) =>
                setCare((current) => ({
                  ...current,
                  watering: parseEnumSelectValue(value, isPlantWatering),
                }))
              }
            />
            <CareEnumSelect
              id={`${prefix}-space-requirement`}
              label={copy.fields.spaceRequirement}
              value={care.space_requirement}
              disabled={submitting}
              options={PLANT_SPACE_REQUIREMENTS.map((value) => ({
                value,
                label: copy.enums.spaceRequirement[value],
              }))}
              onChange={(value) =>
                setCare((current) => ({
                  ...current,
                  space_requirement: parseEnumSelectValue(
                    value,
                    isPlantSpaceRequirement
                  ),
                }))
              }
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <CareBooleanCheckbox
              id={`${prefix}-indoor-suitable`}
              label={copy.fields.indoorSuitable}
              checked={care.indoor_suitable === true}
              disabled={submitting}
              onCheckedChange={(checked) =>
                setCare((current) => ({
                  ...current,
                  indoor_suitable: nextNullableBool(
                    checked,
                    current.indoor_suitable
                  ),
                }))
              }
            />
            <CareBooleanCheckbox
              id={`${prefix}-outdoor-suitable`}
              label={copy.fields.outdoorSuitable}
              checked={care.outdoor_suitable === true}
              disabled={submitting}
              onCheckedChange={(checked) =>
                setCare((current) => ({
                  ...current,
                  outdoor_suitable: nextNullableBool(
                    checked,
                    current.outdoor_suitable
                  ),
                }))
              }
            />
            <CareBooleanCheckbox
              id={`${prefix}-pet-safe`}
              label={copy.fields.petSafe}
              checked={care.pet_safe === true}
              disabled={submitting}
              onCheckedChange={(checked) =>
                setCare((current) => ({
                  ...current,
                  pet_safe: nextNullableBool(checked, current.pet_safe),
                }))
              }
            />
            <CareBooleanCheckbox
              id={`${prefix}-beginner-friendly`}
              label={copy.fields.beginnerFriendly}
              checked={care.beginner_friendly === true}
              disabled={submitting}
              onCheckedChange={(checked) =>
                setCare((current) => ({
                  ...current,
                  beginner_friendly: nextNullableBool(
                    checked,
                    current.beginner_friendly
                  ),
                }))
              }
            />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-medium">{copy.sections.pricing}</h3>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor={`${prefix}-price`}>{copy.fields.price}</Label>
              <Input
                id={`${prefix}-price`}
                name="price"
                type="number"
                min={0}
                step="0.01"
                required
                defaultValue={plant?.price ?? ""}
                disabled={submitting}
                className="h-11 rounded-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${prefix}-price-vi`}>{copy.fields.priceVi}</Label>
              <Input
                id={`${prefix}-price-vi`}
                name="price_vi"
                type="number"
                min={0}
                step="1"
                defaultValue={plant?.price_vi ?? ""}
                disabled={submitting}
                className="h-11 rounded-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${prefix}-stock`}>{copy.fields.stock}</Label>
              <Input
                id={`${prefix}-stock`}
                name="stock"
                type="number"
                min={0}
                step={1}
                defaultValue={plant?.stock ?? 0}
                disabled={submitting}
                className="h-11 rounded-full"
              />
            </div>
          </div>

          <div className="flex items-start gap-2">
            <input
              id={`${prefix}-is-featured`}
              name="is_featured"
              type="checkbox"
              defaultChecked={plant?.is_featured ?? false}
              disabled={submitting}
              className="mt-0.5 size-4 accent-primary"
            />
            <div className="space-y-1">
              <Label htmlFor={`${prefix}-is-featured`}>
                {copy.fields.featured}
              </Label>
              <p className="text-xs text-muted-foreground">
                {copy.fields.featuredHint}
              </p>
            </div>
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
                  {copy.fields.active}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {copy.fields.activeHint}
                </p>
              </div>
            </div>
          ) : null}
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-medium">{copy.sections.images}</h3>
          {plant ? (
            <PlantImagesSection
              plantId={plant.id}
              images={images}
              disabled={submitting}
              onChange={(next) => {
                setImages(next);
                void refreshStorefront({
                  entity: "plants",
                  slugs: [plant.slug],
                });
              }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {copy.images.availableAfterCreate}
            </p>
          )}
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

type CareEnumSelectProps = {
  id: string;
  label: string;
  value: string | null;
  disabled?: boolean;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
};

function CareEnumSelect({
  id,
  label,
  value,
  disabled,
  options,
  onChange,
}: CareEnumSelectProps) {
  const selected = options.find((option) => option.value === value);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={enumSelectValue(value)}
        disabled={disabled}
        onValueChange={(next) => {
          if (next == null) return;
          onChange(next as string);
        }}
      >
        <SelectTrigger id={id} className="h-11 w-full rounded-full px-4">
          <SelectValue>
            {selected ? (
              selected.label
            ) : (
              <span className="text-muted-foreground">
                {copy.fields.enumUnset}
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UNSET_VALUE}>{copy.fields.enumUnset}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

type CareBooleanCheckboxProps = {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
};

function CareBooleanCheckbox({
  id,
  label,
  checked,
  disabled,
  onCheckedChange,
}: CareBooleanCheckboxProps) {
  return (
    <div className="flex items-start gap-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="mt-0.5 size-4 accent-primary"
      />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
}
