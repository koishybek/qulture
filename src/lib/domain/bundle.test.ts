import { describe, expect, it } from "vitest";

import { calculateBundleAvailability, calculateBundleTotals } from "./bundle";

describe("bundle domain", () => {
  it("supports different sizes for top and bottom", () => {
    const result = calculateBundleAvailability([
      {
        componentId: "top",
        productId: "top-product",
        role: "TOP",
        variant: { id: "top-m", size: "M", stock: 5, reservedStock: 1, active: true },
      },
      {
        componentId: "bottom",
        productId: "bottom-product",
        role: "BOTTOM",
        variant: { id: "bottom-l", size: "L", stock: 2, reservedStock: 0, active: true },
      },
    ]);

    expect(result.available).toBe(true);
    expect(result.maxBundleQuantity).toBe(2);
    expect(result.components.map((component) => component.size)).toEqual(["M", "L"]);
  });

  it("derives availability from the least available component", () => {
    const result = calculateBundleAvailability([
      {
        componentId: "top",
        productId: "top-product",
        role: "TOP",
        variant: { id: "top-m", size: "M", stock: 4, reservedStock: 4, active: true },
      },
      {
        componentId: "bottom",
        productId: "bottom-product",
        role: "BOTTOM",
        variant: { id: "bottom-m", size: "M", stock: 10, reservedStock: 0, active: true },
      },
    ]);

    expect(result.available).toBe(false);
    expect(result.maxBundleQuantity).toBe(0);
    expect(result.unavailableComponentIds).toEqual(["top"]);
  });

  it("calculates a bundle saving in basis points", () => {
    const result = calculateBundleTotals(
      [
        { componentId: "top", unitPriceMinor: 100_000 },
        { componentId: "bottom", unitPriceMinor: 80_000 },
      ],
      { type: "PERCENTAGE", value: 1_000 },
    );

    expect(result).toMatchObject({
      subtotalMinor: 180_000,
      discountMinor: 18_000,
      savingsMinor: 18_000,
      totalMinor: 162_000,
    });
  });
});
