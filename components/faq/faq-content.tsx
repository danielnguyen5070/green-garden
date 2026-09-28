import { getTranslations } from "next-intl/server";
import { FaqBrowser } from "@/components/faq/faq-browser";
import { FaqCategories } from "@/components/faq/faq-categories";
import { FaqHero } from "@/components/faq/faq-hero";
import { FaqList } from "@/components/faq/faq-list";
import { Container } from "@/components/layout/container";
import { FAQ_CATEGORIES, type FaqEntry } from "@/config/faq";
import { cn } from "@/lib/utils";

async function FaqContent({
  items,
  className,
}: {
  items: readonly FaqEntry[];
  className?: string;
}) {
  const t = await getTranslations("faq");

  return (
    <FaqBrowser>
      <div data-slot="faq-content" className={cn(className)}>
        <FaqHero />

        <Container className="pb-4 md:pb-6">
          <FaqCategories
            navLabel={t("categories.navLabel")}
            categories={FAQ_CATEGORIES.map((category) => ({
              id: category.id,
              label: t(`categories.${category.labelKey}`),
            }))}
          />
        </Container>

        <Container className="pb-8 md:pb-12 lg:pb-16">
          <div className="mx-auto max-w-[52rem]">
            <FaqList
              items={items}
              emptyLabel={t("empty")}
              clearSearchLabel={t("clearSearch")}
            />
          </div>
        </Container>
      </div>
    </FaqBrowser>
  );
}

export { FaqContent };
