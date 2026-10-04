/**
 * Exports the storefront FAQ (`FAQ_ITEMS` + vi/en messages) as a JSON snapshot
 * for the API's chatbot knowledge index.
 *
 * Run: `npx tsx scripts/export-faq.ts [output-path]`
 * Or:  `npm run export:faq`
 *
 * Default output: `../green-garden-api/app/data/faqs.json`.
 * After exporting, re-run `python -m scripts.reindex_knowledge` in the API.
 */

import fs from "node:fs";
import path from "node:path";
import { FAQ_ITEMS } from "../config/faq";
import en from "../messages/en.json";
import vi from "../messages/vi.json";

type FaqCopy = Record<string, { question?: string; answer?: string }>;

type FaqSnapshotItem = {
  id: string;
  category: string;
  category_label: string;
  category_label_vi: string;
  question: string;
  answer: string;
  question_vi: string;
  answer_vi: string;
};

const ROOT = process.cwd();
const DEFAULT_OUTPUT = path.join(ROOT, "../green-garden-api/app/data/faqs.json");

function requireText(value: string | undefined, label: string): string {
  const text = value?.trim();
  if (!text) {
    throw new Error(`Missing FAQ copy: ${label}`);
  }
  return text;
}

function buildItems(): FaqSnapshotItem[] {
  const enItems = en.faq.items as FaqCopy;
  const viItems = vi.faq.items as FaqCopy;
  const enCategories = en.faq.categories as Record<string, string>;
  const viCategories = vi.faq.categories as Record<string, string>;

  return FAQ_ITEMS.map(({ id, categoryId }) => ({
    id,
    category: categoryId,
    category_label: requireText(enCategories[categoryId], `en category ${categoryId}`),
    category_label_vi: requireText(viCategories[categoryId], `vi category ${categoryId}`),
    question: requireText(enItems[id]?.question, `en ${id}.question`),
    answer: requireText(enItems[id]?.answer, `en ${id}.answer`),
    question_vi: requireText(viItems[id]?.question, `vi ${id}.question`),
    answer_vi: requireText(viItems[id]?.answer, `vi ${id}.answer`),
  }));
}

function main() {
  const output = path.resolve(process.argv[2] ?? DEFAULT_OUTPUT);
  const items = buildItems();

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify({ items }, null, 2)}\n`, "utf8");

  console.log(`Wrote ${items.length} FAQ item(s) to ${output}`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
