import { describe, expect, it } from "vitest";

import { resolveAIAction } from "@/lib/ai/client-actions";

describe("AI client action resolver", () => {
  it("only creates locale-scoped product routes from safe slugs", () => {
    expect(
      resolveAIAction(
        { kind: "open_product", label: "Открыть", value: '{"slug":"city-shell"}' },
        "ru",
      ),
    ).toEqual({ type: "navigate", href: "/ru/product/city-shell" });
    expect(
      resolveAIAction(
        { kind: "open_product", label: "Open", value: '{"slug":"city-shell"}' },
        "en",
      ),
    ).toEqual({ type: "navigate", href: "/en/product/city-shell" });
    expect(
      resolveAIAction(
        { kind: "open_product", label: "Открыть", value: "https://evil.example/x" },
        "ru",
      ),
    ).toEqual({ type: "invalid" });
    expect(
      resolveAIAction(
        { kind: "open_product", label: "Открыть", value: "javascript:alert(1)" },
        "ru",
      ),
    ).toEqual({ type: "invalid" });
  });

  it("accepts bounded cart confirmation payloads and rejects duplicates", () => {
    const action = {
      kind: "confirm_add_to_cart" as const,
      label: "Подтвердить",
      value: JSON.stringify({
        items: [{ productId: "product-1", variantId: "variant-1", quantity: 1 }],
      }),
    };
    expect(resolveAIAction(action, "ru")).toEqual({
      type: "confirm_cart",
      items: [{ productId: "product-1", variantId: "variant-1", quantity: 1 }],
    });
    expect(
      resolveAIAction(
        {
          ...action,
          value: JSON.stringify({
            items: [
              { productId: "product-1", variantId: "variant-1", quantity: 1 },
              { productId: "product-1", variantId: "variant-1", quantity: 1 },
            ],
          }),
        },
        "ru",
      ),
    ).toEqual({ type: "invalid" });
  });

  it("ignores model-provided order proof and uses the protected form", () => {
    expect(
      resolveAIAction(
        { kind: "check_order", label: "Проверить", value: "ORDER-1 user@example.com" },
        "ru",
      ),
    ).toEqual({ type: "navigate", href: "/ru/order-status" });
  });
});
