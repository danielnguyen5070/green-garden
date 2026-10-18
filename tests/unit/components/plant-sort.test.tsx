/** @vitest-environment jsdom */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlantSort } from "@/components/plant/plant-sort";

vi.mock("next-intl", () => ({
  useTranslations: () => {
    const t = (key: string) => {
      const copy: Record<string, string> = {
        sortLabel: "Sort",
        "sort.featured": "Featured",
        "sort.newest": "Newest",
        "sort.price-asc": "Price: Low to high",
        "sort.price-desc": "Price: High to low",
      };
      return copy[key] ?? key;
    };
    return t;
  },
}));

describe("PlantSort", () => {
  it("opens below the trigger without aligning the selected item under the pointer", async () => {
    const onChange = vi.fn();

    render(<PlantSort value="featured" onChange={onChange} />);

    fireEvent.click(screen.getByRole("combobox", { name: "Sort" }));

    await screen.findByRole("listbox");

    const content = document.querySelector('[data-slot="select-content"]');
    expect(content).not.toBeNull();
    expect(content?.getAttribute("data-align-trigger")).toBe("false");

    const featured = screen.getByRole("option", { name: "Featured" });
    expect(featured.getAttribute("aria-selected")).toBe("true");
    expect(featured.querySelector("svg")).not.toBeNull();
  });
});
