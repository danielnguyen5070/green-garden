import { getTranslations } from "next-intl/server";
import { PlantListSkeleton } from "@/components/plant/plant-list-section";

export default async function PlantsLoading() {
  const t = await getTranslations("plants");

  return (
    <PlantListSkeleton
      title={t("title")}
      headingAs="h1"
      frameId="plants"
      className="pb-16 md:pb-20 lg:pb-24"
    />
  );
}
