import { describe, expect, it } from "vitest";

import {
  DemoOrderValidationError,
  priceDemoOrder,
  type DemoBundleDefinition,
  type DemoPriceVariant,
} from "./demo-pricing";

const variants: DemoPriceVariant[] = [
  {
    id: "top-m",
    productId: "top",
    productName: "Demo top",
    category: "TOP",
    sku: "TOP-M",
    color: "Graphite",
    size: "M",
    available: 4,
    unitPriceMinor: 120_000,
  },
  {
    id: "pants-l",
    productId: "pants",
    productName: "Demo pants",
    category: "BOTTOM",
    sku: "PANTS-L",
    color: "Graphite",
    size: "L",
    available: 2,
    unitPriceMinor: 90_000,
  },
];

const bundles: DemoBundleDefinition[] = [
  {
    id: "city-set",
    discountType: "PERCENTAGE",
    discountValue: 1_000,
    components: [
      { productId: "top", role: "TOP" },
      { productId: "pants", role: "BOTTOM" },
    ],
  },
];

describe("priceDemoOrder", () => {
  it("derives variant prices and applies the seeded bundle discount", () => {
    const result = priceDemoOrder(
      [
        { variantId: "top-m", quantity: 1, bundleGroupId: "group-1" },
        { variantId: "pants-l", quantity: 1, bundleGroupId: "group-1" },
      ],
      variants,
      bundles,
    );

    expect(result).toMatchObject({
      subtotalMinor: 210_000,
      discountMinor: 21_000,
      totalMinor: 189_000,
    });
    expect(result.lines.map((line) => line.discountMinor)).toEqual([12_000, 9_000]);
    expect(result.lines.map((line) => line.componentRole)).toEqual(["TOP", "BOTTOM"]);
  });

  it("does not trust a group unless it contains the exact bundle components", () => {
    const result = priceDemoOrder(
      [{ variantId: "top-m", quantity: 1, bundleGroupId: "partial" }],
      variants,
      bundles,
    );

    expect(result.discountMinor).toBe(0);
    expect(result.totalMinor).toBe(120_000);
  });

  it("aggregates repeated variant quantities before checking stock", () => {
    expect(() =>
      priceDemoOrder(
        [
          { variantId: "pants-l", quantity: 2 },
          { variantId: "pants-l", quantity: 1 },
        ],
        variants,
        bundles,
      ),
    ).toThrowError(DemoOrderValidationError);
  });

  it("rejects any variant absent from the server-side demo fixture set", () => {
    expect(() =>
      priceDemoOrder(
        [{ variantId: "public-or-invented", quantity: 1 }],
        variants,
        bundles,
      ),
    ).toThrowError(/unavailable/i);
  });
});

