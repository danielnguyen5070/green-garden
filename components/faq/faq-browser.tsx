"use client";

import { createContext, use, useEffect, useState } from "react";
import {
  FAQ_CATEGORY_IDS,
  type FaqCategoryFilter,
  type FaqCategoryId,
} from "@/config/faq";

type FaqBrowserState = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  category: FaqCategoryFilter;
  setCategory: (category: FaqCategoryFilter) => void;
};

const FaqBrowserContext = createContext<FaqBrowserState | null>(null);

function getHashCategory(): FaqCategoryId | null {
  const hash = window.location.hash.slice(1);
  return (FAQ_CATEGORY_IDS as readonly string[]).includes(hash)
    ? (hash as FaqCategoryId)
    : null;
}

/**
 * Search and category state shared by the FAQ search input, category pills
 * and list. The surrounding page, including the hero copy, renders on the
 * server and is passed through as `children`.
 */
function FaqBrowser({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<FaqCategoryFilter>("all");

  // Deep links like `/faq#delivery`; read after mount so `/faq` stays static.
  useEffect(() => {
    const syncFromHash = () => {
      const hashCategory = getHashCategory();
      if (hashCategory) setCategory(hashCategory);
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  return (
    <FaqBrowserContext
      value={{ searchQuery, setSearchQuery, category, setCategory }}
    >
      {children}
    </FaqBrowserContext>
  );
}

function useFaqBrowser(): FaqBrowserState {
  const state = use(FaqBrowserContext);
  if (!state) {
    throw new Error("useFaqBrowser must be used inside <FaqBrowser>");
  }
  return state;
}

export { FaqBrowser, useFaqBrowser };
