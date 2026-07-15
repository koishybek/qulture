import { describe, expect, it } from "vitest";

import type { PublicVariantView } from "@/lib/commerce/public-catalog";
import {
  publicProductGallery,
  restockWaitlistHref,
  variantForColor,
} from "@/lib/commerce/public-pdp";

function variant(
  id: string,
  colorCode: string,
  size: string,
  canAddToCart: boolean,
): PublicVariantView {
  return {
    id,
    sku: id,
    colorCode,
    color: colorCode,
    size,
    availableUnits: canAddToCart ? 1 : 0,
    availability: canAddToCart ? "in_stock" : "unavailable",
    priceMinor: canAddToCart ? 50_000 : null,
    comparePriceMinor: null,
    incomingEta: null,
    leadTimeDays: null,
    media: [],
    canAddToCart,
  };
}

describe("public PDP helpers", () => {
  it("puts selected variant media first and removes duplicate paths", () => {
    expect(
      publicProductGallery(
        [
          { src: "/media/a.jpg", alt: "A" },
          { src: "/media/b.jpg", alt: "B" },
        ],
        [
          { src: "/media/b.jpg", alt: "Variant B" },
          { src: "/media/c.jpg", alt: "C" },
        ],
      ),
    ).toEqual([
      { src: "/media/b.jpg", alt: "Variant B" },
      { src: "/media/c.jpg", alt: "C" },
      { src: "/media/a.jpg", alt: "A" },
    ]);
  });

  it("prefers a purchasable variant in the requested color and size", () => {
    const variants = [
      variant("black-s", "black", "S", false),
      variant("black-m", "black", "M", true),
      variant("sand-s", "sand", "S", true),
    ];
    expect(variantForColor(variants, "black", "S")?.id).toBe("black-m");
    expect(variantForColor(variants, "sand", "S")?.id).toBe("sand-s");
  });

  it("builds an encoded, locale-scoped restock URL with verified IDs", () => {
    expect(restockWaitlistHref("kz", "product/1", "variant 2")).toBe(
      "/kz/waitlist?product=product%2F1&variant=variant+2&intent=restock",
    );
  });
});
