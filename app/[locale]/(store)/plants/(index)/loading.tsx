import { getTranslations } from "next-intl/server";
import { CatalogListSkeleton } from "@/app/[locale]/(store)/_components/catalog/catalog-list-section";

export default async function PlantsLoading() {
  const t = await getTranslations("plants");

  return (
    <CatalogListSkeleton
      title={t("title")}
      headingAs="h1"
      frameId="plants"
      className="pb-16 md:pb-20 lg:pb-24"
    />
  );
}
