import { describe, expect, it } from "vitest";

import { calculateCartTotals } from "./cart";

describe("cart totals", () => {
  it("uses integer minor units and separates discounts from delivery", () => {
    const result = calculateCartTotals(
      [
        { id: "top", unitPriceMinor: 80_000, quantity: 1, discountMinor: 5_000 },
        { id: "bottom", unitPriceMinor: 50_000, quantity: 2 },
      ],
      { cartDiscountMinor: 10_000, deliveryMinor: 3_000 },
    );

    expect(result).toMatchObject({
      subtotalMinor: 180_000,
      itemDiscountMinor: 5_000,
      cartDiscountMinor: 10_000,
      discountMinor: 15_000,
      deliveryMinor: 3_000,
      totalMinor: 168_000,
    });
  });

  it("never lets discounts make the item total negative", () => {
    const result = calculateCartTotals([
      { id: "only", unitPriceMinor: 1_000, quantity: 1, discountMinor: 4_000 },
    ]);

    expect(result.totalMinor).toBe(0);
    expect(result.discountMinor).toBe(1_000);
  });
});
