import { Suspense } from "react";
import { Hero } from "@/components/home/hero";
import { NewsletterSection } from "@/components/home/newsletter-section";
import {
  PlantListSection,
  PlantListSkeleton,
} from "@/components/plant/plant-list-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Suspense fallback={<PlantListSkeleton />}>
        <PlantListSection />
      </Suspense>
      <NewsletterSection />
    </>
  );
}
